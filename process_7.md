# Frontend Implementation - Pages & Logic

This document outlines the implementation of the core frontend pages, routing, and integration with the backend.

## 1. Backend Integration Fix
- **File**: `backend/src/auth/auth.controller.ts`
- **Change**: Updated `githubLoginCallback` to redirect the user to the frontend application (`http://localhost:5173/auth/callback`) with the JWT access token in the query string (`?token=...`) instead of returning JSON directly. This enables a seamless OAuth flow for the SPA.

## 2. Frontend Architecture
- **Services**:
  - `frontend/src/services/api.client.ts`: Configured Axios with interceptors for JWT handling and 401 redirects.
  - `frontend/src/services/auth.service.ts`: Handles login redirection to backend and profile fetching.
  - `frontend/src/services/jobs.service.ts`: Handles job creation (`POST /jobs`) and fetching (`GET /jobs`, `GET /jobs/:id`).

- **Components (UI)**:
  - Implemented reusable components in `frontend/src/components/ui/`:
    - `Button`, `Input`, `Card`, `Badge`, `Progress`, `ScrollArea`.
  - Used `class-variance-authority` (cva) for component variants.
  - Used `lucide-react` for icons.

## 3. Pages Implementation

### Login Page (`/login`)
- **File**: `frontend/src/pages/Login.tsx`
- **Features**:
  - Clean, centered card layout.
  - "Login with GitHub" button that triggers `authService.login()`.

### Auth Callback Page (`/auth/callback`)
- **File**: `frontend/src/pages/AuthCallback.tsx`
- **Features**:
  - Captures the `token` from the URL query parameters.
  - Saves the token to `localStorage`.
  - Redirects the user to the Dashboard (`/dashboard`).

### Dashboard (`/dashboard`)
- **File**: `frontend/src/pages/Dashboard.tsx`
- **Features**:
  - **New Analysis**: Input field to submit a GitHub repository URL for analysis.
  - **Job List**: Cards displaying past analysis jobs.
  - **Real-time Status**: Polls the backend every 3 seconds to update job status (Pending -> Cloning -> Analyzing -> Completed).
  - **Visuals**: Status badges (animated for active states) and coverage progress bars.

### Job Details (`/jobs/:id`)
- **File**: `frontend/src/pages/JobDetails.tsx`
- **Features**:
  - **Summary**: Top section with "Overall Coverage" Pie Chart (`recharts`) and file statistics.
  - **Split View**:
    - **Left**: Scrollable list of analyzed files with individual coverage scores.
    - **Right**: Detailed view of the selected file, listing all functions and their coverage status (Covered/Uncovered).
  - **Polling**: Continues to poll for updates if the job is still processing.

## 4. Routing
- **File**: `frontend/src/App.tsx`
- **Router**: `react-router-dom` (v6/v7).
- **Structure**:
  - Public Routes: `/login`, `/auth/callback`.
  - **Protected Routes**: Wrapped in a `ProtectedLayout` that checks for the existence of a token.
    - `/dashboard`
    - `/jobs/:id`

## 5. Configuration Changes
- **Vite**: Converted `main.ts` to `main.tsx` to correctly bootstrap the React application.
- **Dependencies**: Added `recharts`, `date-fns`, `@radix-ui/react-slot`, `@radix-ui/react-progress`, `@radix-ui/react-scroll-area`.
