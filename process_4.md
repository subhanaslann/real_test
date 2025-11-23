# Analysis Engine Implementation

This document details the implementation of the core analysis logic, including git cloning and file scanning.

## 1. Dependencies
- Installed `simple-git`, `glob`, `fs-extra`, `uuid` and their type definitions.

## 2. Analysis Module
- **Module**: `backend/src/analysis/analysis.module.ts`
  - Encapsulates `GitService` and `FileScannerService`.
  - Exports them for use in other modules (specifically `QueueModule`).

## 3. Git Service
- **File**: `backend/src/analysis/git.service.ts`
- **Purpose**: Handles cloning of git repositories.
- **Logic**:
  - Generates a unique temporary directory using `uuid` and `os.tmpdir`.
  - Uses `simple-git` to clone the provided `repoUrl` into the temp directory.
  - Provides a `removeDirectory` method for cleanup using `fs-extra`.
- **Error Handling**: Logs errors and attempts to clean up if cloning fails.

## 4. File Scanner Service
- **File**: `backend/src/analysis/file-scanner.service.ts`
- **Purpose**: Scans the cloned repository for relevant files.
- **Logic**:
  - Uses `glob` to find all `.dart` files.
  - Ignores standard non-source directories (`.*`, `build`, `ios`, `android`, `web`).
  - Categorizes files into `libFiles` (source code) and `testFiles` (tests) based on path prefixes.
  - Returns file paths and sizes.

## 5. Analysis Processor Update
- **File**: `backend/src/queue/processors/analysis.processor.ts`
- **Logic**:
  - Now injects `GitService` and `FileScannerService`.
  - **Process Flow**:
    1.  Update Job Status -> `ANALYZING`.
    2.  **Clone**: Calls `gitService.cloneRepository`.
    3.  **Scan**: Calls `fileScannerService.scanProject`.
    4.  **Complete**: Updates Job Status -> `COMPLETED` and saves the scan result (list of files) to the `result` JSON field in the DB.
    5.  **Cleanup**: In a `finally` block, calls `gitService.removeDirectory` to ensure the temp folder is deleted regardless of success or failure.

## 6. Module Integration
- `AnalysisModule` is imported into `QueueModule` to make the services available to the processor.
- `AnalysisModule` is registered in `AppModule`.

The system can now successfully clone a repository, identify its Dart source and test files, and store this information in the database.
