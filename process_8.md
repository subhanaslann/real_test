# Robustness & Cleanup Improvements

This document details the improvements made to error handling and system maintenance.

## 1. Error Handling Strategy
- **Backend**:
  - **Analysis Processor**: Updated `backend/src/queue/processors/analysis.processor.ts` to capture errors during cloning or analysis.
  - **Persistence**: Errors are now saved to the `Job`'s `result` field as JSON: `{ "error": "...", "stack": "..." }`.
  - **Status Update**: Job status is explicitly set to `FAILED` upon error.
  - **Frontend**:
    - **JobDetails Page**: Checks for `job.status === 'FAILED'`. If failed, it displays a red alert box with the error message instead of the analysis charts.

## 2. Automated Cleanup (Cron Job)
- **Goal**: Prevent disk space exhaustion by removing old temporary files that might have been left behind (e.g., if the server crashed during analysis).
- **Implementation**:
  - **Library**: `@nestjs/schedule` (Cron).
  - **Module**: `backend/src/cleanup/cleanup.module.ts`.
  - **Service**: `backend/src/cleanup/cleanup.service.ts`.
- **Logic**:
  - Runs every hour (`@Cron(CronExpression.EVERY_HOUR)`).
  - Scans the temporary directory (`os.tmpdir()/flutter-sentinel`).
  - Checks the creation time (`birthtime`) of each folder.
  - Deletes folders older than 24 hours.

## 3. Code Updates
- **App Module**: Registered `ScheduleModule` and `CleanupModule`.
- **Git Service**: (Existing) Uses `os.tmpdir()/flutter-sentinel` as the base path, which aligns with the cleanup service's target.

## 4. Verification
- To test error handling: Submit an invalid Git URL. The job should fail, and the UI should show the error.
- To test cleanup: Manually create a folder in the temp dir and set its timestamp to the past (or wait 24h), then observe the logs.
