---
# When to use this
Use this when: Testing components that consume query remote functions
Example: Testing a component that imports and calls `getCurrentUser()` from a `.remote.ts` file
Next steps: Load test structure and assertion patterns from `patterns/` directory
---

# Consumed Query Remote Mock

This mock provides a simple mock for consumed query remote functions in component tests.

```ts
vi.mock(import('../../remotes/{remote-name}.remote'), () => {
	return {
		'{remote-name}': vi.fn()
	};
});
```

## Usage

Place this mock at the top of your component test file (`.svelte.test.ts`) when the component imports and uses query remote functions.

## Related Files

For testing the actual query remote function implementation, use: `mocks/$app-server/query.md`

← Back to [Reference](../reference.md) | [Next: Test Structure](../../patterns/test-structure.md)
