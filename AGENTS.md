# AGENTS Guide

## Purpose

This file is for coding agents working in `/home/hugo/Projects/swipe-check`.
It summarizes the repository's build, lint, test, and style expectations based on the current codebase.

## Mandatory Epic-to-Issues Routing

If the user asks to convert an epic, product spec, PRD, roadmap, or domain brief into GitHub issues, subissues, or a dependency graph, you must invoke `epic-orchestrator` first.

This includes requests phrased like:
- "make issues for this epic"
- "break this down into issues"
- "turn this spec into GitHub issues"
- "create an issue hierarchy"
- "split this epic into subissues"
- "plan the work from this brief"

Do not create the issues manually with generic GitHub commands until `epic-orchestrator` has run.

If the request is ambiguous but mentions an epic/spec/issues/dependencies, default to `epic-orchestrator`.

## Project Summary

- Framework: Expo + React Native + Expo Router
- Language: TypeScript with `strict: true`
- Package manager: `pnpm`
- Styling: `className` via Uniwind, theme tokens via `global.css`, plus React Native `StyleSheet` and inline styles
- UI library: `heroui-native`
- Testing: Jest with `jest-expo`
- Linting: `expo lint` via Expo ESLint flat config
- Module alias: `@/*` maps to the repo root

## Workspace Facts

- Root package: `package.json` at repository root
- No monorepo packages are currently defined in `pnpm-workspace.yaml`; it only sets `nodeLinker: hoisted`
- There is no root `src/` directory; app code lives mainly under `app/`, `components/`, `hooks/`, and `constants/`
- Routing is file-based through Expo Router

## Editor / Agent Rule Files

- No `.cursorrules` file exists
- No files exist under `.cursor/rules/`
- No `.github/copilot-instructions.md` file exists
- No root-level preexisting `AGENTS.md` existed when this guide was generated

If any of those files are added later, update this document to incorporate them.

## Install

Use `pnpm` for dependency installation:

```bash
pnpm install
```

Avoid mixing package managers unless the user explicitly asks for it.

## Common Commands

Run commands from the repository root.

### Development

```bash
pnpm start
pnpm android
pnpm ios
pnpm web
```

Equivalent direct Expo command:

```bash
pnpm expo start
```

### Lint

```bash
pnpm lint
```

This runs `expo lint`.

### Typecheck

```bash
pnpm typecheck
```

This runs:

```bash
tsc --noEmit
```

### Tests

Interactive watch mode:

```bash
pnpm test
```

CI/non-watch mode:

```bash
pnpm test:ci
```

`test:ci` is the safer default for agents because it exits.

## Running A Single Test

There are currently no committed `*.test.*` or `*.spec.*` files in the repository, but Jest is configured and ready.

Preferred patterns for one file:

```bash
pnpm test:ci -- path/to/file.test.tsx
pnpm exec jest --runInBand path/to/file.test.tsx
```

Run a single test by name:

```bash
pnpm test:ci -- -t "renders loading state"
pnpm exec jest --runInBand -t "renders loading state"
```

Run a single file and a single named test together:

```bash
pnpm exec jest --runInBand path/to/file.test.tsx -t "renders loading state"
```

Useful Jest flags in this repo:

```bash
pnpm exec jest --runInBand --watch false
pnpm exec jest --runInBand --coverage
pnpm exec jest --clearCache
```

## Build Notes

- There is no dedicated `build` script in `package.json`
- Web/dev bundles are typically exercised through `pnpm web` or `pnpm start`
- For validation, prefer `pnpm lint`, `pnpm typecheck`, and `pnpm test:ci`
- Do not invent a production build command unless the user asks for one

## Validation Expectations For Agents

After non-trivial code changes, prefer this sequence when relevant:

```bash
pnpm lint
pnpm typecheck
pnpm test:ci
```

If the change is narrow and tests do not exist yet, at minimum run the checks that are meaningful for the touched code.

## Code Organization

- `app/`: route files, layouts, and screens
- `components/`: reusable UI and view helpers
- `components/ui/`: UI primitives/helpers with platform-specific variants where needed
- `hooks/`: custom hooks
- `constants/`: theme and static configuration
- `scripts/`: utility scripts; not part of the runtime app bundle

## Imports

Follow the existing import style seen across the repo.

- Put external imports first
- Put internal alias imports after external imports
- Leave a blank line between external and internal import groups
- Use `@/` aliases for internal modules instead of long relative traversals when possible
- Prefer `import type` or inline `type` imports for type-only usage when already supported by the import statement
- Keep side-effect imports near the top and only where required, such as `import 'react-native-reanimated';` and `import '@/global.css';`

Examples from the codebase:

- `import { StyleSheet, Text, type TextProps } from 'react-native';`
- `import type { PropsWithChildren, ReactElement } from 'react';`
- `import { useThemeColor } from '@/hooks/use-theme-color';`

