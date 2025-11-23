import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus } from '@prisma/client';
import { ANALYSIS_QUEUE } from '../jobs/jobs.service';
import { GitService } from '../../analysis/git.service';
import { FileScannerService } from '../../analysis/file-scanner.service';

@Processor(ANALYSIS_QUEUE)
export class AnalysisProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private gitService: GitService,
    private fileScannerService: FileScannerService,
  ) {
    super();
  }

  async process(job: Job<{ jobId: number; repoUrl: string }>): Promise<any> {
    console.log(`İş alındı: JobID ${job.data.jobId}`);
    let projectPath: string | null = null;

    // 1. Update status to ANALYZING
    await this.prisma.job.update({
      where: { id: job.data.jobId },
      data: { status: JobStatus.ANALYZING },
    });

    try {
      // 2. Clone Repository
      projectPath = await this.gitService.cloneRepository(job.data.repoUrl);

      // 3. Scan Files
      const scanResult = await this.fileScannerService.scanProject(projectPath);

      // 4. Update status to COMPLETED
      await this.prisma.job.update({
        where: { id: job.data.jobId },
        data: {
          status: JobStatus.COMPLETED,
          result: scanResult as any, // Storing scan result in JSON field
        },
      });

      console.log(`İş bitti: JobID ${job.data.jobId}`);
    } catch (error) {
      console.error(`İş hatası JobID ${job.data.jobId}:`, error);
      // Handle failure
      await this.prisma.job.update({
        where: { id: job.data.jobId },
        data: { status: JobStatus.FAILED },
      });
      throw error;
    } finally {
      // 5. Cleanup
      if (projectPath) {
        await this.gitService.removeDirectory(projectPath);
      }
    }
  }
}
