
export interface FunctionDefinition {
    name: string;
    startLine: number;
    endLine: number;
    signature: string;
    type: 'function' | 'method' | 'getter' | 'setter';
    className?: string;
}

export interface TestAnalysisResult {
    calls: string[];
    mentions: string[];
}

export interface Analyzer {
    supportedExtensions: string[];
    analyze(content: string, filePath: string): Promise<FunctionDefinition[]>;
    analyzeTest?(content: string, filePath: string): Promise<TestAnalysisResult>;
}
