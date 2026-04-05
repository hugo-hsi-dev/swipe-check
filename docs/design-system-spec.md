# Organic Design System Specification

## Overview

A warm, wellness-focused design system for a personality quiz journal app. The aesthetic creates an emotionally safe space for self-reflection through soft shapes, earthy tones, and approachable typography.

**Philosophy**: Self-discovery requires vulnerability. The UI should feel like a warm, nurturing space that says "it's safe to explore yourself here."

---

## Color Palette

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `cream` | `#FDF8F3` | Main background, creates warmth |
| `warmWhite` | `#FFFBF7` | Card backgrounds, elevated surfaces |
| `softBrown` | `#4A4238` | Primary text, headings |
| `warmGray` | `#6B6358` | Secondary text, descriptions |

### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `sage` | `#8B9A7D` | Success states, positive actions |
| `sageLight` | `#E8EDE4` | Sage-tinted backgrounds |
| `terracotta` | `#C4A484` | Primary actions, CTAs |
| `terracottaLight` | `#F5EDE4` | Terracotta-tinted backgrounds |
| `peach` | `#F5E6D8` | Secondary highlights, streaks |
| `coral` | `#D4A574` | Tertiary accents, badges |

### Color Usage Patterns

- **Backgrounds**: Always use cream (`#FDF8F3`) as base
- **Cards**: Use warmWhite (`#FFFBF7`) for default, or tinted versions (sageLight, terracottaLight, peach) for categorization
- **Text**: softBrown (`#4A4238`) for primary, warmGray (`#6B6358`) for secondary
- **Success/Complete**: sage (`#8B9A7D`) family
- **Actions**: terracotta (`#C4A484`) for primary buttons

---

## Typography

### Font Stack

```typescript
const FONTS = {
  // System fonts - clean and approachable
  heading: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  body: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
};
```

### Type Scale

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Display | 30px | 600 | 1.2 | Page titles ("Good morning,") |
| Heading 1 | 24px | 700 | 1.3 | Card titles, type names |
| Heading 2 | 18px | 600 | 1.3 | Section labels |
| Body | 14px | 400 | 1.5 | Descriptions, questions |
| Body Small | 12px | 400 | 1.4 | Metadata, hints |
| Label | 11px | 600 | 1.2 | Uppercase labels, tracking wide |

### Typography Patterns

- **Labels**: Always uppercase with letterSpacing: 0.5-1px
- **Headings**: Use softBrown color, semibold or bold weight
- **Body**: Use warmGray color for descriptions
- **Emphasis**: Use terracotta or sage for highlighted text

---

## Shapes & Borders

### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 12px | Small icons, badges |
| `md` | 16px | Buttons, small cards |
| `lg` | 20px | Medium cards |
| `xl` | 24px | Large cards, main containers |
| `pill` | 9999px | Full rounded elements |

### Shape Patterns

- **Cards**: Large rounded corners (20-24px), never sharp
- **Buttons**: Medium rounded (16px), full width when primary
- **Icons containers**: Small rounded (12px) or match card radius
- **Badges**: Pill-shaped (fully rounded)

---

## Shadows & Elevation

### Shadow Style

No harsh shadows. Use very subtle shadows only when necessary:

```typescript
const shadow = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
};
```

### Elevation Pattern

Prefer flat design with background color changes for elevation:
- Use warmWhite on cream for elevation
- Use tinted backgrounds (sageLight, terracottaLight) for categorization
- Avoid shadows unless absolutely necessary for depth

---

## Spacing

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight gaps, icon gaps |
| `sm` | 8px | Small gaps, badge padding |
| `md` | 12px | Standard gaps |
| `lg` | 16px | Card padding, section gaps |
| `xl` | 20px | Large card padding |
| `2xl` | 24px | Header padding |
| `3xl` | 32px | Section separation |

### Layout Patterns

- **Page padding**: 20px horizontal (mx-5 equivalent)
- **Card padding**: 20-24px (p-5 or p-6)
- **Card gap**: 16-20px between cards
- **Section gap**: 24px between major sections
- **Header top padding**: 56px (pt-14) for status bar

---

## Components

### Cards

**Standard Card**:
- Background: warmWhite (`#FFFBF7`)
- Border radius: 24px
- Padding: 24px (p-6)
- No border, no shadow (flat design)

**Colored/Tinted Cards**:
- sageLight (`#E8EDE4`) - for type/identity cards
- terracottaLight (`#F5EDE4`) - for status/action cards
- peach (`#F5E6D8`) - for streaks/progress

