# Best Practices for Remote Query Testing

## 1. Mock Server Module Correctly

### Always Use String Path for $app/server

```typescript
// Correct - Works with query module prototype modifications
vi.mock('$app/server', () => ({
  query: vi.fn((fn) => fn)
}));

// Incorrect - Type errors with query module
vi.mock(import('$app/server'), async (importOriginal) => {
  // This won't work with query's prototype modifications
});
```

### Include Only Needed Exports

```typescript
vi.mock('$app/server', () => ({
  query: vi.fn((fn) => fn),
  // Add other exports ONLY if your query uses them
  read: vi.fn(), // Only if query reads files
  command: vi.fn() // Only if query uses commands
}));
```

## 2. Type Safety Guidelines

### Safe Type Casting

The `as` keyword is acceptable here because TypeScript will still catch major type mismatches:

```typescript
// Good - Safe casting to similar type
const mockUser = {
  id: 'user-123',
  email: 'test@example.com'
} as User;

// TypeScript would error here - completely different shape
// const mockData = { foo: 'bar' } as User;
```

### Type Imports for Clarity

```typescript
// Import types for better documentation
import type { User } from '../types';
import type { MyQueryReturn } from './my-query';

// Use types in test descriptions
it(`returns ${keyof User} correctly`);
```

## 3. Test Organization Principles

### Group Tests by Scenario

```typescript
describe('getUserQuery', () => {
  describe('when data exists', () => {
    // All positive cases
  });

  describe('when data does not exist', () => {
    // All negative/edge cases
  });

  describe('data validation', () => {
    // All property and structure tests
  });
});
```

### Test One Thing Per Test

```typescript
// Good - Tests specific behavior
it('returns null when user not found', () => {
  // Test only null handling
});

// Bad - Tests multiple behaviors
it('handles null and undefined', () => {
  // Two different scenarios in one test
});
```

## 4. Mock Management

### Always Clean Up Mocks

```typescript
describe('Query Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  // Tests...
});
```

### Mock Dependencies, Not Implementation

```typescript
// Good - Mock external dependencies
vi.mock('./database', () => ({
  findUser: vi.fn()
}));

// Bad - Mock internal implementation details
vi.mock('./internal-utils', () => ({
  // Don't mock internal helper functions
}));
```

### Store Mock References

```typescript
it('tests query behavior', () => {
  const { findUser } = require('./database');
  const mockFindUser = vi.mocked(findUser);
  mockFindUser.mockResolvedValue(mockUser);
  
  // Test implementation
  
  // Verify the mock was called
  expect(mockFindUser).toHaveBeenCalledWith('user-123');
});
```

## 5. Data Testing Best Practices

### Test All Possible States

For any data that can be null/undefined:

```typescript
it('handles data present');
it('handles data null');
it('handles data undefined');
it('handles data missing');
```

### Validate Data Structure

```typescript
it('preserves all properties correctly', async () => {
  const result = await getSomeQuery();
  
  // Check each property
  expect(result?.id).toBe(expectedId);
  expect(result?.email).toBe(expectedEmail);
  expect(result?.name).toBe(expectedName);
});
```

### Use Meaningful Test Data

```typescript
// Good - Realistic test data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date('2024-01-01')
} as User;

// Bad - Meaningless data
const mockUser = { id: 'x', email: 'y' } as User;
```

## 6. Error Handling

### Test Error Scenarios

```typescript
it('handles missing dependencies gracefully', async () => {
  // Mock dependency to return error
  const { database } = require('./database');
  vi.mocked(database.query).mockRejectedValue(new Error('Connection failed'));
  
  await expect(getSomeQuery()).rejects.toThrow('Connection failed');
});
```

### Don't Swallow Errors

```typescript
// Good - Let errors propagate
it('propagates validation errors', async () => {
  // Mock to throw error
  await expect(getSomeQuery()).rejects.toThrow('Validation error');
});

// Bad - Catch and suppress errors
it('handles errors', async () => {
  try {
    await getSomeQuery();
  } catch (e) {
    // Don't just catch and ignore
  }
});
```

## 7. Performance Considerations

### Efficient Date Testing

```typescript
// Good - Reuse date objects
const testDate = new Date('2024-01-01');
const mockData = {
  createdAt: testDate,
  updatedAt: testDate
};

// Bad - Creating new dates everywhere
```

### Minimal Test Data

Only include properties your query actually uses:

```typescript
// If your query only uses id and email
const mockUser = {
  id: 'user-123',
  email: 'test@example.com'
} as User; // Other properties default to undefined
```

## 8. Documentation

### Descriptive Test Names

```typescript
// Good - Clear what's being tested
it('returns user profile when user exists in database');

// Bad - Vague
it('works correctly');
```

### Comments for Complex Logic

```typescript
it('handles complex data transformation', () => {
  // Mock complex data structure
  const mockData = {
    // ... complex mock setup
  
  // Assert transformation works correctly
  // ... complex assertions
});
```

## Review Checklist

Before committing your query tests, ensure they:

- [ ] Use string path for $app/server mock
- [ ] Clean up mocks in beforeEach
- [ ] Test all possible return states
- [ ] Verify mock calls when appropriate
- [ ] Have descriptive test names
- [ ] Use type imports for clarity
- [ ] Test individual properties when appropriate
- [ ] Handle error scenarios
- [ ] Mock only necessary dependencies