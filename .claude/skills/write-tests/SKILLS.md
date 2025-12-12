---
name: write-tests
description: how to write tests for this project
allowed-tools: Read, Write, Edit, Glob, Grep, Skill
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

## mocks

SvelteKit has very complex internals that lets us, as developers have a really great developer experience. Unfortunately, these same internal complexities can make it difficult to write working mocks. To address this, there are prebuilt templates for mocks that we can use that will consistently work, located in this skill. Please visit [mocks](./mocks/reference.md) for more details.
