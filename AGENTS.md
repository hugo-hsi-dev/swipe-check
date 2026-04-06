# AGENTS Guide

## Scope
This file applies to the repository root and all files unless a deeper `AGENTS.md` overrides it.

## Project at a glance
- Stack: Expo + React Native + Expo Router
- Language: TypeScript with `strict: true`
- Package manager: `pnpm`
- Styling: Uniwind `className`, `global.css` theme tokens, plus `StyleSheet` and inline styles
- UI: custom components/primitives; docs include a historical HeroUI migration plan, but verify `package.json` before assuming any external UI library is installed
- Testing: Jest with `jest-expo`
- Linting: `expo lint` via Expo ESLint flat config
- Module alias: `@/*` maps to the repo root

## Repository layout
- `app/`: route files, layouts, and screens
- `components/`: shared UI and feature view helpers
- `hooks/`: custom hooks
- `constants/`: shared tokens, contracts, and static configuration
- `lib/local-data/`: SQLite and persistence helpers
- `scripts/`: utility scripts, if present

There is no root `src/` directory; app code lives mainly under `app/`, `components/`, `hooks/`, and `constants/`.

## Working rules
- Read any deeper `AGENTS.md` files before editing within those directories.
- Use `@/` imports for internal modules when practical.
- Keep external imports first, then internal imports, with a blank line between groups.
- Use semicolons and single quotes in TS/JS files.
- Keep changes small and preserve local formatting.
- Prefer explicit types, function components, and typed hooks.
- Avoid `any`; use `unknown` and narrow it if needed.
- Handle expected failures at the boundary where they occur.

## Validation
After meaningful changes, run the checks that apply:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test:ci`

Prefer `pnpm test:ci` over `pnpm test` for non-interactive runs.

## Commands
```bash
pnpm install
pnpm start
pnpm android
pnpm ios
pnpm web
pnpm lint
pnpm typecheck
pnpm test
pnpm test:ci
```

## Epic/issue routing
If asked to turn an epic, spec, PRD, roadmap, or domain brief into GitHub issues or a dependency graph, invoke `epic-orchestrator` first.
