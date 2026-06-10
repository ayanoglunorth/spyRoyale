import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';

import { ChevronDown } from 'lucide-react-native';
import { ScrollView } from 'react-native';

interface GameCardProps {
  word: string;
  category: string;
  isVisible: boolean;
  onClose: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  word,
  category,
  isVisible,
  onClose,
}) => {
  const { colors } = useThemeContext();
  const f = theme.fontFamily;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const [scrollable, setScrollable] = React.useState(false);
  const [atBottom, setAtBottom] = React.useState(false);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const bounce = Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 5,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(bounce).start();

    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      setAtBottom(false);
    }
  }, [isVisible, scaleAnim, opacityAnim, bounceAnim]);

  if (!isVisible) {
    return null;
  }

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.cardBackground,
      borderColor: colors.border,
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim,
    },
  ];

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setAtBottom(isCloseToBottom);
  };

  return (
    <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
      <Animated.View style={cardStyle}>
        <View style={styles.cardContent}>

          <View style={{ width: '100%', alignItems: 'center' }}>
            <View style={styles.scrollWrapper}>
              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
                nestedScrollEnabled={true}
                onContentSizeChange={(w, h) => {
                  setScrollable(h > 200);
                }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                <Text style={[styles.word, { color: colors.text, fontFamily: f }]}>{word}</Text>
              </ScrollView>
            </View>

            {scrollable && !atBottom && (
              <Animated.View style={[
                styles.scrollIndicator,
                { transform: [{ translateY: bounceAnim }] }
              ]}>
                <ChevronDown size={20} color={colors.textMuted} />
              </Animated.View>
            )}
          </View>

          <View style={[styles.categoryContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.categoryLabel, { color: colors.textSecondary, fontFamily: f }]}>Kategori:</Text>
            <Text style={[styles.category, { color: colors.primary, fontFamily: f }]}>{category}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.primary, borderBottomColor: colors.primaryDark }]} onPress={onClose}>
          <Text style={[styles.closeButtonText, { color: colors.buttonPrimaryText, fontFamily: f }]}>Kapat</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
    borderWidth: 2,
    ...theme.shadows.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  cardContent: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    flexShrink: 1,
    width: '100%',
  },
  scrollWrapper: {
    maxHeight: 200,
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  scrollContainer: {
    width: '100%',
  },
  word: {
    fontSize: 32,
    fontWeight: theme.fontWeight.bold,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  scrollIndicator: {
    alignItems: 'center',
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    height: 24,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  categoryLabel: {
    fontSize: theme.fontSize.sm,
    marginRight: theme.spacing.xs,
  },
  category: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  closeButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 4,
  },
  closeButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
});
