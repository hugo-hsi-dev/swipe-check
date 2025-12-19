---
# When to use this
Use this when: Testing a remote function that uses `prerender` from `$app/server`
Example: Testing `getStaticData = prerender(async () => {...})` in a `.remote.ts` file
Next steps: Load test structure and assertion patterns from `patterns/` directory
---

# $app/server prerender Mock

This mock provides the `prerender` function from `$app/server` for testing remote functions that use prerender operations.

**Note: This mock has not been tested yet. Use with caution and validate test results.**

```ts
import { vi } from 'vitest';

vi.mock('$app/server', () => {
	// prerender mock
	const prerender = (validate_or_fn: unknown, maybe_fn: unknown) => {
		const fn = maybe_fn ?? validate_or_fn;

		const __ = {
			type: 'prerender'
		};

		Object.defineProperty(fn, '__', { value: __ });

		return fn;
	};

	//other mocks here

	return {
		prerender
		// other mocks here
	};
});
```

## Usage

Place this mock at the top of your test file for `.remote.ts` files that use the `prerender` function from `$app/server`.

## Related Files

For testing components that consume prerender remotes, use: `mocks/consumed-remotes/prerender.md`

← Back to [Reference](./reference.md) | [Next: Test Structure](../patterns/test-structure.md)
