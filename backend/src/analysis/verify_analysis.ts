import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisModule } from './analysis.module';
import { FileScannerService } from './file-scanner.service';
import { TestPairingService } from './test-pairing.service';
import * as path from 'path';
import * as fs from 'fs';
import { Command } from 'commander';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
    const program = new Command();
    program
        .argument('[path]', 'Project root path')
        .option('-p, --project-path <path>', 'Project root path')
        .option('-c, --config <file>', 'Configuration file')
        .option('--projects <list>', 'Comma-separated project list')
        .action((path, options) => {
            if (path) options.projectPath = path;
        })
        .parse(process.argv);

    const options = program.opts();

    let projectRoot = options.projectPath || process.env.PROJECT_PATH;

    if (!projectRoot && options.config) {
        try {
            const configPath = path.resolve(options.config);
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                projectRoot = config.projectPath;
            }
        } catch (e) {
            console.error('Failed to read config file:', e);
        }
    }

    if (!projectRoot) {
        // Default fallback
        projectRoot = 'C:\\Tektech\\mini-task-tracker';
        console.warn('No project path provided via CLI, Env, or Config. Using default:', projectRoot);
    }

    console.log(`Scanning project at: ${projectRoot}`);

    if (!fs.existsSync(projectRoot)) {
        console.error(`Project path does not exist: ${projectRoot}`);
        process.exit(1);
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AnalysisModule],
    }).compile();

    const fileScanner = moduleFixture.get<FileScannerService>(FileScannerService);
    const testPairing = moduleFixture.get<TestPairingService>(TestPairingService);

    try {
        const scanResult = await fileScanner.scanProject(projectRoot);
        console.log(`Found ${scanResult.sourceFiles.length} source files and ${scanResult.testFiles.length} test files.`);

        const results = await testPairing.pairAndAnalyze(scanResult.sourceFiles, scanResult.testFiles, projectRoot);

        console.log('\n--- Analysis Results ---');
        results.forEach(res => {
            if (res.functions.length > 0) {
                console.log(`\nFile: ${res.file} (${res.language})`);
                console.log(`Coverage: ${res.coveragePercentage}%`);
                console.log(`Functions: ${res.functions.length}`);
                res.functions.slice(0, 5).forEach(f => {
                    console.log(` - ${f.functionName} (${f.type}): ${f.covered ? 'Covered' : 'Not Covered'}`);
                });
                if (res.functions.length > 5) console.log(' ...');
            }
        });
    } catch (error) {
        console.error('Analysis failed:', error);
        process.exit(1);
    }
}

bootstrap();
