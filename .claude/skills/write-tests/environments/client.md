Client side tests use vitest's browser mode with Playwright.

Browser mode documentation: https://vitest.dev/guide/browser/why.html
Component testing guide: https://vitest.dev/guide/browser/component-testing.html

All tests run in actual browser environment for accurate and realistic test results using `vitest-browser-svelte`.

You will primarily test components. If you need to test something other than a component, ask the user first for guidance.

Component tests must be named as: `*.svelte.test.ts`

The `.svelte.` segment tells vitest to use the client browser environment for this test.

## Quick Start - Mock Setup

For client-side testing, you'll primarily use **consumed-remotes** mocks which simulate calling server functions from the client:

### 🎯 Primary Mock Types (Consumed Remotes)

- **[client-query.md](../mocks/client-query.md)** - Mock remote query functions (GET requests)
- **[client-form.md](../mocks/client-form.md)** - Mock remote form functions (POST/PUT/PATCH requests)
- **[client-command.md](../mocks/client-command.md)** - Mock remote command functions (actions with side effects)
- **[client-prerender.md](../mocks/client-prerender.md)** - Mock prerender function calls

### 📁 Detailed Mock Templates

Navigate to the **[consumed-remotes](../mocks/consumed-remotes/)** directory for specific implementation templates:

- **[query.md](../mocks/consumed-remotes/query.md)** - Detailed query mock template
- **[form.md](../mocks/consumed-remotes/form.md)** - Detailed form mock template
- **[command.md](../mocks/consumed-remotes/command.md)** - Detailed command mock template
- **[prerender.md](../mocks/consumed-remotes/prerender.md)** - Detailed prerender mock template

### 📖 Reference Guide

- **[reference.md](../mocks/reference.md)** - Complete mock reference and examples

## Testing Workflow

1. Choose the appropriate mock type based on the remote function you're testing
2. Set up the mock in your test file using the template
3. Write your component test with the mocked remote calls
4. Test component behavior with different mock responses
