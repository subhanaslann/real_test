import 'dart:convert';
import 'dart:io';
import 'package:analyzer/dart/analysis/utilities.dart';
import 'package:analyzer/dart/ast/ast.dart';
import 'package:analyzer/dart/ast/visitor.dart';
import 'package:args/args.dart';

void main(List<String> arguments) {
  final parser = ArgParser()..addOption('file', abbr: 'f', help: 'Path to the Dart file to analyze');
  final argResults = parser.parse(arguments);

  final filePath = argResults['file'] as String?;

  if (filePath == null) {
    print(jsonEncode({'error': 'No file provided'}));
    exit(1);
  }

  try {
    final file = File(filePath);
    if (!file.existsSync()) {
      print(jsonEncode({'error': 'File not found: $filePath'}));
      exit(1);
    }

    final content = file.readAsStringSync();
    final result = parseString(content: content, path: filePath);
    final visitor = FunctionVisitor(content);
    result.unit.accept(visitor);

    print(jsonEncode({
      'functions': visitor.functions,
      'testCalls': visitor.testCalls,
      'testMentions': visitor.testMentions.toList(),
    }));
  } catch (e, stackTrace) {
    print(jsonEncode({'error': 'Analysis failed: $e', 'stack': stackTrace.toString()}));
    exit(1);
  }
}

class FunctionVisitor extends GeneralizingAstVisitor<void> {
  final String content;
  final List<Map<String, dynamic>> functions = [];
  final List<String> testCalls = [];
  final Set<String> testMentions = {};

  FunctionVisitor(this.content);

  @override
  void visitFunctionDeclaration(FunctionDeclaration node) {
    _addFunction(node.name.lexeme, node.functionExpression, 'function', node.offset, node.end);
    super.visitFunctionDeclaration(node);
  }

  @override
  void visitMethodDeclaration(MethodDeclaration node) {
    _addFunction(node.name.lexeme, node.body, 'method', node.offset, node.end, className: _getClassName(node));
    super.visitMethodDeclaration(node);
  }

  String? _getClassName(AstNode node) {
    AstNode? parent = node.parent;
    while (parent != null) {
      if (parent is ClassDeclaration) {
        return parent.name.lexeme;
      }
      if (parent is ExtensionDeclaration) {
        return parent.name?.lexeme ?? 'extension';
      }
      if (parent is MixinDeclaration) {
        return parent.name.lexeme;
      }
      parent = parent.parent;
    }
    return null;
  }

  void _addFunction(String name, AstNode bodyOrExpression, String type, int startOffset, int endOffset, {String? className}) {
    // Calculate line numbers
    final startLine = _getLineNumber(startOffset);
    final endLine = _getLineNumber(endOffset);
    
    // Get signature (approximate)
    // We can just take the first line of the function definition
    final signatureLine = content.substring(startOffset, endOffset).split('\n').first.trim();

    functions.add({
      'name': name,
      'startLine': startLine,
      'endLine': endLine,
      'signature': signatureLine,
      'type': type,
      'className': className,
    });
  }

  int _getLineNumber(int offset) {
    return content.substring(0, offset).split('\n').length;
  }

  @override
  void visitMethodInvocation(MethodInvocation node) {
    final name = node.methodName.name;
    
    // Check for test calls
    if (['test', 'testWidgets', 'group', 'setUp', 'tearDown'].contains(name)) {
       // Check if it's a top-level call or inside main/group
       testCalls.add(name);
       
       // Extract description if present (usually first argument)
       if (node.argumentList.arguments.isNotEmpty) {
         final firstArg = node.argumentList.arguments.first;
         if (firstArg is StringLiteral) {
           _extractMentions(firstArg.stringValue);
         }
       }
    }
    
    super.visitMethodInvocation(node);
  }

  void _extractMentions(String? text) {
    if (text == null) return;
    testMentions.add(text);
    // Split by spaces to get individual words
    text.split(RegExp(r'\s+')).forEach((word) {
      if (word.isNotEmpty) testMentions.add(word);
    });
  }
}
