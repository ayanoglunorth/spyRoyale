import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';

interface ScreenLayoutProps {
  children: React.ReactNode;
  showBrand?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({ children }) => {
  const { colors, isDark } = useThemeContext();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
