import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip } from 'heroui-native';

import { useCurrentTypeSnapshot } from '@/hooks/use-current-type-snapshot';
import { useDailySession } from '@/hooks/use-daily-session';

export default function TodayScreen() {
  const { todaysSession, startTodaysSession } = useDailySession();
  const { currentType, isLoading } = useCurrentTypeSnapshot();

  const hasCompletedToday = todaysSession?.status === 'completed';
  const hasStartedToday = todaysSession != null;

  function handleStartSession() {
    void startTodaysSession();
    router.push('/session');
  }

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
          <View className="flex-row items-center justify-between">
            <View>
              <Card.Title className="text-xl">Today</Card.Title>
              <Card.Description>{new Date().toLocaleDateString()}</Card.Description>
            </View>
            {currentType && (
              <Chip color="accent" variant="soft" size="lg">
                <Chip.Label>{currentType}</Chip.Label>
              </Chip>
            )}
          </View>
        </Card.Header>
      </Card>

      <Card className="bg-accent-soft">
        <Card.Body className="gap-4">
          <View className="flex-row items-center gap-3">
            <View className="size-12 items-center justify-center rounded-full bg-accent">
              <Ionicons name="checkmark-circle-outline" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold">
                {hasCompletedToday ? 'All caught up!' : 'Daily Check-in'}
              </Text>
              <Text className="text-text-secondary">
                {hasCompletedToday
                  ? 'You have completed today\'s session.'
                  : 'Take a moment to check in with yourself.'}
              </Text>
            </View>
          </View>

          {!hasCompletedToday && (
            <Button onPress={handleStartSession}>
              <Ionicons name="play-outline" size={18} />
              <Button.Label>{hasStartedToday ? 'Continue Session' : 'Start Session'}</Button.Label>
            </Button>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Recent Activity</Card.Title>
        </Card.Header>
        <Card.Body>
          <Text className="text-text-secondary">
            Your journal entries and insights will appear here.
          </Text>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
