# AGENTS Guide — hooks/

## Scope
Applies to custom hooks under `hooks/`.

## Conventions
- Export one hook per file where practical, with `use...` naming.
- Encapsulate reusable state and derived data-flow; do not render UI from hooks.
- Keep hook APIs small and predictable.
- Prefer returning typed objects for multiple values unless an existing pattern uses tuples.
- Avoid side effects at module scope; initialize lazily inside the hook or helper.
- Use platform-specific hook files such as `.web.ts` only when the behavior truly differs by platform.
- Surface loading and error state clearly when hooks depend on app bootstrap or local data.
