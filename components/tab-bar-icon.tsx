import React from 'react';
import { View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { getNavVariant } from '@/constants/nav-variants';

type TabBarIconProps = {
  color: string;
  focused: boolean;
  name: Extract<AppIconName, 'chart.bar.fill' | 'checkmark.circle.fill' | 'ellipsis.circle.fill'>;
  size?: number;
};

export function TabBarIcon({ color, focused, name, size = 28 }: TabBarIconProps) {
  const variant = getNavVariant();
  const iconColor = focused ? variant.focusedIconColor : color;
  const shellStyle = [variant.iconShellStyle, focused ? variant.iconShellFocusedStyle : variant.iconShellIdleStyle];

  return (
    <View style={shellStyle}>
      <AppIcon color={iconColor} name={name} size={size} />
    </View>
  );
}
