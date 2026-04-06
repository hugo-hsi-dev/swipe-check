import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button, ButtonLabel } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';
import { clearSQLiteData } from '@/lib/local-data/sqlite';

export default function SettingsScreen() {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);
  const [isWiping, setIsWiping] = React.useState(false);
  const [wipeError, setWipeError] = React.useState<null | string>(null);
  const isMounted = React.useRef(true);

  React.useEffect(
    () => () => {
      isMounted.current = false;
    },
    []
  );

  async function handleResetData() {
    setIsWiping(true);
    setWipeError(null);

    try {
      await clearSQLiteData();
      if (isMounted.current) {
        router.replace('/onboarding');
      }
    } catch (error: unknown) {
      if (isMounted.current) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setWipeError(message);
        setIsWiping(false);
      }
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{
        gap: SPACING.lg,
        padding: SPACING.xl,
        paddingBottom: SPACING['2xl'],
        paddingTop: SPACING['3xl'],
      }}
      style={{ backgroundColor: COLORS.cream, flex: 1 }}>
      <Card>
        <CardBody gap="sm">
          <Text
            style={{
              color: COLORS.softBrown,
              fontSize: FONT_SIZES['2xl'],
              fontWeight: FONT_WEIGHTS.bold,
            }}>
            Settings
          </Text>
          <Text
            style={{
              color: COLORS.warmGray,
              fontSize: FONT_SIZES.base,
              lineHeight: FONT_SIZES.base * 1.5,
            }}>
            App information and local data controls
          </Text>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Text
            style={{
              color: COLORS.softBrown,
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
            }}>
            About
          </Text>
        </CardHeader>
        <CardBody gap="sm">
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.base }}>Version</Text>
            <Text style={{ color: COLORS.softBrown, fontSize: FONT_SIZES.base }}>
              {Constants.expoConfig?.version ?? 'Unknown'}
            </Text>
          </View>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.base }}>Build</Text>
            <Text style={{ color: COLORS.softBrown, fontSize: FONT_SIZES.base }}>100</Text>
          </View>
        </CardBody>
      </Card>

      <Card variant="default">
        <CardBody gap="lg">
          {!showDeleteConfirmation ? (
            <>
              <View>
                <Text
                  style={{
                    color: COLORS.danger,
                    fontSize: FONT_SIZES.xl,
                    fontWeight: FONT_WEIGHTS.semibold,
                  }}>
                  Clear Local Data
                </Text>
                <Text
                  style={{
                    color: COLORS.warmGray,
                    fontSize: FONT_SIZES.base,
                    lineHeight: FONT_SIZES.base * 1.5,
                    marginTop: SPACING.sm,
                  }}>
                  This will permanently delete all your data, including your personality profile and
                  journal history. This action cannot be undone.
                </Text>
              </View>
              <Button onPress={() => setShowDeleteConfirmation(true)} variant="danger">
                <Ionicons color="#FFFFFF" name="trash-outline" size={18} />
                <ButtonLabel variant="danger">Delete All Data</ButtonLabel>
              </Button>
            </>
          ) : (
            <>
              <View style={{ alignItems: 'center', gap: SPACING.md, paddingBottom: SPACING.sm }}>
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: COLORS.cream,
                    borderRadius: 9999,
                    height: 64,
                    justifyContent: 'center',
                    width: 64,
                  }}>
                  <Ionicons color={COLORS.danger} name="warning-outline" size={28} />
                </View>
                <Text
                  style={{
                    color: COLORS.danger,
                    fontSize: FONT_SIZES.lg,
                    fontWeight: FONT_WEIGHTS.semibold,
                    textAlign: 'center',
                  }}>
                  Are you sure?
                </Text>
                <Text
                  style={{
                    color: COLORS.warmGray,
                    fontSize: FONT_SIZES.sm,
                    lineHeight: FONT_SIZES.sm * 1.5,
                    textAlign: 'center',
                  }}>
                  This will permanently delete all your local data. The app will return to its
                  first-launch state.
                </Text>
                {wipeError && (
                  <Text
                    style={{
                      color: COLORS.danger,
                      fontSize: FONT_SIZES.sm,
                      textAlign: 'center',
                    }}>
                    Failed to delete data: {wipeError}
                  </Text>
                )}
              </View>
              <Button isDisabled={isWiping} onPress={handleResetData} variant="danger">
                <Ionicons color="#FFFFFF" name="trash-outline" size={18} />
                <ButtonLabel variant="danger">
                  {isWiping ? 'Deleting...' : 'Yes, Delete All Data'}
                </ButtonLabel>
              </Button>
              <Button
                isDisabled={isWiping}
                onPress={() => {
                  setShowDeleteConfirmation(false);
                  setWipeError(null);
                }}
                variant="secondary">
                <ButtonLabel variant="secondary">Cancel</ButtonLabel>
              </Button>
            </>
          )}
        </CardBody>
      </Card>

      <Button isDisabled={isWiping} onPress={() => router.back()} variant="secondary">
        <Ionicons color={COLORS.terracotta} name="arrow-back" size={16} />
        <ButtonLabel variant="secondary">Go Back</ButtonLabel>
      </Button>
    </ScrollView>
  );
}
