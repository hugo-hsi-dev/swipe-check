# Testing Patterns & Conventions

## Standard Test Structure

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formRemote } from '../path/to/form-remote';
import Component from './Component.svelte';
import { render } from 'vitest-browser-svelte';

// Mock setup
vi.mock(import('../path/to/form-remote'), () => ({
  formRemote: { /* mock structure */ }
}));

// Test suites
describe('ComponentName', () => {
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

### 1. Field Validation Tests
```typescript
describe('ComponentName Field Validation', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe('Email Field', () => {
    it('shows no errors when valid');
    it('shows error when invalid');
    it('has correct input attributes');
  });
});
```

### 2. Form Interaction Tests
```typescript
describe('ComponentName Form Interaction', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('renders form with correct attributes');
  it('displays submit button with correct type');
  it('disables button when pending');
});
```

### 3. State Management Tests
```typescript
describe('ComponentName State Management', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('shows loading state when pending > 0');
  it('shows normal state when pending === 0');
});
```

### 4. Multiple Field Tests
```typescript
describe('ComponentName Multiple Field Validation', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('displays errors for multiple invalid fields');
  it('displays no errors when all fields valid');
});
```

## Naming Conventions

### Test Names (it blocks)
- Start with a verb: `"shows"`, `"displays"`, `"renders"`, `"disables"`
- Be specific about what's being tested
- Include expected outcome

✅ Good examples:
- `"shows no email validation errors when valid"`
- `"displays submit button with loading text when pending"`
- `"renders form with correct action attribute"`

❌ Bad examples:
- `"test email"` (too vague)
- `"button test"` (doesn't say what to test)
- `"it works"` (meaningless)

## Mock Patterns

### Store mock references
```typescript
it('displays validation error', () => {
  const mockIssues = vi.mocked(formRemote.fields.email.issues)
    .mockReturnValue([{ message: 'Invalid email', path: ['email'] }]);
  
  render(Component);
  
  expect(mockIssues).toHaveBeenCalledTimes(1);
  await expect.element(getByText('Invalid email')).toBeInTheDocument();
});
```

### Always clean up mocks
```typescript
describe('Test Suite', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
});
```

### Mock only what you need
Don't mock everything - only mock the methods/properties you're testing in that specific test.

## Assertion Patterns

### Verify mock calls
```typescript
expect(mockIssues).toHaveBeenCalledTimes(1);
```

### Test UI state
```typescript
// Check for specific error messages
await expect.element(getByText('Invalid email')).toBeInTheDocument();

// Check for absence of errors
await expect.element(queryByText('Invalid email')).not.toBeInTheDocument();
```

### Test attributes
```typescript
expect(button).not.toBeDisabled();
expect(button).toHaveAttribute('type', 'submit');
expect(form?.getAttribute('action')).toBe('/api/submit');
```

## Property Override Patterns

```typescript
// Number properties (like pending)
Object.defineProperty(formRemote, 'pending', {
  get: vi.fn(() => 1), // 0 = idle, 1+ = submitting
  writable: true,
  configurable: true
});

// String properties (like action)
Object.defineProperty(formRemote, 'action', {
  get: vi.fn(() => '/api/submit'),
  writable: true,
  configurable: true
});
```

## Query Method Guide

### getByText
- Use when element MUST exist
- Will throw error if not found

### queryByText
- Use when element MAY NOT exist
- Returns null if not found

### container.querySelector
- Use for form elements and attributes
- More precise for form structure

## Common Gotchas

1. **Don't test labels, test error messages**
   - Bad: `expect(errorText).not.toContain('Password')`
   - Good: `expect(errorText).not.toContain('Password is required')`

2. **Use render() once per test**

3. **Use await for async assertions**
   - Good: `await expect.element(getByText('Error')).toBeInTheDocument()`
   - Good: `await expect.element(queryByText('Error')).not.toBeInTheDocument()`

## Final Checklist for Each Test

- [ ] Mock set up correctly
- [ ] Component rendered
- [ ] Mock called expected number of times
- [ ] UI shows expected state
- [ ] Test has clear, descriptive name
- [ ] Tests one thing only
- [ ] No unintended side effects