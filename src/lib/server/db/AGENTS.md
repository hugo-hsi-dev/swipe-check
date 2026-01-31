# Database Directory

## `./index.ts`

- holds the database client and configuration
- NEVER change anything in this file

## `./relations.ts`

- all table relations for the application
- uses the new API in drizzle v1._._ beta
- [old vs new relations comparison](https://orm.drizzle.team/docs/relations-v1-v2)

## `./auth-schema.ts`

- holds auth-related database table schemas
- reason for separation:
  - better-auth package generates table schemas for auth-related tables
- NEVER make changes to this file
- explicit column names are ok because this is generated code - regenerate with better-auth's CLI instead of editing

## `./schema.ts`

- holds non-auth-related database table schemas
- prefer to use implicit column naming for cleaner code
  - DO `id: text()`
  - DO NOT `id: text('id')`
