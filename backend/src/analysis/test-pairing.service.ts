import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { FileInfo } from './file-scanner.service';
import { DartAnalyzerService, DartFunction } from './dart-analyzer.service';

export interface FunctionCoverage {
  functionName: string;
  covered: boolean;
}

export interface FileCoverage {
  file: string;
  testFile: string | null;
  functions: FunctionCoverage[];
  coveragePercentage: number;
}

@Injectable()
export class TestPairingService {
  private readonly logger = new Logger(TestPairingService.name);

  constructor(private dartAnalyzer: DartAnalyzerService) {}

  async pairAndAnalyze(
    libFiles: FileInfo[], 
    testFiles: FileInfo[], 
    projectRoot: string
  ): Promise<FileCoverage[]> {
    const results: FileCoverage[] = [];

    for (const libFile of libFiles) {
      const relativePath = libFile.path; // e.g., lib/utils/helper.dart
      
      // Calculate expected test path
      // lib/utils/helper.dart -> test/utils/helper_test.dart
      const testPath = relativePath
        .replace(/^lib/, 'test')
        .replace(/\.dart$/, '_test.dart');

      // Find matching test file
      // We normalize paths to ensure OS compatibility
      const matchingTest = testFiles.find(tf => 
        path.normalize(tf.path) === path.normalize(testPath)
      );

      // Analyze the source file
      const functions = await this.dartAnalyzer.analyzeFile(path.join(projectRoot, relativePath));
      
      if (functions.length === 0) {
        continue; // Skip files with no public functions
      }

      let functionCoverages: FunctionCoverage[] = [];
      
      if (matchingTest) {
        // Read test file content
        const testContent = await fs.readFile(path.join(projectRoot, matchingTest.path), 'utf-8');
        
        functionCoverages = functions.map(func => ({
          functionName: func.name,
          covered: testContent.includes(func.name), // Simple mention check
        }));
      } else {
        // No test file found -> 0% coverage
        functionCoverages = functions.map(func => ({
          functionName: func.name,
          covered: false,
        }));
      }

      const coveredCount = functionCoverages.filter(fc => fc.covered).length;
      const coveragePercentage = (coveredCount / functionCoverages.length) * 100;

      results.push({
        file: relativePath,
        testFile: matchingTest ? matchingTest.path : null,
        functions: functionCoverages,
        coveragePercentage: Math.round(coveragePercentage * 100) / 100,
      });
    }

    return results;
  }
}
