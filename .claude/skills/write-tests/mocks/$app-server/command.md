---
# When to use this
Use this when: Testing a remote function that uses `command` from `$app/server`
Example: Testing `logoutUser = command(async () => {...})` in a `.remote.ts` file
Next steps: Load test structure and assertion patterns from `patterns/` directory
---

# $app/server command Mock

This mock provides the `command` function from `$app/server` for testing remote functions that use command operations.

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

	//other mocks here

	return {
		command
		// other mocks here
	};
});
```

## Usage

Place this mock at the top of your test file for `.remote.ts` files that use the `command` function from `$app/server`.

## Related Files

For testing components that consume command remotes, use: `mocks/consumed-remotes/command.md`

← Back to [Reference](./reference.md) | [Next: Test Structure](../patterns/test-structure.md)
