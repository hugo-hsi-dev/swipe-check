import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, Description } from 'heroui-native';

import { clearSQLiteData } from '@/lib/local-data/sqlite';

export default function SettingsScreen() {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);

  async function handleResetData() {
    try {
      await clearSQLiteData();
      router.replace('/onboarding');
    } catch (error) {
      console.error('Failed to reset data:', error);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        gap: 16,
        padding: 16,
        paddingTop: 24,
        paddingBottom: 24,
      }}
    >
      <Card>
        <Card.Body className="gap-3">
          <Card.Title className="text-xl">Settings</Card.Title>
          <Card.Description>
            App information and local data controls
          </Card.Description>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="gap-3">
          <Card.Title>About</Card.Title>
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Description>Version</Description>
              <Description>1.0.0</Description>
            </View>
            <View className="flex-row items-center justify-between">
              <Description>Build</Description>
              <Description>100</Description>
            </View>
          </View>
        </Card.Body>
      </Card>

      <Card className="bg-danger-soft">
        <Card.Body className="gap-4">
          {!showDeleteConfirmation ? (
            <>
              <Card.Title className="text-destructive">Clear Local Data</Card.Title>
              <Description>
                This will permanently delete all your data, including your personality profile and
                journal history. This action cannot be undone.
              </Description>
              <Button variant="danger" onPress={() => setShowDeleteConfirmation(true)}>
                <Ionicons name="trash-outline" size={18} />
                <Button.Label>Delete All Data</Button.Label>
              </Button>
            </>
          ) : (
            <>
              <View className="items-center gap-3 pb-2">
                <View className="size-16 items-center justify-center rounded-full bg-surface-secondary">
                  <Ionicons name="warning-outline" size={28} color="#ef4444" />
                </View>
                <Text className="text-lg font-semibold text-center text-destructive">
                  Are you sure?
                </Text>
                <Text className="text-sm text-text-secondary text-center">
                  This will permanently delete all your local data. The app will return to its
                  first-launch state.
                </Text>
              </View>
              <Button variant="danger" onPress={handleResetData}>
                <Ionicons name="trash-outline" size={18} />
                <Button.Label>Yes, Delete All Data</Button.Label>
              </Button>
              <Button variant="secondary" onPress={() => setShowDeleteConfirmation(false)}>
                <Button.Label>Cancel</Button.Label>
              </Button>
            </>
          )}
        </Card.Body>
      </Card>

      <Button variant="secondary" onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={16} />
        <Button.Label>Go Back</Button.Label>
      </Button>
    </ScrollView>
  );
}