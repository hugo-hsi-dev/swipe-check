---
name: write-tests
description: how to write tests for this project
allowed-tools: Read, Write, Edit, Glob, Grep, Skill, Bash, LspHover, LspDiagnostics
---

# Write Tests

<!--Above, I have allowed tools configuration. I'm not sure what else is needed for a skill that writes tests. use your best judgement on things that you'll need, but don't include anything that you don't need.-->

## environments

this project uses vitest as the test runner. We have two different testing environments:

1. client
2. server

If you are writing tests for components, please load the [client](./environments/client.md) into your context
If you are writing tests for remote functions, please load the [server](./environments/server.md) into your context

If the test you are writing doesn't fit into either of these categories, ask the user for guidance.

### Test Execution

Use the Bash tool to run tests:

- `npm run test:unit` - run server-side tests (--run flag built-in)
- `npm run test:component` - run client-side component tests (--run flag built-in)

## mocks

SvelteKit has very complex internals that lets us, as developers have a really great developer experience. Unfortunately, these same internal complexities can make it difficult to write working mocks. To address this, there are prebuilt templates for mocks that we can use that will consistently work, located in this skill.

### Mock Structure

The mocks are organized into three main categories:

1. **`$app-server/`** - Mocks for SvelteKit's internal `$app/server` module
2. **`consumed-remotes/`** - Mocks for remote function calls and dependencies
3. **Individual client/server files** - Specific mocks for different test types

For complete documentation, please visit [mocks](./mocks/reference.md) for more details.

## patterns

For testing best practices and patterns, refer to the [patterns](./patterns/) directory:

- [assertions](./patterns/assertions.md) - assertion patterns and utilities
- [test-structure](./patterns/test-structure.md) - organizing and structuring tests
- [type-safety](./patterns/type-safety.md) - ensuring type safety in tests
