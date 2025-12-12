---
name: form-component-tests
description: Write comprehensive component tests for SKit forms in Svelte applications. Use when testing form validation, field interactions, and submission states.
---

# Form Unit Tests

This skill provides templates and guidance for writing unit tests for SKit form components in Svelte applications.

## Quick Start

1. **Mock your form action** using [templates/mock-template.md](templates/mock-template.md)
2. **Mock field values** with [templates/return-value-template.md](templates/return-value-template.md)
3. **Override properties** like `pending` with [templates/property-override-template.md](templates/property-override.md)
4. **Follow patterns** from [guides/patterns-and-conventions.md](guides/patterns-and-conventions.md)
5. **Check what to test** with [guides/testing-checklist.md](guides/testing-checklist.md)

## Usage Example

```typescript
// Mock your form action
vi.mock(import('../lib/auth/remotes/login'), () => ({
  loginUser: {
    // mock structure from template
  }
}));

// Test validation errors
it('displays email validation error', () => {
  const mockIssues = vi.mocked(loginUser.fields.email.issues)
    .mockReturnValue([{ message: 'Invalid email', path: ['email'] }]);
  
  render(LoginForm);
  expect(mockIssues).toHaveBeenCalledTimes(1);
});

// Test loading state
it('shows loading when submitting', () => {
  Object.defineProperty(loginUser, 'pending', {
    get: vi.fn(() => 1),
    writable: true,
    configurable: true
  });
  
  render(LoginForm);
  // Assert loading state
});
```

## Resources

### Templates
- **[mock-template.md](templates/mock-template.md)** - Base mock structure with complete example
- **[return-value-template.md](templates/return-value-template.md)** - Mocking field return values
- **[property-override-template.md](templates/property-override-template.md)** - Overriding form properties

### Guides
- **[testing-checklist.md](guides/testing-checklist.md)** - Comprehensive testing checklist
- **[patterns-and-conventions.md](guides/patterns-and-conventions.md)** - Standard patterns and file organization
- **[best-practices.md](guides/best-practices.md)** - Type safety and testing principles

## Key Concepts

- **Type-safe testing** - No `as any` casting, maintain full TypeScript safety
- **Mock isolation** - Clean mocks for each test with `vi.clearAllMocks()`
- **Behavior-focused** - Test what users see, not implementation details
- **Property overrides** - Use `Object.defineProperty` for primitive properties like `pending`