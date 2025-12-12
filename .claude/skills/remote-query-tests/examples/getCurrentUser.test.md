# Example: getCurrentUser Query Test

This example demonstrates testing a query that accesses request event data. While `getRequestEvent` is specific to this query, the patterns shown here can be adapted for any remote query.

## The Query Function

```typescript
// src/lib/auth/remotes/getCurrentUser.ts
import { getRequestEvent, query } from '$app/server';

export const getCurrentUser = query(async () => {
  const event = getRequestEvent();
  return event.locals.user;
});
```

## The Test File

```typescript
// src/lib/auth/remotes/getCurrentUser.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../types';
import { getCurrentUser } from './getCurrentUser';
import { getRequestEvent } from '$app/server';

// Mock the SKit server module
vi.mock('$app/server', () => ({
  getRequestEvent: vi.fn(),
  query: vi.fn((fn) => fn)
}));

describe('getCurrentUser', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  // Test case 1: User is present
  it('returns user when user is present in event.locals', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: true,
      image: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    } as User;

    const mockEvent = {
      locals: {
        user: mockUser
      }
    } as ReturnType<typeof getRequestEvent>;

    const mockGetRequestEvent = vi.mocked(getRequestEvent)
      .mockReturnValue(mockEvent);

    // Act
    const result = await getCurrentUser();

    // Assert
    expect(mockGetRequestEvent).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockUser);
    expect(result).toEqual(mockUser);
  });

  // Test case 2: User property exists but is null
  it('returns null when user is null in event.locals', async () => {
    // Arrange
    const mockEvent = {
      locals: {
        user: null
      }
    } as ReturnType<typeof getRequestEvent>;

    const mockGetRequestEvent = vi.mocked(getRequestEvent)
      .mockReturnValue(mockEvent);

    // Act
    const result = await getCurrentUser();

    // Assert
    expect(mockGetRequestEvent).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  // Test case 3: User property is undefined
  it('returns undefined when user is not present in event.locals', async () => {
    // Arrange
    const mockEvent = {
      locals: {}
    } as ReturnType<typeof getRequestEvent>;

    const mockGetRequestEvent = vi.mocked(getRequestEvent)
      .mockReturnValue(mockEvent);

    // Act
    const result = await getCurrentUser();

    // Assert
    expect(mockGetRequestEvent).toHaveBeenCalledTimes(1);
    expect(result).toBeUndefined();
  });

  // Test case 4: Validate all properties are preserved
  it('returns user with all required properties', async () => {
    // Arrange
    const mockUser: User = {
      id: 'user-456',
      email: 'user@example.com',
      name: 'Example User',
      emailVerified: false,
      image: 'https://example.com/avatar.jpg',
      createdAt: new Date('2024-06-15T10:30:00Z'),
      updatedAt: new Date('2024-06-20T14:45:00Z')
    } as User;

    const mockEvent = {
      locals: {
        user: mockUser
      }
    } as ReturnType<typeof getRequestEvent>;

    const mockGetRequestEvent = vi.mocked(getRequestEvent)
      .mockReturnValue(mockEvent);

    // Act
    const result = await getCurrentUser();

    // Assert
    expect(mockGetRequestEvent).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
    expect(result?.id).toBe('user-456');
    expect(result?.email).toBe('user@example.com');
    expect(result?.name).toBe('Example User');
    expect(result?.emailVerified).toBe(false);
    expect(result?.image).toBe('https://example.com/avatar.jpg');
    expect(result?.createdAt).toEqual(new Date('2024-06-15T10:30:00Z'));
    expect(result?.updatedAt).toEqual(new Date('2024-06-20T14:45:00Z'));
  });
});
```

## Key Takeaways

1. **Mock Setup** - Use `vi.mock('$app/server')` with string path for query modules
2. **Type Casting** - Safe use of `as ReturnType<typeof getRequestEvent>` for mock objects
3. **Test Coverage** - Covers all possible states: user present, null, undefined
4. **Property Validation** - Verifies individual properties when testing complex objects
5. **Mock Verification** - Always verify dependencies were called

## Adapting for Other Queries

For queries that don't use `getRequestEvent`:

1. Remove the `getRequestEvent` import and mock
2. Mock the actual dependencies your query uses
3. Adapt the test cases to match your query's behavior
4. Keep the same structure: Arrange, Act, Assert

## General Pattern

```typescript
// 1. Mock $app/server (required for all queries)
vi.mock('$app/server', () => ({
  query: vi.fn((fn) => fn)
}));

// 2. Mock your specific dependencies
vi.mock('./your-dependency', () => ({
  yourFunction: vi.fn()
}));

// 3. Write tests following AAA pattern
it('describes behavior', async () => {
  // Arrange - Set up mocks
  // Act - Call your query
  // Assert - Check results
});
```