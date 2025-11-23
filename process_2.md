# Authentication Setup Process

This document outlines the steps taken to set up GitHub OAuth authentication for the "Flutter Test Coverage Sentinel" project.

## 1. Dependencies
- Installed `passport`, `@nestjs/passport`, `@nestjs/jwt`, `passport-github2`, `passport-jwt` and their type definitions.
- Updated `package.json` via `npm install`.

## 2. Users Module
- **Service**: `backend/src/users/users.service.ts`
  - Implemented `findOrCreate` to handle user registration/login via GitHub.
  - Uses Prisma `upsert` to create or update user details.
- **Module**: `backend/src/users/users.module.ts`
  - Exports `UsersService` for use in `AuthModule`.

## 3. Auth Module
- **Service**: `backend/src/auth/auth.service.ts`
  - `validateOAuthLogin`: Validates GitHub profile and delegates to `UsersService` to find/create user.
  - `login`: Generates a JWT access token for the user.
- **Strategies**:
  - `GitHubStrategy` (`backend/src/auth/strategies/github.strategy.ts`): Configures passport-github2 with client ID, secret, and callback URL.
  - `JwtStrategy` (`backend/src/auth/strategies/jwt.strategy.ts`): Validates JWT tokens on protected routes.
- **Guards**:
  - `GitHubAuthGuard` (`backend/src/auth/guards/github-auth.guard.ts`): Triggered on `/auth/github`.
  - `JwtAuthGuard` (`backend/src/auth/guards/jwt-auth.guard.ts`): Protects `/auth/me` and future private endpoints.
- **Controller**: `backend/src/auth/auth.controller.ts`
  - `GET /auth/github`: Initiates GitHub login.
  - `GET /auth/github/callback`: Handles the callback, logs the user in, and returns the JWT.
  - `GET /auth/me`: Returns the authenticated user's profile.
- **Module**: `backend/src/auth/auth.module.ts`
  - Registers `PassportModule` and `JwtModule` (async configuration with `ConfigService`).
  - Imports `UsersModule`.

## 4. Environment Variables
- Updated `backend/.env` with:
  - `JWT_SECRET`
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `GITHUB_CALLBACK_URL`
- Updated `backend/src/app.module.ts` to validate these new variables using Joi.

## 5. App Module Integration
- Imported `AuthModule` and `UsersModule` in `backend/src/app.module.ts`.

The authentication layer is now fully implemented. Users can log in via GitHub, and their session is managed via JWT.
