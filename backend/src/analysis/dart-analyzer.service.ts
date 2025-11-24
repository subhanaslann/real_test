import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn } from 'child_process';
import { Analyzer, FunctionDefinition, TestAnalysisResult } from './abstract-analyzer';

@Injectable()
export class DartAnalyzerService implements Analyzer {
  private readonly logger = new Logger(DartAnalyzerService.name);
  private readonly parserPath = path.join(__dirname, '..', '..', 'src', 'analysis', 'dart_parser', 'dart_parser.dart');

  supportedExtensions = ['.dart'];

  async analyze(content: string, filePath: string): Promise<FunctionDefinition[]> {
    try {
      const result = await this.runParser(filePath);
      return result.functions.map((f: any) => ({
        name: f.name,
        startLine: f.startLine,
        endLine: f.endLine,
        signature: f.signature,
        type: f.type,
        className: f.className,
      }));
    } catch (error: any) {
      this.logger.error(`Failed to analyze file ${filePath}: ${error.message}`);
      return [];
    }
  }

  async analyzeTest(content: string, filePath: string): Promise<TestAnalysisResult> {
    try {
      const result = await this.runParser(filePath);
      return {
        calls: result.testCalls,
        mentions: Array.from(result.testMentions),
      };
    } catch (error: any) {
      this.logger.error(`Failed to analyze Dart test file ${filePath}: ${error.message}`);
      return { calls: [], mentions: [] };
    }
  }

  private async runParser(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const process = spawn('dart', [this.parserPath, '--file', filePath], { shell: true });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Parser exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(new Error(`Failed to parse JSON output: ${e.message}\nOutput: ${stdout}`));
        }
      });
    });
  }
}
