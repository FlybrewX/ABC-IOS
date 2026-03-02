import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'accent';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  glow?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  glow = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.buttonDisabled;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'success':
        return colors.success;
      case 'danger':
        return colors.danger;
      case 'accent':
        return colors.accent;
      default:
        return colors.buttonBg;
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          minHeight: 40,
        };
      case 'large':
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xxl,
          minHeight: 64,
        };
      default:
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          minHeight: 56,
        };
    }
  };

  const bgColor = getBackgroundColor();

  const buttonStyle: ViewStyle = {
    backgroundColor: bgColor,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...getSize(),
    ...(glow && {
      shadowColor: bgColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 15,
      elevation: 10,
    }),
  };

  const labelStyle: TextStyle = {
    color: colors.buttonText,
    ...typography.bodyLarge,
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.buttonText} />
      ) : (
        <Text style={labelStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};
