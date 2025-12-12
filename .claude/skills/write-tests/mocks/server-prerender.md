this mock has not been tested yet

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

  //other mocks

	return {
	prerender
		// other mocks
	};
});
```
