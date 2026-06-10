import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Eye, EyeOff, ChevronRight } from 'lucide-react-native';
import { GameCard } from '../components/GameCard';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';
import { Player } from '../utils/gameLogic';

interface RevealScreenProps {
  players: Player[];
  onComplete: () => void;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({
  players,
  onComplete,
}) => {
  const { colors } = useThemeContext();
  const f = theme.fontFamily;

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [allRevealed, setAllRevealed] = useState(false);

  const currentPlayer = players[currentPlayerIndex];

  const handleReveal = () => {
    setIsCardVisible(true);
  };

  const handleCloseCard = () => {
    setIsCardVisible(false);
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex((prev) => prev + 1);
    } else {
      setAllRevealed(true);
    }
  };

  if (allRevealed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.completeContent}>
          <Text style={[styles.completeTitle, { color: colors.text, fontFamily: f }]}>Herkes Hazır!</Text>
          <Text style={[styles.completeSubtitle, { color: colors.textSecondary, fontFamily: f }]}>
            Tüm oyuncular kartlarını gördü.
          </Text>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.primary, borderBottomColor: colors.primaryDark }]}
            onPress={onComplete}
            activeOpacity={0.7}
          >
            <Text style={[styles.startButtonText, { color: colors.buttonPrimaryText, fontFamily: f }]}>Oyunu Başlat</Text>
            <ChevronRight size={20} color={colors.buttonPrimaryText} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: colors.textSecondary, fontFamily: f }]}>
          {currentPlayerIndex + 1} / {players.length}
        </Text>
        <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${((currentPlayerIndex + 1) / players.length) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.playerContent}>
        <Text style={[styles.playerLabel, { color: colors.textSecondary, fontFamily: f }]}>Sıradaki oyuncu:</Text>
        <Text style={[styles.playerName, { color: colors.text, fontFamily: f }]}>{currentPlayer.name}</Text>

        <TouchableOpacity
          style={[styles.revealButton, { backgroundColor: colors.primary, borderBottomColor: colors.primaryDark }]}
          onPress={handleReveal}
          activeOpacity={0.7}
        >
          <Eye size={24} color={colors.buttonPrimaryText} />
          <Text style={[styles.revealButtonText, { color: colors.buttonPrimaryText, fontFamily: f }]}>Kartını Gör</Text>
        </TouchableOpacity>

      </View>

      <GameCard
        word={currentPlayer.word}
        category={currentPlayer.categoryName}
        isVisible={isCardVisible}
        onClose={handleCloseCard}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  progressText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  playerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  playerLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.sm,
  },
  playerName: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.xl,
  },
  revealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    borderBottomWidth: 4,
  },
  revealButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  warningText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    marginTop: theme.spacing.xl,
    fontStyle: 'italic',
  },
  completeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  completeTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.md,
  },
  completeSubtitle: {
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.xl,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    borderBottomWidth: 4,
  },
  startButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
});
