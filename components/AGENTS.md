# AGENTS Guide — components/

## Scope
Applies to reusable UI and feature presentation components under `components/`.

## Conventions
- Prefer function components with explicit exported prop types.
- Keep components small and composable; extract only when it improves reuse or clarity.
- Use React Native prop types and `ComponentProps<typeof X>` where they fit better than hand-rolled shapes.
- Keep styling native-first.
  - Use `className` for straightforward layout and spacing.
  - Use `StyleSheet.create` or inline styles for reusable native or one-off styles.
- Organize feature-specific components in feature folders instead of a flat bucket.
- In `components/ui/`, keep primitives prop-driven and presentation-only.
- Avoid adding memoization hooks unless there is a clear performance reason.
- If a component has a platform-specific variant, keep the paired file names aligned.
