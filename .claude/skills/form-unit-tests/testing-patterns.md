# Testing Patterns and Standards

## File Organization

```typescript
// 1. Imports - Always at top
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formRemote } from '../path/to/form-remote';
import Component from './Component.svelte';
import { render } from 'vitest-browser-svelte';

// 2. Mock setup - Immediately after imports
vi.mock(import('../path/to/form-remote'), () => ({
  formRemote: { /* mock structure */ }
}));

// 3. Test suites - Organized by feature
describe('ComponentName Feature Tests', () => {
  // 4. beforeEach for cleanup
  beforeEach(async () => {
    vi.clearAllMocks();
  });
  
  // 5. Individual tests
  it('should do something', () => {
    // test implementation
  });
});
```

## Test Naming Conventions

### Describe Blocks
- Use component name + feature: `"LoginForm Email Validation"`
- Use descriptive names: `"Form Interaction Tests"`
- Group related tests together

### Test Names (it blocks)
- Start with verb: `"shows"`, `"displays"`, `"renders"`, `"disables"`
- Be specific about what's being tested
- Include expected outcome: `"displays error when email is invalid"`

Good examples:
- ✅ `"shows no email validation errors when valid"`
- ✅ `"displays submit button with loading text when pending"`
- ✅ `"renders form with correct action attribute"`

Bad examples:
- ❌ `"test email"` (too vague)
- ❌ `"button test"` (doesn't say what to test)
- ❌ `"it works"` (meaningless)

## Mock Patterns

### 1. Store mock references for assertions
```typescript
it('displays validation error', () => {
  const mockIssues = vi.mocked(formRemote.fields.email.issues)
    .mockReturnValue([{ message: 'Invalid email', path: ['email'] }]);
  
  render(Component);
  
  // Use the reference for assertions
  expect(mockIssues).toHaveBeenCalledTimes(1);
  await expect.element(getByText('Invalid email')).toBeInTheDocument();
});
```

### 2. Always clean up mocks
```typescript
describe('Test Suite', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
  
  // tests...
});
```

### 3. Mock only what you need
```typescript
// Good - Only mock the method you're testing
const mockIssues = vi.mocked(formRemote.fields.email.issues)
  .mockReturnValue([{ message: 'Invalid email', path: ['email'] }]);

// Bad - Don't mock everything if not needed
```

## Assertion Patterns

### 1. Verify mock calls
```typescript
// Always verify mocks were called
expect(mockIssues).toHaveBeenCalledTimes(1);
```

### 2. Test UI state
```typescript
// Check for specific error messages
await expect.element(getByText('Invalid email')).toBeInTheDocument();

// Check for absence of errors
const errorText = container.textContent || '';
expect(errorText).not.toContain('Invalid email');
```

### 3. Test attributes and state
```typescript
// Check button state
expect(button).not.toBeDisabled();
expect(button).toHaveAttribute('type', 'submit');

// Check form attributes
expect(form?.getAttribute('action')).toBe('/api/submit');
```

## Property Override Patterns

### Number properties (like pending)
```typescript
Object.defineProperty(formRemote, 'pending', {
  get: vi.fn(() => 1), // 0 = idle, 1+ = submitting
  writable: true,
  configurable: true
});
```

### Method properties
```typescript
Object.defineProperty(formRemote, 'action', {
  get: vi.fn(() => '/api/submit'),
  writable: true,
  configurable: true
});
```

## Common Gotchas

### 1. Don't test labels, test error messages
```typescript
// Bad - Will always fail because "Password" label exists
expect(errorText).not.toContain('Password');

// Good - Test for actual error messages
expect(errorText).not.toContain('Password is required');
```

### 2. Use render() once per test
```typescript
// Good
render(Component);
const { getByText, container } = render(Component);

// Bad - Multiple renders can cause issues
render(Component);
const element1 = screen.getSomething();
render(Component); // Don't render again
```

### 3. Async assertions
```typescript
// Good - Use await for async assertions
await expect.element(getByText('Error message')).toBeInTheDocument();

// Also works for checking absence
await expect.element(queryByText('Error message')).not.toBeInTheDocument();
```

## When to Use Each Query Method

### getByText
- Use when element MUST exist
- Will throw error if not found

### queryByText
- Use when element MAY NOT exist
- Returns null if not found

### container.querySelector
- Use for form elements and attributes
- More precise for form structure

## Final Checklist for Each Test

- [ ] Mock set up correctly
- [ ] Component rendered
- [ ] Mock called expected number of times
- [ ] UI shows expected state
- [ ] No unintended side effects
- [ ] Test has clear, descriptive name
- [ ] Tests one thing only