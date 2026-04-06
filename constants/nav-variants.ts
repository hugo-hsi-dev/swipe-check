/**
 * Navigation Bar Styles
 *
 * Minimal variant: Cream background with terracotta pill focus states.
 * Follows the organic design system with generous spacing and warm colors.
 */

import { StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from './design-system';

export type NavVariantName = 'C';

export const ACTIVE_VARIANT: NavVariantName = 'C';

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
