import { Crosshair, Ghost, ShieldAlert, Trophy } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';
import { Player } from '../utils/gameLogic';

type EliminationPhase =
  | 'selecting'
  | 'spyCaught'
  | 'agentsWin'
  | 'spiesWin';

interface EliminationPanelProps {
  players: Player[];
  onNewGame: () => void;
}

export const EliminationPanel: React.FC<EliminationPanelProps> = ({
  players: initialPlayers,
  onNewGame,
}) => {
  const { colors } = useThemeContext();
  const f = theme.fontFamily;

  const [players, setPlayers] = useState<Player[]>(
    initialPlayers.map((p) => ({ ...p, isEliminated: false }))
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [phase, setPhase] = useState<EliminationPhase>('selecting');
  const [lastEliminatedName, setLastEliminatedName] = useState('');

  const activePlayers = players.filter((p) => !p.isEliminated);
  const activeSpies = activePlayers.filter((p) => p.role === 'spy');

  const handleEliminate = () => {
    if (!selectedPlayerId) return;

    const target = players.find((p) => p.id === selectedPlayerId);
    if (!target) return;

    setLastEliminatedName(target.name);

    if (target.role === 'agent') {
      setPhase('spiesWin');
      return;
    }

    const updatedPlayers = players.map((p) =>
      p.id === selectedPlayerId ? { ...p, isEliminated: true } : p
    );
    setPlayers(updatedPlayers);

    const remainingSpies = updatedPlayers.filter(
      (p) => p.role === 'spy' && !p.isEliminated
    );

    if (remainingSpies.length === 0) {
      setPhase('agentsWin');
    } else {
      setPhase('spyCaught');
    }

    setSelectedPlayerId(null);
  };

  const handleContinue = () => {
    setPhase('selecting');
  };

  const renderRoleSummary = () => (
    <View style={[styles.roleSummary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.roleSummaryTitle, { color: colors.text, fontFamily: f }]}>Oyuncu Rolleri</Text>
      {players.map((p) => (
        <View key={p.id} style={[styles.roleRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.roleName, { color: colors.text, fontFamily: f }]}>{p.name}</Text>
          <View
            style={[
              styles.roleBadge,
              p.role === 'spy'
                ? { backgroundColor: colors.error + '20' }
                : { backgroundColor: colors.primary + '20' },
            ]}
          >
            <Text
              style={[
                styles.roleBadgeText,
                { fontFamily: f },
                p.role === 'spy'
                  ? { color: colors.error }
                  : { color: colors.primary },
              ]}
            >
              {p.role === 'spy' ? 'SPY' : 'AGENT'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  if (phase === 'spiesWin') {
    return (
      <View style={{ height: '100%', width: '100%' }}>
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={styles.resultContainer} 
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <Ghost size={100} color={colors.error} />
          <Text style={[styles.resultTitle, { color: colors.text, fontFamily: f, marginTop: theme.spacing.lg }]}>Spy'lar Kazandı!</Text>
          <Text style={[styles.resultSubtitle, { color: colors.textSecondary, fontFamily: f }]}>
            Yanlış kişi elendi: {lastEliminatedName}
          </Text>
          {renderRoleSummary()}
          <TouchableOpacity
            style={[styles.newGameButton, { backgroundColor: colors.primary }]}
            onPress={onNewGame}
            activeOpacity={0.7}
          >
            <Text style={[styles.newGameButtonText, { color: colors.buttonPrimaryText, fontFamily: f }]}>Yeni Oyun</Text>
          </TouchableOpacity>
          <View style={{ height: 120, width: '100%' }} />
        </ScrollView>
      </View>
    );
  }

  if (phase === 'agentsWin') {
    return (
      <View style={{ height: '100%', width: '100%' }}>
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={styles.resultContainer} 
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <Trophy size={100} color={colors.success} />
          <Text style={[styles.resultTitle, { color: colors.text, fontFamily: f, marginTop: theme.spacing.lg }]}>Agent'lar Kazandı!</Text>
          <Text style={[styles.resultSubtitle, { color: colors.textSecondary, fontFamily: f }]}>Tüm Spy'lar temizlendi!</Text>
          {renderRoleSummary()}
          <TouchableOpacity
            style={[styles.newGameButton, { backgroundColor: colors.primary }]}
            onPress={onNewGame}
            activeOpacity={0.7}
          >
            <Text style={[styles.newGameButtonText, { color: colors.buttonPrimaryText, fontFamily: f }]}>Yeni Oyun</Text>
          </TouchableOpacity>
          <View style={{ height: 120, width: '100%' }} />
        </ScrollView>
      </View>
    );
  }

  if (phase === 'spyCaught') {
    return (
      <View style={{ flex: 1, width: '100%' }}>
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={styles.resultContainer} 
          showsVerticalScrollIndicator={true}
        >
          <Crosshair size={100} color={colors.warning} />
          <Text style={[styles.resultTitle, { color: colors.text, fontFamily: f, marginTop: theme.spacing.lg }]}>Bir Spy Yakalandı!</Text>
          <Text style={[styles.resultSubtitle, { color: colors.textSecondary, fontFamily: f }]}>
            {lastEliminatedName} elendi. Oyun devam ediyor!
          </Text>
          <Text style={[styles.remainingText, { color: colors.warning, fontFamily: f }]}>
            Kalan Spy: {activeSpies.length}
          </Text>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.primary }]}
            onPress={handleContinue}
            activeOpacity={0.7}
          >
            <Text style={[styles.continueButtonText, { color: colors.buttonPrimaryText, fontFamily: f }]}>Devam Et</Text>
          </TouchableOpacity>
          <View style={{ height: 100, width: '100%' }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: f }]}>Oyuncu Eleme</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: f }]}>
        Elemek istediğiniz oyuncuyu seçin
      </Text>

      <ScrollView style={styles.playerList} showsVerticalScrollIndicator={false}>
        {activePlayers.map((player) => {
          const isSelected = selectedPlayerId === player.id;
          return (
            <TouchableOpacity
              key={player.id}
              style={[
                styles.playerItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isSelected && { borderColor: colors.primary, backgroundColor: colors.surfaceLight },
              ]}
              onPress={() => setSelectedPlayerId(player.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, { borderColor: colors.textMuted }, isSelected && { borderColor: colors.primary }]}>
                {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
              </View>
              <Text
                style={[
                  styles.playerName,
                  { color: colors.text, fontFamily: f },
                  isSelected && { color: colors.primary, fontWeight: theme.fontWeight.bold },
                ]}
              >
                {player.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.eliminateButton,
          { backgroundColor: colors.error },
          !selectedPlayerId && styles.eliminateButtonDisabled,
        ]}
        onPress={handleEliminate}
        disabled={!selectedPlayerId}
        activeOpacity={0.7}
      >
        <Text style={[styles.eliminateButtonText, { fontFamily: f }]}>Ele</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.md,
  },
  playerList: {
    flex: 1,
    marginBottom: theme.spacing.md,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  playerName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  eliminateButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  eliminateButtonDisabled: {
    opacity: 0.4,
  },
  eliminateButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  resultContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 20,
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  resultTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  remainingText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xl,
  },
  roleSummary: {
    width: '100%',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
  },
  roleSummaryTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  roleName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  roleBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  roleBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  continueButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  continueButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  newGameButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  newGameButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
});
