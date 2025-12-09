# Type Safety in Tests

This testing approach is intentionally more verbose to maintain 100% type safety:

## Why No Type Casting?

We avoid `as any` or type casting in tests because:
- **Maintains type safety** - Tests catch actual type errors, not just runtime errors
- **Robust code** - If the form interface changes, tests will fail and alert you
- **Better IDE support** - Full autocomplete and type checking in test files
- **Refactoring safety** - Renaming/moving fields breaks tests, ensuring they stay updated

## The Trade-off

Yes, it's more verbose than using `any` or type casting, but:
- ✅ Tests won't silently pass when interfaces change
- ✅ You get compile-time errors for mock mismatches
- ✅ IDE provides full intellisense for mock objects
- ✅ Future-proof against breaking changes

## Best Practice

```typescript
// Good - Type safe with vi.mocked()
const mockIssues = vi.mocked(formRemote.fields.email.issues)
  .mockReturnValue([{ message: 'Invalid email', path: ['email'] }]);

// Bad - Type casting loses safety
const mockIssues = (formRemote.fields.email.issues as any)
  .mockReturnValue([{ message: 'Invalid email', path: ['email'] }]);
```

The verbosity pays off by ensuring your tests remain valid as your code evolves.