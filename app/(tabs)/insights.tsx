import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

import { Card, CardBody, CardHeader } from '@/components/ui/card';

import { AxisBar } from '@/components/insights/chart-card';
import { useInsightsData } from '@/hooks/use-insights-data';
import { AXES } from '@/constants/questions';
import { TypeTrendSection } from '@/components/insights/type-trend-section';
import type { AxisStrength } from '@/constants/scoring-contract';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

function TypeHero({ type }: { type: string }) {
  return (
    <Card variant="terracotta">
      <CardBody style={{ alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING['3xl'] }}>
        <Text
          style={{
            fontSize: FONT_SIZES['4xl'],
            fontWeight: FONT_WEIGHTS.bold,
            color: COLORS.softBrown,
          }}>
          {type}
        </Text>
        <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.warmGray }}>Your current type</Text>
      </CardBody>
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

  return (
    <Card>
      <CardBody gap="md">
        <AxisBar
          axisId={axisId}
          poleA={{ id: axis.poleA.id, label: axis.poleA.label }}
          poleB={{ id: axis.poleB.id, label: axis.poleB.label }}
          strength={axisStrength.strength}
          dominantPoleId={axisStrength.dominantPoleId}
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
            fontSize: FONT_SIZES.xs,
            color: COLORS.warmGray,
            textAlign: 'center',
            lineHeight: FONT_SIZES.xs * 1.5,
          }}>
          This assessment is for self-reflection purposes only. It is not affiliated
          with or endorsed by MBTI, CAPT, or any official personality typing system.
        </Text>
      </CardBody>
    </Card>
  );
}

export default function InsightsScreen() {
  const state = useInsightsData();

  if (state.status === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.cream,
        }}>
        <Text style={{ color: COLORS.softBrown }}>Loading...</Text>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.cream }}
        contentContainerStyle={{
          padding: SPACING.xl,
          paddingTop: SPACING['3xl'],
          paddingBottom: SPACING['2xl'],
          gap: SPACING.lg,
        }}>
        <Card>
          <CardHeader>
            <Text
              style={{
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
                color: COLORS.softBrown,
              }}>
              Insights
            </Text>
          </CardHeader>
        </Card>

        <Card variant="default">
          <CardBody style={{ alignItems: 'center', gap: SPACING.lg, paddingVertical: SPACING['3xl'] }}>
            <View
              style={{
                width: 64,
                height: 64,
                backgroundColor: COLORS.cream,
                borderRadius: 9999,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name="alert-circle-outline" size={28} color={COLORS.softBrown} />
            </View>
            <Text style={{ textAlign: 'center', color: COLORS.warmGray }}>
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
        style={{ flex: 1, backgroundColor: COLORS.cream }}
        contentContainerStyle={{
          padding: SPACING.xl,
          paddingTop: SPACING['3xl'],
          paddingBottom: SPACING['2xl'],
          gap: SPACING.lg,
        }}>
        <Card>
          <CardHeader>
            <Text
              style={{
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
                color: COLORS.softBrown,
              }}>
              Insights
            </Text>
          </CardHeader>
        </Card>

        <Card>
          <CardBody style={{ alignItems: 'center', gap: SPACING.lg, paddingVertical: SPACING['3xl'] }}>
            <View
              style={{
                width: 64,
                height: 64,
                backgroundColor: COLORS.cream,
                borderRadius: 9999,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name="analytics-outline" size={28} color={COLORS.softBrown} />
            </View>
            <Text style={{ textAlign: 'center', color: COLORS.warmGray }}>
              Complete onboarding to see your personality insights.
            </Text>
          </CardBody>
        </Card>
      </ScrollView>
    );
  }

  if (state.status === 'sparse') {
    const { latestType, latestSnapshot, history } = state;
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.cream }}
        contentContainerStyle={{
          padding: SPACING.xl,
          paddingTop: SPACING['3xl'],
          paddingBottom: SPACING['2xl'],
          gap: SPACING.lg,
        }}>
        <Card>
          <CardHeader>
            <Text
              style={{
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
                color: COLORS.softBrown,
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
                fontSize: FONT_SIZES.sm,
                fontWeight: FONT_WEIGHTS.medium,
                color: COLORS.coral,
              }}>
              Limited history
            </Text>
            <Text
              style={{
                fontSize: FONT_SIZES.xs,
                color: COLORS.warmGray,
                textAlign: 'center',
                lineHeight: FONT_SIZES.xs * 1.5,
              }}>
              Complete more assessments to unlock trend tracking and richer insights.
            </Text>
          </CardBody>
        </Card>

        <TypeTrendSection latestType={latestType} history={history} />

        {latestSnapshot?.axisStrengths.map((strength) => (
          <AxisStrengthCard key={strength.axisId} axisId={strength.axisId} strength={strength} />
        ))}

        <MBTIDisclaimer />
      </ScrollView>
    );
  }

  const { latestType, latestSnapshot, history } = state;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.cream }}
      contentContainerStyle={{
        padding: SPACING.xl,
        paddingTop: SPACING['3xl'],
        paddingBottom: SPACING['2xl'],
        gap: SPACING.lg,
      }}>
      <Card>
        <CardHeader>
          <Text
            style={{
              fontSize: FONT_SIZES['2xl'],
              fontWeight: FONT_WEIGHTS.bold,
              color: COLORS.softBrown,
            }}>
            Insights
          </Text>
        </CardHeader>
      </Card>

      <TypeHero type={latestType} />

      <TypeTrendSection latestType={latestType} history={history} />

      {latestSnapshot?.axisStrengths.map((strength) => (
        <AxisStrengthCard key={strength.axisId} axisId={strength.axisId} strength={strength} />
      ))}

      <MBTIDisclaimer />
    </ScrollView>
  );
}
