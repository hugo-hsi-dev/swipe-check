# Mock Template for SKit Form Actions

## Base Structure

Use this template to mock any SKit form action. Replace `formRemote` with your actual form remote name.

```typescript
vi.mock(import('../path/to/form-action'), () => {
	return {
		formRemote: {
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
				// Add field objects below
			}
		}
	};
});
```

## Field Template

Add each field using this structure:

```typescript
fieldName: {
	as: vi.fn(),
	issues: vi.fn(() => []),
	set: vi.fn(),
	value: vi.fn()
}
```

## Complete Example: Registration Form

```typescript
vi.mock(import('../../auth/remotes/register'), () => {
	return {
		registerUser: {
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
				name: {
					as: vi.fn(),
					issues: vi.fn(() => []),
					set: vi.fn(),
					value: vi.fn()
				},
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
				},
				confirmPassword: {
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

Key points:
- Default `issues()` returns empty array (no validation errors)
- All fields have the same four methods: `as`, `issues`, `set`, `value`
- Replace `registerUser` with your form action name
- Add/remove fields as needed