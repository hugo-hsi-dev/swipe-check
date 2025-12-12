Client side tests use vitest's new browser mode

general browser mode documentation: https://vitest.dev/guide/browser/why.html
component testing with browsermode guide: https://vitest.dev/guide/browser/component-testing.html

And as the name suggests, all tests are really run on the browser, which gives more accurate and realistic test results

You will, for the most part, only be testing components. If you find a need to test something other than a component, ask the user first for guidance.

component tests must be named as so: `*.svelte.test.ts`

the `.svelte.` segment in the filename is important, as it tells vitest to use the client environment for this test
