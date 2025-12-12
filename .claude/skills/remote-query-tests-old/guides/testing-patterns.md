# Testing Patterns for Remote Queries

## Standard Test Structure

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { myQuery } from './my-query';
import type { MyQueryReturn } from './my-query';

// Mock $app/server module
vi.mock('$app/server', () => ({
  query: vi.fn((fn) => fn)
}));

describe('myQuery', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  // Individual tests
  it('should do something specific', () => {
    // test implementation
  });
});
```

## Test Organization

### 1. Positive Case Tests
Test when everything works as expected:

```typescript
describe('Success Cases', () => {
  it('returns expected data when inputs are valid');
  it('returns correctly typed data');
  it('handles all required properties correctly');
});
```

### 2. Edge Case Tests
Test boundary conditions and error states:

```typescript
describe('Edge Cases', () => {
  it('returns undefined when data not present');
  it('returns null when data is null');
  it('handles missing dependencies');
});
```

### 3. Data Validation Tests
Test the structure and content of returned data:

```typescript
describe('Data Validation', () => {
  it('returns data with all required properties');
  it('preserves correct data types');
  it('handles optional properties correctly');
});
```

## Common Testing Patterns

### Mock Query Dependencies

```typescript
// If your query uses external services or databases
vi.mock('./database', () => ({
  getUser: vi.fn(),
  saveData: vi.fn()
}));

// If your query uses server utilities
vi.mock('$app/server', () => ({
  query: vi.fn((fn) => fn),
  read: vi.fn()
}));
```

### Return Value Testing

```typescript
// Test exact return value
expect(result).toBe(expectedValue);

// Test equality of objects
expect(result).toEqual(expectedObject);

// Test specific properties
expect(result?.id).toBe('user-123');
expect(result?.email).toBe('test@example.com');

// Test null/undefined cases
expect(result).toBeNull();
expect(result).toBeUndefined();
```

### Async Testing Patterns

```typescript
// Test successful async operation
it('returns data asynchronously', async () => {
  const result = await myQuery();
  expect(result).toBeDefined();
});

// Test async errors
it('handles async errors', async () => {
  // Mock error condition
  await expect(myQuery()).rejects.toThrow('Expected error message');
});
```

## Type Safety in Tests

### Using Type Assertions

```typescript
// Safe casting with as
const mockData = {
  id: 'user-123',
  email: 'test@example.com'
  // ... other properties
} as User;

// Use specific return types
const result: MyQueryReturn = await myQuery();
```

### Type Imports for Clarity

```typescript
// Import types for better test documentation
import type { User } from '../types';
import type { MyQueryReturn } from './my-query';

// Use types in test descriptions
it(`returns ${keyof MyQueryReturn} correctly`);
```

## Test Naming Conventions

### Describe Blocks
- Use function name: `"getUserData"`
- Add context: `"getUserData with valid inputs"`
- Group by scenario: `"Success Cases"`, `"Error Cases"`, `"Edge Cases"`

### Test Names (it blocks)
- Start with verb: `"returns"`, `"handles"`, `"extracts"`
- Include expected outcome: `"returns user data"`, `"handles invalid input"`
- Be specific about conditions: `"returns null when user not found"`

✅ Good examples:
- `"returns expected data for valid inputs"`
- `"handles missing database connection"`
- `"preserves all required properties"`

❌ Bad examples:
- `"test data"` (too vague)
- `"query test"` (doesn't say what to test)
- `"it works"` (meaningless)

## Complete Test Example

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../types';
import { getUserById } from './getUserById';

vi.mock('$app/server', () => ({
  query: vi.fn((fn) => fn)
}));

vi.mock('./database', () => ({
  findUserById: vi.fn()
}));

describe('getUserById', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe('when user exists', () => {
    it('returns user data', async () => {
      // Arrange
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      } as User;

      const { findUserById } = await import('./database');
      vi.mocked(findUserById).mockResolvedValue(mockUser);

      // Act
      const result = await getUserById('user-123');

      // Assert
      expect(findUserById).toHaveBeenCalledWith('user-123');
      expect(result).toBe(mockUser);
      expect(result?.id).toBe('user-123');
      expect(result?.email).toBe('test@example.com');
    });
  });

  describe('when user does not exist', () => {
    it('returns null', async () => {
      // Arrange
      const { findUserById } = await import('./database');
      vi.mocked(findUserById).mockResolvedValue(null);

      // Act
      const result = await getUserById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('propagates database errors', async () => {
      // Arrange
      const { findUserById } = await import('./database');
      vi.mocked(findUserById).mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(getUserById('user-123')).rejects.toThrow('Database error');
    });
  });
});
```