import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

import type { AxisStrength } from '@/constants/scoring-contract';

import { AxisBar } from '@/components/insights/chart-card';
import { TypeTrendSection } from '@/components/insights/type-trend-section';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';
import { AXES } from '@/constants/questions';
import { useInsightsData } from '@/hooks/use-insights-data';

export default function InsightsScreen() {
  const state = useInsightsData();

  if (state.status === 'loading') {
    return (
      <View
        style={{
          alignItems: 'center',
          backgroundColor: COLORS.cream,
          flex: 1,
          justifyContent: 'center',
        }}>
        <Text style={{ color: COLORS.softBrown }}>Loading...</Text>
      </View>
    );
  }

  if (state.status === 'error') {
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
          <CardHeader>
            <Text
              style={{
                color: COLORS.softBrown,
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
              }}>
              Insights
            </Text>
          </CardHeader>
        </Card>

        <Card variant="default">
          <CardBody style={{ alignItems: 'center', gap: SPACING.lg, paddingVertical: SPACING['3xl'] }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: COLORS.cream,
                borderRadius: 9999,
                height: 64,
                justifyContent: 'center',
                width: 64,
              }}>
              <Ionicons color={COLORS.softBrown} name="alert-circle-outline" size={28} />
            </View>
            <Text style={{ color: COLORS.warmGray, textAlign: 'center' }}>
              Failed to load insights. Please try again later.
            </Text>
          </CardBody>
        </Card>
      </ScrollView>
    );
  }

  if (state.status === 'empty') {
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
          <CardHeader>
            <Text
              style={{
                color: COLORS.softBrown,
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
              }}>
              Insights
            </Text>
          </CardHeader>
        </Card>

        <Card>
          <CardBody style={{ alignItems: 'center', gap: SPACING.lg, paddingVertical: SPACING['3xl'] }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: COLORS.cream,
                borderRadius: 9999,
                height: 64,
                justifyContent: 'center',
                width: 64,
              }}>
              <Ionicons color={COLORS.softBrown} name="analytics-outline" size={28} />
            </View>
            <Text style={{ color: COLORS.warmGray, textAlign: 'center' }}>
              Complete onboarding to see your personality insights.
            </Text>
          </CardBody>
        </Card>
      </ScrollView>
    );
  }

  if (state.status === 'sparse') {
    const { history, latestSnapshot, latestType } = state;
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
          <CardHeader>
            <Text
              style={{
                color: COLORS.softBrown,
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
              }}>
              Insights
            </Text>
          </CardHeader>
        </Card>

        <TypeHero type={latestType} />

        <Card variant="peach">
          <CardBody style={{ alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg }}>
            <Text
              style={{
                color: COLORS.coral,
                fontSize: FONT_SIZES.sm,
                fontWeight: FONT_WEIGHTS.medium,
              }}>
              Limited history
            </Text>
            <Text
              style={{
                color: COLORS.warmGray,
                fontSize: FONT_SIZES.xs,
                lineHeight: FONT_SIZES.xs * 1.5,
                textAlign: 'center',
              }}>
              Complete more assessments to unlock trend tracking and richer insights.
            </Text>
          </CardBody>
        </Card>

        <TypeTrendSection history={history} latestType={latestType} />

        {latestSnapshot?.axisStrengths.map((strength) => (
          <AxisStrengthCard axisId={strength.axisId} key={strength.axisId} strength={strength} />
        ))}

        <MBTIDisclaimer />
      </ScrollView>
    );
  }

  const { history, latestSnapshot, latestType } = state;

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
        <CardHeader>
          <Text
            style={{
              color: COLORS.softBrown,
              fontSize: FONT_SIZES['2xl'],
              fontWeight: FONT_WEIGHTS.bold,
            }}>
            Insights
          </Text>
        </CardHeader>
      </Card>

      <TypeHero type={latestType} />

      <TypeTrendSection history={history} latestType={latestType} />

      {latestSnapshot?.axisStrengths.map((strength) => (
        <AxisStrengthCard axisId={strength.axisId} key={strength.axisId} strength={strength} />
      ))}

      <MBTIDisclaimer />
    </ScrollView>
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

  return (
    <Card>
      <CardBody gap="md">
        <AxisBar
          axisId={axisId}
          dominantPoleId={axisStrength.dominantPoleId}
          poleA={{ id: axis.poleA.id, label: axis.poleA.label }}
          poleB={{ id: axis.poleB.id, label: axis.poleB.label }}
          strength={axisStrength.strength}
        />
      </CardBody>
    </Card>
  );
}

function MBTIDisclaimer() {
  return (
    <Card variant="default">
      <CardBody style={{ alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg }}>
        <Text
          style={{
            color: COLORS.warmGray,
            fontSize: FONT_SIZES.xs,
            lineHeight: FONT_SIZES.xs * 1.5,
            textAlign: 'center',
          }}>
          This assessment is for self-reflection purposes only. It is not affiliated
          with or endorsed by MBTI, CAPT, or any official personality typing system.
        </Text>
      </CardBody>
    </Card>
  );
}

function TypeHero({ type }: { type: string }) {
  return (
    <Card variant="terracotta">
      <CardBody style={{ alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING['3xl'] }}>
        <Text
          style={{
            color: COLORS.softBrown,
            fontSize: FONT_SIZES['4xl'],
            fontWeight: FONT_WEIGHTS.bold,
          }}>
          {type}
        </Text>
        <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.base }}>Your current type</Text>
      </CardBody>
    </Card>
  );
}
