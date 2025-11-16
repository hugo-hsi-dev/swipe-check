# Swipe Check

A playful daily personality tracker where users answer 3 questions per day to track their personality over time, based on the 16 personalities (MBTI) framework.

## About the Project

Swipe Check makes personality tracking fun and effortless with a swipe-based interface inspired by dating apps. Answer quick daily questions, build your streak, and watch your personality type evolve over time using a rolling 7-day window of responses.

See [PROJECT_PROMPT.md](./PROJECT_PROMPT.md) for detailed requirements and specifications.

## Key Features

- **Daily Quiz** - 3 questions per day (10 on first day for onboarding)
- **Swipe Interface** - Quick, casual, game-like experience
- **Streak Tracking** - Build consecutive day streaks with milestone celebrations
- **Personality Insights** - Track your 4-letter MBTI type with percentage breakdowns
- **PWA Support** - Installable app with offline capabilities
- **Type-Safe** - Full TypeScript support across the stack

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Database Setup

Copy the environment file and configure your database:

```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/swipe_check
```

Push the schema to your database:

```bash
pnpm db:push
```

See [DATABASE.md](./DATABASE.md) for detailed database setup instructions.

### 3. Start Development Server

```bash
pnpm dev

# or open in browser automatically
pnpm dev -- --open
```

Visit http://localhost:5173

## Project Structure

```
├── src/
│   ├── routes/
│   │   ├── +page.svelte          # Home page
│   │   ├── data.remote.ts         # Remote functions
│   │   ├── todos.remote.ts        # Todo CRUD operations
│   │   ├── demo/                  # Remote functions demo
│   │   └── todos/                 # Todos CRUD demo
│   └── lib/
│       └── server/
│           └── db/
│               ├── index.ts       # Database client
│               └── schema.ts      # Database schema
├── drizzle.config.ts              # Drizzle configuration
├── DATABASE.md                    # Database documentation
└── REMOTE_FUNCTIONS.md            # Remote functions guide
```

## Available Scripts

### Development

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm check        # Type check
pnpm check:watch  # Type check in watch mode
```

### Database

```bash
pnpm db:push      # Push schema changes to database
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio
pnpm db:drop      # Drop migration files
pnpm db:seed      # Seed database with initial data
```

### Authentication

```bash
pnpm auth:generate  # Generate Better Auth schema to auth-schema.ts
```

## Technologies

### Core Stack
- **[SvelteKit 2](https://svelte.dev/docs/kit)** - Full-stack framework
- **[Svelte 5](https://svelte.dev/)** - Reactive UI framework with runes
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Better Auth](https://www.better-auth.com/)** - Authentication solution
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

### UI & Design
- **[Bits UI](https://bits-ui.com/)** - Headless component primitives
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Tabler Icons](https://tabler.io/icons)** - Icon library (Svelte package)
- **[LayerChart](https://layerchart.com/)** - Data visualization and charts

### PWA & Build
- **[vite-pwa](https://vite-pwa-org.netlify.app/)** - Progressive Web App support
- **[Vite](https://vite.dev/)** - Build tool and dev server

## Remote Functions

This project uses SvelteKit's experimental Remote Functions feature. See [REMOTE_FUNCTIONS.md](./REMOTE_FUNCTIONS.md) for detailed documentation.

### Quick Example

**Define server function:**

```typescript
// src/routes/data.remote.ts
import { query } from '$app/server';

export const getData = query(async () => {
  return { message: 'Hello from server!' };
});
```

**Use in component:**

```svelte
<script lang="ts">
  import { getData } from './data.remote';
</script>

{JSON.stringify(await getData())}
```

## Database

This project uses Drizzle ORM with PostgreSQL. See [DATABASE.md](./DATABASE.md) for detailed documentation.

### Quick Example

```typescript
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';

// Select all users
const allUsers = await db.select().from(users);

// Insert a user
const [newUser] = await db.insert(users)
  .values({ name: 'John', email: 'john@example.com' })
  .returning();
```

## Project Architecture

This project uses **Svelte Remote Functions** instead of traditional load functions or form actions. Server functions are defined in `.remote.ts` files and can be directly imported and called from components, providing type-safe server-client communication.

### Architecture Principles
- All server interactions use remote functions (query, form, command)
- No load functions or form actions
- Type-safe end-to-end communication
- Progressive enhancement with automatic fallbacks

## Demo Pages

- **[Home](/)** - Feature overview and links
- **[Remote Functions Demo](/demo)** - Interactive examples of query, form, and command functions
- **[Todos Demo](/todos)** - Full CRUD application with database persistence

_Note: These are example pages from the template. The personality tracker UI will replace these._

## Configuration

### Enable Remote Functions

Remote functions are enabled in `svelte.config.js`:

```javascript
export default {
  kit: {
    experimental: {
      remoteFunctions: true
    }
  },
  compilerOptions: {
    experimental: {
      async: true
    }
  }
};
```

### Database Configuration

Database configuration is in `drizzle.config.ts`:

```typescript
export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || ''
  }
});
```

## Environment Variables

Required environment variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

See `.env.example` for template.

## Deployment

This project is configured for deployment on **[Dokploy](https://dokploy.com/)**.

### Build

```bash
pnpm build
```

### Deploy

The project uses `adapter-auto` which automatically detects your deployment environment.

Supported platforms:
- Dokploy (primary)
- Vercel
- Netlify
- Cloudflare Pages
- Node.js servers

For specific adapters, see [SvelteKit Adapters](https://svelte.dev/docs/kit/adapters).

### Database in Production

Ensure your production environment has:
1. PostgreSQL database instance
2. `DATABASE_URL` environment variable set
3. Run migrations: `pnpm db:migrate`

### PWA Considerations

When deploying the PWA:
- Ensure HTTPS is enabled (required for PWA features)
- Service workers will be automatically registered
- Configure caching strategies in `vite-pwa` config

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checking: `pnpm check`
5. Commit and push
6. Create a pull request

## Resources

### Project Documentation
- [Project Requirements & Specifications](./PROJECT_PROMPT.md)
- [Remote Functions Guide](./REMOTE_FUNCTIONS.md)
- [Database Setup Guide](./DATABASE.md)

### Technology Documentation
- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [Svelte 5 Docs](https://svelte.dev/docs/svelte/overview)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Bits UI Docs](https://bits-ui.com/docs)
- [LayerChart Docs](https://layerchart.com/)
- [vite-pwa Docs](https://vite-pwa-org.netlify.app/)

## License

MIT
