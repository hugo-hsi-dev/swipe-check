# Testing Svelte 5 Remote Functions

This document summarizes our investigation and best practices for testing Svelte 5's experimental remote functions with Vitest.

## Overview

Svelte 5 introduced experimental **remote functions** as a way to enable type-safe communication between client and server. These functions are defined in `.remote.ts` or `.remote.js` files and use the `query`, `form`, `command`, and `prerender` functions from `$app/server`.

## Configuration

Remote functions are enabled in `svelte.config.js`:

```js
export default {
  kit: {
    experimental: {
      remoteFunctions: true
    }
  },
  compilerOptions: {
    experimental: {
      async: true  // Optional: enables await in components
    }
  }
};
```

## Key Findings

### ✅ What Works

1. **Creating Remote Functions**: Remote functions can be created successfully using the proper pattern
2. **Importing Remote Functions**: Remote functions can be imported in test files without issues
3. **Mocking Remote Functions**: Remote functions can be mocked using `vi.mock()` in Vitest
4. **Component Testing**: Components that use remote queries can be tested with mocked functions

### ❌ What Doesn't Work

1. **Direct Execution in Unit Tests**: Remote functions cannot be called directly in Vitest unit tests
2. **Server-Side Tests**: Attempting to execute remote functions in server-side tests fails with:
   ```
   Error: Could not get the request store. This is an internal error.
   ```

### 🔍 Root Cause

Remote functions require a SvelteKit request context that is not available in the Vitest test environment. They are designed to run within the SvelteKit request/response cycle, not in isolated test contexts.

## Testing Strategies

### 1. Test Underlying Logic Separately (Recommended)

Keep remote functions as thin wrappers and test business logic independently:

```typescript
// ✅ Good: Testable business logic
export async function fetchUserFromDatabase(userId: number) {
  const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  return user;
}

// Remote function as a thin wrapper
export const getUser = query(v.number(), async (userId) => {
  return fetchUserFromDatabase(userId);
});

// Test the business logic directly
describe('fetchUserFromDatabase', () => {
  it('should fetch user by ID', async () => {
    const user = await fetchUserFromDatabase(123);
    expect(user.id).toBe(123);
  });
});
```

### 2. Mock Remote Functions in Component Tests

When testing components that consume remote functions, mock them:

```typescript
// ✅ Mock the remote function module
vi.mock('$lib/server/queries.remote', () => ({
  getUserData: vi.fn()
}));

import { getUserData } from '$lib/server/queries.remote';

describe('UserProfile component', () => {
  it('should render with mocked data', async () => {
    // Mock the return value
    (getUserData as any).mockResolvedValue({
      id: 123,
      name: 'Test User',
      email: 'test@example.com'
    });

    render(UserProfile, { props: { userId: 123 } });

    await new Promise((resolve) => setTimeout(resolve, 50));

    // Verify the mock was called
    expect(getUserData).toHaveBeenCalledWith(123);
  });
});
```

### 3. Integration Testing

For end-to-end testing of remote functions:

- Use Playwright or similar tools to test in a full browser environment
- Make actual HTTP requests to the generated remote function endpoints
- Test the complete request/response cycle

### 4. Server-Side Logic Testing

Test server-side logic using regular async functions:

```typescript
// testQuery.ts - Regular server functions (testable)
export async function getTestNumber(): Promise<number> {
  return 42;
}

// testQuery.remote.ts - Remote function wrapper
import { query } from '$app/server';
import { getTestNumber } from './testQuery';

export const getTestNumberRemote = query(async () => {
  return getTestNumber();
});

// testQuery.spec.ts - Unit test
describe('Server functions', () => {
  it('should return test number', async () => {
    const result = await getTestNumber();
    expect(result).toBe(42);
  });
});
```

## Example Files

### Remote Function Definition

```typescript
// src/lib/server/users.remote.ts
import { query, command, form } from '$app/server';
import * as v from 'valibot';

export const getUser = query(v.number(), async (userId: number) => {
  const user = await db.users.findById(userId);
  return user;
});

export const updateUser = command(
  v.object({
    userId: v.number(),
    name: v.string()
  }),
  async ({ userId, name }) => {
    await db.users.update(userId, { name });
    return { success: true };
  }
);
```

### Component Using Remote Query

```svelte
<!-- src/components/UserProfile.svelte -->
<script lang="ts">
  import { getUser } from '$lib/server/users.remote';

  let { userId } = $props();
  const user = $derived(await getUser(userId));
</script>

<div class="user-profile">
  <h2>{user.name}</h2>
  <p>{user.email}</p>
</div>
```

### Component Test with Mocked Remote Query

```typescript
// src/components/UserProfile.svelte.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import UserProfile from './UserProfile.svelte';

vi.mock('$lib/server/users.remote', () => ({
  getUser: vi.fn()
}));

import { getUser } from '$lib/server/users.remote';

describe('UserProfile', () => {
  it('should call getUser with correct userId', async () => {
    (getUser as any).mockResolvedValue({
      id: 123,
      name: 'Test User',
      email: 'test@example.com'
    });

    render(UserProfile, { props: { userId: 123 } });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(getUser).toHaveBeenCalledWith(123);
  });
});
```

## Best Practices

1. **Keep Remote Functions Thin**: Use remote functions as wrappers around testable business logic
2. **Mock for Component Tests**: Always mock remote functions when testing components
3. **Test Business Logic Separately**: Extract and test core logic in isolation
4. **Use Integration Tests**: Test the full remote function flow with end-to-end tests
5. **Document Limitations**: Be aware that unit testing remote functions directly is not possible

## Known Limitations

- Remote functions cannot be executed directly in Vitest unit tests
- The experimental nature of remote functions means this behavior may change
- Server-side rendering with remote functions is not yet fully supported in all contexts
- Vitest does not provide the SvelteKit request context needed for remote functions

## Future Considerations

As Svelte 5 and SvelteKit mature, testing support for remote functions may improve. Monitor:

- SvelteKit release notes for changes to remote functions
- Vitest updates for better SvelteKit integration
- Community tools for testing remote functions

## Additional Resources

- [SvelteKit Remote Functions Documentation](https://svelte.dev/docs/kit/remote-functions)
- [Vitest Documentation](https://vitest.dev/)
- [Standard Schema Validation](https://standardschema.dev/)

---

**Last Updated**: 2024
**Status**: Remote functions are experimental in Svelte 5