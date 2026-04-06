# AGENTS Guide — lib/local-data/

## Scope
Applies to persistence, SQLite, and local data helpers under `lib/local-data/`.

## Conventions
- Treat this as the data/persistence layer; keep UI and route logic out of it.
- Prefer small, adapter-based modules with one responsibility.
- Make database lifecycle behavior explicit, especially bootstrap and reset flows.
- Keep SQL and schema details localized here instead of leaking them into hooks or screens.
- Return typed results where practical and keep async boundaries clear.
- If schema behavior changes, document the policy close to the implementation.
