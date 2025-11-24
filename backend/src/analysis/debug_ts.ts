
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'file-scanner.service.ts');
const content = fs.readFileSync(filePath, 'utf-8');

console.log(`Analyzing ${filePath}...`);

const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
);

console.log('Source file created.');

const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node)) {
        console.log('Found function:', node.name?.text);
    } else if (ts.isClassDeclaration(node)) {
        console.log('Found class:', node.name?.text);
        node.members.forEach(member => {
            if (ts.isMethodDeclaration(member)) {
                console.log(' - Found method:', member.name?.getText(sourceFile));
            }
        });
    }
    ts.forEachChild(node, visit);
};

visit(sourceFile);
