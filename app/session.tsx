import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card } from 'heroui-native';

export default function SessionScreen() {
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
        <View className="size-20 items-center justify-center rounded-full bg-accent-soft">
          <Ionicons name="checkbox-outline" size={40} />
        </View>
        <Text className="text-2xl font-semibold text-center">Session Screen</Text>
        <Text className="text-text-secondary text-center">
          This is a placeholder for the daily question session.
        </Text>
      </View>

      <Card>
        <Card.Body className="gap-4">
          <Button onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} />
            <Button.Label>Go Back</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
