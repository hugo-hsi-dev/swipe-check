# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-16T00:51:30Z
**Commit:** 55f4146
**Branch:** main

## OVERVIEW

SvelteKit 2.49 + Svelte 5 demo with custom session-based auth, PostgreSQL, and Drizzle ORM.

## STRUCTURE

```
.
├── src/
│   ├── lib/
│   │   ├── server/    # Auth & Database logic
│   │   └── index.ts
│   ├── routes/        # Page-based routing
│   ├── hooks.server.ts # Middleware
│   └── app.d.ts       # Global types
├── e2e/               # Playwright tests
├── static/            # Assets
└── compose.yaml       # Docker DB setup
```

## WHERE TO LOOK

| Task           | Location                      | Notes                  |
| -------------- | ----------------------------- | ---------------------- |
| Authentication | `src/lib/server/auth.ts`      | Session logic, renewal |
| DB Schema      | `src/lib/server/db/schema.ts` | User & Session tables  |
| Middleware     | `src/hooks.server.ts`         | handleAuth injection   |
| Types          | `src/app.d.ts`                | App.Locals definition  |

## CODE MAP

| Symbol                 | Type       | Location                                      | Role                             |
| ---------------------- | ---------- | --------------------------------------------- | -------------------------------- |
| `handleAuth`           | Middleware | `src/hooks.server.ts`                         | Injects user/session into locals |
| `validateSessionToken` | Function   | `src/lib/server/auth.ts`                      | Token verification & renewal     |
| `actions`              | Method     | `src/routes/demo/lucia/login/+page.server.ts` | Login/Register logic             |
| `user`, `session`      | Schema     | `src/lib/server/db/schema.ts`                 | Drizzle tables                   |

## CONVENTIONS

- **Svelte 5**: Use Runes ($state, $derived, etc.) for reactivity.
- **Auth**: Custom implementation (Lucia-like) instead of external library.
- **Database**: Drizzle with PostgreSQL (Node adapter).
- **Styling**: Tailwind CSS 4.

## ANTI-PATTERNS (THIS PROJECT)

- **no-undef**: Disabled in ESLint (handled by TS).
- **Hardcoding**: Use `.env` via `DATABASE_URL`.
- **Manual DB Edits**: Use `drizzle-kit push` or `migrate`.

## UNIQUE STYLES

- **Tabs**: Project uses tabs for indentation.
- **Single Quotes**: Project uses single quotes.
- **MDsveX**: Supports `.svx` extensions for markdown content.

## COMMANDS

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm test         # Run unit + E2E tests
pnpm db:start     # Start Docker Postgres
pnpm db:push      # Sync schema to DB
pnpm db:studio    # Open DB GUI
```

## NOTES

- **Session Duration**: 30 days default, renewed at 15 days.
- **ID Generation**: 120 bits of entropy via `@oslojs/encoding`.