## Formatting

- Match the existing formatting already used in each file
- Use semicolons
- Use single quotes in TS/JS files
- Prefer trailing commas only where the formatter or surrounding code already uses them
- Keep JSX readable; break props across lines when they get long
- Favor concise object literals, but wrap long inline style objects or prop lists
- Do not reformat unrelated files just to satisfy personal preference

There is no separate Prettier config in the repository, so preserve local style and let ESLint/Expo defaults guide formatting.

## TypeScript

- `strict` mode is enabled; keep code type-safe
- Prefer explicit prop types for exported components
- Use existing React Native prop types such as `TextProps`, `ViewProps`, or `ComponentProps<typeof X>` instead of re-declaring shapes
- Prefer unions and derived types over `any`
- Avoid `any`; use `unknown` if a type is truly unknown and narrow it before use
- Keep types close to usage unless reused broadly
- Use platform-specific files when that is the established pattern, for example `icon-symbol.tsx` and `icon-symbol.ios.tsx`

## Components And React Patterns

- Most screen and component modules export a single default or named function component
- Prefer function components over class components
- Keep components small and direct unless extraction clearly improves reuse or clarity
- Use local state with `useState` for simple screen interactions
- Derive booleans and display state inline when simple, for example `const emailInvalid = ...`
- Do not add memoization hooks by default unless profiling or existing patterns justify it
- Follow Expo Router conventions for route names and layouts

## Naming Conventions

- Components: PascalCase
- Hooks: camelCase with `use` prefix
- Variables/functions: camelCase
- Constants: camelCase for local constants, `UPPER_SNAKE_CASE` for true module constants like `HEADER_HEIGHT`
- Route files: Expo Router naming conventions such as `_layout.tsx`, `modal.tsx`, `(tabs)/index.tsx`
- Type aliases and prop types: PascalCase, commonly suffixed with `Props`

## Styling Conventions

Styling in this repo is mixed intentionally.

- Prefer `className` for straightforward layout, spacing, colors, and token-driven styling
- Use `StyleSheet.create` for reusable native style blocks or animation-related style objects
- Use inline styles for one-off values that are clearer in place
- Use semantic theme tokens like `bg-background`, `bg-surface-secondary`, and `bg-accent-soft`
- Use `useThemeColor` or `Colors` when code needs explicit theme-aware values
- Keep styling native-first; avoid web-only assumptions

The Metro config wraps Expo with Reanimated and Uniwind support, and `global.css` imports Tailwind, Uniwind, and HeroUI styles.

## Error Handling

- Handle errors at the boundary where failure is expected
- Prefer simple guard clauses over deeply nested conditionals
- In UI code, fail safely and preserve a usable screen where possible
- In scripts, log actionable error messages; `scripts/reset-project.js` is the current example
- Do not swallow errors silently unless there is a deliberate user-experience reason
- For async event handlers, await promises when the flow depends on them

## Testing Guidance

- Use Jest with the `jest-expo` preset
- Place tests next to the feature or in a nearby logical test location
- Prefer testing behavior and rendered output over implementation details
- For React Native UI, use `@testing-library/react-native`
- Keep tests deterministic; avoid timers and animation assertions unless necessary
- If adding tests for router screens, mock only the minimum needed

## Linting Guidance

- ESLint uses `eslint-config-expo/flat`
- `dist/*` is ignored
- Do not add new lint disables unless necessary and justified by a real limitation
- If you must suppress a rule, keep the scope as narrow as possible

## Dependency And Platform Notes

- React 19 and React Native 0.83 are in use
- Expo SDK 55 is installed even if some sample UI text still references older Expo versions
- `heroui-native`, `uniwind`, and `tailwindcss` are part of the intended stack
- `react-native-reanimated` and `react-native-gesture-handler` are configured and should remain correctly initialized

## File-Specific Observations

- `app/_layout.tsx` is the top-level provider composition point
- `app/(tabs)/_layout.tsx` configures tab navigation
- `global.css` defines semantic theme variables exposed to class-based styling
- `constants/theme.ts` is the source of theme colors and fonts for imperative styling
- `hooks/use-color-scheme.web.ts` uses hydration-aware logic for web

## Agent Do / Don't

- Do make the smallest correct change
- Do preserve Expo Router file conventions
- Do use `@/` imports for internal modules where appropriate
- Do run `pnpm lint` and `pnpm typecheck` after meaningful changes
- Do use `pnpm test:ci` instead of `pnpm test` for non-interactive verification
- Do not replace `pnpm` with npm/yarn without a reason
- Do not add broad architectural layers unless the user asks for them
- Do not introduce `any`, dead abstractions, or speculative helpers
- Do not change unrelated formatting or rename files casually

## Quick Command Reference

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
pnpm test:ci -- path/to/file.test.tsx
pnpm exec jest --runInBand path/to/file.test.tsx -t "test name"
```
