import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { FileInfo } from './file-scanner.service';
import { AnalyzerFactory } from './analyzer.factory';
import { FunctionDefinition, TestAnalysisResult } from './abstract-analyzer';

export interface CoverageDetails {
  isCalled: boolean;
  isMentioned: boolean;
  score: number;
}

export interface FunctionCoverage {
  functionName: string;
  covered: boolean; // Kept for backward compatibility, true if score > 0
  coverageDetails: CoverageDetails;
  startLine: number;
  endLine: number;
  type: string;
}

export interface FileCoverage {
  file: string;
  testFile: string | null;
  functions: FunctionCoverage[];
  coveragePercentage: number;
  language: string;
}

@Injectable()
export class TestPairingService {
  private readonly logger = new Logger(TestPairingService.name);

  constructor(private analyzerFactory: AnalyzerFactory) { }

  async pairAndAnalyze(
    sourceFiles: FileInfo[],
    testFiles: FileInfo[],
    projectRoot: string
  ): Promise<FileCoverage[]> {
    const results: FileCoverage[] = [];

    for (const sourceFile of sourceFiles) {
      const relativePath = sourceFile.path;
      const fullPath = path.join(projectRoot, relativePath);

      // Get appropriate analyzer
      const analyzer = this.analyzerFactory.getAnalyzer(fullPath);
      if (!analyzer) {
        console.log(`No analyzer found for ${relativePath}`);
        continue;
      }

      // Analyze source file
      const functions = await analyzer.analyze('', fullPath);
      console.log(`Analyzed ${relativePath}: found ${functions.length} functions`);

      if (functions.length === 0) {
        continue;
      }

      // Find matching test file
      const matchingTest = this.findMatchingTest(sourceFile, testFiles);

      let functionCoverages: FunctionCoverage[] = [];

      if (matchingTest) {
        const testPath = path.join(projectRoot, matchingTest.path);
        const testContent = await fs.readFile(testPath, 'utf-8');

        let testAnalysis: TestAnalysisResult = { calls: [], mentions: [] };
        if (analyzer.analyzeTest) {
          testAnalysis = await analyzer.analyzeTest(testContent, testPath);
        } else {
          // Fallback if analyzeTest is not implemented (should not happen with current refactor)
          this.logger.warn(`Analyzer for ${sourceFile.extension} does not support analyzeTest`);
        }

        functionCoverages = functions.map(func => {
          const details = this.calculateCoverage(func, testAnalysis, testContent);
          return {
            functionName: func.name,
            startLine: func.startLine,
            endLine: func.endLine,
            type: func.type,
            covered: details.score > 0,
            coverageDetails: details
          };
        });
      } else {
        functionCoverages = functions.map(func => ({
          functionName: func.name,
          startLine: func.startLine,
          endLine: func.endLine,
          type: func.type,
          covered: false,
          coverageDetails: { isCalled: false, isMentioned: false, score: 0 }
        }));
      }

      const coveredCount = functionCoverages.filter(fc => fc.covered).length;
      const coveragePercentage = (coveredCount / functionCoverages.length) * 100;

      results.push({
        file: relativePath,
        testFile: matchingTest ? matchingTest.path : null,
        functions: functionCoverages,
        coveragePercentage: Math.round(coveragePercentage * 100) / 100,
        language: sourceFile.extension === '.dart' ? 'Dart' : 'TypeScript'
      });
    }

    return results;
  }

  private findMatchingTest(sourceFile: FileInfo, testFiles: FileInfo[]): FileInfo | undefined {
    // Normalize paths
    const sourcePath = path.normalize(sourceFile.path);
    const sourceName = path.basename(sourcePath, sourceFile.extension);

    return testFiles.find(tf => {
      const testPath = path.normalize(tf.path);
      const testName = path.basename(testPath);

      // Check for Dart convention
      if (sourceFile.extension === '.dart') {
        return testName === `${sourceName}_test.dart`;
      }

      // Check for TS convention
      if (sourceFile.extension === '.ts') {
        return testName === `${sourceName}.spec.ts` || testName === `${sourceName}.test.ts`;
      }

      return false;
    });
  }

  private calculateCoverage(func: FunctionDefinition, testAnalysis: TestAnalysisResult, testContent: string): CoverageDetails {
    let score = 0;
    const isCalled = testAnalysis.calls.includes(func.name);
    const isMentioned = testAnalysis.mentions.includes(func.name);
    const isTextMatch = testContent.includes(func.name);

    if (isCalled) {
      score += 50;
    }
    if (isMentioned) {
      score += 30;
    }
    if (isTextMatch && !isCalled && !isMentioned) {
      score += 10;
    } else if (isTextMatch) {
      // If it's already called or mentioned, we can still add a small bonus or just ignore
      // The prompt says "text: Function name randomly passes (+10 Points)"
      // If it is called, it is likely also in text. Let's cap it or add it.
      // Let's assume text match is a fallback or additive.
      // "call: ... (+50)", "mention: ... (+30)", "text: ... (+10)"
      // If I have a call, I have 50. If I have mention, I have 30.
      // If I have both, 80?
      // Let's implement additive but logical.
      score += 10;
    }

    // Cap at 100
    if (score > 100) score = 100;

    return {
      isCalled,
      isMentioned,
      score
    };
  }
}
