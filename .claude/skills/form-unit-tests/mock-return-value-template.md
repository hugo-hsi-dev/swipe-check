# Mock Return Value Template

Use this pattern to mock return values for field methods:

## For issues() method
Returns validation errors for a field:

```typescript
const mockIssues = vi.mocked(formRemote.fields.fieldName.issues).mockReturnValue([array_of_errors]);
```

## For as() method
Returns input attributes for rendering:

```typescript
const mockAs = vi.mocked(formRemote.fields.fieldName.as).mockReturnValue(object_of_attributes);
```

## For value() method
Returns the current field value:

```typescript
const mockValue = vi.mocked(formRemote.fields.fieldName.value).mockReturnValue(current_value);
```

## Pattern Explanation

- `formRemote` - Your mocked form remote (e.g., `loginUser`, `registerUser`)
- `fieldName` - The field you're mocking (e.g., `email`, `password`)
- `mockReturnValue()` - Sets what the method returns when called
- Replace placeholders with actual values based on your test needs