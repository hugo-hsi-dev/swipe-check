import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { TabBarIcon } from '@/components/tab-bar-icon';
import { useNavVariant } from '@/contexts/NavVariantContext';
import { NAV_VARIANTS } from '@/constants/nav-variants';

export default function TabLayout() {
  const { activeVariant } = useNavVariant();
  const variant = NAV_VARIANTS[activeVariant];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: variant.activeTintColor,
        tabBarInactiveTintColor: variant.inactiveTintColor,
        tabBarStyle: variant.tabBarStyle,
        tabBarItemStyle: variant.tabBarItemStyle,
        tabBarLabelStyle: variant.tabBarLabelStyle,
      }}>
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="checkmark.circle.fill" color={color} focused={focused} variant={variant} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="chart.bar.fill" color={color} focused={focused} variant={variant} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="ellipsis.circle.fill" color={color} focused={focused} variant={variant} />
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
