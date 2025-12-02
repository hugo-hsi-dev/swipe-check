User Registration Flow Refactoring Plan

1. Enable remote functions in svelte.config.js
2. Create src/lib/auth.remote.ts with registerUser function using valibot validation
3. Create src/routes/register/+page.svelte using shadcn-svelte components
4. Use existing auth utilities from src/lib/server/auth.ts
5. Include confirm password field with validation
6. Add loading states and error handling with sonner toasts
7. Keep demo routes intact for reference

Key Features:
- Remote functions instead of form actions
- Valibot validation with confirm password
- Shadcn-svelte components (field, input, button, card)
- Loading spinner in button
- Proper error handling and validation feedback
