import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { Card } from 'heroui-native';

import { useInsightsData } from '@/hooks/use-insights-data';
import { AXES } from '@/constants/questions';

export default function InsightsScreen() {
  const state = useInsightsData();

  if (state.status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          padding: 16,
          paddingTop: 24,
          paddingBottom: 24,
          gap: 16,
        }}
      >
        <Card>
          <Card.Header>
            <Card.Title className="text-xl">Insights</Card.Title>
          </Card.Header>
        </Card>

        <Card className="bg-danger-soft">
          <Card.Body className="items-center gap-4 py-12">
            <View className="size-16 items-center justify-center rounded-full bg-surface-secondary">
              <Ionicons name="alert-circle-outline" size={28} />
            </View>
            <Text className="text-center text-text-secondary">
              Failed to load insights. Please try again later.
            </Text>
          </Card.Body>
        </Card>
      </ScrollView>
    );
  }

  if (state.status === 'empty') {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          padding: 16,
          paddingTop: 24,
          paddingBottom: 24,
          gap: 16,
        }}
      >
        <Card>
          <Card.Header>
            <Card.Title className="text-xl">Insights</Card.Title>
          </Card.Header>
        </Card>

        <Card>
          <Card.Body className="items-center gap-4 py-12">
            <View className="size-16 items-center justify-center rounded-full bg-surface-secondary">
              <Ionicons name="analytics-outline" size={28} />
            </View>
            <Text className="text-center text-text-secondary">
              Complete onboarding to see your personality insights.
            </Text>
          </Card.Body>
        </Card>
      </ScrollView>
    );
  }

  const currentType = state.latestType;
  const snapshot = state.latestSnapshot;

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
          <Card.Title className="text-xl">Insights</Card.Title>
        </Card.Header>
      </Card>

      <Card className="bg-accent-soft">
        <Card.Body className="items-center gap-4 py-8">
          <Text className="text-4xl font-bold">{currentType ?? '???'}</Text>
          <Text className="text-text-secondary">Your personality type</Text>
        </Card.Body>
      </Card>

      {snapshot?.axisStrengths.map((strength) => {
        const axis = AXES.find((a) => a.id === strength.axisId);
        if (!axis) return null;

        const poleAName = axis.poleA.label;
        const poleBName = axis.poleB.label;
        const isPoleADominant = strength.strength < 0;
        const dominancePercent = Math.round(Math.abs(strength.strength) * 100);

        return (
          <Card key={strength.axisId}>
            <Card.Body className="gap-3">
              <View className="flex-row justify-between">
                <Text className="font-medium">{poleAName}</Text>
                <Text className="font-medium">{poleBName}</Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
                <View
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: `${50 + (strength.strength * 50)}%`,
                  }}
                />
              </View>
              <Text className="text-center text-sm text-text-secondary">
                {isPoleADominant ? poleAName : poleBName} ({dominancePercent}%)
              </Text>
            </Card.Body>
          </Card>
        );
      })}
    </ScrollView>
  );
}