import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import type { PersistedSessionAnswer } from '@/lib/local-data/session-lifecycle';

import { Badge, BadgeLabel } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Avatar } from '@/components/ui/icon-container';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';
import { useJournalEntryDetail } from '@/hooks/use-journal-data';

export default function JournalEntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { detail, error, isLoading } = useJournalEntryDetail(id ?? null);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ScrollView
          contentContainerStyle={{
            gap: SPACING.lg,
            padding: SPACING.xl,
            paddingBottom: SPACING['2xl'],
            paddingTop: SPACING['3xl'],
          }}
          style={{ backgroundColor: COLORS.cream, flex: 1 }}>
          <Card>
            <CardBody gap="md">
              <View
                style={{
                  backgroundColor: COLORS.sageLight,
                  borderRadius: 4,
                  height: 32,
                  width: 150,
                }}
              />
              <View
                style={{
                  backgroundColor: COLORS.sageLight,
                  borderRadius: 4,
                  height: 16,
                  width: 100,
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
                      backgroundColor: COLORS.sageLight,
                      borderRadius: 4,
                      height: 16,
                      width: '100%',
                    }}
                  />
                  <View
                    style={{
                      backgroundColor: COLORS.sageLight,
                      borderRadius: 4,
                      height: 12,
                      width: 60,
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
          contentContainerStyle={{
            gap: SPACING.lg,
            padding: SPACING.xl,
            paddingBottom: SPACING['2xl'],
            paddingTop: SPACING['3xl'],
          }}
          style={{ backgroundColor: COLORS.cream, flex: 1 }}>
          <Card>
            <CardBody gap="sm">
              <Text
                style={{
                  color: COLORS.danger,
                  fontSize: FONT_SIZES.lg,
                  fontWeight: FONT_WEIGHTS.semibold,
                }}>
                Unable to Load Entry
              </Text>
              <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.base }}>
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
          contentContainerStyle={{
            gap: SPACING.lg,
            padding: SPACING.xl,
            paddingBottom: SPACING['2xl'],
            paddingTop: SPACING['3xl'],
          }}
          style={{ backgroundColor: COLORS.cream, flex: 1 }}>
          <Card>
            <CardBody gap="sm">
              <Text
                style={{
                  color: COLORS.danger,
                  fontSize: FONT_SIZES.lg,
                  fontWeight: FONT_WEIGHTS.semibold,
                }}>
                Entry Not Found
              </Text>
              <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.base }}>
                This entry may have been deleted or does not exist.
              </Text>
            </CardBody>
          </Card>
        </ScrollView>
      </>
    );
  }

  const { answers, session, snapshot } = detail;
  const completedAt = session.completedAt;

  return (
    <>
      <Stack.Screen
        options={{
          title: completedAt ? formatDate(completedAt) : 'In Progress',
        }}
      />
      <ScrollView
        contentContainerStyle={{
          gap: SPACING.lg,
          padding: SPACING.xl,
          paddingBottom: SPACING['2xl'],
          paddingTop: SPACING['3xl'],
        }}
        style={{ backgroundColor: COLORS.cream, flex: 1 }}>
        {/* Header Card */}
        <Card>
          <CardBody gap="lg">
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.lg }}>
              <Avatar
                size="lg"
                variant={session.type === 'onboarding' ? 'terracotta' : 'sage'}>
                <Text
                  style={{
                    color:
                      session.type === 'onboarding' ? COLORS.terracotta : COLORS.sage,
                    fontSize: FONT_SIZES.lg,
                    fontWeight: FONT_WEIGHTS.semibold,
                  }}>
                  {snapshot?.currentType ?? (session.type === 'onboarding' ? 'ON' : 'DY')}
                </Text>
              </Avatar>
              <View style={{ flex: 1, gap: SPACING.xs }}>
                <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.sm }}>
                  <Text
                    style={{
                      color: COLORS.softBrown,
                      fontSize: FONT_SIZES.lg,
                      fontWeight: FONT_WEIGHTS.semibold,
                    }}>
                    {getEntryTypeLabel(session.type)}
                  </Text>
                  <Badge size="sm" variant="default">
                    <BadgeLabel>Read-Only</BadgeLabel>
                  </Badge>
                </View>
                {completedAt && (
                  <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.sm }}>
                    Completed at {formatTime(completedAt)}
                  </Text>
                )}
                {session.localDayKey && (
                  <Badge size="sm" variant="default">
                    <BadgeLabel>{session.localDayKey}</BadgeLabel>
                  </Badge>
                )}
              </View>
            </View>

            {snapshot && (
              <>
                <View style={{ backgroundColor: COLORS.border, height: 1 }} />
                <View style={{ gap: SPACING.sm }}>
                  <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.sm }}>
                    Type Snapshot
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                    <Badge size="sm" variant="sage">
                      <BadgeLabel>{snapshot.currentType}</BadgeLabel>
                    </Badge>
                    <Badge size="sm" variant="default">
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
                  color: COLORS.softBrown,
                  fontSize: FONT_SIZES.xl,
                  fontWeight: FONT_WEIGHTS.semibold,
                }}>
                Responses
              </Text>
              <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.sm }}>
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
                        alignItems: 'flex-start',
                        flexDirection: 'row',
                        gap: SPACING.md,
                        paddingVertical: SPACING.sm,
                      }}>
                      <View style={{ marginTop: 2 }}>
                        <Ionicons color={iconColor} name={iconName as never} size={20} />
                      </View>
                      <View style={{ flex: 1, gap: SPACING.xs }}>
                        <Text
                          style={{
                            color: COLORS.softBrown,
                            fontSize: FONT_SIZES.sm,
                            lineHeight: FONT_SIZES.sm * 1.5,
                          }}>
                          {answer.questionText}
                        </Text>
                        <Text
                          style={{
                            color: COLORS.warmGray,
                            fontSize: FONT_SIZES.xs,
                            textTransform: 'capitalize',
                          }}>
                          {answer.answer} · {formatTime(answer.answeredAt)}
                        </Text>
                      </View>
                    </View>
                    {!isLast && <View style={{ backgroundColor: COLORS.border, height: 1 }} />}
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
                  alignItems: 'center',
                  backgroundColor: COLORS.cream,
                  borderRadius: 9999,
                  height: 48,
                  justifyContent: 'center',
                  width: 48,
                }}>
                <Ionicons color={COLORS.softBrown} name="help-circle-outline" size={24} />
              </View>
              <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.base, textAlign: 'center' }}>
                No responses recorded for this session.
              </Text>
            </CardBody>
          </Card>
        )}
      </ScrollView>
    </>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getAnswerIconName(answer: PersistedSessionAnswer['answer']): string {
  return answer === 'agree' ? 'checkmark-circle' : 'close-circle';
}

function getEntryTypeLabel(type: string): string {
  return type === 'onboarding' ? 'Baseline (Onboarding)' : 'Daily Check-in';
}
