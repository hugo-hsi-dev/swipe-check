import { Ionicons } from '@expo/vector-icons';
import { Text, View, Pressable, type PressableProps } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

type AnswerType = 'agree' | 'disagree';

interface AnswerButtonProps extends Omit<PressableProps, 'onPress'> {
  answer: AnswerType;
  onAnswer: (answer: AnswerType) => void;
  isDisabled?: boolean;
}

export function AnswerButton({
  answer,
  onAnswer,
  isDisabled = false,
  ...props
}: AnswerButtonProps) {

  const config = {
    agree: {
      icon: 'checkmark' as const,
      label: 'Agree',
      bgColor: COLORS.sage,
      textColor: '#FFFFFF',
      borderColor: undefined as string | undefined,
    },
    disagree: {
      icon: 'close' as const,
      label: 'Disagree',
      bgColor: COLORS.warmWhite,
      textColor: COLORS.softBrown,
      borderColor: COLORS.border,
    },
  };

  const style = config[answer];

  return (
    <Pressable
      disabled={isDisabled}
      onPress={() => onAnswer(answer)}
      style={({ pressed }) => ({
        backgroundColor: style.bgColor,
        borderRadius: RADIUS.lg,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.md,
        borderWidth: style.borderColor ? 1 : 0,
        borderColor: style.borderColor,
        opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1,
      })}
      {...props}>
      <Ionicons name={style.icon} size={24} color={style.textColor} />
      <Text
        style={{
          fontSize: FONT_SIZES.lg,
          fontWeight: FONT_WEIGHTS.semibold,
          color: style.textColor,
        }}>
        {style.label}
      </Text>
    </Pressable>
  );
}

interface AnswerButtonGroupProps {
  onAgree: () => void;
  onDisagree: () => void;
  isDisabled?: boolean;
}

export function AnswerButtonGroup({
  onAgree,
  onDisagree,
  isDisabled = false,
}: AnswerButtonGroupProps) {
  return (
    <View style={{ gap: SPACING.md }}>
      <AnswerButton answer="agree" onAnswer={onAgree} isDisabled={isDisabled} />
      <AnswerButton answer="disagree" onAnswer={onDisagree} isDisabled={isDisabled} />
    </View>
  );
}
