# SvelteKit Remote Functions

This document explains how SvelteKit Remote Functions are implemented in the Swipe Check project.

## Overview

Remote Functions are a powerful experimental feature in SvelteKit that allows you to write server-only logic in `.remote.ts` files and call them from Svelte components as if they were regular functions.

**Key Benefits:**
- **Type-Safe**: Full TypeScript support with end-to-end type safety
- **Secure**: Server-only code that never gets exposed to the client
- **Simple**: Call server functions like regular JavaScript functions
- **Progressive Enhancement**: Forms work with and without JavaScript
- **Automatic Serialization**: Data is automatically serialized using `devalue`

## Current Status

⚠️ **Experimental Feature**: Remote Functions are currently experimental and subject to change. Enable at your own risk for production applications.

## Setup

### 1. Enable in Configuration

Remote functions must be enabled in `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		experimental: {
			remoteFunctions: true  // Enable remote functions
		}
	},

	compilerOptions: {
		experimental: {
			async: true  // Enable async/await in templates
		}
	}
};

export default config;
```

### 2. Create Remote Function Files

Create `.remote.ts` files anywhere in your `src/routes/` directory:

```
src/routes/
├── data.remote.ts     # General remote functions
├── todos.remote.ts    # Todo CRUD operations
└── ...
```

## Function Types

SvelteKit Remote Functions come in four types:

### 1. `query()` - Fetch Data

Query functions are used to fetch data from the server. They can be awaited directly in Svelte templates.

**Example:**

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
	// Fetch from database
	return await db.findById(id);
});
```

**Usage in Components:**

```svelte
<script lang="ts">
	import { getServerData, getRecord } from './data.remote';

	let recordId = $state('42');
</script>

<!-- Await directly in template -->
<pre>{JSON.stringify(await getServerData(), null, 2)}</pre>

<!-- With reactive parameters -->
<pre>{JSON.stringify(await getRecord(recordId), null, 2)}</pre>
```

### 2. `form()` - Handle Form Submissions

Form functions handle form submissions with progressive enhancement. They work with or without JavaScript enabled.

**Example:**

```typescript
// src/routes/data.remote.ts
import { form } from '$app/server';

