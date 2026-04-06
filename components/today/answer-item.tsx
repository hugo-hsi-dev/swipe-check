import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

interface AnswerItemProps {
  answer: 'agree' | 'disagree' | string;
  isLast?: boolean;
  questionText: string;
}

interface AnswerListCardProps {
  answers: { answer: 'agree' | 'disagree' | string; questionId: string; questionText: string; }[];
}

export function AnswerItem({ answer, isLast = false, questionText }: AnswerItemProps) {
  const isAgree = answer === 'agree';
  const iconName = isAgree ? 'checkmark-circle' : 'close-circle';
  const iconColor = isAgree ? COLORS.sage : COLORS.danger;
  const answerText = isAgree ? 'Agree' : 'Disagree';
  const textColor = isAgree ? COLORS.sage : COLORS.danger;

  return (
    <View style={{ gap: SPACING.xs, paddingBottom: isLast ? 0 : SPACING.md }}>
      <View style={{ alignItems: 'flex-start', flexDirection: 'row', gap: SPACING.sm }}>
        <Ionicons color={iconColor} name={iconName} size={20} style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: COLORS.warmGray,
              fontSize: FONT_SIZES.sm,
              lineHeight: FONT_SIZES.sm * 1.5,
            }}>
            {questionText}
          </Text>
          <Text
            style={{
              color: textColor,
              fontSize: FONT_SIZES.base,
              fontWeight: FONT_WEIGHTS.semibold,
              marginTop: SPACING.xs,
            }}>
            {answerText}
          </Text>
        </View>
      </View>
      {!isLast && (
        <View
          style={{
            backgroundColor: COLORS.border,
            height: 1,
            marginTop: SPACING.md,
          }}
        />
      )}
    </View>
  );
}

export function AnswerListCard({ answers }: AnswerListCardProps) {
  if (answers.length === 0) return null;

  return (
    <View style={{ gap: SPACING.md }}>
      <Text
        style={{
          color: COLORS.softBrown,
          fontSize: FONT_SIZES.xl,
          fontWeight: FONT_WEIGHTS.semibold,
        }}>
        Today&apos;s Reflections
      </Text>
      <View
        style={{
          backgroundColor: COLORS.warmWhite,
          borderRadius: 24,
          padding: SPACING.xl,
        }}>
        {answers.map((answer, index) => (
          <AnswerItem
            answer={answer.answer}
            isLast={index === answers.length - 1}
            key={answer.questionId}
            questionText={answer.questionText}
          />
        ))}
      </View>
    </View>
  );
}
