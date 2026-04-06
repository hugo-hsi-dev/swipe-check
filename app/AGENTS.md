# AGENTS Guide — app/

## Scope
Applies to Expo Router files under `app/`.

## Conventions
- Keep route files thin and route-focused; move reusable logic into hooks or components.
- Treat `_layout.tsx` files as navigation/provider composition points.
- Follow Expo Router naming and folder conventions for static, dynamic, and grouped routes.
- Keep tab and stack configuration centralized in the relevant layout file.
- Use `Redirect`, `Stack`, and `Tabs` patterns already established in the app.
- Prefer screen-local state over broad abstractions when the behavior is isolated.
- Avoid putting shared business logic directly in route files unless it is truly route-specific.
