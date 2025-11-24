import { Injectable } from '@nestjs/common';
import { Analyzer } from './abstract-analyzer';
import { DartAnalyzerService } from './dart-analyzer.service';
import { TypescriptAnalyzerService } from './typescript-analyzer.service';
import * as path from 'path';

@Injectable()
export class AnalyzerFactory {
    constructor(
        private readonly dartAnalyzer: DartAnalyzerService,
        private readonly tsAnalyzer: TypescriptAnalyzerService,
    ) { }

    getAnalyzer(filePath: string): Analyzer | null {
        const ext = path.extname(filePath);
        if (this.dartAnalyzer.supportedExtensions.includes(ext)) {
            return this.dartAnalyzer;
        }
        if (this.tsAnalyzer.supportedExtensions.includes(ext)) {
            return this.tsAnalyzer;
        }
        return null;
    }
}
