---
# When to use this
Use this when: Testing a remote function that uses `form` from `$app/server`
Example: Testing `registerUser = form(schema, handler)` in a `.remote.ts` file
Next steps: Forms are not testable at this time. See note below.
---

# $app/server form Mock

**Note: You don't need to test forms. We are unable to test them at this point because they technically don't return the handler function, and so we are unable to test their behavior from their export alone.**

## Related Files

For testing components that consume form remotes, use: `mocks/consumed-remotes/form.md`

## Testing Form Components

Instead of testing the form remote function itself, test the components that consume the form remotes using the consumed-remotes mock.

← Back to [Reference](./reference.md) | [Next: Test Structure](../patterns/test-structure.md)
