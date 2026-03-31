import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card } from 'heroui-native';

import { clearSQLiteData } from '@/lib/local-data/sqlite';

export default function ResetDataScreen() {
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
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        gap: 24,
      }}>
      <View className="items-center gap-4">
        <View className="size-20 items-center justify-center rounded-full bg-danger-soft">
          <Ionicons name="warning-outline" size={40} color="#ef4444" />
        </View>
        <Text className="text-2xl font-semibold text-center">Reset All Data</Text>
        <Text className="text-text-secondary text-center">
          This will permanently delete all your data, including your personality profile and journal
          history. This action cannot be undone.
        </Text>
      </View>

      <Card>
        <Card.Body className="gap-4">
          <Button variant="danger" onPress={handleResetData}>
            <Ionicons name="trash-outline" size={18} />
            <Button.Label>Yes, Delete All Data</Button.Label>
          </Button>

          <Button variant="secondary" onPress={() => router.back()}>
            <Button.Label>Cancel</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
