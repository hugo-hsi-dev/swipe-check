---
name: remote-query-tests
description: Write comprehensive unit tests for SKit remote query functions. Use when testing server-side query functions.
---

# Remote Query Unit Tests

This skill provides templates and patterns for writing unit tests for SKit remote query functions.

## Quick Start

1. **Mock $app/server** using [templates/mock-server.md](templates/mock-server.md)
2. **Follow testing patterns** from [guides/testing-patterns.md](guides/testing-patterns.md)
3. **See complete example** in [examples/getCurrentUser.test.md](examples/getCurrentUser.test.md)
4. **Check best practices** in [guides/best-practices.md](guides/best-practices.md)

## Usage Example

```typescript
// Mock $app/server module
vi.mock('$app/server', () => ({
  query: vi.fn((fn) => fn),
  // Add other exports your query uses
}));

// Test your query function
it('returns expected data', async () => {
  // Arrange your test data
  // Act by calling your query
  // Assert the results
});
```

## Resources

### Templates
- **[mock-server.md](templates/mock-server.md)** - Server module mocking template

### Guides
- **[testing-patterns.md](guides/testing-patterns.md)** - Standard patterns and test organization
- **[best-practices.md](guides/best-practices.md)** - Type safety and testing principles

### Examples
- **[getCurrentUser.test.md](examples/getCurrentUser.test.md)** - Complete example testing getCurrentUser query

## Key Concepts

- **Query mocking** - Use vi.mock('$app/server') (not import()) for query modules
- **Type casting** - Safe use of `as` for mock objects that resemble real types
- **Dependency injection** - Mock server-side dependencies your queries use
- **Return value testing** - Verify correct return values for different states
