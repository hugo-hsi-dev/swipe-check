import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip } from 'heroui-native';

import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';
import { readCompletedSessionDetail, type PersistedSessionDetail } from '@/lib/local-data/session-lifecycle';
import { AXES } from '@/constants/questions';

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<PersistedSessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEntry() {
      if (!id) return;

      try {
        const db = await getSQLiteDatabase();
        const detail = await readCompletedSessionDetail(db, id);
        setEntry(detail);
      } catch (error) {
        console.error('Failed to load entry:', error);
      } finally {
        setIsLoading(false);
      }
    }

    void loadEntry();
  }, [id]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!entry) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <View className="size-16 items-center justify-center rounded-full bg-surface-secondary mb-4">
          <Ionicons name="alert-circle-outline" size={28} />
        </View>
        <Text className="text-lg font-medium mb-2">Entry Not Found</Text>
        <Text className="text-text-secondary text-center mb-6">
          The journal entry you are looking for could not be found.
        </Text>
        <Button onPress={() => router.back()}>
          <Button.Label>Go Back</Button.Label>
        </Button>
      </View>
    );
  }

  const sessionDate = entry.session.completedAt
    ? new Date(entry.session.completedAt)
    : new Date(entry.session.startedAt);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        padding: 16,
        paddingTop: 24,
        paddingBottom: 24,
        gap: 16,
      }}>
      <View className="flex-row items-center gap-2">
        <Button variant="tertiary" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} />
          <Button.Label>Back</Button.Label>
        </Button>
      </View>

      <Card>
        <Card.Header>
          <View className="flex-row items-center justify-between">
            <View>
              <Card.Title className="text-xl">
                {entry.session.type === 'onboarding' ? 'Onboarding' : 'Daily Session'}
              </Card.Title>
              <Card.Description>{sessionDate.toLocaleDateString()}</Card.Description>
            </View>
            {entry.snapshot && (
              <Chip color="accent" variant="soft" size="lg">
                <Chip.Label>{entry.snapshot.currentType}</Chip.Label>
              </Chip>
            )}
          </View>
        </Card.Header>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Session Details</Card.Title>
        </Card.Header>
        <Card.Body className="gap-3">
          <View className="flex-row justify-between">
            <Text className="text-text-secondary">Date</Text>
            <Text>{sessionDate.toLocaleDateString()}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-text-secondary">Time</Text>
            <Text>{sessionDate.toLocaleTimeString()}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-text-secondary">Questions Answered</Text>
            <Text>{entry.answers.length}</Text>
          </View>
          {entry.snapshot && (
            <View className="flex-row justify-between">
              <Text className="text-text-secondary">Personality Type</Text>
              <Text>{entry.snapshot.currentType}</Text>
            </View>
          )}
        </Card.Body>
      </Card>

      {entry.snapshot && entry.snapshot.axisStrengths.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Axis Breakdown</Card.Title>
          </Card.Header>
          <Card.Body className="gap-4">
            {entry.snapshot.axisStrengths.map((strength) => {
              const axis = AXES.find((a) => a.id === strength.axisId);
              if (!axis) return null;

              return (
                <View key={strength.axisId} className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm font-medium">{axis.poleA.label}</Text>
                    <Text className="text-sm font-medium">{axis.poleB.label}</Text>
                  </View>
                  <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
                    <View
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${50 + strength.strength * 50}%`,
                      }}
                    />
                  </View>
                  <Text className="text-xs text-text-secondary">
                    {strength.dominantPoleId
                      ? `${strength.dominantPoleId.toUpperCase()} dominant`
                      : 'Balanced'}
                  </Text>
                </View>
              );
            })}
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Header>
          <Card.Title>Answers</Card.Title>
        </Card.Header>
        <Card.Body className="gap-3">
          {entry.answers.length === 0 ? (
            <Text className="text-text-secondary">No answers recorded for this session.</Text>
          ) : (
            entry.answers.map((answer, index) => (
              <View key={answer.questionId} className="flex-row justify-between py-2">
                <Text className="text-text-secondary">Question {index + 1}</Text>
                <Chip
                  variant="soft"
                  color={answer.answer === 'agree' ? 'success' : 'warning'}
                  size="sm">
                  <Chip.Label>{answer.answer === 'agree' ? 'Agree' : 'Disagree'}</Chip.Label>
                </Chip>
              </View>
            ))
          )}
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
