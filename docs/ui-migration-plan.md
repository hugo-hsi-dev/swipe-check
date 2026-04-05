# UI Migration Plan: HeroUI → Custom Organic Design

## Overview

Migrate the swipe-check app from HeroUI components to a custom implementation following the **Organic Design System**. This is a phased approach to minimize risk and allow incremental testing.

---

## Phase 1: Foundation (Required First)

**Goal**: Create the design system infrastructure that all other work depends on.

### 1.1 Create Design Tokens
**Files to create:**
- `constants/design-system.ts` - Color palette, typography, spacing, border radius

**Colors to migrate:**
```typescript
const COLORS = {
  cream: '#FDF8F3',          // background
  warmWhite: '#FFFBF7',      // cards
  softBrown: '#4A4238',      // primary text
  warmGray: '#6B6358',       // secondary text
  sage: '#8B9A7D',
  sageLight: '#E8EDE4',
  terracotta: '#C4A484',
  terracottaLight: '#F5EDE4',
  peach: '#F5E6D8',
  coral: '#D4A574',
};
```

**Spacing tokens:**
- xs: 4, sm: 8, md: 12, lg: 16, xl: 20, 2xl: 24, 3xl: 32

**Border radius tokens:**
- sm: 12, md: 16, lg: 20, xl: 24, pill: 9999

### 1.2 Create Base Components
**Files to create:**
- `components/ui/card.tsx` - Organic card with variants
- `components/ui/button.tsx` - Primary and secondary buttons
- `components/ui/badge.tsx` - Pill-shaped badges
- `components/ui/icon-container.tsx` - Status icons

**Acceptance Criteria:**
- All components accept style props for customization
- Components are typed with TypeScript
- Components render correctly in isolation

---

## Phase 2: Today Screen (Primary Target)

**Goal**: Fully migrate the Today screen (`app/(tabs)/today.tsx`) to custom UI.

### 2.1 Create Today-Specific Components
**Files to create:**
- `components/today/status-card.tsx` - Session status (completed/in-progress/empty)
- `components/today/type-card.tsx` - Current personality type display
- `components/today/streak-card.tsx` - Streak counter
- `components/today/answer-item.tsx` - Individual answer row

### 2.2 Refactor Today Screen
**File to modify:**
- `app/(tabs)/today.tsx`

**Changes:**
- Remove all HeroUI imports (`Card`, `Button`, `Chip`, etc.)
- Replace with custom components from Phase 1
- Remove `useThemeColor` hook usage, use design system directly
- Update layout to match Organic design (cards stacked vertically, warm backgrounds)

**Visual Requirements:**
- [ ] Page background: cream (`#FDF8F3`)
- [ ] Header card: warmWhite with 32px bottom radius
- [ ] Status card: terracottaLight background
- [ ] Type card: sageLight background  
- [ ] Streak card: peach background
- [ ] Proper spacing between cards (16-20px gap)

**Acceptance Criteria:**
- Today screen renders without HeroUI
- All states work (empty, in-progress, completed)
- TypeScript passes
- No visual regressions in functionality

---

## Phase 3: Session Screen

**Goal**: Migrate the question/answer session UI.

### 3.1 Session Components
**Files to create:**
- `components/session/progress-bar.tsx` - Question progress
- `components/session/question-card.tsx` - Question display
- `components/session/answer-button.tsx` - Agree/Disagree buttons

### 3.2 Refactor Session Screen
**File to modify:**
- `app/session.tsx`

**Changes:**
- Replace HeroUI components with custom
- Apply Organic styling (cream backgrounds, rounded cards)
- Keep gesture handling for swipe answers

---

## Phase 4: Journal & Insights

**Goal**: Migrate secondary screens.

### 4.1 Journal Screen
**Files:**
- `app/(tabs)/journal.tsx`
- `components/journal/journal-list-item.tsx`
- `components/journal/empty-state.tsx`

### 4.2 Insights Screen
**Files:**
- `app/(tabs)/insights.tsx`
- `components/insights/chart-card.tsx`
- `components/insights/stat-card.tsx`

### 4.3 Journal Detail
**Files:**
- `app/journal/[id].tsx`

---

## Phase 5: Settings & Onboarding

**Goal**: Complete remaining screens.

### 5.1 Settings Screen
**Files:**
- `app/settings.tsx`

### 5.2 Onboarding Flow
**Files:**
- `app/onboarding.tsx`
- `components/onboarding/welcome-step.tsx`
- `components/onboarding/question-step.tsx`
- `components/onboarding/results-step.tsx`

---

## Phase 6: Cleanup

**Goal**: Remove HeroUI dependency.

### 6.1 Uninstall HeroUI
```bash
pnpm remove heroui-native
```

### 6.2 Clean up global.css
Remove or simplify global.css to remove HeroUI imports if no longer needed.

### 6.3 Remove Unused Hooks
- `hooks/use-theme-color.ts` (if not used elsewhere)

### 6.4 Update _layout.tsx
Remove `HeroUINativeProvider` from `app/_layout.tsx`.

---

## Dependencies

```
Phase 1 must complete before Phase 2 can start.
Phase 2 should complete before Phase 3-5 start (as a pattern reference).
Phases 3, 4, 5 can happen in parallel once Phase 2 is done.
Phase 6 must happen last.
```

---

## Testing Checklist

For each migrated screen:
- [ ] Visual matches Organic spec
- [ ] All interactive elements work
- [ ] TypeScript compiles
- [ ] No console warnings
- [ ] Works on both iOS and Android
- [ ] Works on web (if applicable)

---

## Rollback Plan

If issues arise:
1. HeroUI remains installed until Phase 6
2. Can revert individual files by restoring from git
3. Keep the `fix/spacer-comment` branch with design showcase as reference

---

## Estimation

| Phase | Estimated Effort | Risk Level |
|-------|-----------------|------------|
| 1. Foundation | 2-3 hours | Low |
| 2. Today Screen | 3-4 hours | Medium |
| 3. Session | 2-3 hours | Medium |
| 4. Journal/Insights | 3-4 hours | Low |
| 5. Settings/Onboarding | 2-3 hours | Low |
| 6. Cleanup | 30 min | Low |
| **Total** | **13-17 hours** | |

---

## Reference Files

- `docs/design-system-spec.md` - Full design system documentation
- Stashed changes: `git stash show -p stash@{0}` (design showcase exploration)
- Original Today implementation: `app/(tabs)/today.tsx` (current)
