import React from 'react';
import { View } from 'react-native';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { COLORS, RADIUS } from '@/constants/design-system';

type TabBarIconProps = {
  name: IconSymbolName;
  color: string;
  size?: number;
  focused: boolean;
};

export function TabBarIcon({ name, color, size = 28, focused }: TabBarIconProps) {
  const shellStyle = {
    alignItems: 'center' as const,
    borderRadius: RADIUS.lg,
    height: 48,
    justifyContent: 'center' as const,
    width: 48,
    backgroundColor: focused ? COLORS.terracotta : 'transparent',
  };

  // White icon on terracotta background when focused
  const iconColor = focused ? '#FFFFFF' : color;

  return (
    <View style={shellStyle}>
      <IconSymbol name={name} size={size} color={iconColor} />
    </View>
  );
}
