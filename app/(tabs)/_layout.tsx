import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { TabBarIcon } from '@/components/tab-bar-icon';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

const MINIMAL_TAB_BAR_STYLE = StyleSheet.create({
  root: {
    backgroundColor: COLORS.cream,
    borderTopColor: COLORS.borderLight,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: SPACING.md,
    paddingBottom: 34,
    paddingHorizontal: SPACING.lg,
    height: 90,
  },
}).root;

const MINIMAL_TAB_BAR_ITEM_STYLE = StyleSheet.create({
  root: {
    paddingTop: SPACING.xs,
    paddingBottom: 0,
  },
}).root;

const MINIMAL_TAB_BAR_LABEL_STYLE = StyleSheet.create({
  root: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0,
    textTransform: 'none',
    marginTop: SPACING.md,
  },
}).root;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: MINIMAL_TAB_BAR_STYLE,
        tabBarItemStyle: MINIMAL_TAB_BAR_ITEM_STYLE,
        tabBarLabelStyle: MINIMAL_TAB_BAR_LABEL_STYLE,
      }}>
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="checkmark.circle.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="chart.bar.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="ellipsis.circle.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
