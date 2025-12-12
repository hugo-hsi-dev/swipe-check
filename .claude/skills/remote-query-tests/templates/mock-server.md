# Mocking $app/server Module

## Why Special Handling is Needed

SKit's `query` function modifies its prototype internally, making it impossible to mock using the type-safe `vi.mock(import('$app/server'))` syntax. We must use the non-type-safe form with the string path.

## Mock Template

```typescript
import { vi } from 'vitest';

// Mock at the top level of your test file
vi.mock('$app/server', () => ({
  query: vi.fn((fn) => fn),
  // Include other exports if your query uses them
  command: vi.fn(),
  form: vi.fn(),
  prerender: vi.fn(),
  read: vi.fn()
}));
```

## Why This Works

The `query` mock simply passes through the function it receives. This preserves the original query behavior while allowing us to mock any dependencies the query uses.

## Complete Example Setup

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { myQuery } from './my-query';

// Mock $app/server
vi.mock('$app/server', () => ({
  query: vi.fn((fn) => fn)
}));

describe('myQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns expected data', async () => {
    // Arrange
    // Set up any dependencies your query needs
    
    // Act
    const result = await myQuery();
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

## Type Safety Considerations

When mocking dependencies:
1. TypeScript will still error if types are completely different
2. Use `as` sparingly and only when types resemble each other
3. Missing properties will be caught during implementation

## Additional Mock Properties

If your query uses other server functions, add them to the mock:

```typescript
vi.mock('$app/server', () => ({
  query: vi.fn((fn) => fn),
  read: vi.fn(),
  command: vi.fn(),
  form: vi.fn(),
  // Add only the exports your query actually uses
}));
```