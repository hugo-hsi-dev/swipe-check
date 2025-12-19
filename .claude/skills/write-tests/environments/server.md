Server side tests run in the node environment

All server-side tests are going to be testing SvelteKit remote functions. If you find yourself testing something that is not a SvelteKit remote function, ask the user first for guidance.

remote function tests should be named as so: `*.ts`

you must not append `.svelte.` to the filename, as that tells vitest to use the client environment for this test.

## Quick Start - Mock Setup

For server-side testing, you'll primarily use **$app-server** mocks which simulate the SvelteKit server environment:

### 🎯 Primary Mock Types ($app-server)

- **[server-query.md](../mocks/server-query.md)** - Mock query remote functions (GET operations)
- **[server-form.md](../mocks/server-form.md)** - Mock form remote functions (POST/PUT/PATCH operations)
- **[server-command.md](../mocks/server-command.md)** - Mock command remote functions (actions with side effects)
- **[server-prerender.md](../mocks/server-prerender.md)** - Mock prerender remote functions

### 📁 Detailed Mock Templates

Navigate to the **[$app-server](../mocks/$app-server/)** directory for specific implementation templates:

- **[query.md](../mocks/$app-server/query.md)** - Detailed query mock template
- **[form.md](../mocks/$app-server/form.md)** - Detailed form mock template
- **[command.md](../mocks/$app-server/command.md)** - Detailed command mock template
- **[prerender.md](../mocks/$app-server/prerender.md)** - Detailed prerender mock template

### 📖 Reference Guide

- **[reference.md](../mocks/reference.md)** - Complete mock reference and examples

## Testing Workflow

1. Choose the appropriate mock type based on the remote function you're testing
2. Set up the $app-server environment mocks in your test file
3. Write your remote function test with the mocked server context
4. Test function behavior with different mock scenarios and database states
