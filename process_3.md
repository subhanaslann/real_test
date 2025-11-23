# Job Processing Infrastructure

This document details the setup of the asynchronous job processing system using BullMQ and Redis.

## 1. Dependencies
- Installed `@nestjs/bullmq`, `bullmq`, `class-validator`, and `class-transformer`.

## 2. Queue Module
- **File**: `backend/src/queue/queue.module.ts`
- **Purpose**: Configures `BullModule` globally using Redis credentials from `ConfigService`.
- **Processor**: `AnalysisProcessor` is registered here.

## 3. Jobs Module
- **Module**: `backend/src/jobs/jobs.module.ts`
  - Registers the `analysis-queue`.
  - Imports `BullModule`.
- **Service**: `backend/src/jobs/jobs.service.ts`
  - `createJob`: Creates a job record in PostgreSQL (status: `PENDING`) and adds a job to the `analysis-queue` in Redis.
  - `findAllByUser`: Retrieves all jobs for a specific user.
  - `findOne`: Retrieves a specific job by ID and User ID.
- **Controller**: `backend/src/jobs/jobs.controller.ts`
  - `POST /jobs`: Endpoint to submit a new analysis job.
  - `GET /jobs`: List all jobs for the authenticated user.
  - `GET /jobs/:id`: Get details of a specific job.
- **DTO**: `backend/src/jobs/dto/create-job.dto.ts`
  - Validates `repoUrl` (must be a URL) and `branch` (optional string).

## 4. Analysis Processor (Worker)
- **File**: `backend/src/queue/processors/analysis.processor.ts`
- **Queue**: `analysis-queue`
- **Process**:
  1.  **Start**: Logs "İş alındı" and updates job status to `ANALYZING`.
  2.  **Execution**: Simulates a 5-second task (will be replaced by actual cloning/analysis logic).
  3.  **Completion**: Updates job status to `COMPLETED` with a mock result.
  4.  **Failure**: Updates job status to `FAILED` if an error occurs.

## 5. Integration
- `QueueModule` and `JobsModule` are imported into `AppModule`.
- The system now supports scalable, asynchronous processing of long-running analysis tasks.
