import { Module } from '@nestjs/common';
import { GitService } from './git.service';
import { FileScannerService } from './file-scanner.service';
import { DartAnalyzerService } from './dart-analyzer.service';
import { TypescriptAnalyzerService } from './typescript-analyzer.service';
import { AnalyzerFactory } from './analyzer.factory';
import { TestPairingService } from './test-pairing.service';

@Module({
  providers: [
    GitService,
    FileScannerService,
    DartAnalyzerService,
    TypescriptAnalyzerService,
    AnalyzerFactory,
    TestPairingService
  ],
  exports: [
    GitService,
    FileScannerService,
    DartAnalyzerService,
    TypescriptAnalyzerService,
    AnalyzerFactory,
    TestPairingService
  ],
})
export class AnalysisModule { }
