import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { EmptyState } from '@/components/journal/empty-state';
import { JournalListItem } from '@/components/journal/journal-list-item';
import { AppIcon } from '@/components/ui/app-icon';
import { Button, ButtonLabel } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Avatar } from '@/components/ui/icon-container';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';
import {
  useCurrentDayCompletedSession,
  useJournalHistory,
} from '@/hooks/use-journal-data';

export default function JournalScreen() {
  const { entries, error, hasMore, isLoading, isLoadingMore, loadMore } = useJournalHistory();
  const {
    entry: currentDayEntry,
    error: currentDayError,
    isCurrentDay: isDayComplete,
    isLoading: isCurrentDayLoading,
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
                height: 24,
                width: 120,
              }}
            />
            <View
              style={{
                backgroundColor: COLORS.sageLight,
                borderRadius: 4,
                height: 16,
                width: '100%',
              }}
            />
          </CardBody>
        </Card>
        <View style={{ gap: SPACING.md }}>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardBody style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.md }}>
                <View
                  style={{
                    backgroundColor: COLORS.sageLight,
                    borderRadius: 9999,
                    height: 40,
                    width: 40,
                  }}
                />
                <View style={{ flex: 1, gap: SPACING.sm }}>
                  <View
                    style={{
                      backgroundColor: COLORS.sageLight,
                      borderRadius: 4,
                      height: 16,
                      width: 100,
                    }}
                  />
                  <View
                    style={{
                      backgroundColor: COLORS.sageLight,
                      borderRadius: 4,
                      height: 12,
                      width: 80,
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
        contentContainerStyle={{
          gap: SPACING.lg,
          padding: SPACING.xl,
          paddingBottom: SPACING['2xl'],
          paddingTop: SPACING['3xl'],
        }}
        style={{ backgroundColor: COLORS.cream, flex: 1 }}>
        <EmptyState
          description={error.message}
          icon="alert-circle-outline"
          title="Error loading journal"
        />
      </ScrollView>
    );
  }

  const isFullyEmpty = entries.length === 0;

  if (isFullyEmpty) {
    return (
      <ScrollView
        contentContainerStyle={{
          gap: SPACING.lg,
          padding: SPACING.xl,
          paddingBottom: SPACING['2xl'],
          paddingTop: SPACING['3xl'],
        }}
        style={{ backgroundColor: COLORS.cream, flex: 1 }}>
        <EmptyState
          description="Complete daily check-ins to build your history."
          icon="journal-outline"
          title="Your Journal is Empty"
        />
      </ScrollView>
    );
  }

  return (
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
              color: COLORS.softBrown,
              fontSize: FONT_SIZES['2xl'],
              fontWeight: FONT_WEIGHTS.bold,
            }}>
            Journal
          </Text>
          <Text
            style={{
              color: COLORS.warmGray,
              fontSize: FONT_SIZES.base,
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
                color: COLORS.danger,
                fontSize: FONT_SIZES.lg,
                fontWeight: FONT_WEIGHTS.semibold,
              }}>
              Today&apos;s check-in unavailable
            </Text>
            <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.base }}>
              {currentDayError.message}
            </Text>
          </CardBody>
        </Card>
      )}

      {isDayComplete && currentDayEntry && (
        <View style={{ gap: SPACING.md }}>
          <Card variant="terracotta">
            <CardBody gap="md">
              <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.sm }}>
                <AppIcon color={COLORS.softBrown} name="star" size={16} />
                <Text
                  style={{
                    color: COLORS.softBrown,
                    fontSize: FONT_SIZES.lg,
                    fontWeight: FONT_WEIGHTS.semibold,
                  }}>
                  Today
                </Text>
              </View>
              <Button onPress={() => handleEntryPress(currentDayEntry.session.id)} variant="secondary">
                <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.md }}>
                  <Avatar size="sm" variant="sage">
                    <Text
                      style={{
                        color: COLORS.sage,
                        fontSize: FONT_SIZES.xs,
                        fontWeight: FONT_WEIGHTS.semibold,
                      }}>
                      {currentDayEntry.snapshot?.currentType ?? 'DY'}
                    </Text>
                  </Avatar>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: COLORS.softBrown,
                        fontSize: FONT_SIZES.base,
                        fontWeight: FONT_WEIGHTS.semibold,
                      }}>
                      {currentDayEntry.snapshot?.currentType ??
                        getEntryTypeLabel(currentDayEntry.session.type)}
                    </Text>
                    <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.sm }}>
                      {currentDayEntry.session.completedAt
                        ? formatTime(currentDayEntry.session.completedAt)
                        : ''}
                    </Text>
                  </View>
                  <AppIcon color={COLORS.warmGray} name="chevron-forward" size={18} />
                </View>
              </Button>
            </CardBody>
          </Card>

          {filteredPastDailyEntries.length === 0 && (
            <View style={{ alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg }}>
              <Text
                style={{
                  color: COLORS.warmGray,
                  fontSize: FONT_SIZES.sm,
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
              alignItems: 'center',
              flexDirection: 'row',
              gap: SPACING.sm,
            }}>
            <View style={{ backgroundColor: COLORS.border, flex: 1, height: 1 }} />
            <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.sm }}>Baseline</Text>
            <View style={{ backgroundColor: COLORS.border, flex: 1, height: 1 }} />
          </View>
          <View style={{ gap: SPACING.md }}>
            {onboardingEntries.map((entry) => {
              const session = entry.session;
              const snapshot = entry.snapshot;
              const completedAt = session.completedAt;

              return (
                <JournalListItem
                  avatarText={snapshot?.currentType ?? 'ON'}
                  id={session.id}
                  key={session.id}
                  onPress={handleEntryPress}
                  subtitle={`${completedAt ? formatTime(completedAt) : ''}${snapshot ? ` · ${snapshot.currentType}` : ''}`}
                  title={completedAt ? formatDate(completedAt) : 'Unknown date'}
                  type="onboarding"
                  typeLabel={getEntryTypeLabel(session.type)}
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
              alignItems: 'center',
              flexDirection: 'row',
              gap: SPACING.sm,
            }}>
            <View style={{ backgroundColor: COLORS.border, flex: 1, height: 1 }} />
            <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.sm }}>
              Past Daily Check-ins
            </Text>
            <View style={{ backgroundColor: COLORS.border, flex: 1, height: 1 }} />
          </View>
          <View style={{ gap: SPACING.md }}>
            {filteredPastDailyEntries.map((entry) => {
              const session = entry.session;
              const snapshot = entry.snapshot;
              const completedAt = session.completedAt;

              return (
                <JournalListItem
                  avatarText={snapshot?.currentType ?? 'DY'}
                  id={session.id}
                  key={session.id}
                  onPress={handleEntryPress}
                  subtitle={`${completedAt ? formatTime(completedAt) : ''}${snapshot ? ` · ${snapshot.currentType}` : ''}`}
                  title={completedAt ? formatDate(completedAt) : 'Unknown date'}
                  type="daily"
                  typeLabel={getEntryTypeLabel(session.type)}
                />
              );
            })}
          </View>
          {hasMore && (
            <Button isDisabled={isLoadingMore} onPress={loadMore} variant="secondary">
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
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
