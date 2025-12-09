---
name: form-unit-tests
description: Write comprehensive unit tests for SKit forms in Svelte applications. Use when testing form validation, field interactions, and submission states.
---

# Form Unit Tests

This skill provides templates and examples for writing unit tests for SKit form components in Svelte applications.

## Quick Start

1. Create a mock using [mock-template.md](mock-template.md)
2. See a complete example in [mock-example.md](mock-example.md)
3. Mock field return values using [mock-return-value-template.md](mock-return-value-template.md)
4. Override properties like `pending` with [override-property-template.md](override-property-template.md)
5. Check what to test with [what-to-test.md](what-to-test.md)

## Available Resources

### Mock Setup
- **[mock-template.md](mock-template.md)** - Base mock structure for any SKit form remote
- **[mock-example.md](mock-example.md)** - Complete mock example with multiple fields

### Mocking Values
- **[mock-return-value-template.md](mock-return-value-template.md)** - Template for mocking field return values
- **[mock-return-value-example.md](mock-return-value-example.md)** - Example of mocking field return values

### Property Overrides
- **[override-property-template.md](override-property-template.md)** - Template for overriding properties like `pending`
- **[override-property-example.md](override-property-example.md)** - Example of overriding form properties

### Testing Guidelines
- **[what-to-test.md](what-to-test.md)** - Comprehensive testing checklist for forms
- **[type-safety.md](type-safety.md)** - Why we avoid type casting in tests
- **[testing-patterns.md](testing-patterns.md)** - Standard patterns and conventions
- **[test-organization.md](test-organization.md)** - How to structure test files

## Usage Example

To create a mock for your form:

```typescript
// Start with the base template from mock-template.md
vi.mock(import('../path/to/form-remote'), () => ({
  formRemote: {
    // ... mock structure
  }
}));

// Then mock return values as shown in mock-return-value-example.md
const mockIssues = vi.mocked(formRemote.fields.email.issues)
  .mockReturnValue([{ message: 'Invalid email', path: ['email'] }]);
```