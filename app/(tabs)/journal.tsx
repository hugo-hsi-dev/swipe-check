import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Avatar, Button, Card, Chip, ListGroup, Skeleton } from 'heroui-native';

import {
  useCurrentDayCompletedSession,
  useJournalHistory,
} from '@/hooks/use-journal-data';

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

function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export default function JournalScreen() {
  const { entries, isLoading, error } = useJournalHistory(50);
  const {
    entry: currentDayEntry,
    isCurrentDay: isDayComplete,
    isLoading: isCurrentDayLoading,
  } = useCurrentDayCompletedSession();

  const filteredEntries = entries.filter((entry) => {
    if (!isDayComplete || !currentDayEntry) return true;
    return entry.session.id !== currentDayEntry.session.id;
  });

  const handleEntryPress = (sessionId: string) => {
    router.push(`/journal/${sessionId}`);
  };

  if (isLoading || isCurrentDayLoading) {
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

      {isDayComplete && currentDayEntry && (
        <View className="gap-3">
          <Card className="border-accent-soft">
            <Card.Body className="gap-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="star" size={16} color="currentColor" />
                <Card.Title className="text-base">Today</Card.Title>
              </View>
              <Button
                variant="soft"
                color="accent"
                onPress={() => handleEntryPress(currentDayEntry.session.id)}>
                <View className="flex-row items-center gap-3">
                  <Avatar
                    size="sm"
                    variant="soft"
                    color="accent">
                    <Avatar.Fallback>
                      {currentDayEntry.snapshot?.currentType ??
                        (currentDayEntry.session.type === 'onboarding' ? 'ON' : 'DY')}
                    </Avatar.Fallback>
                  </Avatar>
                  <View className="flex-1">
                    <View className="font-semibold text-foreground-primary">
                      {currentDayEntry.snapshot?.currentType ?? 'Unknown'}
                    </View>
                    <View className="text-sm text-foreground-secondary">
                      {currentDayEntry.session.completedAt
                        ? formatTime(currentDayEntry.session.completedAt)
                        : ''}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="currentColor" />
                </View>
              </Button>
            </Card.Body>
          </Card>
        </View>
      )}

      {filteredEntries.length > 0 && (
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <View className="h-px flex-1 bg-surface-tertiary" />
            <View className="text-sm text-foreground-secondary">Past Check-ins</View>
            <View className="h-px flex-1 bg-surface-tertiary" />
          </View>
          <ListGroup>
            {filteredEntries.map((entry) => {
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
                      <Chip
                        size="sm"
                        variant="soft"
                        color={session.type === 'onboarding' ? 'accent' : 'success'}>
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
        </View>
      )}
    </ScrollView>
  );
}
