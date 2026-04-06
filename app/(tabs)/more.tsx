import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { ScrollView, Text, View, Pressable } from 'react-native';

import { Button, ButtonIcon, ButtonLabel } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';
import { NAV_VARIANTS, type NavVariantName } from '@/constants/nav-variants';
import { useNavVariant } from '@/contexts/NavVariantContext';

function VariantOption({
  variantKey,
  isActive,
  onPress,
}: {
  variantKey: NavVariantName;
  isActive: boolean;
  onPress: () => void;
}) {
  const variant = NAV_VARIANTS[variantKey];

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          backgroundColor: isActive ? COLORS.terracottaLight : COLORS.warmWhite,
          borderRadius: RADIUS.lg,
          padding: SPACING.lg,
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? COLORS.terracotta : COLORS.borderLight,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: FONT_SIZES.base,
                fontWeight: FONT_WEIGHTS.semibold,
                color: isActive ? COLORS.terracotta : COLORS.softBrown,
              }}>
              {variant.name}
            </Text>
            <Text
              style={{
                fontSize: FONT_SIZES.sm,
                color: COLORS.warmGray,
                marginTop: 2,
              }}>
              {variant.description}
            </Text>
          </View>
          {isActive && (
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: COLORS.terracotta,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name="checkmark" size={16} color={COLORS.warmWhite} />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function MoreScreen() {
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ??
    (Constants.expoConfig?.android?.versionCode != null
      ? String(Constants.expoConfig.android.versionCode)
      : 'Unknown');
  const { activeVariant, setVariant } = useNavVariant();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.cream }}
      contentContainerStyle={{
        gap: SPACING.lg,
        padding: SPACING.xl,
        paddingTop: SPACING['3xl'],
        paddingBottom: SPACING['2xl'],
      }}>
      <Card>
        <CardBody gap="sm">
          <Text
            style={{
              fontSize: FONT_SIZES['2xl'],
              fontWeight: FONT_WEIGHTS.bold,
              color: COLORS.softBrown,
            }}>
            More
          </Text>
          <Text
            style={{
              fontSize: FONT_SIZES.base,
              color: COLORS.warmGray,
              lineHeight: FONT_SIZES.base * 1.5,
            }}>
            App information and additional features
          </Text>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Text
            style={{
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.softBrown,
            }}>
            Secondary Screens
          </Text>
        </CardHeader>
        <CardBody gap="sm">
          <Button variant="secondary" onPress={() => router.push('/journal')} style={{ alignSelf: 'stretch' }}>
            <ButtonIcon>
              <Ionicons name="book" size={20} color={COLORS.terracotta} />
            </ButtonIcon>
            <ButtonLabel variant="secondary">Journal</ButtonLabel>
          </Button>
          <Text
            style={{
              fontSize: FONT_SIZES.sm,
              color: COLORS.warmGray,
              lineHeight: FONT_SIZES.sm * 1.5,
            }}>
            View your history and past entries
          </Text>

          <Button variant="secondary" onPress={() => router.push('/settings')} style={{ alignSelf: 'stretch' }}>
            <ButtonIcon>
              <Ionicons name="settings" size={20} color={COLORS.terracotta} />
            </ButtonIcon>
            <ButtonLabel variant="secondary">Settings</ButtonLabel>
          </Button>
          <Text
            style={{
              fontSize: FONT_SIZES.sm,
              color: COLORS.warmGray,
              lineHeight: FONT_SIZES.sm * 1.5,
            }}>
            App information and local data controls
          </Text>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Text
            style={{
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.softBrown,
            }}>
            Navigation Design
          </Text>
        </CardHeader>
        <CardBody gap="sm">
          <Text
            style={{
              fontSize: FONT_SIZES.sm,
              color: COLORS.warmGray,
              marginBottom: SPACING.xs,
            }}>
            Select a navigation bar style to preview
          </Text>
          <View style={{ gap: SPACING.sm }}>
            {(['A', 'B', 'C'] as NavVariantName[]).map((key) => (
              <VariantOption
                key={key}
                variantKey={key}
                isActive={activeVariant === key}
                onPress={() => setVariant(key)}
              />
            ))}
          </View>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Text
            style={{
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.softBrown,
            }}>
            About
          </Text>
        </CardHeader>
        <CardBody gap="sm">
          <Text
            style={{
              fontSize: FONT_SIZES.base,
              color: COLORS.warmGray,
              lineHeight: FONT_SIZES.base * 1.5,
            }}>
            Swipe Check
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.warmGray }}>Version</Text>
            <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.softBrown }}>
              {Constants.expoConfig?.version ?? 'Unknown'}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.warmGray }}>Build</Text>
            <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.softBrown }}>{buildNumber}</Text>
          </View>
        </CardBody>
      </Card>
    </ScrollView>
  );
}