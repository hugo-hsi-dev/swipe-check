import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import Constants from 'expo-constants';

import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button, ButtonLabel } from '@/components/ui/button';
import { clearSQLiteData } from '@/lib/local-data/sqlite';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

export default function SettingsScreen() {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);
  const [isWiping, setIsWiping] = React.useState(false);
  const [wipeError, setWipeError] = React.useState<string | null>(null);
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
            Settings
          </Text>
          <Text
            style={{
              fontSize: FONT_SIZES.base,
              color: COLORS.warmGray,
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
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.softBrown,
            }}>
            About
          </Text>
        </CardHeader>
        <CardBody gap="sm">
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
            <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.softBrown }}>100</Text>
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
                    fontSize: FONT_SIZES.xl,
                    fontWeight: FONT_WEIGHTS.semibold,
                    color: COLORS.danger,
                  }}>
                  Clear Local Data
                </Text>
                <Text
                  style={{
                    fontSize: FONT_SIZES.base,
                    color: COLORS.warmGray,
                    lineHeight: FONT_SIZES.base * 1.5,
                    marginTop: SPACING.sm,
                  }}>
                  This will permanently delete all your data, including your personality profile and
                  journal history. This action cannot be undone.
                </Text>
              </View>
              <Button variant="danger" onPress={() => setShowDeleteConfirmation(true)}>
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                <ButtonLabel variant="danger">Delete All Data</ButtonLabel>
              </Button>
            </>
          ) : (
            <>
              <View style={{ alignItems: 'center', gap: SPACING.md, paddingBottom: SPACING.sm }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    backgroundColor: COLORS.cream,
                    borderRadius: 9999,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Ionicons name="warning-outline" size={28} color={COLORS.danger} />
                </View>
                <Text
                  style={{
                    fontSize: FONT_SIZES.lg,
                    fontWeight: FONT_WEIGHTS.semibold,
                    textAlign: 'center',
                    color: COLORS.danger,
                  }}>
                  Are you sure?
                </Text>
                <Text
                  style={{
                    fontSize: FONT_SIZES.sm,
                    color: COLORS.warmGray,
                    textAlign: 'center',
                    lineHeight: FONT_SIZES.sm * 1.5,
                  }}>
                  This will permanently delete all your local data. The app will return to its
                  first-launch state.
                </Text>
                {wipeError && (
                  <Text
                    style={{
                      fontSize: FONT_SIZES.sm,
                      color: COLORS.danger,
                      textAlign: 'center',
                    }}>
                    Failed to delete data: {wipeError}
                  </Text>
                )}
              </View>
              <Button variant="danger" onPress={handleResetData} isDisabled={isWiping}>
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                <ButtonLabel variant="danger">
                  {isWiping ? 'Deleting...' : 'Yes, Delete All Data'}
                </ButtonLabel>
              </Button>
              <Button
                variant="secondary"
                onPress={() => {
                  setShowDeleteConfirmation(false);
                  setWipeError(null);
                }}
                isDisabled={isWiping}>
                <ButtonLabel variant="secondary">Cancel</ButtonLabel>
              </Button>
            </>
          )}
        </CardBody>
      </Card>

      <Button variant="secondary" onPress={() => router.back()} isDisabled={isWiping}>
        <Ionicons name="arrow-back" size={16} color={COLORS.terracotta} />
        <ButtonLabel variant="secondary">Go Back</ButtonLabel>
      </Button>
    </ScrollView>
  );
}
