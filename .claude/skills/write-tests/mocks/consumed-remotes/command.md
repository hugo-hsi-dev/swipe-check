---
# When to use this
Use this when: Testing components that consume command remote functions
Example: Testing a component that imports and calls `logoutUser()` from a `.remote.ts` file
Next steps: Load test structure and assertion patterns from `patterns/` directory
---

# Consumed Command Remote Mock

This mock provides a simple mock for consumed command remote functions in component tests.

```ts
vi.mock(import('../../remotes/*.remote'), () => {
	return {
		'*': vi.fn()
	};
});
```

## Usage

Place this mock at the top of your component test file (`.svelte.test.ts`) when the component imports and uses command remote functions.

## Related Files

For testing actual command remote function implementation, use: `mocks/$app-server/command.md`

← Back to [Reference](../reference.md) | [Next: Test Structure](../../patterns/test-structure.md)
