import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

interface AnswerItemProps {
  questionText: string;
  answer: 'agree' | 'disagree' | string;
  isLast?: boolean;
}

export function AnswerItem({ questionText, answer, isLast = false }: AnswerItemProps) {
  const isAgree = answer === 'agree';
  const iconName = isAgree ? 'checkmark-circle' : 'close-circle';
  const iconColor = isAgree ? COLORS.sage : COLORS.danger;
  const answerText = isAgree ? 'Agree' : 'Disagree';
  const textColor = isAgree ? COLORS.sage : COLORS.danger;

  return (
    <View style={{ gap: SPACING.xs, paddingBottom: isLast ? 0 : SPACING.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm }}>
        <Ionicons name={iconName} size={20} color={iconColor} style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: FONT_SIZES.sm,
              color: COLORS.warmGray,
              lineHeight: FONT_SIZES.sm * 1.5,
            }}>
            {questionText}
          </Text>
          <Text
            style={{
              fontSize: FONT_SIZES.base,
              fontWeight: FONT_WEIGHTS.semibold,
              color: textColor,
              marginTop: SPACING.xs,
            }}>
            {answerText}
          </Text>
        </View>
      </View>
      {!isLast && (
        <View
          style={{
            height: 1,
            backgroundColor: COLORS.border,
            marginTop: SPACING.md,
          }}
        />
      )}
    </View>
  );
}

interface AnswerListCardProps {
  answers: { questionText: string; answer: 'agree' | 'disagree' | string; questionId: string }[];
}

export function AnswerListCard({ answers }: AnswerListCardProps) {
  if (answers.length === 0) return null;

  return (
    <View style={{ gap: SPACING.md }}>
      <Text
        style={{
          fontSize: FONT_SIZES.xl,
          fontWeight: FONT_WEIGHTS.semibold,
          color: COLORS.softBrown,
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
            key={answer.questionId}
            questionText={answer.questionText}
            answer={answer.answer}
            isLast={index === answers.length - 1}
          />
        ))}
      </View>
    </View>
  );
}
