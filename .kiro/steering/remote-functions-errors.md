# Remote Functions Error Handling

## TL;DR

**For Remote Functions:**

- ✅ Use Zod schemas with `form()` for automatic validation
- ✅ Return error objects `{ success: false, error: '...' }` for runtime errors
- ❌ Don't use `invalid()` - that's for traditional form actions, not remote functions

## Remote Functions Pattern (What We Use)

### Schema Validation (Automatic)

When you pass a Zod schema to `form()`, SvelteKit automatically:

- Validates the data before calling your handler
- Returns validation errors to the client
- Types the `data` parameter according to your schema

```typescript
import { form } from '$app/server';
import { z } from 'zod';

const signUpSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters')
});

// Schema validation happens automatically!
export const signUp = form(signUpSchema, async (data) => {
	// data is already validated and typed
	const { email, password } = data;

	// ... your logic
});
```

**Benefits:**

- Automatic validation before handler runs
- Type-safe data parameter
- Client gets validation errors automatically
- No manual validation needed

### Runtime Error Handling (Return Error Objects)

For errors that occur during execution (database errors, business logic errors, etc.), return error objects:

```typescript
export const signUp = form(signUpSchema, async (data) => {
	try {
		const response = await auth.api.signUpEmail({
			body: { ...data }
		});

		// Business logic error
		if (!response || 'error' in response) {
			return {
				success: false,
				error: 'Failed to create account. Email may already be in use.'
			};
		}

		// Success
		return {
			success: true,
			message: 'Account created successfully!'
		};
	} catch (error) {
		// Unexpected error
		console.error('Sign up error:', error);
		return {
			success: false,
			error: 'An unexpected error occurred. Please try again.'
		};
	}
});
```

**Pattern:**

1. Wrap logic in try-catch
2. Return `{ success: false, error: '...' }` for errors
3. Return `{ success: true, ... }` for success
4. Always log unexpected errors

## What NOT to Do

### ❌ Don't Use `invalid()`

```typescript
// ❌ WRONG - invalid() doesn't exist in remote functions
import { invalid } from '$app/server'; // This export doesn't exist!

export const signUp = form(signUpSchema, async (data) => {
	if (someError) {
		throw invalid({ field: 'error message' }); // Won't work!
	}
});
```

**Why?**

- `invalid()` is for traditional form actions (`.server.ts` files)
- It's not exported from `$app/server` for remote functions
- Remote functions use a different error handling model

### ❌ Don't Throw Regular Errors for Business Logic

```typescript
// ❌ WRONG - throws will be treated as unexpected errors
export const signUp = form(signUpSchema, async (data) => {
	if (emailExists) {
		throw new Error('Email already in use'); // Treated as unexpected error!
	}
});

// ✅ CORRECT - return error objects for business logic
export const signUp = form(signUpSchema, async (data) => {
	if (emailExists) {
		return {
			success: false,
			error: 'Email already in use'
		};
	}
});
```

## Query Functions

Query functions (for fetching data) can also return error objects:

```typescript
export const getQuestions = query(getQuestionsSchema, async (data) => {
	const user = await getCurrentUser();
	if (!user) {
		return {
			success: false,
			error: 'You must be logged in'
		};
	}

	try {
		// Fetch data...
		return {
			success: true,
			questions: selectedQuestions
		};
	} catch (error) {
		return {
			success: false,
			error: 'Failed to load questions'
		};
	}
});
```

## Best Practices

1. **Always use Zod schemas** - Let SvelteKit handle validation automatically
2. **Return consistent error objects** - `{ success: false, error: 'message' }`
3. **Always include success flag** - Makes client handling easier
4. **Log unexpected errors** - Use `console.error()` for debugging
5. **Provide helpful error messages** - User-friendly, actionable messages

## Comparison Table

| Aspect            | Remote Functions (Our Pattern) | Traditional Form Actions |
| ----------------- | ------------------------------ | ------------------------ |
| File Type         | `.remote.ts`                   | `+page.server.ts`        |
| Validation        | Zod schema with `form()`       | Manual or with `fail()`  |
| Validation Errors | Automatic from schema          | `return fail(400, ...)`  |
| Runtime Errors    | Return error objects           | `return fail(...)`       |
| Unexpected Errors | Throw or return error object   | `throw error(...)`       |
| Invalid Function  | ❌ Not available               | ✅ Available             |
