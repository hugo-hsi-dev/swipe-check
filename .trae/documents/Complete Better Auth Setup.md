## Dependencies

- Add `better-auth` to `dependencies` and install.
- Ensure imports for `better-auth/svelte` and `better-auth/svelte-kit` resolve.

## Database & Schema

- Add a Postgres service for local dev (Docker Compose) or point `DATABASE_URL` to an existing DB.
- Generate Better Auth tables using `npx @better-auth/cli@latest generate`, output to `src/lib/server/db/auth-schema.ts`.
- Update Drizzle config to include both app and auth schemas (use the db directory path or a glob) and generate/push migrations.

## Env & Secrets

- Create `.env` with `DATABASE_URL`, `BETTER_AUTH_SECRET`, `APP_URL`.
- If using email flows, add SMTP envs (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) and configure Better Auth email sender.
- Configure secure cookies for production (`secure=true`, appropriate `sameSite` and domain) in Better Auth options if needed.

## SvelteKit Integration

- Keep `svelteKitHandler` in `hooks.server.ts` and session locals wiring as-is.
- Optionally add route-level guards (server `load` or endpoint checks) using `event.locals.user` for protected pages.

## UI: Sign In/Up & Session

- Create `/auth/sign-in` and `/auth/sign-up` pages with forms using `signIn`/`signUp` from `src/lib/auth-client.ts`.
- Add a small session indicator and `signOut` action in a shared layout/nav.
- Add a protected example page (e.g., `/dashboard`) that redirects to `/auth/sign-in` when unauthenticated.

## Tests

- Server tests: session retrieval via `auth.api.getSession`, and route protection behavior.
- Component tests: sign-in/up form interaction, error handling, and sign-out.

## Verification

- Start the database, run migrations, and launch the app.
- Exercise sign-up/sign-in/sign-out flows and confirm cookies and session locals.
- Run test suites and ensure all pass.

## Deliverables

- Updated `package.json` dependencies.
- Generated auth schema and migrations integrated with Drizzle.
- `.env` keys documented and loaded.
- Sign-in/up pages, session indicator, protected route example.
- Tests for basic auth flows and guards.

Please confirm and I will implement these changes end-to-end, validate locally, and share the results.
