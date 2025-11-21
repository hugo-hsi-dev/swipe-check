# Remote Functions Guide

## Overview

This project uses SvelteKit Remote Functions for all server interactions. Remote functions allow you to write server-only logic in `.remote.ts` files and call them from components as if they were regular functions.

**Key Benefits:**

- Type-safe end-to-end communication
- Secure server-only code
- Simple function calls (no fetch boilerplate)
- Progressive enhancement for forms
- Automatic serialization

## Function Types

### 1. `query()` - Fetch Data

Query functions fetch data from the server. They can be awaited directly in Svelte templates.

```typescript
// src/routes/data.remote.ts
import { query } from '$app/server';

export const getServerData = query(async () => {
	return {
		timestamp: new Date().toISOString(),
		message: 'Data from server'
	};
});

export const getRecord = query(async (id: string) => {
	return await db.findById(id);
});
```

**Usage in Components:**

```svelte
<script lang="ts">
	import { getServerData, getRecord } from './data.remote';
	let recordId = $state('42');
</script>

<pre>{JSON.stringify(await getServerData(), null, 2)}</pre>
<pre>{JSON.stringify(await getRecord(recordId), null, 2)}</pre>
```

### 2. `form()` - Handle Form Submissions

Form functions handle form submissions with progressive enhancement. They work with or without JavaScript.

```typescript
// src/routes/data.remote.ts
import { form } from '$app/server';
import { z } from 'zod';

const submitSchema = z.object({
	text: z.string().min(1, 'Text is required')
});

export const submitData = form(submitSchema, async (data) => {
	// data is validated and typed
	await saveToDatabase(data.text);

	return {
		success: true,
		message: 'Data saved successfully'
	};
});
```

**Usage in Components:**

```svelte
<script lang="ts">
	import { submitData } from './data.remote';
</script>

<form {...submitData}>
	<input type="text" name="text" required />
	<button type="submit">Submit</button>
</form>
```

### 3. `command()` - Execute Actions

Command functions execute actions without returning data. Useful for logging, analytics, or side effects.

```typescript
// src/routes/data.remote.ts
import { command } from '$app/server';

export const logActivity = command(async (activity: string) => {
	console.log(`Activity: ${activity}`);
	await analyticsService.track(activity);
});
```

**Usage in Components:**

```svelte
<script lang="ts">
	import { logActivity } from './data.remote';
</script>

<button onclick={() => logActivity('Button clicked')}> Click me </button>
```

## Complete CRUD Example

```typescript
// src/routes/todos.remote.ts
import { query, form } from '$app/server';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { todos } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// READ
export const getTodos = query(async () => {
	return await db.select().from(todos);
});

// CREATE
const addTodoSchema = z.object({
	text: z.string().min(1).max(100)
});

export const addTodo = form(addTodoSchema, async (data) => {
	const [newTodo] = await db.insert(todos).values({ text: data.text }).returning();

	return { success: true, todo: newTodo };
});

// UPDATE
const toggleTodoSchema = z.object({
	id: z.string().uuid()
});

export const toggleTodo = form(toggleTodoSchema, async (data) => {
	const [todo] = await db.select().from(todos).where(eq(todos.id, data.id));

	if (!todo) {
		return { success: false, error: 'Todo not found' };
	}

	const [updated] = await db
		.update(todos)
		.set({ completed: !todo.completed })
		.where(eq(todos.id, data.id))
		.returning();

	return { success: true, todo: updated };
});

// DELETE
const deleteTodoSchema = z.object({
	id: z.string().uuid()
});

export const deleteTodo = form(deleteTodoSchema, async (data) => {
	await db.delete(todos).where(eq(todos.id, data.id));
	return { success: true };
});
```

## Best Practices

### 1. Security

Always validate inputs and check authentication:

```typescript
export const deleteUser = form(deleteUserSchema, async (data, event) => {
	// Check authentication
	if (!event.locals.user) {
		return { success: false, error: 'Not authenticated' };
	}

	// Check authorization
	if (event.locals.user.id !== data.userId && !event.locals.user.isAdmin) {
		return { success: false, error: 'Not authorized' };
	}

	await db.deleteUser(data.userId);
	return { success: true };
});
```

### 2. Error Handling

Always handle errors gracefully:

```typescript
export const getData = query(async (id: string) => {
	try {
		const data = await db.findById(id);
		if (!data) {
			return { success: false, error: 'Data not found' };
		}
		return { success: true, data };
	} catch (error) {
		console.error('Error fetching data:', error);
		return { success: false, error: 'Failed to fetch data' };
	}
});
```

### 3. Type Safety

Use TypeScript for full type safety:

```typescript
interface User {
	id: string;
	name: string;
	email: string;
}

export const getUser = query(async (id: string): Promise<User> => {
	return await db.users.findById(id);
});
```

### 4. Event Access

Remote functions receive the request event as a second parameter:

```typescript
export const getUserData = query(async (userId: string, event) => {
	// Access cookies
	const sessionId = event.cookies.get('sessionId');

	// Access route information
	console.log('Called from:', event.route.id);
	console.log('URL:', event.url.pathname);

	return await db.users.findById(userId);
});
```

## Reusable Query Pattern

Create reusable queries that can be imported by other remote functions:

```typescript
// src/routes/auth.remote.ts
export const getCurrentUser = query(async (_, event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	return session?.user ?? null;
});

// src/routes/quiz.remote.ts
import { getCurrentUser } from './auth.remote';

export const getQuestions = query(async (data) => {
	const user = await getCurrentUser();
	if (!user) {
		return { success: false, error: 'Not authenticated' };
	}
	// Use user.id...
});
```

**Benefits:**

- Centralized session validation
- Query deduplication (SvelteKit calls it once per request)
- Consistent authentication pattern
- Type-safe user object

## Progressive Enhancement

Forms work without JavaScript:

```svelte
<!-- This form will work even if JavaScript fails to load -->
<form {...submitData}>
	<input type="text" name="text" required />
	<button type="submit">Submit</button>
</form>
```

## Resources

- [Official SvelteKit Remote Functions Docs](https://svelte.dev/docs/kit/remote-functions)
- See `REMOTE_FUNCTIONS.md` for comprehensive examples
- See `remote-functions-errors.md` for error handling patterns
