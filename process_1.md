# Backend Setup Process

This document outlines the steps taken to set up the NestJS backend for the "Flutter Test Coverage Sentinel" project.

## 1. Project Initialization
- **Command**: `npx @nestjs/cli new backend --package-manager npm --strict`
- **Location**: `backend/`
- **Purpose**: Initialized the NestJS project structure with strict TypeScript mode.

## 2. Database & Caching Setup (Docker)
- **File**: `backend/docker-compose.yml`
- **Services**:
  - `db`: PostgreSQL 15 Alpine
  - `redis`: Redis 7 Alpine
- **Purpose**: Provides the database and caching infrastructure.

## 3. Prisma ORM Setup
- **Schema File**: `backend/prisma/schema.prisma`
- **Env File**: `backend/.env`
- **Models**:
  - `User`: Stores user information (GitHub ID, username, email, etc.).
  - `Job`: Stores coverage analysis jobs (status, result, repoUrl, etc.).
- **Prisma Module**: `backend/src/prisma/prisma.module.ts`
- **Prisma Service**: `backend/src/prisma/prisma.service.ts`
- **Purpose**: Manages database connections and schema migrations.
- **Note**: Downgraded to Prisma 5 to avoid experimental features in version 7.

## 4. Configuration & Validation
- **Module**: `@nestjs/config`
- **Validation**: `Joi`
- **File**: `backend/src/app.module.ts`
- **Purpose**: Loads environment variables and validates them against a schema (e.g., DB connection strings, ports).

## 5. Global Interceptors & Filters
- **Interceptor**: `backend/src/common/interceptors/transform.interceptor.ts`
  - Standardizes success responses: `{ success: true, data: ..., error: null }`
- **Filter**: `backend/src/common/filters/http-exception.filter.ts`
  - Standardizes error responses: `{ success: false, data: null, error: { ... } }`
- **Registration**: `backend/src/main.ts`
  - Applied globally using `app.useGlobalInterceptors` and `app.useGlobalFilters`.

## 6. Application Bootstrap
- **File**: `backend/src/main.ts`
- **Prefix**: `/api/v1`
- **Validation Pipe**: Global validation pipe enabled with whitelist.

## 7. Dependencies
- **Key Packages**:
  - `@nestjs/config`
  - `@prisma/client`
  - `joi`
  - `redis` (via Docker)
  - `postgres` (via Docker)

The backend skeleton is now ready for development.
