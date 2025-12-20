---
# When to use this
Use this when: Testing components that consume form remote functions
Example: Testing a component that imports and calls `registerUser()` from a `.remote.ts` file
Next steps: Load test structure and assertion patterns from `patterns/` directory
---

# Consumed Form Remote Mock

This mock provides a detailed mock for consumed form remote functions in component tests.

```ts
vi.mock(import('../../remotes/{remote-name}.remote'), () => {
	return {
		'{remote-name}': {
			action: '',
			buttonProps: {
				enhance: vi.fn(),
				formaction: '',
				formmethod: 'POST' as const,
				onclick: vi.fn(),
				pending: 0,
				type: 'submit' as const
			},
			enhance: vi.fn(),
			for: vi.fn(),
			method: 'POST' as const,
			pending: 0,
			preflight: vi.fn(),
			result: undefined,
			validate: vi.fn(),
			fields: {
				allIssues: vi.fn(),
				issues: vi.fn(),
				set: vi.fn(),
				value: vi.fn(),
				email: {
					as: vi.fn(),
					issues: vi.fn(() => []),
					set: vi.fn(),
					value: vi.fn()
				},
				password: {
					as: vi.fn(),
					issues: vi.fn(() => []),
					set: vi.fn(),
					value: vi.fn()
				}
			}
		}
	};
});
```

## Usage

Place this mock at the top of your component test file (`.svelte.test.ts`) when the component imports and uses form remote functions.

## Related Files

For testing actual form remote function implementation: Forms are not testable at this time.

← Back to [Reference](../reference.md) | [Next: Test Structure](../../patterns/test-structure.md)
