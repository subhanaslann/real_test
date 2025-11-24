import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { JobStatus } from '@prisma/client';
import { ANALYSIS_QUEUE } from '../../jobs/jobs.service';
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

  async process(job: Job<{ jobId: number; repoUrl: string; token?: string }>): Promise<any> {
    console.log(`[AnalysisProcessor] Job received - JobID: ${job.data.jobId}, RepoURL: ${job.data.repoUrl}`);
    let projectPath: string | null = null;

    // 1. Update status to CLONING
    await this.prisma.job.update({
      where: { id: job.data.jobId },
      data: { status: JobStatus.CLONING },
    });

    try {
      // 2. Clone Repository
      console.log(`[AnalysisProcessor] Step 1/4: Cloning repository...`);
      projectPath = await this.gitService.cloneRepository(job.data.repoUrl, job.data.token);
      console.log(`[AnalysisProcessor] Repository cloned to: ${projectPath}`);

      // Update status to ANALYZING
      await this.prisma.job.update({
        where: { id: job.data.jobId },
        data: { status: JobStatus.ANALYZING },
      });

      // 3. Scan Files
      console.log(`[AnalysisProcessor] Step 2/4: Scanning project files...`);
      const scanResult = await this.fileScannerService.scanProject(projectPath);
      console.log(`[AnalysisProcessor] Scan complete - Source files: ${scanResult.sourceFiles.length}, Test files: ${scanResult.testFiles.length}`);

      // 4. Pair and Analyze Coverage
      console.log(`[AnalysisProcessor] Step 3/4: Analyzing test coverage...`);
      const coverageResult = await this.testPairingService.pairAndAnalyze(
        scanResult.sourceFiles,
        scanResult.testFiles,
        projectPath,
      );
      console.log(`[AnalysisProcessor] Coverage analysis complete - Analyzed files: ${coverageResult.length}`);

      // Calculate overall coverage
      const totalCoverage = coverageResult.length > 0
        ? coverageResult.reduce((sum, item) => sum + item.coveragePercentage, 0) / coverageResult.length
        : 0;

      console.log(`[AnalysisProcessor] Overall coverage: ${totalCoverage.toFixed(2)}%`);

      // 5. Update status to COMPLETED with full results
      console.log(`[AnalysisProcessor] Step 4/4: Saving results to database...`);
      const resultData = {
        summary: {
          totalFiles: scanResult.sourceFiles.length,
          analyzedFiles: coverageResult.length,
          testFiles: scanResult.testFiles.length,
          overallCoverage: Math.round(totalCoverage * 100) / 100,
        },
        details: coverageResult,
      };

      await this.prisma.job.update({
        where: { id: job.data.jobId },
        data: {
          status: JobStatus.COMPLETED,
          result: resultData as any,
        },
      });

      console.log(`[AnalysisProcessor] ✅ Job completed successfully - JobID: ${job.data.jobId}`);
      console.log(`[AnalysisProcessor] Result summary:`, JSON.stringify(resultData.summary, null, 2));
    } catch (error: any) {
      console.error(`[AnalysisProcessor] ❌ Job failed - JobID: ${job.data.jobId}`);
      console.error(`[AnalysisProcessor] Error message:`, error?.message);
      console.error(`[AnalysisProcessor] Error stack:`, error?.stack);
      
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
      
      throw error;
    } finally {
      // 6. Cleanup
      if (projectPath) {
        console.log(`[AnalysisProcessor] Cleaning up project directory...`);
        await this.gitService.removeDirectory(projectPath);
      }
    }
  }
}
