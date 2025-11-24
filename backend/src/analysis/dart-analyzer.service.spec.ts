import { Test, TestingModule } from '@nestjs/testing';
import { DartAnalyzerService } from './dart-analyzer.service';
import * as path from 'path';

describe('DartAnalyzerService', () => {
    let service: DartAnalyzerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DartAnalyzerService],
        }).compile();

        service = module.get<DartAnalyzerService>(DartAnalyzerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should analyze a Dart file and extract functions', async () => {
        const fixturePath = path.join(__dirname, 'fixtures', 'sample.dart');
        const functions = await service.analyze('', fixturePath);

        expect(functions).toHaveLength(5); // method1, asyncMethod, getter, globalFunction, main

        const names = functions.map(f => f.name);
        expect(names).toContain('method1');
        expect(names).toContain('asyncMethod');
        expect(names).toContain('globalFunction');
        expect(names).toContain('main');
    }, 10000);

    it('should analyze test calls', async () => {
        const fixturePath = path.join(__dirname, 'fixtures', 'sample.dart');
        const result = await service.analyzeTest('', fixturePath);

        expect(result.calls).toContain('test');
        expect(result.calls).toContain('group');
        expect(result.calls).toContain('testWidgets');

        expect(result.mentions).toContain('test description');
        expect(result.mentions).toContain('group description');
        expect(result.mentions).toContain('widget test');
    }, 10000);
});
