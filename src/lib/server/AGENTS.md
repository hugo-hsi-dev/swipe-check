# SERVER KNOWLEDGE BASE

## OVERVIEW

Critical backend logic for authentication and database persistence.

## STRUCTURE

```
src/lib/server/
├── db/
│   ├── index.ts      # Drizzle client init
│   └── schema.ts     # User & Session table definitions
└── auth.ts           # Token generation, validation, cookie management
```

## WHERE TO LOOK

| Module        | File           |
| ------------- | -------------- |
| Auth Logic    | `auth.ts`      |
| DB Schema     | `db/schema.ts` |
| DB Connection | `db/index.ts`  |

## CONVENTIONS

- **Session Tokens**: Generated with 18 bytes entropy, SHA-256 hashed for DB storage.
- **Renewal**: Sessions automatically extend when < 15 days remaining.
- **Passwords**: Hashed using Argon2id via `@node-rs/argon2`.

## ANTI-PATTERNS

- **Raw SQL**: Prefer Drizzle ORM for all database operations.
- **Global State**: Avoid storing user state in global server variables.
