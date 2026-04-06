/**
 * Navigation Bar Styles
 *
 * Minimal variant: Cream background with terracotta pill focus states.
 * Follows the organic design system with generous spacing and warm colors.
 */

import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from './design-system';

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

export const MINIMAL_NAV_VARIANT: NavVariant = {
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
};

export function getNavVariant(): NavVariant {
  return MINIMAL_NAV_VARIANT;
}
