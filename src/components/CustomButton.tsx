import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle: customTextStyle,
}) => {
  const { colors } = useThemeContext();

  const buttonStyle = [
    styles.button,
    { fontFamily: theme.fontFamily },
    variant === 'primary' && { backgroundColor: colors.buttonPrimary, borderBottomColor: colors.buttonPrimaryBorder },
    variant === 'secondary' && { backgroundColor: colors.buttonSecondary, borderWidth: 2, borderColor: colors.border, borderBottomColor: colors.buttonSecondaryBorder },
    variant === 'danger' && { backgroundColor: colors.buttonDanger, borderBottomColor: colors.buttonDangerBorder },
    (disabled || loading) && styles.buttonDisabled,
    style,
  ];

  const textStyleArr = [
    styles.text,
    { fontFamily: theme.fontFamily },
    variant === 'primary' && { color: colors.buttonPrimaryText },
    variant === 'secondary' && { color: colors.buttonSecondaryText },
    variant === 'danger' && { color: colors.buttonDangerText },
    (disabled || loading) && styles.textDisabled,
    customTextStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.buttonPrimaryText : colors.text}
          size="small"
        />
      ) : (
        <Text style={textStyleArr}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderBottomWidth: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  textDisabled: {
    opacity: 0.7,
  },
});
