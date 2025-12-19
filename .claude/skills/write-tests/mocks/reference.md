# How to use this

First determine if you are writing tests for the client or server. Look below to the relevant section and search for the exact mock that you need. Only load the relevant mocks into your context.

## Client

If you are writing tests for components, and those components import implemented remote functions, you'll need to mock those implemented remote functions. For example, you're writing tests for a component that simply gets the current authenticated user's email. In this scenario, we'll have an implemented remote function that returns the current user, likely called something like `getCurrentUser`. You'll need to mock this function to return a user object.

### Consumed Remotes

These mocks are for testing client-side components that consume remote functions:

[Client Query]('./consumed-remotes/query.md') - For mocking query remote functions
[Client Form]('./consumed-remotes/form.md') - For mocking form remote functions  
[Client Command]('./consumed-remotes/command.md') - For mocking command remote functions
[Client Prerender]('./consumed-remotes/prerender.md') - For mocking prerender remote functions in SSR contexts

## Server

If you are writing tests for remote functions, you'll need to mock the `$app/server` import of whichever remote function you are testing. For example, if you are testing a query remote function, you'll need to mock the `query` method from the `$app/server` module.

### $app/server Mocks

These mocks are for testing server-side remote function implementations:

[Server Query]('./$app-server/query.md') - For testing query remote functions
[Server Form]('./$app-server/form.md') - For testing form remote functions
[Server Command]('./$app-server/command.md') - For testing command remote functions
[Server Prerender]('./$app-server/prerender.md') - For testing prerender remote functions

---

## Navigation

- **Next**: [Test Structure Patterns](../patterns/test-structure.md)
- **Also see**: [Assertions](../patterns/assertions.md) | [Type Safety](../patterns/type-safety.md)
