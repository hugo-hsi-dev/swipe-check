# Override Property Template

Use this pattern to override properties that can't be mocked with `mockReturnValue()`:

```typescript
Object.defineProperty(formRemote, 'propertyName', {
	get: vi.fn(() => value),
	writable: true,
	configurable: true
});
```

## Common Properties to Override

### pending
Controls form submission state (number of pending submissions):

```typescript
Object.defineProperty(formRemote, 'pending', {
	get: vi.fn(() => 1) // 0 = idle, 1+ = submitting
});
```

### action
Form submission endpoint:

```typescript
Object.defineProperty(formRemote, 'action', {
	get: vi.fn(() => '/api/submit'),
	writable: true,
	configurable: true
});
```

### result
Form submission result:

```typescript
Object.defineProperty(formRemote, 'result', {
	get: vi.fn(() => ({ success: true, data: {...} })),
	writable: true,
	configurable: true
});
```

## When to Use

Use `Object.defineProperty` when:
- Property is a primitive value (not a function)
- Property has getters/setters
- `mockReturnValue()` doesn't work (e.g., for number properties)
- You need to override read-only properties

## Important Notes

- Always include `writable: true` and `configurable: true` to allow overriding
- Use inside individual tests, not globally, to avoid test interference
- Each test can set different values as needed