**Header Card**:
- Background: warmWhite
- Border radius: 32px (rounded at bottom only)
- Creates floating effect over cream background

### Buttons

**Primary Button**:
- Background: terracotta (`#C4A484`)
- Text: white, semibold
- Border radius: 16px
- Padding: 12px vertical, full width
- Icon support with gap of 8px

**Secondary Button**:
- Background: warmWhite
- Border: 1px solid terracottaLight or sageLight
- Text: terracotta or matching border color
- Border radius: 16px

### Icon Containers

**Status Icon**:
- Size: 56-64px
- Border radius: 16px (square with rounded corners)
- Background: sage or terracotta
- Icon: white, 28px

**Badge Icon**:
- Size: 40px
- Border radius: 12px
- Background: matching tint color
- Icon: matching primary color

### Badges/Pills

```typescript
// Example streak badge
<View
  style={{
    backgroundColor: 'rgba(139, 154, 125, 0.15)', // 15% sage
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  }}
>
  <Text style={{ color: sage, fontSize: 12, fontWeight: '600' }}>
    {count} reflections
  </Text>
</View>
```

### Answer Items

- Background: warmWhite
- Border radius: 16px
- Padding: 16px
- Gap between items: 12px
- Status indicator: small icon (16px) in colored circle

---

## Layout Patterns

### Page Structure

```
┌─────────────────────────────┐
│  Status Bar (transparent)   │
├─────────────────────────────┤
│  Header Card (warmWhite)    │
│  - Greeting                 │
│  - Date                     │
├─────────────────────────────┤
│  Main Content (cream bg)    │
│  - Status Card              │
│  - Type Card                │
│  - Stats Row                │
│  - Answers List             │
│  - Actions                  │
└─────────────────────────────┘
```

### Card Ordering

1. **Status Card** (terracottaLight) - Current session state
2. **Type Card** (sageLight) - Current personality type
3. **Streak Card** (peach) - Progress/streak
4. **Answers Section** - List of responses
5. **Action Buttons** - Navigation actions

---

## Animation Guidelines

### Transitions

- **Card entrance**: Gentle fade-in with slight translateY (10px → 0)
- **Button press**: Scale to 0.98 with opacity reduction
- **Page transitions**: Soft fade, no harsh movements

### Timing

- **Standard**: 200ms ease-out
- **Gentle**: 300ms ease-in-out
- **Stagger**: 50ms between list items

---

## Migration from HeroUI

### Component Replacements

| HeroUI Component | Custom Implementation |
|------------------|----------------------|
| `Card` | Custom `View` with warmWhite bg, 24px radius |
| `Card.Header/Body` | Regular `View` with padding |
| `Button` | `Pressable` with terracotta bg, 16px radius |
| `Chip` | `View` with pill shape, tinted bg |
| `Text` | React Native `Text` with style objects |

### Code Patterns

**Before (HeroUI)**:
```tsx
<Card>
  <Card.Header>
    <Card.Title>Today</Card.Title>
  </Card.Header>
  <Card.Body>
    <Text>Content</Text>
  </Card.Body>
</Card>
```

**After (Custom)**:
```tsx
<View style={styles.card}>
  <View style={styles.cardHeader}>
    <Text style={styles.cardTitle}>Today</Text>
  </View>
  <Text style={styles.cardBody}>Content</Text>
</View>

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: 24,
    padding: 24,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.softBrown,
  },
  cardBody: {
    fontSize: 14,
    color: COLORS.warmGray,
    lineHeight: 21,
  },
});
```

---

## File Organization

```
constants/
├── design-system.ts          # Colors, typography, spacing tokens
├── theme.ts                  # Keep existing (for legacy)

components/
├── ui/                       # Reusable UI primitives
│   ├── card.tsx              # Organic card component
│   ├── button.tsx            # Organic button component
│   ├── badge.tsx             # Pill badges
│   └── icon-container.tsx    # Status/icon containers
├── today/                    # Today screen specific
│   ├── status-card.tsx
│   ├── type-card.tsx
│   ├── streak-card.tsx
│   └── answer-item.tsx

hooks/
└── use-design-system.ts      # Access tokens in components
```

---

## Accessibility

- **Touch targets**: Minimum 44x44pt
- **Contrast ratios**: All text meets WCAG AA (4.5:1)
- **Screen readers**: All interactive elements labeled
- **Reduce motion**: Respect system preference

---

## Responsive Considerations

- Use percentage-based widths where appropriate
- Minimum card width: 320px
- Maximum content width: 430px (centered on larger screens via web)
