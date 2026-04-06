/**
 * Navigation Bar Styles
 *
 * Minimal variant: Cream background with terracotta pill focus states.
 * Follows the organic design system with generous spacing and warm colors.
 */

import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SHADOWS, SPACING } from './design-system';

export const NAV_VARIANT_ORDER = ['A', 'B', 'C'] as const;

export type NavVariantName = (typeof NAV_VARIANT_ORDER)[number];

export const DEFAULT_NAV_VARIANT: NavVariantName = 'C';

export type NavVariant = {
  name: string;
  description: string;
  accentColor: string;
  surfaceColor: string;
  activeTintColor: string;
  inactiveTintColor: string;
  focusedIconColor: string;
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
    description: 'Warm white bar, bordered icon shells, uppercase labels',
    accentColor: COLORS.terracotta,
    surfaceColor: COLORS.warmWhite,
    activeTintColor: COLORS.terracotta,
    inactiveTintColor: COLORS.warmGray,
    focusedIconColor: COLORS.terracotta,
    tabBarStyle: StyleSheet.create({
      root: {
        backgroundColor: COLORS.warmWhite,
        borderColor: COLORS.borderLight,
        borderRadius: RADIUS['2xl'],
        borderWidth: 1,
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.sm,
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.sm,
        height: 92,
        ...SHADOWS.subtle,
      },
    }).root,
    tabBarItemStyle: StyleSheet.create({
      root: {
        paddingTop: SPACING.xs,
        paddingBottom: SPACING.sm,
      },
    }).root,
    tabBarLabelStyle: StyleSheet.create({
      root: {
        fontSize: 10,
        fontWeight: FONT_WEIGHTS.semibold,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginTop: SPACING.xs,
      },
    }).root,
    iconShellStyle: StyleSheet.create({
      root: {
        alignItems: 'center',
        borderRadius: RADIUS.lg,
        height: 46,
        justifyContent: 'center',
        width: 46,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
      },
    }).root,
    iconShellFocusedStyle: StyleSheet.create({
      root: {
        backgroundColor: COLORS.warmWhite,
        borderColor: COLORS.terracotta,
      },
    }).root,
    iconShellIdleStyle: StyleSheet.create({
      root: {
        backgroundColor: 'transparent',
      },
    }).root,
  },
  B: {
    name: 'Floating Pill',
    description: 'Inset floating bar, pill icons, sage focus',
    accentColor: COLORS.sage,
    surfaceColor: COLORS.warmWhite,
    activeTintColor: COLORS.sage,
    inactiveTintColor: COLORS.warmGray,
    focusedIconColor: '#FFFFFF',
    tabBarStyle: StyleSheet.create({
      root: {
        backgroundColor: COLORS.warmWhite,
        borderColor: COLORS.borderLight,
        borderRadius: RADIUS['2xl'],
        borderWidth: 1,
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.sm,
        height: 94,
        ...SHADOWS.soft,
      },
    }).root,
    tabBarItemStyle: StyleSheet.create({
      root: {
        paddingTop: 0,
        paddingBottom: SPACING.xs,
      },
    }).root,
    tabBarLabelStyle: StyleSheet.create({
      root: {
        fontSize: 10,
        fontWeight: FONT_WEIGHTS.semibold,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop: SPACING.xs,
      },
    }).root,
    iconShellStyle: StyleSheet.create({
      root: {
        alignItems: 'center',
        borderRadius: RADIUS.pill,
        height: 44,
        justifyContent: 'center',
        width: 44,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
      },
    }).root,
    iconShellFocusedStyle: StyleSheet.create({
      root: {
        backgroundColor: COLORS.sage,
        borderColor: COLORS.sage,
      },
    }).root,
    iconShellIdleStyle: StyleSheet.create({
      root: {
        backgroundColor: 'transparent',
      },
    }).root,
  },
  C: {
    name: 'Minimal',
    description: 'Cream background, terracotta pill on focus, generous spacing',
    accentColor: COLORS.terracotta,
    surfaceColor: COLORS.cream,
    activeTintColor: COLORS.terracotta,
    inactiveTintColor: COLORS.warmGray,
    focusedIconColor: '#FFFFFF',
    tabBarStyle: StyleSheet.create({
      root: {
        backgroundColor: COLORS.cream,
        borderTopColor: COLORS.borderLight,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingTop: SPACING.md,
        paddingBottom: 34,
        paddingHorizontal: SPACING.lg,
        height: 90,
      },
    }).root,
    tabBarItemStyle: StyleSheet.create({
      root: {
        paddingTop: SPACING.xs,
        paddingBottom: 0,
      },
    }).root,
    tabBarLabelStyle: StyleSheet.create({
      root: {
        fontSize: FONT_SIZES.xs,
        fontWeight: FONT_WEIGHTS.medium,
        letterSpacing: 0,
        textTransform: 'none',
        marginTop: SPACING.md,
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

export function getNavVariant(variant: NavVariantName): NavVariant {
  return NAV_VARIANTS[variant];
}
