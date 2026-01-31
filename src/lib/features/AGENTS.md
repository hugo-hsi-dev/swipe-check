# Feature Organization

Features are self-contained modules with components, remote functions, and supporting code.

## Structure

```
[src/lib/features/[feature-name]/]
├── remotes/[action]/
│   ├── [action].handler.ts   # Implementation (exported as default)
│   ├── [action].remote.ts    # Remote wrapper (query/command/form/prerender)
│   ├── [action].schema.ts    # Optional: validation schema
│   └── [action].test.ts      # Tests for implementation
├── components/[component]/
│   ├── [component].svelte
│   └── [component].test.ts   # Component tests
└── lib/                      # Optional: utilities, types
```

## File Patterns

**Implementation** (`[action].handler.ts`)

- Exports default function with action logic

**Schema** (`[action].schema.ts`)

- Optional, only for remotes requiring validation
- Exports named schema (e.g., `deleteUserSchema`)
- Use Zod as validation library

**Remote wrapper** (`[action].remote.ts`)

- Imports handler and schema
- Exports remote function using `$app/server` utilities
- Named export matches action name

**Tests** (`[action].test.ts`)

- Test the handler implementation and schema validation only
- Remote wrappers cannot be reliably tested

## Remote Functions

Refer to SvelteKit documentation via MCP for:

- `query` - Read data
- `command` - Write data
- `form` - Form submissions with progressive enhancement
- `prerender` - Build-time data
