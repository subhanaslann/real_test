import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus } from '@prisma/client';
import { ANALYSIS_QUEUE } from '../jobs/jobs.service';
import { GitService } from '../../analysis/git.service';
import { FileScannerService } from '../../analysis/file-scanner.service';
import { TestPairingService } from '../../analysis/test-pairing.service';

@Processor(ANALYSIS_QUEUE)
export class AnalysisProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private gitService: GitService,
    private fileScannerService: FileScannerService,
    private testPairingService: TestPairingService,
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

      // 4. Pair and Analyze Coverage
      const coverageResult = await this.testPairingService.pairAndAnalyze(
        scanResult.libFiles,
        scanResult.testFiles,
        projectPath,
      );

      // Calculate overall coverage
      const totalCoverage = coverageResult.length > 0
        ? coverageResult.reduce((sum, item) => sum + item.coveragePercentage, 0) / coverageResult.length
        : 0;

      // 5. Update status to COMPLETED with full results
      await this.prisma.job.update({
        where: { id: job.data.jobId },
        data: {
          status: JobStatus.COMPLETED,
          result: {
            summary: {
              totalFiles: scanResult.libFiles.length,
              analyzedFiles: coverageResult.length,
              testFiles: scanResult.testFiles.length,
              overallCoverage: Math.round(totalCoverage * 100) / 100,
            },
            details: coverageResult,
          } as any,
        },
      });

      console.log(`İş bitti: JobID ${job.data.jobId}`);
    } catch (error: any) {
      console.error(`İş hatası JobID ${job.data.jobId}:`, error);
      // Handle failure with error message
      await this.prisma.job.update({
        where: { id: job.data.jobId },
        data: { 
          status: JobStatus.FAILED,
          result: {
            error: error?.message || 'Unknown error occurred',
            stack: error?.stack,
          } as any
        },
      });
      // Don't rethrow if we want to mark it as failed in BullMQ without retrying immediately (or use specific BullMQ settings)
      // Throwing error here makes BullMQ mark it as Failed.
      throw error;
    } finally {
      // 6. Cleanup
      if (projectPath) {
        await this.gitService.removeDirectory(projectPath);
      }
    }
  }
}
