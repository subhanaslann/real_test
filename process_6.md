# Frontend Setup - Initialization

This document outlines the steps taken to set up the React frontend for the "Flutter Test Coverage Sentinel" project.

## 1. Project Initialization
- **Framework**: Vite + React + TypeScript
- **Command**: `npm create vite@latest frontend -- --template react-ts`
- **Location**: `frontend/`
- **Purpose**: High-performance frontend build tool and development server.

## 2. Styling & UI Architecture
- **CSS Framework**: TailwindCSS (v3)
- **Configuration Files**:
  - `frontend/tailwind.config.js`: Defines the color palette (Dark/Neon theme), border radius, and content paths.
  - `frontend/postcss.config.js`: Configures Tailwind and Autoprefixer plugins.
  - `frontend/src/index.css`: Imports Tailwind directives and defines global CSS variables for the theme (background, primary, accent colors).
- **Helper Utility**:
  - `frontend/src/lib/utils.ts`: Exports the `cn` function (combines `clsx` and `tailwind-merge`) for dynamic class handling.
- **Dependencies**:
  - `tailwindcss`, `postcss`, `autoprefixer`
  - `class-variance-authority`, `clsx`, `tailwind-merge`
  - `lucide-react` (Icons)

## 3. Configuration & Aliases
- **Vite Config**: `frontend/vite.config.ts`
  - Configured path alias `@` to point to `src/` directory.
- **TypeScript Config**: `frontend/tsconfig.json`
  - Added `baseUrl: "."` and `paths: { "@/*": ["./src/*"] }` to support absolute imports.
  - Added `jsx: "react-jsx"` to fix linter errors.

## 4. Networking
- **Library**: `axios`
- **File**: `frontend/src/services/api.client.ts`
  - **Base URL**: Retrieves from `VITE_API_URL` env var or defaults to `http://localhost:3000/api/v1`.
  - **Interceptors**:
    - **Request**: Automatically attaches `Bearer` token from `localStorage`.
    - **Response**: Intercepts `401 Unauthorized` to clear session and redirect to login.

## 5. Folder Structure Setup
Created the following directory structure in `frontend/src/`:
- `src/components`: Reusable UI components.
- `src/pages`: Route views (Login, Dashboard, ProjectDetails).
- `src/hooks`: Custom React hooks.
- `src/services`: API calls and external services (e.g., `api.client.ts`).
- `src/lib`: Utility functions (e.g., `utils.ts`).

## 6. Demo UI Implementation
- **File**: `frontend/src/App.tsx`
  - Implemented a responsive Dashboard layout.
  - Uses `lucide-react` for icons.
  - Demonstrates the Dark/Neon theme with specific Tailwind classes (`bg-background`, `text-foreground`, `border-border`).
  - Includes mock stats cards and recent activity list.
