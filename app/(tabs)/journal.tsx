import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Avatar, Card, Chip, ListGroup, Skeleton } from 'heroui-native';

import { useJournalHistory } from '@/hooks/use-journal-data';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getEntryTypeLabel(type: string): string {
  return type === 'onboarding' ? 'Onboarding' : 'Daily Check-in';
}

export default function JournalScreen() {
  const { entries, isLoading, error } = useJournalHistory(50);

  const handleEntryPress = (sessionId: string) => {
    router.push(`/journal/${sessionId}`);
  };

  if (isLoading) {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ gap: 16, padding: 16, paddingTop: 24, paddingBottom: 24 }}>
        <Card>
          <Card.Body className="gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
          </Card.Body>
        </Card>
        <View className="gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Card.Body className="flex-row items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <View className="flex-1 gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </View>
              </Card.Body>
            </Card>
          ))}
        </View>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ gap: 16, padding: 16, paddingTop: 24, paddingBottom: 24 }}>
        <Card>
          <Card.Body className="gap-2">
            <Card.Title className="text-danger">Error loading journal</Card.Title>
            <Card.Description>{error.message}</Card.Description>
          </Card.Body>
        </Card>
      </ScrollView>
    );
  }

  if (entries.length === 0) {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ gap: 16, padding: 16, paddingTop: 24, paddingBottom: 24 }}>
        <Card>
          <Card.Body className="gap-4">
            <View className="items-center gap-4 py-8">
              <View className="size-16 items-center justify-center rounded-full bg-surface-secondary">
                <Ionicons name="journal-outline" size={28} color="currentColor" />
              </View>
              <View className="items-center gap-2">
                <Card.Title className="text-center">Your Journal is Empty</Card.Title>
                <Card.Description className="text-center">
                  Complete your first daily check-in to see it here.
                </Card.Description>
              </View>
            </View>
          </Card.Body>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ gap: 16, padding: 16, paddingTop: 24, paddingBottom: 24 }}>
      <Card>
        <Card.Body className="gap-2">
          <Card.Title>Journal</Card.Title>
          <Card.Description>
            Review your past check-ins and see how your type has evolved.
          </Card.Description>
        </Card.Body>
      </Card>

      <ListGroup>
        {entries.map((entry) => {
          const session = entry.session;
          const snapshot = entry.snapshot;
          const completedAt = session.completedAt;

          return (
            <ListGroup.Item
              key={session.id}
              onPress={() => handleEntryPress(session.id)}
              className="active:opacity-70">
              <ListGroup.ItemPrefix>
                <Avatar
                  alt={getEntryTypeLabel(session.type)}
                  color={session.type === 'onboarding' ? 'accent' : 'success'}
                  size="md"
                  variant="soft">
                  <Avatar.Fallback>
                    {snapshot?.currentType ?? (session.type === 'onboarding' ? 'ON' : 'DY')}
                  </Avatar.Fallback>
                </Avatar>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <View className="flex-row items-center gap-2">
                  <ListGroup.ItemTitle>
                    {completedAt ? formatDate(completedAt) : 'Unknown date'}
                  </ListGroup.ItemTitle>
                  <Chip size="sm" variant="soft" color={session.type === 'onboarding' ? 'accent' : 'success'}>
                    <Chip.Label>{getEntryTypeLabel(session.type)}</Chip.Label>
                  </Chip>
                </View>
                <ListGroup.ItemDescription>
                  {completedAt ? formatTime(completedAt) : ''}
                  {snapshot && ` · ${snapshot.currentType}`}
                </ListGroup.ItemDescription>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix>
                <Ionicons name="chevron-forward" size={18} color="currentColor" />
              </ListGroup.ItemSuffix>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </ScrollView>
  );
}
