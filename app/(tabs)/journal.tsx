import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Card } from 'heroui-native';

import { useCompletedSessions } from '@/hooks/use-completed-sessions';

export default function JournalScreen() {
  const { sessions, isLoading } = useCompletedSessions();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        padding: 16,
        paddingTop: 24,
        paddingBottom: 24,
        gap: 16,
      }}>
      <Card>
        <Card.Header>
          <Card.Title className="text-xl">Journal</Card.Title>
        </Card.Header>
      </Card>

      {sessions.length === 0 ? (
        <Card>
          <Card.Body className="items-center gap-4 py-12">
            <View className="size-16 items-center justify-center rounded-full bg-surface-secondary">
              <Ionicons name="journal-outline" size={28} />
            </View>
            <Text className="text-center text-text-secondary">
              No entries yet. Complete your first session to see it here.
            </Text>
          </Card.Body>
        </Card>
      ) : (
        sessions.map((entry) => (
          <TouchableOpacity
            key={entry.session.id}
            onPress={() => router.push(`/entry/${entry.session.id}`)}>
            <Card>
              <Card.Body className="flex-row items-center justify-between">
                <View>
                  <Text className="font-medium">
                    {new Date(entry.session.completedAt!).toLocaleDateString()}
                  </Text>
                  <Text className="text-text-secondary">
                    {entry.snapshot?.currentType ?? 'No type recorded'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} />
              </Card.Body>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}
