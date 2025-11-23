import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Job, JobStatus } from '@prisma/client';

export const ANALYSIS_QUEUE = 'analysis-queue';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(ANALYSIS_QUEUE) private analysisQueue: Queue,
  ) {}

  async createJob(userId: number, repoUrl: string): Promise<Job> {
    // 1. Create Job in DB
    const job = await this.prisma.job.create({
      data: {
        userId,
        repoUrl,
        status: JobStatus.PENDING,
      },
    });

    // 2. Add to BullMQ
    await this.analysisQueue.add('analyze', {
      jobId: job.id,
      repoUrl: job.repoUrl,
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
