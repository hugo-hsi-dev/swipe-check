# Test Organization

## Standard Test Structure

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formRemote } from '../path/to/form-remote';
import Component from './Component.svelte';
import { render } from 'vitest-browser-svelte';

// Mock setup
vi.mock(import('../path/to/form-remote'), () => ({
  formRemote: {
    // mock structure
  }
}));

// 1. Field Validation Tests
describe('ComponentName Field Validation', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  // Test each field separately
  describe('Email Field', () => {
    it('shows no errors when valid');
    it('shows error when invalid');
    it('shows multiple errors if applicable');
  });
});

// 2. Form Interaction Tests
describe('ComponentName Form Interaction', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  // Test form structure and behavior
  it('renders form with correct attributes');
  it('renders submit button with correct type');
  it('disables button when pending');
});

// 3. State Tests
describe('ComponentName State Management', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  // Test different form states
  it('shows loading state when pending');
  it('shows normal state when idle');
});

// 4. Multiple Field Tests
describe('ComponentName Multiple Field Validation', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  // Test field interactions
  it('displays errors for multiple invalid fields');
  it('displays no errors when all fields valid');
});
```

## Test Suite Guidelines

### 1. Separate Concerns
- **Field Validation** - Individual field errors and validation
- **Form Interaction** - Form structure, attributes, button behavior
- **State Management** - Pending states, submission states
- **Multiple Fields** - Cross-field validation and interactions

### 2. beforeEach Usage
- Always include `beforeEach` in each describe block
- Always call `vi.clearAllMocks()`
- This ensures tests don't interfere with each other

### 3. Test Ordering Within Suites
- Start with positive cases (no errors)
- Then test error cases
- Finally test edge cases and combinations

### 4. Nested Describe Blocks
Use nested describes for better organization:
```typescript
describe('Email Field', () => {
  describe('Validation States', () => {
    it('validates empty input');
    it('validates invalid format');
  });
  
  describe('Input Attributes', () => {
    it('has correct type attribute');
    it('has correct name attribute');
  });
});
```

## Import Order
1. Vitest imports
2. Form remote imports
3. Component imports
4. Testing library imports

## Common Test Patterns by Category

### Validation Tests
```typescript
it('shows no [field] validation errors when [field].issues returns empty array', () => {
  // mock empty issues
  // render
  // assert no errors
});

it('displays [field] validation error when [field].issues returns error', () => {
  // mock error issues
  // render
  // assert error displayed
});
```

### Interaction Tests
```typescript
it('renders [element] with correct [attribute]', () => {
  // mock as() method
  // render
  // assert as was called with correct params
});

it('displays [element] with correct text when [condition]', () => {
  // set up condition (e.g., pending state)
  // render
  // assert text content
});
```

### State Tests
```typescript
it('[action] button when [state]', () => {
  // override property for state
  // render
  // assert button state
});
```

This organization ensures tests are:
- Easy to find and navigate
- Logically grouped
- Consistent across components
- Maintainable as features grow