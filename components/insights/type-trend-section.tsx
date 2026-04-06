import { Text, View } from 'react-native';

import type { TypeSnapshot } from '@/constants/scoring-contract';

import { Card, CardBody } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

export type TypeTrendSectionProps = {
  history: TypeSnapshot[];
  latestType: string;
};

type SnapshotStatus = 'new' | 'shifted' | 'stable';

export function TypeTrendSection({ history, latestType }: TypeTrendSectionProps) {
  if (!history || history.length === 0) {
    return <EmptyHistory />;
  }

  if (history.length === 1) {
    return <SingleSnapshot latestType={latestType} snapshot={history[0]} />;
  }

  return <TrendHistory history={history} />;
}

function EmptyHistory() {
  return (
    <Card>
      <CardBody style={{ alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xl }}>
        <Text
          style={{
            color: COLORS.warmGray,
            fontSize: FONT_SIZES.sm,
            textAlign: 'center',
          }}>
          No trend data yet. Check back after your next assessment.
        </Text>
      </CardBody>
    </Card>
  );
}

function formatDate(date: Date): string {
  const now = new Date();

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayDay =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (yesterdayDay) return 'Yesterday';

  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((now.getTime() - date.getTime()) / oneDay);

  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function getLatestSnapshotStatus(sortedHistory: TypeSnapshot[]): SnapshotStatus {
  const latest = sortedHistory[0];
  const previous = sortedHistory[1];
  if (!latest || !previous) return 'new';
  return latest.currentType === previous.currentType ? 'stable' : 'shifted';
}

function SingleSnapshot({ latestType, snapshot }: { latestType: string; snapshot: TypeSnapshot }) {
  return (
    <Card>
      <CardBody gap="md">
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            style={{
              color: COLORS.softBrown,
              fontSize: FONT_SIZES.lg,
              fontWeight: FONT_WEIGHTS.semibold,
            }}>
            {latestType}
          </Text>
          <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.xs }}>
            {formatDate(snapshot.createdAt)}
          </Text>
        </View>
        <StatusIndicator status="new" />
        <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.sm }}>
          This is your first recorded personality type.
        </Text>
      </CardBody>
    </Card>
  );
}

function SnapshotRow({
  index,
  snapshot,
  total,
}: {
  index: number;
  snapshot: TypeSnapshot;
  total: number;
}) {
  const isLatest = index === 0;

  return (
    <View
      style={{
        alignItems: 'center',
        borderBottomColor: COLORS.border,
        borderBottomWidth: index < total - 1 ? 1 : 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
      }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.md }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: isLatest ? COLORS.terracottaLight : COLORS.cream,
            borderRadius: 9999,
            height: 40,
            justifyContent: 'center',
            width: 40,
          }}>
          <Text
            style={{
              color: isLatest ? COLORS.terracotta : COLORS.warmGray,
              fontSize: FONT_SIZES.sm,
              fontWeight: FONT_WEIGHTS.semibold,
            }}>
            {snapshot.currentType}
          </Text>
        </View>
        <View>
          <Text
            style={{
              color: COLORS.softBrown,
              fontSize: FONT_SIZES.sm,
              fontWeight: FONT_WEIGHTS.medium,
            }}>
            {formatDate(snapshot.createdAt)}
          </Text>
          <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.xs }}>
            {snapshot.source.type === 'onboarding'
              ? 'Onboarding'
              : snapshot.source.type === 'daily'
                ? 'Daily check-in'
                : 'Manual entry'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function StatusIndicator({ status }: { status: SnapshotStatus }) {
  if (status === 'new') {
    return (
      <Text
        style={{
          color: COLORS.terracotta,
          fontSize: FONT_SIZES.xs,
          fontWeight: FONT_WEIGHTS.medium,
        }}>
        First result
      </Text>
    );
  }
  if (status === 'stable') {
    return (
      <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.xs }}>Same as before</Text>
    );
  }
  return (
    <Text
      style={{
        color: COLORS.coral,
        fontSize: FONT_SIZES.xs,
        fontWeight: FONT_WEIGHTS.medium,
      }}>
      Type shifted
    </Text>
  );
}

function TrendHistory({ history }: { history: TypeSnapshot[] }) {
  const sortedHistory = [...history].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id.localeCompare(a.id)
  );

  const latestStatus = getLatestSnapshotStatus(sortedHistory);
  const latest = sortedHistory[0];
  const previous = sortedHistory[1];
  const typeChanged = latestStatus === 'shifted' && previous;

  return (
    <Card>
      <CardBody gap="lg">
        <View>
          <Text
            style={{
              color: COLORS.softBrown,
              fontSize: FONT_SIZES.base,
              fontWeight: FONT_WEIGHTS.semibold,
            }}>
            Type History
          </Text>
          <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.xs, marginTop: SPACING.xs }}>
            {history.length} snapshot{history.length !== 1 ? 's' : ''} recorded
          </Text>
        </View>

        {typeChanged && previous && (
          <View
            style={{
              backgroundColor: COLORS.peach,
              borderRadius: RADIUS.md,
              padding: SPACING.md,
            }}>
            <Text
              style={{
                color: COLORS.coral,
                fontSize: FONT_SIZES.sm,
                fontWeight: FONT_WEIGHTS.medium,
              }}>
              Type changed
            </Text>
            <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.xs, marginTop: SPACING.xs }}>
              You went from {previous.currentType} to {latest?.currentType}
            </Text>
          </View>
        )}

        <View style={{ gap: SPACING.xs }}>
          {sortedHistory.slice(0, 5).map((snapshot, index) => (
            <SnapshotRow
              index={index}
              key={snapshot.id}
              snapshot={snapshot}
              total={Math.min(sortedHistory.length, 5)}
            />
          ))}
          {latest && sortedHistory.length > 0 && (
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end', paddingVertical: SPACING.sm }}>
              <StatusIndicator status={latestStatus} />
            </View>
          )}
        </View>

        {sortedHistory.length > 5 && (
          <Text
            style={{
              color: COLORS.warmGray,
              fontSize: FONT_SIZES.xs,
              textAlign: 'center',
            }}>
            +{sortedHistory.length - 5} more earlier snapshot
            {sortedHistory.length - 5 !== 1 ? 's' : ''}
          </Text>
        )}
      </CardBody>
    </Card>
  );
}
