This directory is used for routing in sveltekit. 

- NEVER make changes to `./layout.css`
- NEVER use load or form actions
  - This also means that +page.server.ts or +page.ts will never be necessary, and should NEVER exist in this directory or the project
  - If code needs to interact with the server, ONLY use remote functions
    - load -> query
    - form action -> command/form

### Testing 
- Every route needs to be accompanied with a `page.svelte.spec.ts` which will run some basic route-related tests.
  - tests do not need to be extensive. Heavy functionality tests should be tested with e2e tests that test entire user journeys.
  - Do not use *.test.ts naming pattern for testing route components
