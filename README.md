# Swipe Check

A modern SvelteKit application with Remote Functions and Drizzle ORM + PostgreSQL.

## Features

- **SvelteKit 2** - Latest version with Svelte 5 runes
- **Remote Functions** - Type-safe server-client communication
- **Drizzle ORM** - Type-safe database access with PostgreSQL
- **TypeScript** - Full type safety across the stack
- **Progressive Enhancement** - Forms work with or without JavaScript

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
```

## Technologies

- **[SvelteKit](https://svelte.dev/docs/kit)** - Full-stack framework
- **[Svelte 5](https://svelte.dev/)** - Reactive UI framework with runes
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Vite](https://vite.dev/)** - Build tool
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

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

## Demo Pages

- **[Home](/)** - Feature overview and links
- **[Remote Functions Demo](/demo)** - Interactive examples of query, form, and command functions
- **[Todos Demo](/todos)** - Full CRUD application with database persistence

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

### Build

```bash
pnpm build
```

### Deploy

This project uses `adapter-auto` which automatically detects your deployment environment.

Supported platforms:
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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checking: `pnpm check`
5. Commit and push
6. Create a pull request

## Resources

- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [Remote Functions Guide](./REMOTE_FUNCTIONS.md)
- [Database Setup Guide](./DATABASE.md)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## License

MIT
