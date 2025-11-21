# Technology Stack

## Core Framework

- **SvelteKit 2** with **Svelte 5** (using runes and modern reactive patterns)
- **TypeScript** with strict mode enabled
- **Vite** for build tooling and dev server

## Database & ORM

- **PostgreSQL** as the database
- **Drizzle ORM** for type-safe database operations
- Schema files: `src/lib/server/db/schema.ts` and `src/lib/server/db/auth-schema.ts`

## Authentication

- **Better Auth** for user authentication
- Client: `src/lib/auth-client.ts`
- Server: `src/lib/server/auth/index.ts`
- Supports email/password and social logins

## UI & Styling

- **Tailwind CSS v4** (using Vite plugin)
- **Bits UI** for headless component primitives (style completely custom)
- **Tabler Icons** (Svelte package) for icons
- **LayerChart** for data visualization
- Custom playful styling (not default component themes)

## PWA

- **vite-pwa** for Progressive Web App functionality
- Installable app with offline support

## Code Quality

- **ESLint** with TypeScript and Svelte plugins
- **Prettier** for code formatting (tabs, single quotes, 100 char width)
- **svelte-check** for type checking

## Architecture Pattern

**Critical**: This project uses **Svelte Remote Functions** instead of traditional load functions or form actions.

- Server functions defined in `.remote.ts` files
- Components directly import and call server functions
- Three types: `query`, `form`, `command` from `$app/server`
- Type-safe end-to-end communication
- Enabled via `experimental.remoteFunctions: true` in `svelte.config.js`

## Common Commands

### Development
```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm check            # Type check
pnpm check:watch      # Type check in watch mode
```

### Database
```bash
pnpm db:push          # Push schema changes to database (development)
pnpm db:generate      # Generate migration files
pnpm db:migrate       # Run migrations (production)
pnpm db:studio        # Open Drizzle Studio GUI
pnpm db:drop          # Drop migration files
pnpm db:seed          # Seed database with initial data
```

### Authentication
```bash
pnpm auth:generate    # Generate Better Auth schema to auth-schema.ts
```

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

## Deployment

- Configured for **Dokploy** (primary target)
- Uses `adapter-auto` which detects deployment environment
- Also supports Vercel, Netlify, Cloudflare Pages, Node.js servers
