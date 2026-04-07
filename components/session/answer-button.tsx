import { Ionicons } from '@expo/vector-icons';
import { Pressable, type PressableProps, Text, View } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

interface AnswerButtonGroupProps {
  isDisabled?: boolean;
  onAgree: () => void;
  onDisagree: () => void;
}

interface AnswerButtonProps extends Omit<PressableProps, 'onPress'> {
  answer: AnswerType;
  isDisabled?: boolean;
  onAnswer: (answer: AnswerType) => void;
}

type AnswerType = 'agree' | 'disagree';

export function AnswerButton({
  answer,
  isDisabled = false,
  onAnswer,
  ...props
}: AnswerButtonProps) {

  const config = {
    agree: {
      bgColor: COLORS.sage,
      borderColor: undefined as string | undefined,
      icon: 'checkmark' as const,
      label: 'Agree',
      textColor: '#FFFFFF',
    },
    disagree: {
      bgColor: COLORS.warmWhite,
      borderColor: COLORS.border,
      icon: 'close' as const,
      label: 'Disagree',
      textColor: COLORS.softBrown,
    },
  };

  const style = config[answer];

  return (
    <Pressable
      accessibilityLabel={style.label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={() => onAnswer(answer)}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: style.bgColor,
        borderColor: style.borderColor,
        borderRadius: RADIUS.lg,
        borderWidth: style.borderColor ? 1 : 0,
        flexDirection: 'row',
        gap: SPACING.md,
        justifyContent: 'center',
        opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
      })}
      {...props}>
      <Ionicons color={style.textColor} name={style.icon} size={24} />
      <Text
        style={{
          color: style.textColor,
          fontSize: FONT_SIZES.lg,
          fontWeight: FONT_WEIGHTS.semibold,
        }}>
        {style.label}
      </Text>
    </Pressable>
  );
}

export function AnswerButtonGroup({
  isDisabled = false,
  onAgree,
  onDisagree,
}: AnswerButtonGroupProps) {
  return (
    <View style={{ gap: SPACING.md }}>
      <AnswerButton answer="agree" isDisabled={isDisabled} onAnswer={onAgree} />
      <AnswerButton answer="disagree" isDisabled={isDisabled} onAnswer={onDisagree} />
    </View>
  );
}
