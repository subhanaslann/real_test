import { Injectable, Logger } from '@nestjs/common';
import * as ts from 'typescript';
import * as fs from 'fs-extra';
import { Analyzer, FunctionDefinition, TestAnalysisResult } from './abstract-analyzer';

@Injectable()
export class TypescriptAnalyzerService implements Analyzer {
    private readonly logger = new Logger(TypescriptAnalyzerService.name);

    supportedExtensions = ['.ts', '.tsx'];

    async analyze(content: string, filePath: string): Promise<FunctionDefinition[]> {
        try {
            if (!content) {
                content = await fs.readFile(filePath, 'utf-8');
            }

            const sourceFile = ts.createSourceFile(
                filePath,
                content,
                ts.ScriptTarget.Latest,
                true
            );

            const functions: FunctionDefinition[] = [];

            const visit = (node: ts.Node) => {
                if (ts.isFunctionDeclaration(node)) {
                    if (node.name) {
                        functions.push(this.createFunctionDefinition(node, node.name.text, 'function', sourceFile));
                    }
                } else if (ts.isClassDeclaration(node)) {
                    if (node.name) {
                        const className = node.name.text;
                        node.members.forEach(member => {
                            if (ts.isMethodDeclaration(member) && member.name) {
                                const methodName = member.name.getText(sourceFile);
                                functions.push(this.createFunctionDefinition(member, methodName, 'method', sourceFile, className));
                            }
                        });
                    }
                } else if (ts.isVariableStatement(node)) {
                    node.declarationList.declarations.forEach(declaration => {
                        if (declaration.name && ts.isIdentifier(declaration.name) && declaration.initializer && (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer))) {
                            functions.push(this.createFunctionDefinition(declaration.initializer, declaration.name.text, 'function', sourceFile));
                        }
                    });
                }

                ts.forEachChild(node, visit);
            };

            visit(sourceFile);
            return functions;

        } catch (error: any) {
            this.logger.error(`Failed to analyze TypeScript file ${filePath}: ${error.message}`);
            return [];
        }
    }

    async analyzeTest(content: string, filePath: string): Promise<TestAnalysisResult> {
        const calls = new Set<string>();
        const mentions = new Set<string>();

        try {
            if (!content) {
                content = await fs.readFile(filePath, 'utf-8');
            }

            const sourceFile = ts.createSourceFile(
                filePath,
                content,
                ts.ScriptTarget.Latest,
                true
            );

            const visit = (node: ts.Node) => {
                // Check for CallExpression (actual function calls)
                if (ts.isCallExpression(node)) {
                    const expression = node.expression;
                    if (ts.isIdentifier(expression)) {
                        calls.add(expression.text);
                    } else if (ts.isPropertyAccessExpression(expression)) {
                        calls.add(expression.name.text);
                    }
                }

                // Check for describe/it/test blocks (mentions)
                if (ts.isCallExpression(node)) {
                    const expression = node.expression;
                    if (ts.isIdentifier(expression) && ['describe', 'it', 'test'].includes(expression.text)) {
                        if (node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
                            // Split string by spaces to get individual words as potential mentions
                            const text = node.arguments[0].text;
                            // Add the full text and individual words
                            mentions.add(text);
                            text.split(/\s+/).forEach(word => mentions.add(word));
                        }
                    }
                }

                ts.forEachChild(node, visit);
            };

            visit(sourceFile);

        } catch (error: any) {
            this.logger.error(`Failed to analyze TypeScript test file ${filePath}: ${error.message}`);
        }

        return {
            calls: Array.from(calls),
            mentions: Array.from(mentions)
        };
    }

    private createFunctionDefinition(
        node: ts.Node,
        name: string,
        type: 'function' | 'method',
        sourceFile: ts.SourceFile,
        className?: string
    ): FunctionDefinition {
        const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());

        let signature = node.getText(sourceFile).split('{')[0].trim();
        if (signature.endsWith('=>')) signature = signature.slice(0, -2).trim();

        return {
            name,
            startLine: start.line + 1,
            endLine: end.line + 1,
            signature,
            type,
            className
        };
    }
}
