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

    // Find Flutter project root by looking for pubspec.yaml
    let flutterProjectPath = projectPath;
    const pubspecFiles = await glob('**/pubspec.yaml', {
      cwd: projectPath,
      ignore: ['**/.*/**', '**/build/**'],
    });

    if (pubspecFiles.length > 0) {
      // Use the first pubspec.yaml found (or pick the shortest path for main project)
      const mainPubspec = pubspecFiles.sort((a, b) => a.length - b.length)[0];
      flutterProjectPath = path.join(projectPath, path.dirname(mainPubspec));
      this.logger.log(`Found Flutter project at: ${path.dirname(mainPubspec)}`);
    } else {
      this.logger.warn('No pubspec.yaml found, scanning entire repository');
    }

    const dartFiles = await glob('**/*.dart', {
      cwd: flutterProjectPath,
      ignore: ['**/.*/**', '**/build/**', '**/ios/**', '**/android/**', '**/web/**'],
    });

    this.logger.log(`Total .dart files found: ${dartFiles.length}`);
    if (dartFiles.length > 0 && dartFiles.length <= 10) {
      this.logger.log(`Dart files: ${dartFiles.join(', ')}`);
    }

    const libFiles: FileInfo[] = [];
    const testFiles: FileInfo[] = [];

    for (const file of dartFiles) {
      const fullPath = path.join(flutterProjectPath, file);
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
