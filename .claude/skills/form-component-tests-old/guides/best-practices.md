# Testing Best Practices

## Type Safety First

This testing approach prioritizes type safety over brevity:

### Why Avoid Type Casting?

We avoid `as any` or type casting in tests because:
- **Maintains type safety** - Tests catch actual type errors
- **Robust code** - Changes to interfaces break tests, alerting you to issues
- **Better IDE support** - Full autocomplete and type checking
- **Refactoring safety** - Renaming fields updates tests

### The Trade-off

Yes, it's more verbose, but the benefits outweigh the costs:
- ✅ Tests won't silently pass when interfaces change
- ✅ Compile-time errors for mock mismatches
- ✅ Full IDE intellisense
- ✅ Future-proof against breaking changes

### Always Use vi.mocked()

```typescript
// Good - Type safe
const mockIssues = vi.mocked(formRemote.fields.email.issues)
  .mockReturnValue([{ message: 'Invalid email', path: ['email'] }]);

// Bad - Type casting loses safety
const mockIssues = (formRemote.fields.email.issues as any)
  .mockReturnValue([{ message: 'Invalid email', path: ['email'] }]);
```

## Test Design Principles

### 1. Test Behavior, Not Implementation

Focus on what users see and interact with:

```typescript
// Good - Tests user-visible behavior
it('displays email error message', () => {
  // Assert error message appears in UI
});

// Bad - Tests internal implementation
it('calls validate function', () => {
  // Assert internal function was called
});
```

### 2. One Assertion Per Test

Each test should verify one specific behavior:

```typescript
// Good - Focused test
it('shows email error when invalid', () => {
  // Test only email validation
});

// Bad - Multiple behaviors
it('validates email and password', () => {
  // Tests multiple things
});
```

### 3. Use Descriptive Test Names

Test names should describe the behavior:

```typescript
// Good
it('displays submit button with loading text when pending');
it('shows validation error for invalid email format');

// Bad
it('test button');
it('validation test');
```

## Mock Management

### Mock Isolation

Each test should have clean mocks:

```typescript
describe('Component Tests', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
  
  it('test something', () => {
    // Fresh mocks for each test
  });
});
```

### Mock Only What's Needed

Don't over-mock:

```typescript
// Good - Only mock what you need for this test
const mockEmailIssues = vi.mocked(formRemote.fields.email.issues)
  .mockReturnValue([{ message: 'Invalid email', path: ['email'] }]);

// Bad - Mocking everything even when not needed
```

### Store Mock References

Keep references for assertions:

```typescript
it('validates email field', () => {
  const mockIssues = vi.mocked(formRemote.fields.email.issues)
    .mockReturnValue([{ message: 'Invalid email', path: ['email'] }]);
  
  render(Component);
  
  // Use the reference
  expect(mockIssues).toHaveBeenCalledTimes(1);
});
```

## Error Handling in Tests

### Test Specific Error Messages

```typescript
// Good - Test actual error messages
expect(errorText).toContain('Password must be at least 8 characters');

// Bad - Test generic text that always exists
expect(errorText).not.toContain('Password'); // "Password" label exists
```

### Handle Async Properly

```typescript
// Good - Use await for async assertions
await expect.element(getByText('Error message')).toBeInTheDocument();

// Also works for checking absence
await expect.element(queryByText('Error message')).not.toBeInTheDocument();
```

## Performance Considerations

### Minimize Renders

Render once per test:

```typescript
// Good
const { getByText } = render(Component);
// Use getByText for all assertions

// Bad
render(Component);
const element1 = screen.getSomething();
render(Component); // Don't render again
```

### Efficient Selectors

Use the right query method:
- `getByText` - when element must exist
- `queryByText` - when element may not exist
- `container.querySelector` - for form elements and attributes

## Maintenance Tips

### Keep Tests Simple

Tests should be easy to read and understand:
- Arrange-Act-Assert pattern
- Clear variable names
- Minimal setup

### Document Complex Scenarios

For complex validation or state logic, add comments explaining the scenario:

```typescript
it('handles multiple validation errors', () => {
  // Mock multiple errors to test error aggregation
  const mockEmailIssues = vi.mocked(/* ... */);
  const mockPasswordIssues = vi.mocked(/* ... */);
  // Test that both errors appear
});
```

## Common Anti-Patterns

### 1. Testing Implementation Details
Don't test internal state or private methods.

### 2. Brittle Selectors
Avoid using CSS classes that might change.

### 3. Over-testing
Don't test framework behavior (e.g., that Svelte reactivity works).

### 4. Ignoring Type Safety
Don't use `as any` to bypass TypeScript.

## Review Checklist

Before committing tests, ensure they:
- [ ] Are type-safe (no `as any`)
- [ ] Test user-visible behavior
- [ ] Have descriptive names
- [ ] Test one thing only
- [ ] Clean up mocks properly
- [ ] Use appropriate query methods
- [ ] Are easy to understand and maintain