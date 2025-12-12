Server side tests run in the node environment

All server-side tests are going to be testing SvelteKit remote functions. If you find yourself testing something that is not a SvelteKit remote function, ask the user first for guidance.

remote function tests should be named as so: `*.ts`

you must not append `.svelte.` to the filename, as that tells vitest to use the client environment for this test.
