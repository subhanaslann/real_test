import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';

export interface DartFunction {
  name: string;
  startLine: number;
  endLine: number;
  signature: string;
}

@Injectable()
export class DartAnalyzerService {
  private readonly logger = new Logger(DartAnalyzerService.name);

  async analyzeFile(filePath: string): Promise<DartFunction[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return this.extractFunctions(content);
    } catch (error) {
      this.logger.error(`Failed to analyze file ${filePath}: ${error.message}`);
      return [];
    }
  }

  private extractFunctions(content: string): DartFunction[] {
    const lines = content.split('\n');
    const functions: DartFunction[] = [];
    let braceCount = 0;
    let currentFunction: Partial<DartFunction> | null = null;

    // Regex to match function definitions
    // Matches: Type? name(args) { or name(args) => or void name() async {
    // Excludes: if (...), for (...), switch (...), catch (...)
    const functionRegex = /^\s*(?:[\w<>[\]]+\s+)?(\w+)\s*\(.*\)\s*(?:async\s*)?(?:=>|\{)/;
    const keywordsToExclude = ['if', 'for', 'while', 'switch', 'catch', 'factory', 'main'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Update brace count
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      
      // Check for function start if we are not currently in a function (or nested logic)
      // Note: This is a simplified parser. It assumes functions are defined at top level or class level, not nested.
      if (!currentFunction) {
         const match = line.match(functionRegex);
         if (match) {
           const funcName = match[1];
           // Filter out keywords and private functions
           if (!keywordsToExclude.includes(funcName) && !funcName.startsWith('_')) {
             currentFunction = {
               name: funcName,
               startLine: i + 1,
               signature: line.trim(),
             };
             // If it's an arrow function ending with ;, it ends on the same line (usually)
             if (line.includes('=>') && line.trim().endsWith(';')) {
                functions.push({
                  ...currentFunction as DartFunction,
                  endLine: i + 1
                });
                currentFunction = null;
                continue;
             }
             
             // If it is a block function, we track braces
             braceCount = 0; // Reset for this function scope
           }
         }
      }

      if (currentFunction) {
        braceCount += openBraces;
        braceCount -= closeBraces;

        // Check if function ended
        if (braceCount === 0 && (line.includes('}') || line.includes(';'))) {
          // Only add if we actually entered a block or it was a one-liner handled above
          // But since we handled one-liner arrow functions above, this block handles {} blocks or multi-line arrow functions
          functions.push({
            ...currentFunction as DartFunction,
            endLine: i + 1
          });
          currentFunction = null;
        }
      }
    }

    return functions;
  }
}
