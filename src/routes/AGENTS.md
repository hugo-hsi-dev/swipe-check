# ROUTES KNOWLEDGE BASE

## OVERVIEW

File-based routing for application pages and server actions.

## STRUCTURE

```
src/routes/
├── demo/
│   └── lucia/
│       ├── login/        # Login/Register forms & actions
│       └── +page.svelte  # Protected user profile
├── +layout.svelte        # Global layout & Tailwind import
└── +page.svelte          # Landing page
```

## WHERE TO LOOK

| Feature        | Location                           |
| -------------- | ---------------------------------- |
| Login/Register | `demo/lucia/login/+page.server.ts` |
| Protected Page | `demo/lucia/+page.server.ts`       |
| Home Page      | `+page.svelte`                     |

## CONVENTIONS

- **Actions**: Use named actions (`login`, `register`, `logout`) in `+page.server.ts`.
- **Protection**: Use `requireLogin()` or check `locals.user` in `load` functions.
- **Forms**: Standard SvelteKit form actions with progressive enhancement.

## ANTI-PATTERNS

- **Client-side Auth**: NEVER perform session validation solely on the client.
- **Sensitive Data in URL**: Avoid passing tokens or passwords in search params.
