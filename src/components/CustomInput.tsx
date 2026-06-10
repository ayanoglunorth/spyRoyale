import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  containerStyle,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useThemeContext();

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBorder,
      color: colors.inputText,
      fontFamily: theme.fontFamily,
    },
    isFocused && {
      borderColor: colors.inputBorderFocused,
      backgroundColor: colors.inputFocusedBackground,
    },
    error && { borderColor: colors.error },
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: theme.fontFamily }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={inputStyle}
        placeholderTextColor={colors.placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...textInputProps}
      />
      {error && (
        <Text style={[styles.errorText, { color: colors.error, fontFamily: theme.fontFamily }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 2,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    minHeight: 52,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
});
