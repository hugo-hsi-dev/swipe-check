// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

export type IconSymbolName =
  | 'book.fill'
  | 'calendar'
  | 'chart.bar.fill'
  | 'checkmark.circle.fill'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right'
  | 'clock.fill'
  | 'ellipsis.circle.fill'
  | 'gearshape.fill'
  | 'house.fill'
  | 'paperplane.fill';

type IconMapping = Record<IconSymbolName, ComponentProps<typeof MaterialIcons>['name']>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'book.fill': 'book',
  'calendar': 'calendar-today',
  'chart.bar.fill': 'bar-chart',
  'checkmark.circle.fill': 'check-circle',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'clock.fill': 'history',
  'ellipsis.circle.fill': 'more-horiz',
  'gearshape.fill': 'settings',
  'house.fill': 'home',
  'paperplane.fill': 'send',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  color,
  name,
  size = 24,
  style,
}: {
  color: OpaqueColorValue | string;
  name: IconSymbolName;
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  return <MaterialIcons color={color} name={MAPPING[name]} size={size} style={style} />;
}
