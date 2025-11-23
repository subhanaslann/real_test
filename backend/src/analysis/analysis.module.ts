import { Module } from '@nestjs/common';
import { GitService } from './git.service';
import { FileScannerService } from './file-scanner.service';

@Module({
  providers: [GitService, FileScannerService],
  exports: [GitService, FileScannerService],
})
export class AnalysisModule {}
