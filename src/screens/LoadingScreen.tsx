import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const { colors } = useThemeContext();
  const f = theme.fontFamily;

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.text, { color: colors.text, fontFamily: f }]}>Oyun hazırlanıyor...</Text>
      <Text style={[styles.brand, { color: colors.textMuted, fontFamily: f }]}>Spy Royale</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    marginTop: theme.spacing.lg,
  },
  brand: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.md,
    fontWeight: theme.fontWeight.medium,
  },
});
