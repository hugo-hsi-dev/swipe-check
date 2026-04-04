import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { Card } from 'heroui-native';

import { useInsightsData } from '@/hooks/use-insights-data';
import { AXES } from '@/constants/questions';
import { TypeTrendSection } from '@/components/insights/type-trend-section';
import type { AxisStrength } from '@/constants/scoring-contract';

function TypeHero({ type }: { type: string }) {
  return (
    <Card className="bg-accent-soft">
      <Card.Body className="items-center gap-4 py-8">
        <Text className="text-4xl font-bold">{type}</Text>
        <Text className="text-text-secondary">Your current type</Text>
      </Card.Body>
    </Card>
  );
}

function AxisStrengthCard({
  axisId,
  strength: axisStrength,
}: {
  axisId: string;
  strength: AxisStrength;
}) {
  const axis = AXES.find((a) => a.id === axisId);
  if (!axis) return null;

  const poleAName = axis.poleA.label;
  const poleBName = axis.poleB.label;
  const { strength, dominantPoleId } = axisStrength;
  const dominancePercent = Math.round(Math.abs(strength) * 100);
  const isTied = dominantPoleId === null;

  const fillWidth = Math.abs(strength) * 100;

  const containerClass = isTied
    ? 'justify-center'
    : dominantPoleId === axis.poleA.id
      ? 'justify-start'
      : 'justify-end';

  const fillClass = isTied ? 'bg-surface-tertiary' : 'bg-accent';

  const dominanceText = isTied
    ? 'Balanced'
    : dominantPoleId === axis.poleA.id
      ? `${poleAName} (${dominancePercent}%)`
      : `${poleBName} (${dominancePercent}%)`;

  return (
    <Card>
      <Card.Body className="gap-3">
        <View className="flex-row justify-between">
          <Text className="font-medium">{poleAName}</Text>
          <Text className="font-medium">{poleBName}</Text>
        </View>
        <View className={`h-2 overflow-hidden rounded-full bg-surface-secondary flex-row ${containerClass}`}>
          <View
            className={`h-full rounded-full ${fillClass}`}
            style={{ width: isTied ? '50%' : `${fillWidth}%` }}
            testID={`axis-fill-${axisId}`}
          />
        </View>
        <Text className="text-center text-sm text-text-secondary">
          {dominanceText}
        </Text>
      </Card.Body>
    </Card>
  );
}

function MBTIDisclaimer() {
  return (
    <Card className="bg-surface-secondary">
      <Card.Body className="items-center gap-2 py-4">
        <Text className="text-xs text-text-secondary text-center">
          This assessment is for self-reflection purposes only. It is not affiliated
          with or endorsed by MBTI, CAPT, or any official personality typing system.
        </Text>
      </Card.Body>
    </Card>
  );
}

export default function InsightsScreen() {
  const state = useInsightsData();

  if (state.status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          padding: 16,
          paddingTop: 24,
          paddingBottom: 24,
          gap: 16,
        }}
      >
        <Card>
          <Card.Header>
            <Card.Title className="text-xl">Insights</Card.Title>
          </Card.Header>
        </Card>

        <Card className="bg-danger-soft">
          <Card.Body className="items-center gap-4 py-12">
            <View className="size-16 items-center justify-center rounded-full bg-surface-secondary">
              <Ionicons name="alert-circle-outline" size={28} />
            </View>
            <Text className="text-center text-text-secondary">
              Failed to load insights. Please try again later.
            </Text>
          </Card.Body>
        </Card>
      </ScrollView>
    );
  }

  if (state.status === 'empty') {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          padding: 16,
          paddingTop: 24,
          paddingBottom: 24,
          gap: 16,
        }}
      >
        <Card>
          <Card.Header>
            <Card.Title className="text-xl">Insights</Card.Title>
          </Card.Header>
        </Card>

        <Card>
          <Card.Body className="items-center gap-4 py-12">
            <View className="size-16 items-center justify-center rounded-full bg-surface-secondary">
              <Ionicons name="analytics-outline" size={28} />
            </View>
            <Text className="text-center text-text-secondary">
              Complete onboarding to see your personality insights.
            </Text>
          </Card.Body>
        </Card>
      </ScrollView>
    );
  }

  if (state.status === 'sparse') {
    const { latestType, latestSnapshot, history } = state;
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          padding: 16,
          paddingTop: 24,
          paddingBottom: 24,
          gap: 16,
        }}
      >
        <Card>
          <Card.Header>
            <Card.Title className="text-xl">Insights</Card.Title>
          </Card.Header>
        </Card>

        <TypeHero type={latestType} />

        <Card className="bg-warning-soft">
          <Card.Body className="items-center gap-2 py-4">
            <Text className="text-sm text-warning font-medium">Limited history</Text>
            <Text className="text-xs text-text-secondary text-center">
              Complete more assessments to unlock trend tracking and richer insights.
            </Text>
          </Card.Body>
        </Card>

        <TypeTrendSection latestType={latestType} history={history} />

        {latestSnapshot?.axisStrengths.map((strength) => (
          <AxisStrengthCard
            key={strength.axisId}
            axisId={strength.axisId}
            strength={strength}
          />
        ))}

        <MBTIDisclaimer />
      </ScrollView>
    );
  }

  const { latestType, latestSnapshot, history } = state;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        padding: 16,
        paddingTop: 24,
        paddingBottom: 24,
        gap: 16,
      }}
    >
      <Card>
        <Card.Header>
          <Card.Title className="text-xl">Insights</Card.Title>
        </Card.Header>
      </Card>

      <TypeHero type={latestType} />

      <TypeTrendSection latestType={latestType} history={history} />

{latestSnapshot?.axisStrengths.map((strength) => (
          <AxisStrengthCard
            key={strength.axisId}
            axisId={strength.axisId}
            strength={strength}
          />
        ))}

      <MBTIDisclaimer />
    </ScrollView>
  );
}