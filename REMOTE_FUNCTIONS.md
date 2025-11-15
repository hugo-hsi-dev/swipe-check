# Remote Functions Documentation

This document explains how remote functions are implemented in the Swipe Check project using SvelteKit's server-side capabilities.

## Overview

Remote functions allow you to execute code on the server, providing benefits like:

- Secure API operations (accessing databases, external APIs)
- Server-only logic that shouldn't be exposed to clients
- Server-side data processing
- Protection of sensitive credentials and business logic

## Project Structure

```
src/
├── lib/
│   └── server/           # Server-only utilities
│       └── index.ts      # Server-side functions
└── routes/
    ├── api/              # API endpoints
    │   ├── hello/
    │   │   └── +server.ts
    │   ├── data/
    │   │   └── +server.ts
    │   └── records/
    │       └── [id]/
    │           └── +server.ts
    └── demo/
        ├── +page.svelte        # Demo page UI
        └── +page.server.ts     # Server-side load function
```

## Server-Only Functions

Located in `/src/lib/server/index.ts`, these functions can only be imported and executed on the server:

```typescript
import { getServerData, processData, fetchFromDatabase } from '$lib/server';
```

**Important:** Files in `$lib/server` are automatically excluded from client bundles by SvelteKit.

### Available Functions

- `getServerData()` - Fetch server-side data with timestamp
- `processData(input: string)` - Process text data on the server
- `fetchFromDatabase(id: string)` - Simulate database operations

## API Endpoints

API endpoints are created using `+server.ts` files in the routes directory.

### GET /api/hello

Simple endpoint returning a greeting:

```bash
curl http://localhost:5173/api/hello
```

Response:
```json
{
  "message": "Hello from the server!",
  "timestamp": "2025-11-15T..."
}
```

### GET /api/data

Fetch data using server-side functions:

```bash
curl http://localhost:5173/api/data
```

Response:
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-11-15T...",
    "environment": "server",
    "message": "This data was fetched from the server"
  }
}
```

### POST /api/data

Process data on the server:

```bash
curl -X POST http://localhost:5173/api/data \
  -H "Content-Type: application/json" \
  -d '{"text": "hello world"}'
```

Response:
```json
{
  "success": true,
  "result": {
    "processed": "HELLO WORLD",
    "length": 11
  }
}
```

### GET /api/records/[id]

Fetch a record by ID (parameterized route):

```bash
curl http://localhost:5173/api/records/123
```

Response:
```json
{
  "success": true,
  "record": {
    "id": "123",
    "data": "Record 123",
    "fetchedAt": "2025-11-15T..."
  }
}
```

## Server-Side Load Functions

The demo page (`/demo`) uses a server-side load function to fetch data before rendering:

**File:** `/src/routes/demo/+page.server.ts`

```typescript
export const load: PageServerLoad = async () => {
  const serverData = await getServerData();
  const record = await fetchFromDatabase('demo-123');

  return {
    serverData,
    record,
    loadedAt: new Date().toISOString()
  };
};
```

The data is automatically passed to the page component via the `data` prop.

## Using Remote Functions in Components

### Server Load Function Data

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  const { data }: { data: PageData } = $props();
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>
```

### API Endpoint Calls

```svelte
<script lang="ts">
  let result = $state(null);

  async function fetchData() {
    const response = await fetch('/api/hello');
    result = await response.json();
  }
</script>

<button onclick={fetchData}>Fetch</button>
{#if result}
  <pre>{JSON.stringify(result, null, 2)}</pre>
{/if}
```

## Development

Start the development server:

```bash
pnpm dev
```

Visit:
- Home page: http://localhost:5173
- Demo page: http://localhost:5173/demo
- API endpoints: http://localhost:5173/api/*

## Type Safety

All endpoints use TypeScript and auto-generated types from SvelteKit:

```typescript
import type { RequestHandler } from './$types';
import type { PageServerLoad } from './$types';
```

## Best Practices

1. **Server-Only Code**: Place sensitive logic in `/src/lib/server/`
2. **Type Safety**: Use TypeScript for all server functions
3. **Error Handling**: Always validate inputs and handle errors
4. **Response Format**: Use consistent JSON response structures
5. **HTTP Methods**: Use appropriate HTTP methods (GET for retrieval, POST for mutations)

## Adding New Remote Functions

### 1. Create a Server-Only Function

Add to `/src/lib/server/index.ts`:

```typescript
export async function myServerFunction() {
  // Your server-side logic
  return { result: 'data' };
}
```

### 2. Create an API Endpoint

Create `/src/routes/api/myendpoint/+server.ts`:

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { myServerFunction } from '$lib/server';

export const GET: RequestHandler = async () => {
  const data = await myServerFunction();
  return json({ success: true, data });
};
```

### 3. Use in Components

```svelte
<script lang="ts">
  async function callEndpoint() {
    const res = await fetch('/api/myendpoint');
    const data = await res.json();
    console.log(data);
  }
</script>
```

## Learn More

- [SvelteKit Routing](https://svelte.dev/docs/kit/routing)
- [Server-Side Routes](https://svelte.dev/docs/kit/routing#server)
- [Load Functions](https://svelte.dev/docs/kit/load)
- [API Routes](https://svelte.dev/docs/kit/routing#server)
