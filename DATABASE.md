# Database Setup with Drizzle ORM

This project uses [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL.

## Prerequisites

- PostgreSQL database (local or remote)
- Node.js and pnpm installed

## Quick Start

### 1. Environment Setup

Copy the example environment file and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`:

```env
DATABASE_URL=postgresql://username:password@hostname:5432/database
```

**Local Development Example:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/swipe_check
```

**Production Example (with SSL):**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### 2. Database Initialization

Push the schema to your database:

```bash
pnpm db:push
```

This creates all tables defined in `src/lib/server/db/schema.ts` directly in your database without generating migration files.

### 3. Database Schema

The schema is defined in `src/lib/server/db/schema.ts`:

- **users** - Example users table
- **todos** - Example todos table with foreign key to users

## Available Scripts

```bash
# Generate migrations from schema changes
pnpm db:generate

# Run migrations to update database
pnpm db:migrate

# Push schema changes directly (no migrations)
pnpm db:push

# Open Drizzle Studio (visual database browser)
pnpm db:studio

# Drop migration files
pnpm db:drop
```

## Development Workflow

### Making Schema Changes

1. Edit `src/lib/server/db/schema.ts`
2. Push changes to database:
   ```bash
   pnpm db:push
   ```

### Using Migrations (Production)

For production environments, use migrations instead of direct push:

1. Make schema changes in `src/lib/server/db/schema.ts`
2. Generate migration:
   ```bash
   pnpm db:generate
   ```
3. Review the migration in `drizzle/` directory
4. Apply migration:
   ```bash
   pnpm db:migrate
   ```

## Schema Definition

### Example: Users Table

```typescript
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

## Using the Database in Your App

### In Remote Functions

```typescript
import { query, form } from '$app/server';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Query example
export const getUsers = query(async () => {
  return await db.select().from(users);
});

// Insert example
export const createUser = form(async (data: FormData) => {
  const name = data.get('name') as string;
  const email = data.get('email') as string;

  const [newUser] = await db.insert(users).values({
    name,
    email
  }).returning();

  return { success: true, user: newUser };
});

// Update example
export const updateUser = form(async (data: FormData) => {
  const id = data.get('id') as string;
  const name = data.get('name') as string;

  const [updated] = await db
    .update(users)
    .set({ name, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  return { success: true, user: updated };
});

// Delete example
export const deleteUser = form(async (data: FormData) => {
  const id = data.get('id') as string;

  await db.delete(users).where(eq(users.id, id));

  return { success: true };
});
```

### Common Query Patterns

```typescript
import { db } from '$lib/server/db';
import { users, todos } from '$lib/server/db/schema';
import { eq, and, or, like, desc } from 'drizzle-orm';

// Select all
const allUsers = await db.select().from(users);

// Select with where clause
const user = await db.select()
  .from(users)
  .where(eq(users.id, userId));

// Select with multiple conditions
const completedTodos = await db.select()
  .from(todos)
  .where(and(
    eq(todos.userId, userId),
    eq(todos.completed, true)
  ));

// Select with like (search)
const searchUsers = await db.select()
  .from(users)
  .where(like(users.name, '%john%'));

// Select with joins
const todosWithUsers = await db.select()
  .from(todos)
  .leftJoin(users, eq(todos.userId, users.id));

// Select with order
const recentTodos = await db.select()
  .from(todos)
  .orderBy(desc(todos.createdAt));

// Insert
const [newUser] = await db.insert(users)
  .values({ name: 'John', email: 'john@example.com' })
  .returning();

// Update
await db.update(users)
  .set({ name: 'Jane' })
  .where(eq(users.id, userId));

// Delete
await db.delete(users)
  .where(eq(users.id, userId));
```

## Configuration

### drizzle.config.ts

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || ''
  }
});
```

## Project Structure

```
├── drizzle/                    # Generated migrations
├── src/
│   └── lib/
│       └── server/
│           └── db/
│               ├── index.ts    # Database client
│               └── schema.ts   # Database schema
├── .env                        # Environment variables (not in git)
├── .env.example               # Environment template
└── drizzle.config.ts          # Drizzle configuration
```

## Local PostgreSQL Setup

### Using Docker

```bash
# Start PostgreSQL with Docker
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=swipe_check \
  -p 5432:5432 \
  postgres:16-alpine

# Connect to the database
docker exec -it postgres psql -U postgres -d swipe_check
```

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: swipe-check-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: swipe_check
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Start with:
```bash
docker-compose up -d
```

## Drizzle Studio

Drizzle Studio is a visual database browser. Start it with:

```bash
pnpm db:studio
```

This opens a web interface at `https://local.drizzle.studio` where you can:
- Browse tables and data
- Run queries
- Edit data
- View relationships

## Type Safety

Drizzle provides full type safety:

```typescript
import type { User, NewUser } from '$lib/server/db/schema';

// TypeScript knows the exact shape of User
const user: User = {
  id: '123',
  name: 'John',
  email: 'john@example.com',
  createdAt: new Date(),
  updatedAt: new Date()
};

// TypeScript knows NewUser doesn't require id or timestamps
const newUser: NewUser = {
  name: 'Jane',
  email: 'jane@example.com'
};
```

## Best Practices

1. **Use Transactions** for operations that must succeed or fail together:
   ```typescript
   await db.transaction(async (tx) => {
     await tx.insert(users).values(newUser);
     await tx.insert(todos).values(newTodo);
   });
   ```

2. **Use Prepared Statements** for repeated queries:
   ```typescript
   const getUserById = db.select()
     .from(users)
     .where(eq(users.id, sql.placeholder('id')))
     .prepare('get_user_by_id');

   const user = await getUserById.execute({ id: '123' });
   ```

3. **Validate Input** before database operations:
   ```typescript
   import { z } from 'zod';

   const userSchema = z.object({
     name: z.string().min(1).max(100),
     email: z.string().email()
   });
   ```

4. **Handle Errors** gracefully:
   ```typescript
   try {
     await db.insert(users).values(newUser);
   } catch (error) {
     if (error.code === '23505') { // Unique violation
       return { success: false, error: 'Email already exists' };
     }
     throw error;
   }
   ```

## Troubleshooting

### Connection Issues

**Error: "connect ECONNREFUSED"**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify port 5432 is accessible

**Error: "password authentication failed"**
- Check username and password in `DATABASE_URL`
- Ensure user has proper permissions

### Migration Issues

**Error: "relation already exists"**
- Drop the existing tables or use `pnpm db:push` for development
- For production, use proper migration workflow

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle with PostgreSQL](https://orm.drizzle.team/docs/get-started/postgresql-new)
- [Drizzle Kit Commands](https://orm.drizzle.team/kit-docs/commands)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Migration from In-Memory to Database

If you're migrating from the in-memory todos to database-backed todos:

1. Update `src/routes/todos.remote.ts` to use `db` instead of in-memory array
2. Push schema: `pnpm db:push`
3. Test the application
4. Enjoy persistent data!
