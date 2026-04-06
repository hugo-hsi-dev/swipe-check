/**
 * Organic Design System Tokens
 *
 * A warm, wellness-focused design system for the personality quiz journal app.
 * The aesthetic creates an emotionally safe space for self-reflection through
 * soft shapes, earthy tones, and approachable typography.
 */

import { Platform, type TextStyle, type ViewStyle } from 'react-native';

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const COLORS = {
  // Primary Colors
  cream: '#FDF8F3' as const,           // Main background, creates warmth
  warmWhite: '#FFFBF7' as const,       // Card backgrounds, elevated surfaces
  softBrown: '#4A4238' as const,       // Primary text, headings
  warmGray: '#6B6358' as const,        // Secondary text, descriptions

  // Accent Colors
  sage: '#8B9A7D' as const,            // Success states, positive actions
  sageLight: '#E8EDE4' as const,       // Sage-tinted backgrounds
  terracotta: '#C4A484' as const,      // Primary actions, CTAs
  terracottaLight: '#F5EDE4' as const, // Terracotta-tinted backgrounds
  peach: '#F5E6D8' as const,           // Secondary highlights, streaks
  coral: '#D4A574' as const,           // Tertiary accents, badges

  // Semantic Colors
  success: '#8B9A7D' as const,         // Same as sage
  danger: '#C45B4A' as const,          // Error/destructive actions
  warning: '#D4A574' as const,         // Same as coral

  // Utility Colors
  border: 'rgba(74, 66, 56, 0.1)' as const,
  borderLight: 'rgba(74, 66, 56, 0.06)' as const,
  overlay: 'rgba(74, 66, 56, 0.5)' as const,
} as const;

export type ColorToken = keyof typeof COLORS;

// ============================================================================
// SPACING SCALE
// ============================================================================

export const SPACING = {
  xs: 4 as const,
  sm: 8 as const,
  md: 12 as const,
  lg: 16 as const,
  xl: 20 as const,
  '2xl': 24 as const,
  '3xl': 32 as const,
  '4xl': 40 as const,
  '5xl': 48 as const,
} as const;

export type SpacingToken = keyof typeof SPACING;

// ============================================================================
// BORDER RADIUS SCALE
// ============================================================================

export const RADIUS = {
  sm: 12 as const,
  md: 16 as const,
  lg: 20 as const,
  xl: 24 as const,
  '2xl': 32 as const,
  pill: 9999 as const,
} as const;

export type RadiusToken = keyof typeof RADIUS;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const FONTS = Platform.select({
  ios: {
    heading: 'System' as const,
    body: 'System' as const,
  },
  android: {
    heading: 'Roboto' as const,
    body: 'Roboto' as const,
  },
  default: {
    heading: 'System' as const,
    body: 'System' as const,
  },
});

export const FONT_SIZES = {
  xs: 11 as const,
  sm: 12 as const,
  base: 14 as const,
  lg: 16 as const,
  xl: 18 as const,
  '2xl': 20 as const,
  '3xl': 24 as const,
  '4xl': 30 as const,
} as const;

export const FONT_WEIGHTS = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

export const LINE_HEIGHTS = {
  tight: 1.2 as const,
  normal: 1.4 as const,
  relaxed: 1.5 as const,
  loose: 1.6 as const,
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const SHADOWS: Record<string, ViewStyle> = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

// ============================================================================
// PRESET STYLES
// ============================================================================

export const TEXT_STYLES: Record<string, TextStyle> = {
  // Display
  display: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES['4xl'] * LINE_HEIGHTS.tight,
    color: COLORS.softBrown,
  },

  // Headings
  h1: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES['3xl'] * LINE_HEIGHTS.normal,
    color: COLORS.softBrown,
  },
  h2: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.xl * LINE_HEIGHTS.normal,
    color: COLORS.softBrown,
  },
  h3: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.normal,
    color: COLORS.softBrown,
  },

  // Body
  body: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.normal,
    lineHeight: FONT_SIZES.base * LINE_HEIGHTS.relaxed,
    color: COLORS.warmGray,
  },
  bodySmall: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.normal,
    lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.normal,
    color: COLORS.warmGray,
  },

  // Label
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.xs * LINE_HEIGHTS.tight,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: COLORS.warmGray,
  },

  // Semantic
  success: {
    color: COLORS.sage,
  },
  danger: {
    color: COLORS.danger,
  },
  muted: {
    color: COLORS.warmGray,
  },
} as const;

// ============================================================================
// CARD STYLES
// ============================================================================

export const CARD_STYLES: Record<string, ViewStyle> = {
  base: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
  },
  header: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS['2xl'],
    borderBottomLeftRadius: RADIUS['2xl'],
    borderBottomRightRadius: RADIUS['2xl'],
    padding: SPACING['2xl'],
  },
  sage: {
    backgroundColor: COLORS.sageLight,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
  },
  terracotta: {
    backgroundColor: COLORS.terracottaLight,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
  },
  peach: {
    backgroundColor: COLORS.peach,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
  },
} as const;

// ============================================================================
// BUTTON STYLES
// ============================================================================

export const BUTTON_STYLES: Record<string, ViewStyle> = {
  primary: {
    backgroundColor: COLORS.terracotta,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  secondary: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.terracottaLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  danger: {
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
} as const;

export const BUTTON_TEXT_STYLES: Record<string, TextStyle> = {
  primary: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  secondary: {
    color: COLORS.terracotta,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  ghost: {
    color: COLORS.softBrown,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
  },
  danger: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
} as const;

// ============================================================================
// LAYOUT CONSTANTS
// ============================================================================

export const LAYOUT = {
  pagePadding: SPACING.xl,
  cardGap: SPACING.lg,
  sectionGap: SPACING['2xl'],
  maxContentWidth: 430,
  minTouchTarget: 44,
} as const;

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================

export const ANIMATION = {
  fast: 150,
  normal: 200,
  slow: 300,
  stagger: 50,
} as const;
