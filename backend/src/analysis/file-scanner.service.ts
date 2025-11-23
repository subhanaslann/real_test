import { Injectable, Logger } from '@nestjs/common';
import { glob } from 'glob';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface FileInfo {
  path: string;
  size: number;
}

export interface ScanResult {
  libFiles: FileInfo[];
  testFiles: FileInfo[];
}

@Injectable()
export class FileScannerService {
  private readonly logger = new Logger(FileScannerService.name);

  async scanProject(projectPath: string): Promise<ScanResult> {
    this.logger.log(`Scanning project at ${projectPath}`);

    const dartFiles = await glob('**/*.dart', {
      cwd: projectPath,
      ignore: ['**/.*/**', '**/build/**', '**/ios/**', '**/android/**', '**/web/**'],
    });

    const libFiles: FileInfo[] = [];
    const testFiles: FileInfo[] = [];

    for (const file of dartFiles) {
      const fullPath = path.join(projectPath, file);
      const stats = await fs.stat(fullPath);
      
      const fileInfo: FileInfo = {
        path: file,
        size: stats.size,
      };

      if (file.startsWith('lib/') || file.startsWith('lib\\')) {
        libFiles.push(fileInfo);
      } else if (file.startsWith('test/') || file.startsWith('test\\')) {
        testFiles.push(fileInfo);
      }
    }

    this.logger.log(`Found ${libFiles.length} lib files and ${testFiles.length} test files.`);
    return { libFiles, testFiles };
  }
}
