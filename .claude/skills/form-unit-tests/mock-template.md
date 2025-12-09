# Mock Template for SKit Form Actions

Base structure for mocking any SKit form action:

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

Replace `formRemote` with your actual form remote name and `fieldName` with your field names.