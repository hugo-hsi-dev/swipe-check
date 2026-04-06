import { Text, View } from 'react-native';

import { Card, CardBody } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';
import type { TypeSnapshot } from '@/constants/scoring-contract';

export type TypeTrendSectionProps = {
  latestType: string;
  history: TypeSnapshot[];
};

type SnapshotStatus = 'new' | 'stable' | 'shifted';

function getLatestSnapshotStatus(sortedHistory: TypeSnapshot[]): SnapshotStatus {
  const latest = sortedHistory[0];
  const previous = sortedHistory[1];
  if (!latest || !previous) return 'new';
  return latest.currentType === previous.currentType ? 'stable' : 'shifted';
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
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function StatusIndicator({ status }: { status: SnapshotStatus }) {
  if (status === 'new') {
    return (
      <Text
        style={{
          fontSize: FONT_SIZES.xs,
          fontWeight: FONT_WEIGHTS.medium,
          color: COLORS.terracotta,
        }}>
        First result
      </Text>
    );
  }
  if (status === 'stable') {
    return (
      <Text style={{ fontSize: FONT_SIZES.xs, color: COLORS.warmGray }}>Same as before</Text>
    );
  }
  return (
    <Text
      style={{
        fontSize: FONT_SIZES.xs,
        fontWeight: FONT_WEIGHTS.medium,
        color: COLORS.coral,
      }}>
      Type shifted
    </Text>
  );
}

function EmptyHistory() {
  return (
    <Card>
      <CardBody style={{ alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xl }}>
        <Text
          style={{
            fontSize: FONT_SIZES.sm,
            color: COLORS.warmGray,
            textAlign: 'center',
          }}>
          No trend data yet. Check back after your next assessment.
        </Text>
      </CardBody>
    </Card>
  );
}

function SingleSnapshot({ latestType, snapshot }: { latestType: string; snapshot: TypeSnapshot }) {
  return (
    <Card>
      <CardBody gap="md">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            style={{
              fontSize: FONT_SIZES.lg,
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.softBrown,
            }}>
            {latestType}
          </Text>
          <Text style={{ fontSize: FONT_SIZES.xs, color: COLORS.warmGray }}>
            {formatDate(snapshot.createdAt)}
          </Text>
        </View>
        <StatusIndicator status="new" />
        <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.warmGray }}>
          This is your first recorded personality type.
        </Text>
      </CardBody>
    </Card>
  );
}

function SnapshotRow({
  snapshot,
  index,
  total,
}: {
  snapshot: TypeSnapshot;
  index: number;
  total: number;
}) {
  const isLatest = index === 0;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        borderBottomWidth: index < total - 1 ? 1 : 0,
        borderBottomColor: COLORS.border,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
        <View
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 9999,
            backgroundColor: isLatest ? COLORS.terracottaLight : COLORS.cream,
          }}>
          <Text
            style={{
              fontSize: FONT_SIZES.sm,
              fontWeight: FONT_WEIGHTS.semibold,
              color: isLatest ? COLORS.terracotta : COLORS.warmGray,
            }}>
            {snapshot.currentType}
          </Text>
        </View>
        <View>
          <Text
            style={{
              fontSize: FONT_SIZES.sm,
              fontWeight: FONT_WEIGHTS.medium,
              color: COLORS.softBrown,
            }}>
            {formatDate(snapshot.createdAt)}
          </Text>
          <Text style={{ fontSize: FONT_SIZES.xs, color: COLORS.warmGray }}>
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
              fontSize: FONT_SIZES.base,
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.softBrown,
            }}>
            Type History
          </Text>
          <Text style={{ fontSize: FONT_SIZES.xs, color: COLORS.warmGray, marginTop: SPACING.xs }}>
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
                fontSize: FONT_SIZES.sm,
                fontWeight: FONT_WEIGHTS.medium,
                color: COLORS.coral,
              }}>
              Type changed
            </Text>
            <Text style={{ fontSize: FONT_SIZES.xs, color: COLORS.warmGray, marginTop: SPACING.xs }}>
              You went from {previous.currentType} to {latest?.currentType}
            </Text>
          </View>
        )}

        <View style={{ gap: SPACING.xs }}>
          {sortedHistory.slice(0, 5).map((snapshot, index) => (
            <SnapshotRow
              key={snapshot.id}
              snapshot={snapshot}
              index={index}
              total={Math.min(sortedHistory.length, 5)}
            />
          ))}
          {latest && sortedHistory.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingVertical: SPACING.sm }}>
              <StatusIndicator status={latestStatus} />
            </View>
          )}
        </View>

        {sortedHistory.length > 5 && (
          <Text
            style={{
              fontSize: FONT_SIZES.xs,
              color: COLORS.warmGray,
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

export function TypeTrendSection({ latestType, history }: TypeTrendSectionProps) {
  if (!history || history.length === 0) {
    return <EmptyHistory />;
  }

  if (history.length === 1) {
    return <SingleSnapshot latestType={latestType} snapshot={history[0]} />;
  }

  return <TrendHistory history={history} />;
}
