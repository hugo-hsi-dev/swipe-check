---
# When to use this
Use this when: Testing components that consume prerender remote functions
Example: Testing a component that imports and calls `getStaticData()` from a `.remote.ts` file for SSR/SSG
Next steps: Load test structure and assertion patterns from `patterns/` directory
---

# Consumed Prerender Remote Mock

This mock provides a simple mock for consumed prerender remote functions in component tests.

```ts
vi.mock(import('../../remotes/*.remote'), () => {
	return {
		'*': vi.fn()
	};
});
```

## Usage

Place this mock at the top of your component test file (`.svelte.test.ts`) when the component imports and uses prerender remote functions.

## Related Files

For testing the actual prerender remote function implementation, use: `mocks/$app-server/prerender.md`

← Back to [Reference](../reference.md) | [Next: Test Structure](../../patterns/test-structure.md)
