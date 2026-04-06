import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { TabBarIcon } from '@/components/tab-bar-icon';
import { getNavVariant } from '@/constants/nav-variants';

export default function TabLayout() {
  const variant = getNavVariant();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: variant.activeTintColor,
        tabBarButton: HapticTab,
        tabBarInactiveTintColor: variant.inactiveTintColor,
        tabBarItemStyle: variant.tabBarItemStyle,
        tabBarLabelStyle: variant.tabBarLabelStyle,
        tabBarStyle: variant.tabBarStyle,
      }}>
      <Tabs.Screen
        name="today"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} name="checkmark.circle.fill" />
          ),
          title: 'Today',
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} name="chart.bar.fill" />
          ),
          title: 'Insights',
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} name="ellipsis.circle.fill" />
          ),
          title: 'More',
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
