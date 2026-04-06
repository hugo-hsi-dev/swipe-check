import { Ionicons } from '@expo/vector-icons';
import { Text, View, Pressable } from 'react-native';

import { Badge, BadgeLabel } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/icon-container';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

interface JournalListItemProps {
  id: string;
  title: string;
  subtitle: string;
  type: 'onboarding' | 'daily';
  typeLabel: string;
  avatarText: string;
  onPress: (id: string) => void;
}

export function JournalListItem({
  id,
  title,
  subtitle,
  type,
  typeLabel,
  avatarText,
  onPress,
}: JournalListItemProps) {
  return (
    <Pressable
      onPress={() => onPress(id)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        gap: SPACING.md,
        backgroundColor: COLORS.warmWhite,
        borderRadius: RADIUS.lg,
        opacity: pressed ? 0.7 : 1,
      })}>
      <Avatar size="md" variant={type === 'onboarding' ? 'terracotta' : 'sage'}>
        <Text
          style={{
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.semibold,
            color: type === 'onboarding' ? COLORS.terracotta : COLORS.sage,
          }}>
          {avatarText}
        </Text>
      </Avatar>

      <View style={{ flex: 1, gap: SPACING.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
          <Text
            style={{
              fontSize: FONT_SIZES.base,
              fontWeight: FONT_WEIGHTS.medium,
              color: COLORS.softBrown,
            }}>
            {title}
          </Text>
          <Badge variant={type === 'onboarding' ? 'terracotta' : 'sage'} size="sm">
            <BadgeLabel>{typeLabel}</BadgeLabel>
          </Badge>
        </View>
        <Text
          style={{
            fontSize: FONT_SIZES.sm,
            color: COLORS.warmGray,
          }}>
          {subtitle}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={COLORS.warmGray} />
    </Pressable>
  );
}
