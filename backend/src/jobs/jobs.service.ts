import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Job, JobStatus } from '@prisma/client';
import { CreditsService } from '../credits/credits.service';

export const ANALYSIS_QUEUE = 'analysis-queue';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(ANALYSIS_QUEUE) private analysisQueue: Queue,
    private creditsService: CreditsService,
  ) { }

  async createJob(userId: number, repoUrl: string): Promise<Job> {
    // 1. Kredi kontrolü - YENİ
    const hasCredits = await this.creditsService.checkCredits(userId);
    if (!hasCredits) {
      throw new ForbiddenException('Insufficient credits. Please upgrade your plan.');
    }

    // 2. Fetch User to get Token
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // 3. Create Job in DB
    const job = await this.prisma.job.create({
      data: {
        userId,
        repoUrl,
        status: JobStatus.PENDING,
      },
    });

    // 4. Krediyi düş - YENİ
    await this.creditsService.deductCredit(userId, job.id);

    // 5. Add to BullMQ
    await this.analysisQueue.add('analyze', {
      jobId: job.id,
      repoUrl: job.repoUrl,
      token: (user as any)?.githubAccessToken,
    });

    return job;
  }

  async findAllByUser(userId: number): Promise<Job[]> {
    return this.prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number): Promise<Job | null> {
    return this.prisma.job.findFirst({
      where: { id, userId },
    });
  }
}
