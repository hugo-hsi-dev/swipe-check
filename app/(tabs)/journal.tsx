import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Card, CardBody } from '@/components/ui/card';
import { Button, ButtonLabel } from '@/components/ui/button';

import { Avatar } from '@/components/ui/icon-container';
import { JournalListItem } from '@/components/journal/journal-list-item';
import { EmptyState } from '@/components/journal/empty-state';
import {
  useCurrentDayCompletedSession,
  useJournalHistory,
} from '@/hooks/use-journal-data';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

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
  const { entries, isLoading, isLoadingMore, hasMore, error, loadMore } = useJournalHistory();
  const {
    entry: currentDayEntry,
    isCurrentDay: isDayComplete,
    isLoading: isCurrentDayLoading,
    error: currentDayError,
  } = useCurrentDayCompletedSession();

  const dailyEntries = entries.filter((entry) => entry.session.type === 'daily');
  const onboardingEntries = entries.filter((entry) => entry.session.type === 'onboarding');

  const filteredPastDailyEntries = dailyEntries.filter((entry) => {
    if (!isDayComplete || !currentDayEntry) return true;
    return entry.session.id !== currentDayEntry.session.id;
  });

  const handleEntryPress = (sessionId: string) => {
    router.push(`/journal/${sessionId}`);
  };

  if (isLoading || isCurrentDayLoading) {
    return (
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
                width: 120,
                height: 24,
                backgroundColor: COLORS.sageLight,
                borderRadius: 4,
              }}
            />
            <View
              style={{
                width: '100%',
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
              <CardBody style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: COLORS.sageLight,
                    borderRadius: 9999,
                  }}
                />
                <View style={{ flex: 1, gap: SPACING.sm }}>
                  <View
                    style={{
                      width: 100,
                      height: 16,
                      backgroundColor: COLORS.sageLight,
                      borderRadius: 4,
                    }}
                  />
                  <View
                    style={{
                      width: 80,
                      height: 12,
                      backgroundColor: COLORS.sageLight,
                      borderRadius: 4,
                    }}
                  />
                </View>
              </CardBody>
            </Card>
          ))}
        </View>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.cream }}
        contentContainerStyle={{
          gap: SPACING.lg,
          padding: SPACING.xl,
          paddingTop: SPACING['3xl'],
          paddingBottom: SPACING['2xl'],
        }}>
        <EmptyState
          icon="alert-circle-outline"
          title="Error loading journal"
          description={error.message}
        />
      </ScrollView>
    );
  }

  const isFullyEmpty = entries.length === 0;

  if (isFullyEmpty) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.cream }}
        contentContainerStyle={{
          gap: SPACING.lg,
          padding: SPACING.xl,
          paddingTop: SPACING['3xl'],
          paddingBottom: SPACING['2xl'],
        }}>
        <EmptyState
          icon="journal-outline"
          title="Your Journal is Empty"
          description="Complete daily check-ins to build your history."
        />
      </ScrollView>
    );
  }

  return (
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
              fontSize: FONT_SIZES['2xl'],
              fontWeight: FONT_WEIGHTS.bold,
              color: COLORS.softBrown,
            }}>
            Journal
          </Text>
          <Text
            style={{
              fontSize: FONT_SIZES.base,
              color: COLORS.warmGray,
              lineHeight: FONT_SIZES.base * 1.5,
            }}>
            Review your past check-ins and see how your type has evolved.
          </Text>
        </CardBody>
      </Card>

      {currentDayError && (
        <Card variant="default">
          <CardBody gap="sm">
            <Text
              style={{
                fontSize: FONT_SIZES.lg,
                fontWeight: FONT_WEIGHTS.semibold,
                color: COLORS.danger,
              }}>
              Today&apos;s check-in unavailable
            </Text>
            <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.warmGray }}>
              {currentDayError.message}
            </Text>
          </CardBody>
        </Card>
      )}

      {isDayComplete && currentDayEntry && (
        <View style={{ gap: SPACING.md }}>
          <Card variant="terracotta">
            <CardBody gap="md">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <Ionicons name="star" size={16} color={COLORS.softBrown} />
                <Text
                  style={{
                    fontSize: FONT_SIZES.lg,
                    fontWeight: FONT_WEIGHTS.semibold,
                    color: COLORS.softBrown,
                  }}>
                  Today
                </Text>
              </View>
              <Button variant="secondary" onPress={() => handleEntryPress(currentDayEntry.session.id)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
                  <Avatar size="sm" variant="sage">
                    <Text
                      style={{
                        fontSize: FONT_SIZES.xs,
                        fontWeight: FONT_WEIGHTS.semibold,
                        color: COLORS.sage,
                      }}>
                      {currentDayEntry.snapshot?.currentType ?? 'DY'}
                    </Text>
                  </Avatar>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: FONT_SIZES.base,
                        fontWeight: FONT_WEIGHTS.semibold,
                        color: COLORS.softBrown,
                      }}>
                      {currentDayEntry.snapshot?.currentType ??
                        getEntryTypeLabel(currentDayEntry.session.type)}
                    </Text>
                    <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.warmGray }}>
                      {currentDayEntry.session.completedAt
                        ? formatTime(currentDayEntry.session.completedAt)
                        : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.warmGray} />
                </View>
              </Button>
            </CardBody>
          </Card>

          {filteredPastDailyEntries.length === 0 && (
            <View style={{ alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg }}>
              <Text
                style={{
                  fontSize: FONT_SIZES.sm,
                  color: COLORS.warmGray,
                  textAlign: 'center',
                }}>
                No previous daily check-ins yet
              </Text>
            </View>
          )}
        </View>
      )}

      {onboardingEntries.length > 0 && (
        <View style={{ gap: SPACING.md }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.sm,
            }}>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
            <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.warmGray }}>Baseline</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
          </View>
          <View style={{ gap: SPACING.md }}>
            {onboardingEntries.map((entry) => {
              const session = entry.session;
              const snapshot = entry.snapshot;
              const completedAt = session.completedAt;

              return (
                <JournalListItem
                  key={session.id}
                  id={session.id}
                  title={completedAt ? formatDate(completedAt) : 'Unknown date'}
                  subtitle={`${completedAt ? formatTime(completedAt) : ''}${snapshot ? ` · ${snapshot.currentType}` : ''}`}
                  type="onboarding"
                  typeLabel={getEntryTypeLabel(session.type)}
                  avatarText={snapshot?.currentType ?? 'ON'}
                  onPress={handleEntryPress}
                />
              );
            })}
          </View>
        </View>
      )}

      {filteredPastDailyEntries.length > 0 && (
        <View style={{ gap: SPACING.md }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.sm,
            }}>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
            <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.warmGray }}>
              Past Daily Check-ins
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
          </View>
          <View style={{ gap: SPACING.md }}>
            {filteredPastDailyEntries.map((entry) => {
              const session = entry.session;
              const snapshot = entry.snapshot;
              const completedAt = session.completedAt;

              return (
                <JournalListItem
                  key={session.id}
                  id={session.id}
                  title={completedAt ? formatDate(completedAt) : 'Unknown date'}
                  subtitle={`${completedAt ? formatTime(completedAt) : ''}${snapshot ? ` · ${snapshot.currentType}` : ''}`}
                  type="daily"
                  typeLabel={getEntryTypeLabel(session.type)}
                  avatarText={snapshot?.currentType ?? 'DY'}
                  onPress={handleEntryPress}
                />
              );
            })}
          </View>
          {hasMore && (
            <Button variant="secondary" onPress={loadMore} isDisabled={isLoadingMore}>
              <ButtonLabel variant="secondary">
                {isLoadingMore ? 'Loading more...' : 'Load more entries'}
              </ButtonLabel>
            </Button>
          )}
        </View>
      )}
    </ScrollView>
  );
}
