import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Avatar, Card, Chip, Skeleton, Separator } from 'heroui-native';

import { useJournalEntryDetail } from '@/hooks/use-journal-data';
import type { PersistedSessionAnswer } from '@/lib/local-data/session-lifecycle';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
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

function getAnswerIcon(answer: PersistedSessionAnswer['answer']): { name: string; color: string } {
  return answer === 'agree'
    ? { name: 'checkmark-circle', color: 'success' }
    : { name: 'close-circle', color: 'danger' };
}

export default function JournalEntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { detail, isLoading, error } = useJournalEntryDetail(id ?? null);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Entry Detail' }} />
        <ScrollView
          className="flex-1 bg-background"
          contentContainerStyle={{ gap: 16, padding: 16, paddingTop: 24, paddingBottom: 24 }}>
          <Card>
            <Card.Body className="gap-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </Card.Body>
          </Card>
          <View className="gap-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <Card.Body className="gap-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </Card.Body>
              </Card>
            ))}
          </View>
        </ScrollView>
      </>
    );
  }

  if (error || !detail) {
    return (
      <>
        <Stack.Screen options={{ title: 'Entry Detail' }} />
        <ScrollView
          className="flex-1 bg-background"
          contentContainerStyle={{ gap: 16, padding: 16, paddingTop: 24, paddingBottom: 24 }}>
          <Card>
            <Card.Body className="gap-2">
              <Card.Title className="text-danger">Error loading entry</Card.Title>
              <Card.Description>
                {error?.message ?? 'Entry not found. It may have been deleted.'}
              </Card.Description>
            </Card.Body>
          </Card>
        </ScrollView>
      </>
    );
  }

  const { session, answers, snapshot } = detail;
  const completedAt = session.completedAt;

  return (
    <>
      <Stack.Screen
        options={{
          title: completedAt ? formatDate(completedAt) : 'Entry Detail',
        }}
      />
<ScrollView
          className="flex-1 bg-background"
          contentContainerStyle={{ gap: 16, padding: 16, paddingTop: 24, paddingBottom: 24 }}>
        {/* Header Card */}
        <Card>
          <Card.Body className="gap-4">
            <View className="flex-row items-center gap-4">
              <Avatar
                alt={getEntryTypeLabel(session.type)}
                color={session.type === 'onboarding' ? 'accent' : 'success'}
                size="lg"
                variant="soft">
                <Avatar.Fallback>
                  {snapshot?.currentType ?? (session.type === 'onboarding' ? 'ON' : 'DY')}
                </Avatar.Fallback>
              </Avatar>
              <View className="flex-1 gap-1">
                <Card.Title>
                  {getEntryTypeLabel(session.type)}
                </Card.Title>
                {completedAt && (
                  <Card.Description>
                    Completed at {formatTime(completedAt)}
                  </Card.Description>
                )}
                {session.localDayKey && (
                  <Chip size="sm" variant="secondary">
                    <Chip.Label>{session.localDayKey}</Chip.Label>
                  </Chip>
                )}
              </View>
            </View>

            {snapshot && (
              <>
                <Separator />
                <View className="gap-2">
                  <Card.Description>Type Snapshot</Card.Description>
                  <View className="flex-row flex-wrap gap-2">
                    <Chip color="accent" variant="soft">
                      <Chip.Label>{snapshot.currentType}</Chip.Label>
                    </Chip>
                    <Chip variant="secondary">
                      <Chip.Label>{snapshot.questionCount} questions</Chip.Label>
                    </Chip>
                  </View>
                </View>
              </>
            )}
          </Card.Body>
        </Card>

        {/* Answers Section */}
        {answers.length > 0 && (
          <Card>
            <Card.Header>
              <Card.Title>Responses</Card.Title>
              <Card.Description>
                {answers.length} question{answers.length !== 1 ? 's' : ''} answered
              </Card.Description>
            </Card.Header>
            <Card.Body className="gap-0">
              {answers.map((answer, index) => {
                const icon = getAnswerIcon(answer.answer);
                const isLast = index === answers.length - 1;

                return (
                  <View key={answer.questionId}>
                    <View className="flex-row items-start gap-3 py-3">
                      <View className="mt-0.5">
                        <Ionicons
                          name={icon.name as any}
                          size={20}
                          color={icon.color}
                        />
                      </View>
                      <View className="flex-1 gap-1">
                        <Card.Title className="text-sm font-normal leading-5">
                          {answer.questionText}
                        </Card.Title>
                        <Card.Description className="text-xs capitalize">
                          {answer.answer} · {formatTime(answer.answeredAt)}
                        </Card.Description>
                      </View>
                    </View>
                    {!isLast && <Separator />}
                  </View>
                );
              })}
            </Card.Body>
          </Card>
        )}

        {/* Empty State */}
        {answers.length === 0 && (
          <Card>
            <Card.Body className="items-center gap-3 py-8">
              <View className="size-12 items-center justify-center rounded-full bg-surface-secondary">
                <Ionicons name="help-circle-outline" size={24} color="currentColor" />
              </View>
              <Card.Description className="text-center">
                No responses recorded for this session.
              </Card.Description>
            </Card.Body>
          </Card>
        )}
      </ScrollView>
    </>
  );
}
