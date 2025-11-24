import { Injectable, Logger } from '@nestjs/common';
import { glob } from 'glob';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface FileInfo {
  path: string;
  size: number;
  extension: string;
}

export interface ScanResult {
  sourceFiles: FileInfo[];
  testFiles: FileInfo[];
}

@Injectable()
export class FileScannerService {
  private readonly logger = new Logger(FileScannerService.name);

  async scanProject(projectPath: string): Promise<ScanResult> {
    this.logger.log(`Scanning project at ${projectPath}`);

    // Patterns for source and test files
    // We scan everything and then classify
    const patterns = ['**/*.dart', '**/*.ts'];
    const ignore = [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.*/**',
      '**/*.d.ts', // Ignore declaration files
      '**/ios/**',
      '**/android/**',
      '**/web/**'
    ];

    const files = await glob(patterns, {
      cwd: projectPath,
      ignore: ignore,
    });

    this.logger.log(`Total files found: ${files.length}`);

    const sourceFiles: FileInfo[] = [];
    const testFiles: FileInfo[] = [];

    for (const file of files) {
      const fullPath = path.join(projectPath, file);
      const stats = await fs.stat(fullPath);
      const ext = path.extname(file);

      const fileInfo: FileInfo = {
        path: file,
        size: stats.size,
        extension: ext
      };

      // Classification logic
      const isTest = this.isTestFile(file);

      if (isTest) {
        testFiles.push(fileInfo);
      } else {
        sourceFiles.push(fileInfo);
      }
    }

    this.logger.log(`Found ${sourceFiles.length} source files and ${testFiles.length} test files.`);
    return { sourceFiles, testFiles };
  }

  private isTestFile(filePath: string): boolean {
    const lower = filePath.toLowerCase();
    return (
      lower.includes('/test/') ||
      lower.includes('\\test\\') ||
      lower.endsWith('_test.dart') ||
      lower.endsWith('.spec.ts') ||
      lower.endsWith('.test.ts')
    );
  }
}
