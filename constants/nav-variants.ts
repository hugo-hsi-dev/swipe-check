/**
 * Navigation Bar Variants
 *
 * Three non-liquid glass bottom bar designs following the organic design system.
 * Each variant offers a distinct visual personality while maintaining warmth
 * and approachability.
 *
 * Spacing philosophy:
 * - No fixed heights - let content + padding size the bar naturally
 * - Generous bottom padding (24-32px) to stay clear of home indicator
 * - Icon-to-label gap of 8-12px for comfortable reading
 */

import { StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SHADOWS, SPACING } from './design-system';

export type NavVariantName = 'A' | 'B' | 'C';

export const ACTIVE_VARIANT: NavVariantName = 'A';

export type NavVariant = {
  name: string;
  description: string;
  tabBarStyle: ViewStyle;
  tabBarItemStyle: ViewStyle;
  tabBarLabelStyle: TextStyle;
  iconShellStyle: ViewStyle;
  iconShellFocusedStyle: ViewStyle;
  iconShellIdleStyle: ViewStyle;
};

export const NAV_VARIANTS: Record<NavVariantName, NavVariant> = {
  A: {
    name: 'Subtle',
    description: 'Clean with bordered icon shells, uppercase labels',
    tabBarStyle: StyleSheet.create({
      root: {
        backgroundColor: COLORS.warmWhite,
        borderTopColor: COLORS.borderLight,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingTop: SPACING.md,
        paddingBottom: 28,
        paddingHorizontal: SPACING.md,
      },
    }).root,
    tabBarItemStyle: StyleSheet.create({
      root: {
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.sm,
      },
    }).root,
    tabBarLabelStyle: StyleSheet.create({
      root: {
        fontSize: FONT_SIZES.xs,
        fontWeight: FONT_WEIGHTS.semibold,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginTop: SPACING.sm,
      },
    }).root,
    iconShellStyle: StyleSheet.create({
      root: {
        alignItems: 'center',
        borderRadius: RADIUS.md,
        height: 40,
        justifyContent: 'center',
        width: 40,
      },
    }).root,
    iconShellFocusedStyle: StyleSheet.create({
      root: {
        backgroundColor: COLORS.terracottaLight,
        borderColor: 'rgba(196, 164, 132, 0.25)',
        borderWidth: 1,
      },
    }).root,
    iconShellIdleStyle: StyleSheet.create({
      root: {
        backgroundColor: COLORS.warmWhite,
        borderColor: COLORS.borderLight,
        borderWidth: 1,
      },
    }).root,
  },

  B: {
    name: 'Floating Pill',
    description: 'Inset floating bar with rounded top corners, pill icons',
    tabBarStyle: StyleSheet.create({
      root: {
        backgroundColor: COLORS.warmWhite,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        borderTopWidth: 0,
        paddingTop: SPACING.lg,
        paddingBottom: 24,
        paddingHorizontal: SPACING.xl,
        marginHorizontal: SPACING.sm,
        marginBottom: 0,
        ...SHADOWS.soft,
      },
    }).root,
    tabBarItemStyle: StyleSheet.create({
      root: {
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.sm,
      },
    }).root,
    tabBarLabelStyle: StyleSheet.create({
      root: {
        fontSize: FONT_SIZES.xs,
        fontWeight: FONT_WEIGHTS.semibold,
        letterSpacing: 0.5,
        textTransform: 'none',
        marginTop: SPACING.sm,
      },
    }).root,
    iconShellStyle: StyleSheet.create({
      root: {
        alignItems: 'center',
        borderRadius: RADIUS.pill,
        height: 44,
        justifyContent: 'center',
        width: 44,
      },
    }).root,
    iconShellFocusedStyle: StyleSheet.create({
      root: {
        backgroundColor: COLORS.sageLight,
        borderWidth: 0,
      },
    }).root,
    iconShellIdleStyle: StyleSheet.create({
      root: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
    }).root,
  },

  C: {
    name: 'Minimal',
    description: 'Cream background, terracotta pill on focus, generous spacing',
    tabBarStyle: StyleSheet.create({
      root: {
        backgroundColor: COLORS.cream,
        borderTopColor: COLORS.borderLight,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingTop: SPACING.md,
        paddingBottom: 28,
        paddingHorizontal: SPACING.lg,
      },
    }).root,
    tabBarItemStyle: StyleSheet.create({
      root: {
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
      },
    }).root,
    tabBarLabelStyle: StyleSheet.create({
      root: {
        fontSize: FONT_SIZES.xs,
        fontWeight: FONT_WEIGHTS.medium,
        letterSpacing: 0,
        textTransform: 'none',
        marginTop: SPACING.sm,
      },
    }).root,
    iconShellStyle: StyleSheet.create({
      root: {
        alignItems: 'center',
        borderRadius: RADIUS.lg,
        height: 48,
        justifyContent: 'center',
        width: 48,
      },
    }).root,
    iconShellFocusedStyle: StyleSheet.create({
      root: {
        backgroundColor: COLORS.terracotta,
        borderWidth: 0,
      },
    }).root,
    iconShellIdleStyle: StyleSheet.create({
      root: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
    }).root,
  },
};

export function getActiveVariant(): NavVariant {
  return NAV_VARIANTS[ACTIVE_VARIANT];
}
