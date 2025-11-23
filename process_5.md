# Dart Analysis Logic

This document details the implementation of the Dart code analysis, specifically function extraction and test pairing.

## 1. Services Created
- **DartAnalyzerService** (`backend/src/analysis/dart-analyzer.service.ts`):
  - **Purpose**: Parses Dart source files to extract function signatures and bodies.
  - **Logic**:
    - Reads file content line by line.
    - Uses regex to identify function definitions (`name(args) {` or `name(args) =>`).
    - Tracks braces `{}` to correctly identify the scope and end line of the function.
    - Filters out private functions (starting with `_`) and keywords like `if`, `switch`.
- **TestPairingService** (`backend/src/analysis/test-pairing.service.ts`):
  - **Purpose**: Matches source files with test files and calculates simple coverage.
  - **Logic**:
    - Iterates through `lib/` files found by the scanner.
    - Predicts the test file path (`lib/x.dart` -> `test/x_test.dart`).
    - Checks if the test file exists in the project.
    - Uses `DartAnalyzerService` to get the list of functions in the source file.
    - **Mention Check**: Reads the test file content and checks if the function name appears in it.
    - Calculates a coverage percentage for the file based on how many functions are "mentioned" in the test.

## 2. Integration Update
- **AnalysisModule**: Registered the new services and exported them.
- **AnalysisProcessor**:
  - Updated to perform the following sequence:
    1.  Clone Repo.
    2.  Scan Files.
    3.  **Pair and Analyze**: Calls `TestPairingService.pairAndAnalyze`.
    4.  **Summarize**: Calculates overall project coverage.
    5.  **Save**: updates the `Job` in the database with a detailed JSON result containing per-file and per-function coverage data.
    6.  Cleanup.

## 3. Result Structure
The `Job` result now follows this structure:
```json
{
  "summary": {
    "totalFiles": 10,
    "analyzedFiles": 8,
    "testFiles": 8,
    "overallCoverage": 75.5
  },
  "details": [
    {
      "file": "lib/utils.dart",
      "testFile": "test/utils_test.dart",
      "functions": [
        { "functionName": "calculate", "covered": true },
        { "functionName": "log", "covered": false }
      ],
      "coveragePercentage": 50
    }
  ]
}
```

The core analysis engine is now functional with a heuristic-based coverage algorithm.
