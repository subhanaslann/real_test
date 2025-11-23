import { Module } from '@nestjs/common';
import { GitService } from './git.service';
import { FileScannerService } from './file-scanner.service';
import { DartAnalyzerService } from './dart-analyzer.service';
import { TestPairingService } from './test-pairing.service';

@Module({
  providers: [GitService, FileScannerService, DartAnalyzerService, TestPairingService],
  exports: [GitService, FileScannerService, DartAnalyzerService, TestPairingService],
})
export class AnalysisModule {}
