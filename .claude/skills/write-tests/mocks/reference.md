# How to use this
First determine if you are writing tests for the client or server. Look below to the relevant section and search for the exact mock that you need. Only load the relevant mocks into your context.

## Client
if you are writing tests for components, and those components import...

## Server
if you are writing tests for remote functions, you'll need to mock the `$app/server` import of whichever remote function you are testing. For example, if you are testing a query remote function, you'll need to mock the `query` method from the `$app/server` module. 

[Server Query]('./server-query.md')
