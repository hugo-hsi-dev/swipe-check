# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm preview                # Preview production build

# Code Quality
pnpm check                  # TypeScript/Svelte type checking
pnpm lint                   # ESLint with auto-fix
pnpm lint:check             # ESLint without auto-fix
pnpm format                 # Prettier format
pnpm format:check           # Prettier check

# Testing
pnpm test:unit              # Run Vitest unit tests
pnpm test:e2e               # Run Playwright e2e tests (builds first)
pnpm test                   # Run all tests

# Database (requires DATABASE_URL)
pnpm db:push                # Push schema to database
pnpm db:generate            # Generate migrations
pnpm db:migrate             # Run migrations
pnpm db:studio              # Open Drizzle Studio
```

## Architecture

### Tech Stack
- **Framework**: SvelteKit with Svelte 5 (runes, experimental async components)
- **Styling**: Tailwind CSS v4 with shadcn-svelte components
- **Database**: Drizzle ORM with PostgreSQL (PGlite for dev/testing)
- **Validation**: Valibot with sveltekit-superforms
- **Testing**: Vitest (unit) + Playwright (e2e)

### Project Structure
- `src/lib/server/` - Server-only code (auth, database)
- `src/lib/components/ui/` - shadcn-svelte UI components
- `src/lib/hooks/` - Svelte reactive hooks
- `src/routes/` - SvelteKit routes (login, register, logout)
- `e2e/` - Playwright end-to-end tests

### Database Strategy
The app uses PGlite (embedded PostgreSQL) for development and e2e testing, switching to real PostgreSQL in production when `DATABASE_URL` is set. Schema is auto-applied on startup in dev mode.

### Authentication
- `AuthService` class in `src/lib/server/auth.ts` handles registration, login, logout, session management
- Sessions stored in database with 30-day expiry, auto-renewed when within 15 days of expiry
- Session token stored in `auth-session` cookie
- `hooks.server.ts` validates sessions and populates `event.locals.user` and `event.locals.session`

### Svelte Configuration
Uses experimental features:
- `remoteFunctions: true` in kit config
- `async: true` compiler option (enables async components)

### Testing Configuration
Vitest runs two projects:
- `client`: Browser tests using Playwright, for `.svelte.test.ts` files
- `server`: Node tests for other test files (excludes `src/lib/server/**` from browser tests)
