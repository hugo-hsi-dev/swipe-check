import { Ionicons } from '@expo/vector-icons';
import { ScrollView, View } from 'react-native';
import { Card, Chip } from 'heroui-native';

export default function InsightsScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ gap: 16, padding: 16, paddingTop: 24, paddingBottom: 24 }}>
      <Card>
        <Card.Body className="gap-2">
          <Card.Title>Insights</Card.Title>
          <Card.Description>
            Analytics and patterns from your activity and journal entries.
          </Card.Description>
        </Card.Body>
      </Card>

      <Card className="gap-4">
        <Card.Body className="gap-4">
          <View className="flex-row items-center gap-3">
            <View className="size-12 items-center justify-center rounded-full bg-success-soft">
              <Ionicons name="trending-up" size={24} color="#22c55e" />
            </View>
            <View className="shrink">
              <Card.Title className="text-base">Streak</Card.Title>
              <Card.Description>
                12 days of consistent journaling
              </Card.Description>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="size-12 items-center justify-center rounded-full bg-accent-soft">
              <Ionicons name="create-outline" size={24} />
            </View>
            <View className="shrink">
              <Card.Title className="text-base">Total Entries</Card.Title>
              <Card.Description>
                48 journal entries this month
              </Card.Description>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="size-12 items-center justify-center rounded-full bg-warning-soft">
              <Ionicons name="time-outline" size={24} color="#f59e0b" />
            </View>
            <View className="shrink">
              <Card.Title className="text-base">Avg. Time</Card.Title>
              <Card.Description>
                5 minutes per entry
              </Card.Description>
            </View>
          </View>
        </Card.Body>
      </Card>

      <Card className="gap-4">
        <Card.Body className="gap-3">
          <Card.Title>Mood Trends</Card.Title>
          <View className="flex-row flex-wrap gap-2">
            <Chip variant="soft" color="success">
              Happy
            </Chip>
            <Chip variant="soft" color="accent">
              Calm
            </Chip>
            <Chip variant="soft" color="warning">
              Stressed
            </Chip>
            <Chip variant="soft" color="danger">
              Tired
            </Chip>
            <Chip variant="soft">
              Neutral
            </Chip>
          </View>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="gap-2">
          <Card.Title>Weekly Summary</Card.Title>
          <Card.Description>
            Your journaling has been consistent this week. You've written about work, personal growth, and gratitude most frequently.
          </Card.Description>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
