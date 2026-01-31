# AGENTS.md

This document provides guidelines for AI agents working in this repository.

## Project Overview

This is a SvelteKit application using Svelte 5, TypeScript, PostgreSQL with Drizzle ORM, Tailwind CSS, and Vitest for testing. Uses pnpm as package manager.

## Build/Lint/Test Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm preview                # Preview production build

# Code quality
pnpm check                  # Type-check with svelte-check
pnpm lint                   # ESLint with auto-fix
pnpm lint:check             # ESLint without fixing
pnpm format                 # Prettier format with write
pnpm format:check           # Prettier format check only

# Testing (single test)
pnpm test:unit -- src/path/to/file.spec.ts    # Run single test file
pnpm test:unit -- --run --reporter=verbose     # Run all tests with verbose output
pnpm test:e2e                                 # Run Playwright E2E tests
pnpm test                                     # Run both unit and E2E tests

# Database
pnpm db:start               # Start PostgreSQL via Docker
pnpm db:push                # Push schema changes to database
pnpm db:generate            # Generate Drizzle migrations
pnpm db:migrate             # Run Drizzle migrations
pnpm db:studio              # Open Drizzle Studio
```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Never use `any` type without a good reason.
  - Explicitly ask the user for permission before using `any`



### Naming Conventions

- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE for true constants
- Database tables: lowercase singular (e.g., `user`, `post`)
- Files: kebab-case for all filenames (e.g., `user-card.svelte`, `format-date.ts`, `database-client.ts`)




### Key Directories

- `src/routes/` - SvelteKit routes
- `src/lib/` - Shared components and utilities
- `src/lib/server/` - Server-only code (DB, API)
- `e2e/` - Playwright end-to-end tests

## Environment Variables

Required env vars (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string

Test env in `.env.test` overrides for E2E tests.
