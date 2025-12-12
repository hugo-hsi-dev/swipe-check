```ts
import { vi } from 'vitest';

vi.mock('$app/server', () => {
  // command mock
  const command = (validate_or_fn: unknown, maybe_fn: unknown) => {
		const fn = maybe_fn ?? validate_or_fn;
 
		const __ = {
			type: 'command'
		};
 
		Object.defineProperty(fn, '__', { value: __ });
 
		return fn;
	};

  //other mocks

	return {
		command
		// other mocks
	};
});
```