export const submitData = form(async (data: FormData) => {
	const text = data.get('text') as string;

	if (!text) {
		return {
			success: false,
			error: 'Text is required'
		};
	}

	// Process data
	await saveToDatabase(text);

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

<!-- Form automatically submits to server -->
<form {...submitData}>
	<input type="text" name="text" required />
	<button type="submit">Submit</button>
</form>
```

### 3. `command()` - Execute Actions

Command functions execute actions without returning data. They're useful for logging, analytics, or other side effects.

**Example:**

```typescript
// src/routes/data.remote.ts
import { command } from '$app/server';

export const logActivity = command(async (activity: string) => {
	console.log(`Activity at ${new Date().toISOString()}: ${activity}`);
	await analyticsService.track(activity);
	// Commands don't return values
});
```

**Usage in Components:**

```svelte
<script lang="ts">
	import { logActivity } from './data.remote';
</script>

<button onclick={() => logActivity('Button clicked')}>
	Click me
</button>
```

### 4. `prerender()` - Static Data

Prerender functions are used for static site generation. They run at build time.

```typescript
import { prerender } from '$app/server';

export const getStaticData = prerender(async () => {
	return {
		buildTime: new Date().toISOString(),
		version: '1.0.0'
	};
});
```

## Complete CRUD Example

Here's a complete todo application using remote functions:

**`src/routes/todos.remote.ts`:**

```typescript
import { query, form } from '$app/server';

interface Todo {
	id: string;
	text: string;
	completed: boolean;
}

let todos: Todo[] = [];

// READ
export const getTodos = query(async () => {
	return todos;
});

// CREATE
export const addTodo = form(async (data: FormData) => {
	const text = data.get('text') as string;

	if (!text) {
		return { success: false, error: 'Text required' };
	}

	const newTodo = {
		id: Date.now().toString(),
		text,
		completed: false
	};

	todos.push(newTodo);
	return { success: true, todo: newTodo };
});

// UPDATE
export const toggleTodo = form(async (data: FormData) => {
	const id = data.get('id') as string;
	const todo = todos.find(t => t.id === id);

	if (!todo) {
		return { success: false, error: 'Todo not found' };
	}

	todo.completed = !todo.completed;
	return { success: true, todo };
});

// DELETE
export const deleteTodo = form(async (data: FormData) => {
	const id = data.get('id') as string;
	const index = todos.findIndex(t => t.id === id);

	if (index === -1) {
		return { success: false, error: 'Todo not found' };
	}

	const deleted = todos.splice(index, 1)[0];
	return { success: true, todo: deleted };
});
```

**`src/routes/todos/+page.svelte`:**

```svelte
<script lang="ts">
	import { getTodos, addTodo, toggleTodo, deleteTodo } from '../todos.remote';

	let todosPromise = $derived(getTodos());
</script>

<!-- Add form -->
<form {...addTodo}>
	<input type="text" name="text" required />
	<button type="submit">Add</button>
</form>

<!-- List todos -->
{#await todosPromise then todos}
	{#each todos as todo}
		<div>
			<!-- Toggle form -->
			<form {...toggleTodo}>
				<input type="hidden" name="id" value={todo.id} />
				<button type="submit">
					{todo.completed ? '✓' : '○'}
				</button>
			</form>

			<span>{todo.text}</span>

			<!-- Delete form -->
			<form {...deleteTodo}>
				<input type="hidden" name="id" value={todo.id} />
				<button type="submit">×</button>
			</form>
		</div>
	{/each}
{/await}
```

## Project Structure

```
src/
├── routes/
│   ├── +page.svelte           # Home page
│   ├── data.remote.ts         # General remote functions
│   ├── todos.remote.ts        # Todo CRUD operations
│   ├── demo/
│   │   └── +page.svelte       # Demo of remote functions
│   └── todos/
│       └── +page.svelte       # Todos CRUD demo
└── lib/
    └── ...
```

## How It Works

### On the Server
When code runs on the server (during SSR), remote functions execute directly as regular async functions.

### On the Client
When code runs in the browser:
- **Query functions** become wrappers around `fetch()` calls
- **Form functions** use progressive enhancement - forms submit normally, but JavaScript can enhance the experience
- Data is automatically serialized/deserialized using `devalue`

## Best Practices

### 1. Security
- Never expose secrets or sensitive logic in remote functions
- Validate all inputs (FormData, parameters)
- Implement proper authentication and authorization

```typescript
export const deleteUser = form(async (data: FormData, event) => {
	// Check authentication
	if (!event.locals.user) {
		return { success: false, error: 'Not authenticated' };
	}

	// Check authorization
	const userId = data.get('userId') as string;
	if (event.locals.user.id !== userId && !event.locals.user.isAdmin) {
		return { success: false, error: 'Not authorized' };
	}

	// Proceed with deletion
	await db.deleteUser(userId);
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
			throw new Error('Data not found');
		}
		return data;
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error; // Will be caught by {#await} error block
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

### 4. Progressive Enhancement
Always design forms to work without JavaScript:

```svelte
<!-- This form will work even if JavaScript fails to load -->
<form {...submitData}>
	<input type="text" name="text" required />
	<button type="submit">Submit</button>
</form>
```

### 5. Performance
- Use query batching for multiple requests (SvelteKit handles this automatically)
- Cache results when appropriate
- Avoid unnecessary re-fetching

## Differences from Traditional API Routes

| Feature | Remote Functions | API Routes (+server.ts) |
|---------|-----------------|-------------------------|
| File extension | `.remote.ts` | `+server.ts` |
| Usage | Import and call like functions | Fetch via HTTP |
| Type safety | Full end-to-end | Manual typing |
| Serialization | Automatic | Manual |
| Progressive enhancement | Built-in | Manual |
| When to use | Internal app logic | Public APIs, webhooks |

## Advanced Features

### Event Access
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

### Schema Validation
Form functions support schema validation:

```typescript
import { z } from 'zod';

const todoSchema = z.object({
	text: z.string().min(1).max(100),
	priority: z.enum(['low', 'medium', 'high']).optional()
});

export const addTodo = form(async (data: FormData) => {
	const result = todoSchema.safeParse({
		text: data.get('text'),
		priority: data.get('priority')
	});

	if (!result.success) {
		return {
			success: false,
			error: result.error.message
		};
	}

	// Use validated data
	const { text, priority } = result.data;
	// ...
});
```

## Development

Start the development server:

```bash
pnpm dev
```

Visit:
- Home: http://localhost:5173
- Demo: http://localhost:5173/demo
- Todos: http://localhost:5173/todos

## Resources

- [Official SvelteKit Remote Functions Docs](https://svelte.dev/docs/kit/remote-functions)
- [GitHub Discussion](https://github.com/sveltejs/kit/discussions/13897)
- [Example Repository](https://github.com/devgauravjatt/svelte-remote-functions-example)
- [Remote Functions vs tRPC](https://gornostay25.dev/post/sveltekit-remote-functions-vs-trpc)

## Troubleshooting

### Remote functions not working
1. Ensure `experimental.remoteFunctions: true` is set in `svelte.config.js`
2. Restart the dev server after configuration changes
3. Check that files use `.remote.ts` extension
4. Verify imports use the correct path

### Type errors
1. Run `pnpm run check` to see detailed type errors
2. Ensure you're using the latest version of `@sveltejs/kit`
3. Check that `compilerOptions.experimental.async` is enabled for template awaits

### Forms not submitting
1. Verify the form uses the spread operator: `<form {...formFunction}>`
2. Check that input fields have `name` attributes
3. Ensure the form function returns a result object

## Migration from API Routes

If you're migrating from traditional API routes:

**Before (+server.ts):**
```typescript
// src/routes/api/data/+server.ts
import { json } from '@sveltejs/kit';
export async function GET({ params }) {
	const data = await fetchData(params.id);
	return json(data);
}
```

```svelte
<!-- Usage -->
<script>
	let data = $state(null);
	async function load() {
		const res = await fetch('/api/data/123');
		data = await res.json();
	}
</script>
```

**After (.remote.ts):**
```typescript
// src/routes/data.remote.ts
import { query } from '$app/server';
export const getData = query(async (id: string) => {
	return await fetchData(id);
});
```

```svelte
<!-- Usage -->
<script>
	import { getData } from './data.remote';
</script>

<div>{JSON.stringify(await getData('123'))}</div>
```

Much simpler and type-safe!
