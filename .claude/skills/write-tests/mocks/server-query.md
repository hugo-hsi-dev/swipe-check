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
