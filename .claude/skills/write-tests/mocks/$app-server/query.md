---
# When to use this
Use this when: Testing a remote function that uses `query` from `$app/server`
Example: Testing `getCurrentUser = query(async () => {...})` in a `.remote.ts` file
Next steps: Load test structure and assertion patterns from `patterns/` directory
---

# $app/server query Mock

This mock provides the `query` function from `$app/server` for testing remote functions that use query operations.

```ts
import { vi } from 'vitest';

vi.mock('$app/server', () => {
  
  // query mock
	const query = (validate_or_fn: unknown, maybe_fn: unknown) => {
		const fn = maybe_fn ?? validate_or_fn;

		const __ = {
			type: 'query'
		};

		Object.defineProperty(fn, '__', { value: __ });

		return fn;
	};
	
	// query.batch mock
	const batch = (validate_or_fn: unknown, maybe_fn: unknown) => {
		const fn = (maybe_fn ?? validate_or_fn) as (
			...args: unknown[]
		) => (...args: unknown[]) => unknown;

		const wrapper = vi.fn((args) => fn([Symbol(), args])(args));

		const __ = {
			type: 'query_batch'
		};

		Object.defineProperty(wrapper, '__', { value: __ });

		return wrapper;
	};

	Object.defineProperty(query, 'batch', { value: batch, enumerable: true });

// other mocks here

	return {
		query
		// other mocks here
	};
});
```

## Usage

Place this mock at the top of your test file for `.remote.ts` files that use the `query` function from `$app/server`.

## Related Files

For testing components that consume query remotes, use: `mocks/consumed-remotes/query.md`
