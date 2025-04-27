# Job Listing Platform - Project Setup Commands

Here are the commands needed to scaffold your React 19/Vite frontend project for the job listing platform:

## Initial Project Setup

```bash
# Change directory into the frontend folder
cd apps/frontend

# Create new Vite project with React TypeScript template
npm create vite@latest . -- --template react-ts

# Switch to PNPM (recommended)
npm install -g pnpm
pnpm install
```

## Create Project Structure

```bash
# Create main directory structure
mkdir -p src/app
mkdir -p src/components
mkdir -p src/features
mkdir -p src/hooks
mkdir -p src/services
mkdir -p src/store
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/assets

# Create feature-specific directories
mkdir -p src/features/auth
mkdir -p src/features/jobs
mkdir -p src/features/mentorship
mkdir -p src/features/forum
mkdir -p src/features/profiles
```

## Install Dependencies

```bash
# Core dependencies
pnpm add react-router-dom@next @tanstack/react-query zustand

# UI libraries
pnpm add @mui/material@next @mui/icons-material@next @emotion/react @emotion/styled

# Form handling
pnpm add react-hook-form zod @hookform/resolvers

# Development dependencies
pnpm add -D eslint prettier husky lint-staged

# Testing libraries
pnpm add -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

## Configuration Files Setup

```bash
# Create environment files
touch .env.example .env.local

# Create ESLint and Prettier configuration
touch .eslintrc.cjs .prettierrc

# Create Husky configuration
npx husky init
mkdir -p .husky/pre-commit
```

## Start Development Server

```bash
# Run the development server
pnpm run dev
```

## Environment Configuration

Add these variables to your `.env.example` and `.env.local` files:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_JWT_SECRET=your_jwt_secret_here
VITE_SOCKETIO_URL=http://localhost:8000
```
