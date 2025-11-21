# Database Guide

## Overview

This project uses Drizzle ORM with PostgreSQL for type-safe database operations.

## Schema Organization

- **Main schema**: `src/lib/server/db/schema.ts` - App-specific tables
- **Auth schema**: `src/lib/server/db/auth-schema.ts` - Better Auth tables (generated)
- **Database client**: `src/lib/server/db/index.ts`

**Important:** Keep app schemas separate from Better Auth schemas to prevent overwrites when regenerating auth schema.

## Common Query Patterns

### Select

```typescript
import { db } from '$lib/server/db';
import { users, todos } from '$lib/server/db/schema';
import { eq, and, or, like, desc } from 'drizzle-orm';

// Select all
const allUsers = await db.select().from(users);

// Select with where clause
const user = await db.select().from(users).where(eq(users.id, userId));

// Select with multiple conditions
const completedTodos = await db
	.select()
	.from(todos)
	.where(and(eq(todos.userId, userId), eq(todos.completed, true)));

// Select with like (search)
const searchUsers = await db.select().from(users).where(like(users.name, '%john%'));

// Select with joins
const todosWithUsers = await db.select().from(todos).leftJoin(users, eq(todos.userId, users.id));

// Select with order
const recentTodos = await db.select().from(todos).orderBy(desc(todos.createdAt));
```

### Insert

```typescript
// Insert single record
const [newUser] = await db
	.insert(users)
	.values({ name: 'John', email: 'john@example.com' })
	.returning();

// Insert multiple records
const newUsers = await db
	.insert(users)
	.values([
		{ name: 'John', email: 'john@example.com' },
		{ name: 'Jane', email: 'jane@example.com' }
	])
	.returning();
```

### Update

```typescript
// Update with where clause
const [updated] = await db
	.update(users)
	.set({ name: 'Jane', updatedAt: new Date() })
	.where(eq(users.id, userId))
	.returning();
```

### Delete

```typescript
// Delete with where clause
await db.delete(users).where(eq(users.id, userId));
```

## Schema Definition

### Example Table

```typescript
import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### With Foreign Keys

```typescript
export const todos = pgTable('todos', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	text: text('text').notNull(),
	completed: boolean('completed').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
```

### With Enums

```typescript
import { pgEnum } from 'drizzle-orm/pg-core';

export const dimensionEnum = pgEnum('dimension', ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P']);

export const questions = pgTable('questions', {
	id: uuid('id').defaultRandom().primaryKey(),
	text: text('text').notNull(),
	targetDimension: dimensionEnum('target_dimension').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
```

## Best Practices

### 1. Use Transactions

For operations that must succeed or fail together:

```typescript
await db.transaction(async (tx) => {
	await tx.insert(users).values(newUser);
	await tx.insert(todos).values(newTodo);
});
```

### 2. Validate Input

Always validate before database operations:

```typescript
import { z } from 'zod';

const userSchema = z.object({
	name: z.string().min(1).max(100),
	email: z.string().email()
});

// In remote function
export const createUser = form(userSchema, async (data) => {
	// data is already validated
	const [newUser] = await db.insert(users).values(data).returning();

	return { success: true, user: newUser };
});
```

### 3. Handle Errors

Handle database errors gracefully:

```typescript
try {
	await db.insert(users).values(newUser);
} catch (error) {
	if (error.code === '23505') {
		// Unique violation
		return { success: false, error: 'Email already exists' };
	}
	throw error;
}
```

### 4. Use Type Safety

Leverage Drizzle's type inference:

```typescript
import type { User, NewUser } from '$lib/server/db/schema';

// TypeScript knows the exact shape
const user: User = {
	id: '123',
	name: 'John',
	email: 'john@example.com',
	createdAt: new Date(),
	updatedAt: new Date()
};

// NewUser doesn't require id or timestamps
const newUser: NewUser = {
	name: 'Jane',
	email: 'jane@example.com'
};
```

## Development Workflow

### Making Schema Changes

1. Edit `src/lib/server/db/schema.ts`
2. Push changes: `pnpm db:push`

### Using Migrations (Production)

1. Make schema changes
2. Generate migration: `pnpm db:generate`
3. Review migration in `drizzle/` directory
4. Apply migration: `pnpm db:migrate`

### Drizzle Studio

Visual database browser:

```bash
pnpm db:studio
```

Opens at `https://local.drizzle.studio` to browse tables, run queries, and edit data.

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

- Drop existing tables or use `pnpm db:push` for development
- For production, use proper migration workflow

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle with PostgreSQL](https://orm.drizzle.team/docs/get-started/postgresql-new)
- See `DATABASE.md` for detailed setup instructions
