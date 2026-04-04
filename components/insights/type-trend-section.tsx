import { Text, View } from 'react-native';

import { Card } from 'heroui-native';
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
    return <Text className="text-xs text-accent font-medium">First result</Text>;
  }
  if (status === 'stable') {
    return <Text className="text-xs text-text-secondary">Same as before</Text>;
  }
  return <Text className="text-xs text-warning font-medium">Type shifted</Text>;
}

function EmptyHistory() {
  return (
    <Card>
      <Card.Body className="items-center gap-2 py-6">
        <Text className="text-sm text-text-secondary text-center">
          No trend data yet. Check back after your next assessment.
        </Text>
      </Card.Body>
    </Card>
  );
}

function SingleSnapshot({ latestType, snapshot }: { latestType: string; snapshot: TypeSnapshot }) {
  return (
    <Card>
      <Card.Body className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold">{latestType}</Text>
          <Text className="text-xs text-text-secondary">{formatDate(snapshot.createdAt)}</Text>
        </View>
        <StatusIndicator status="new" />
        <Text className="text-sm text-text-secondary">
          This is your first recorded personality type.
        </Text>
      </Card.Body>
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
      className={`flex-row items-center justify-between py-2 ${index < total - 1 ? 'border-b border-surface-secondary' : ''}`}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`w-10 h-10 items-center justify-center rounded-full ${isLatest ? 'bg-accent-soft' : 'bg-surface-secondary'}`}
        >
          <Text className={`text-sm font-semibold ${isLatest ? 'text-accent' : 'text-text-secondary'}`}>
            {snapshot.currentType}
          </Text>
        </View>
        <View>
          <Text className="text-sm font-medium">{formatDate(snapshot.createdAt)}</Text>
          <Text className="text-xs text-text-secondary">
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
      <Card.Body className="gap-4">
        <View>
          <Text className="text-base font-semibold">Type History</Text>
          <Text className="text-xs text-text-secondary mt-0.5">
            {history.length} snapshot{history.length !== 1 ? 's' : ''} recorded
          </Text>
        </View>

        {typeChanged && previous && (
          <View className="bg-warning-soft rounded-lg p-3">
            <Text className="text-sm text-warning font-medium">Type changed</Text>
            <Text className="text-xs text-text-secondary mt-1">
              You went from {previous.currentType} to {latest?.currentType}
            </Text>
          </View>
        )}

        <View className="gap-1">
          {sortedHistory.slice(0, 5).map((snapshot, index) => (
            <SnapshotRow
              key={snapshot.id}
              snapshot={snapshot}
              index={index}
              total={Math.min(sortedHistory.length, 5)}
            />
          ))}
          {latest && sortedHistory.length > 0 && (
            <View className="flex-row items-center justify-end py-2">
              <StatusIndicator status={latestStatus} />
            </View>
          )}
        </View>

        {sortedHistory.length > 5 && (
          <Text className="text-xs text-text-secondary text-center">
            +{sortedHistory.length - 5} more earlier snapshot
            {sortedHistory.length - 5 !== 1 ? 's' : ''}
          </Text>
        )}
      </Card.Body>
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