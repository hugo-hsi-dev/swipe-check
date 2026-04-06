import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconSymbolName =
  | 'house.fill'
  | 'calendar'
  | 'checkmark.circle.fill'
  | 'chart.bar.fill'
  | 'clock.fill'
  | 'gearshape.fill'
  | 'book.fill'
  | 'paperplane.fill'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right'
  | 'ellipsis.circle.fill';

type IconMapping = Record<IconSymbolName, ComponentProps<typeof MaterialIcons>['name']>;

const MAPPING = {
  'house.fill': 'home',
  'calendar': 'calendar-today',
  'checkmark.circle.fill': 'check-circle',
  'chart.bar.fill': 'bar-chart',
  'clock.fill': 'history',
  'gearshape.fill': 'settings',
  'book.fill': 'book',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'ellipsis.circle.fill': 'more-horiz',
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
