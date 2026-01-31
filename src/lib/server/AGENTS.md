All code in this directory is server-only and can only be imported by:

- Other server-side code
- Remote functions

### Error Handling

- Error handling on the server should be absolutely minimal.
- DO NOT randomly put try catch around everything that could throw
  - Let errors go uncaught if they are unexpected, for example database errors.
    - Uncaught errors on the server will return a 500 status code to the client, which is what we want anyways
- Throw errors for invariant violations
