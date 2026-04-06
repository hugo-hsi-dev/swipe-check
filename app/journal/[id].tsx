import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge, BadgeLabel } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/icon-container';
import { useJournalEntryDetail } from '@/hooks/use-journal-data';
import type { PersistedSessionAnswer } from '@/lib/local-data/session-lifecycle';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

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
  return type === 'onboarding' ? 'Baseline (Onboarding)' : 'Daily Check-in';
}

function getAnswerIconName(answer: PersistedSessionAnswer['answer']): string {
  return answer === 'agree' ? 'checkmark-circle' : 'close-circle';
}

export default function JournalEntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { detail, isLoading, error } = useJournalEntryDetail(id ?? null);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ScrollView
          style={{ flex: 1, backgroundColor: COLORS.cream }}
          contentContainerStyle={{
            gap: SPACING.lg,
            padding: SPACING.xl,
            paddingTop: SPACING['3xl'],
            paddingBottom: SPACING['2xl'],
          }}>
          <Card>
            <CardBody gap="md">
              <View
                style={{
                  width: 150,
                  height: 32,
                  backgroundColor: COLORS.sageLight,
                  borderRadius: 4,
                }}
              />
              <View
                style={{
                  width: 100,
                  height: 16,
                  backgroundColor: COLORS.sageLight,
                  borderRadius: 4,
                }}
              />
            </CardBody>
          </Card>
          <View style={{ gap: SPACING.md }}>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardBody gap="md">
                  <View
                    style={{
                      width: '100%',
                      height: 16,
                      backgroundColor: COLORS.sageLight,
                      borderRadius: 4,
                    }}
                  />
                  <View
                    style={{
                      width: 60,
                      height: 12,
                      backgroundColor: COLORS.sageLight,
                      borderRadius: 4,
                    }}
                  />
                </CardBody>
              </Card>
            ))}
          </View>
        </ScrollView>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: 'Error' }} />
        <ScrollView
          style={{ flex: 1, backgroundColor: COLORS.cream }}
          contentContainerStyle={{
            gap: SPACING.lg,
            padding: SPACING.xl,
            paddingTop: SPACING['3xl'],
            paddingBottom: SPACING['2xl'],
          }}>
          <Card>
            <CardBody gap="sm">
              <Text
                style={{
                  fontSize: FONT_SIZES.lg,
                  fontWeight: FONT_WEIGHTS.semibold,
                  color: COLORS.danger,
                }}>
                Unable to Load Entry
              </Text>
              <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.warmGray }}>
                {error.message ?? 'An unexpected error occurred while loading this entry.'}
              </Text>
            </CardBody>
          </Card>
        </ScrollView>
      </>
    );
  }

  if (!detail) {
    return (
      <>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <ScrollView
          style={{ flex: 1, backgroundColor: COLORS.cream }}
          contentContainerStyle={{
            gap: SPACING.lg,
            padding: SPACING.xl,
            paddingTop: SPACING['3xl'],
            paddingBottom: SPACING['2xl'],
          }}>
          <Card>
            <CardBody gap="sm">
              <Text
                style={{
                  fontSize: FONT_SIZES.lg,
                  fontWeight: FONT_WEIGHTS.semibold,
                  color: COLORS.danger,
                }}>
                Entry Not Found
              </Text>
              <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.warmGray }}>
                This entry may have been deleted or does not exist.
              </Text>
            </CardBody>
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
          title: completedAt ? formatDate(completedAt) : 'In Progress',
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.cream }}
        contentContainerStyle={{
          gap: SPACING.lg,
          padding: SPACING.xl,
          paddingTop: SPACING['3xl'],
          paddingBottom: SPACING['2xl'],
        }}>
        {/* Header Card */}
        <Card>
          <CardBody gap="lg">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.lg }}>
              <Avatar
                size="lg"
                variant={session.type === 'onboarding' ? 'terracotta' : 'sage'}>
                <Text
                  style={{
                    fontSize: FONT_SIZES.lg,
                    fontWeight: FONT_WEIGHTS.semibold,
                    color:
                      session.type === 'onboarding' ? COLORS.terracotta : COLORS.sage,
                  }}>
                  {snapshot?.currentType ?? (session.type === 'onboarding' ? 'ON' : 'DY')}
                </Text>
              </Avatar>
              <View style={{ flex: 1, gap: SPACING.xs }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                  <Text
                    style={{
                      fontSize: FONT_SIZES.lg,
                      fontWeight: FONT_WEIGHTS.semibold,
                      color: COLORS.softBrown,
                    }}>
                    {getEntryTypeLabel(session.type)}
                  </Text>
                  <Badge variant="default" size="sm">
                    <BadgeLabel>Read-Only</BadgeLabel>
                  </Badge>
                </View>
                {completedAt && (
                  <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.warmGray }}>
                    Completed at {formatTime(completedAt)}
                  </Text>
                )}
                {session.localDayKey && (
                  <Badge variant="default" size="sm">
                    <BadgeLabel>{session.localDayKey}</BadgeLabel>
                  </Badge>
                )}
              </View>
            </View>

            {snapshot && (
              <>
                <View style={{ height: 1, backgroundColor: COLORS.border }} />
                <View style={{ gap: SPACING.sm }}>
                  <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.warmGray }}>
                    Type Snapshot
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                    <Badge variant="sage" size="sm">
                      <BadgeLabel>{snapshot.currentType}</BadgeLabel>
                    </Badge>
                    <Badge variant="default" size="sm">
                      <BadgeLabel>{snapshot.questionCount} questions</BadgeLabel>
                    </Badge>
                  </View>
                </View>
              </>
            )}
          </CardBody>
        </Card>

        {/* Answers Section */}
        {answers.length > 0 && (
          <Card>
            <CardHeader>
              <Text
                style={{
                  fontSize: FONT_SIZES.xl,
                  fontWeight: FONT_WEIGHTS.semibold,
                  color: COLORS.softBrown,
                }}>
                Responses
              </Text>
              <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.warmGray }}>
                {answers.length} question{answers.length !== 1 ? 's' : ''} answered
              </Text>
            </CardHeader>
            <CardBody gap="md">
              {answers.map((answer, index) => {
                const iconName = getAnswerIconName(answer.answer);
                const iconColor = answer.answer === 'agree' ? COLORS.sage : COLORS.danger;
                const isLast = index === answers.length - 1;

                return (
                  <View key={answer.questionId}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: SPACING.md,
                        paddingVertical: SPACING.sm,
                      }}>
                      <View style={{ marginTop: 2 }}>
                        <Ionicons name={iconName as never} size={20} color={iconColor} />
                      </View>
                      <View style={{ flex: 1, gap: SPACING.xs }}>
                        <Text
                          style={{
                            fontSize: FONT_SIZES.sm,
                            color: COLORS.softBrown,
                            lineHeight: FONT_SIZES.sm * 1.5,
                          }}>
                          {answer.questionText}
                        </Text>
                        <Text
                          style={{
                            fontSize: FONT_SIZES.xs,
                            color: COLORS.warmGray,
                            textTransform: 'capitalize',
                          }}>
                          {answer.answer} · {formatTime(answer.answeredAt)}
                        </Text>
                      </View>
                    </View>
                    {!isLast && <View style={{ height: 1, backgroundColor: COLORS.border }} />}
                  </View>
                );
              })}
            </CardBody>
          </Card>
        )}

        {/* Empty State */}
        {answers.length === 0 && (
          <Card>
            <CardBody style={{ alignItems: 'center', gap: SPACING.lg, paddingVertical: SPACING['3xl'] }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: COLORS.cream,
                  borderRadius: 9999,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons name="help-circle-outline" size={24} color={COLORS.softBrown} />
              </View>
              <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.warmGray, textAlign: 'center' }}>
                No responses recorded for this session.
              </Text>
            </CardBody>
          </Card>
        )}
      </ScrollView>
    </>
  );
}
