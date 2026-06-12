import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Check,
  Crosshair,
  Eye,
  EyeOff,
  Ghost,
  Play,
  Pause,
  RotateCcw,
  Skull,
  Trophy,
  Users,
} from 'lucide-react-native';
import { GameCard } from '../components/GameCard';
import { CustomAlertModal } from '../components/CustomAlertModal';
import { CustomButton } from '../components/CustomButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { MyRole, VoteResultData } from '../types/online';

interface OnlineGameScreenProps {
  navigation: any;
  route: {
    params: {
      roomCode: string;
      username: string;
      role?: { role: string; word: string; categoryName: string } | null;
    };
  };
}

const COUNTDOWN_OPTIONS = [
  { label: '30s', value: 30 },
  { label: '1dk', value: 60 },
  { label: '5dk', value: 300 },
  { label: '10dk', value: 600 },
];

type GamePhase = 'reveal' | 'play' | 'vote' | 'result' | 'finished';

interface PlayerInfo {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isEliminated: boolean;
}

export const OnlineGameScreen: React.FC<OnlineGameScreenProps> = ({ navigation, route }) => {
  const { colors } = useThemeContext();
  const { socket } = useSocket();
  const f = theme.fontFamily;

  const { roomCode, username, role: initialRole } = route.params;

  const [phase, setPhase] = useState<GamePhase>('reveal');
  const [myRole, setMyRole] = useState<MyRole | null>(initialRole as MyRole | null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [cardVisible, setCardVisible] = useState(false);
  const [hasSeenCard, setHasSeenCard] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [voteTarget, setVoteTarget] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [voteTotal, setVoteTotal] = useState(0);
  const [voteResult, setVoteResult] = useState<VoteResultData | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    destructive?: boolean;
  }>({ visible: false, title: '', message: '', onConfirm: () => {} });

  const setupListeners = useCallback(() => {
    if (!socket) return;

    const handleYourRole = (data: MyRole) => {
      setMyRole(data);
    };

    const handleGameStarted = (data: { players: PlayerInfo[] }) => {
      setPlayers(data.players);
      setPhase('reveal');
    };

    const handlePlayerStatus = (data: { players: PlayerInfo[] }) => {
      setPlayers(data.players);
    };

    const handleAllReady = () => {
      setPhase('play');
    };

    const handleVoteStarted = (data: { eligiblePlayers: Array<{ id: string; name: string }> }) => {
      setVoteTarget(null);
      setHasVoted(false);
      setVoteCount(0);
      setVoteTotal(data.eligiblePlayers.length);
      setPhase('vote');
    };

    const handleVoteUpdate = (data: { count: number; total: number }) => {
      setVoteCount(data.count);
      setVoteTotal(data.total);
    };

    const handleVoteResult = (data: VoteResultData) => {
      setVoteResult(data);
      setPlayers(
        data.players.map((p) => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          isReady: false,
          isEliminated: p.isEliminated,
        }))
      );
      setPhase('result');
    };

    const handleReturnedToLobby = (data: { players: PlayerInfo[] }) => {
      setPlayers(data.players);
      navigation.replace('Lobby', {
        roomCode,
        username,
        isHost: data.players.find((p) => p.name === username)?.isHost ?? false,
        initialPlayers: data.players,
      });
    };

    const handleTimerSync = (data: { action: string; timeLeft?: number; selectedTime?: number }) => {
      switch (data.action) {
        case 'start':
          setTimeLeft(data.timeLeft ?? 0);
          setSelectedTime(data.selectedTime ?? 60);
          setIsTimerRunning(true);
          break;
        case 'pause':
          setTimeLeft(data.timeLeft ?? 0);
          setIsTimerRunning(false);
          break;
        case 'resume':
          setTimeLeft(data.timeLeft ?? 0);
          setIsTimerRunning(true);
          break;
        case 'reset':
          setTimeLeft(null);
          setIsTimerRunning(false);
          break;
      }
    };

    socket.on('your_role', handleYourRole);
    socket.on('game_started', handleGameStarted);
    socket.on('player_status', handlePlayerStatus);
    socket.on('all_ready', handleAllReady);
    socket.on('vote_started', handleVoteStarted);
    socket.on('vote_update', handleVoteUpdate);
    socket.on('vote_result', handleVoteResult);
    socket.on('returned_to_lobby', handleReturnedToLobby);
    socket.on('timer_sync', handleTimerSync);

    return () => {
      socket.off('your_role', handleYourRole);
      socket.off('game_started', handleGameStarted);
      socket.off('player_status', handlePlayerStatus);
      socket.off('all_ready', handleAllReady);
      socket.off('vote_started', handleVoteStarted);
      socket.off('vote_update', handleVoteUpdate);
      socket.off('vote_result', handleVoteResult);
      socket.off('returned_to_lobby', handleReturnedToLobby);
      socket.off('timer_sync', handleTimerSync);
    };
  }, [socket, username]);

  useEffect(() => {
    const cleanup = setupListeners();
    return cleanup;
  }, [setupListeners]);

  useEffect(() => {
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  const handleRevealCard = () => setCardVisible(true);

  const handleCloseCard = () => setCardVisible(false);

  const handleReady = () => {
    setIsReady(true);
    socket?.emit('player_ready', { roomCode });
  };

  const handleCardClose = () => {
    setCardVisible(false);
  };

  const isHost = players.find((p) => p.name === username)?.isHost ?? false;

  const handleStartTimer = () => {
    if (!isHost) return;
    setTimeLeft(selectedTime);
    setIsTimerRunning(true);
    socket?.emit('timer_action', { roomCode, action: 'start', timeLeft: selectedTime, selectedTime });
  };

  const handlePauseTimer = () => {
    if (!isHost) return;
    setIsTimerRunning(false);
    socket?.emit('timer_action', { roomCode, action: 'pause', timeLeft });
  };

  const handleResumeTimer = () => {
    if (!isHost) return;
    setIsTimerRunning(true);
    socket?.emit('timer_action', { roomCode, action: 'resume', timeLeft });
  };

  const handleResetTimer = () => {
    if (!isHost) return;
    setIsTimerRunning(false);
    setTimeLeft(null);
    socket?.emit('timer_action', { roomCode, action: 'reset' });
  };

  const handleSelectTime = (value: number) => {
    setSelectedTime(value);
    setTimeLeft(value);
  };

  const handleStartVote = () => {
    socket?.emit('start_vote', { roomCode });
  };

  const handleCastVote = () => {
    if (!voteTarget) return;
    socket?.emit('cast_vote', { roomCode, targetId: voteTarget });
    setHasVoted(true);
  };

  const handleReturnToPlay = () => {
    setVoteResult(null);
    setPhase('play');
  };

  const handleReturnToLobby = () => {
    setConfirmModal({
      visible: true,
      title: 'Lobiye Dön',
      message: 'Oyuna devam etmek için lobiye dönmek istediğine emin misin?',
      onConfirm: () => {
        socket?.emit('return_to_lobby', { roomCode });
      },
    });
  };

  const handleGoHome = () => {
    setConfirmModal({
      visible: true,
      title: 'Ana Menü',
      message: 'Ana menüye dönmek istediğine emin misin?',
      onConfirm: () => {
        socket?.disconnect();
        navigation.replace('Home');
      },
      destructive: true,
    });
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const activePlayers = players.filter((p) => !p.isEliminated);

  const renderRoleSummary = (players: VoteResultData['players']) => (
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

  const renderTimer = () => (
    <View style={styles.timerSection}>
      {timeLeft === null ? (
        isHost ? (
          <View style={styles.timerPresets}>
            {COUNTDOWN_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.timerPresetButton,
                  {
                    backgroundColor: selectedTime === opt.value ? colors.primary : colors.surface,
                  },
                ]}
                onPress={() => handleSelectTime(opt.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timerPresetText,
                    {
                      color: selectedTime === opt.value ? colors.buttonPrimaryText : colors.text,
                      fontFamily: f,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.timerControls}>
              <TouchableOpacity
                style={[styles.timerControl, { backgroundColor: colors.primary }]}
                onPress={handleStartTimer}
                activeOpacity={0.7}
              >
                <Play size={18} color={colors.buttonPrimaryText} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timerControl, { backgroundColor: colors.surface }]}
                onPress={handleResetTimer}
                activeOpacity={0.7}
              >
                <RotateCcw size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null
      ) : (
        <View style={styles.timerDisplay}>
          <Text
            style={[
              styles.timerText,
              {
                color: timeLeft <= 10 ? colors.error : colors.text,
                fontFamily: f,
              },
            ]}
          >
            {formatTime(timeLeft)}
          </Text>
          {isHost && (
            <View style={styles.timerControls}>
              {!isTimerRunning ? (
                <TouchableOpacity
                  style={[styles.timerControl, { backgroundColor: colors.primary }]}
                  onPress={handleResumeTimer}
                  activeOpacity={0.7}
                >
                  <Play size={18} color={colors.buttonPrimaryText} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.timerControl, { backgroundColor: colors.warning || '#f59e0b' }]}
                  onPress={handlePauseTimer}
                  activeOpacity={0.7}
                >
                  <Pause size={18} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.timerControl, { backgroundColor: colors.surface }]}
                onPress={handleResetTimer}
                activeOpacity={0.7}
              >
                <RotateCcw size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <ScreenLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* REVEAL PHASE */}
        {phase === 'reveal' && (
          <View style={styles.phaseContainer}>
            {!myRole ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary, fontFamily: f }]}>
                  Rolünüz yükleniyor...
                </Text>
              </View>
            ) : (
              <View style={styles.revealContent}>
                {!hasSeenCard && !isReady ? (
                  <>
                    <Text style={[styles.revealTitle, { color: colors.text, fontFamily: f }]}>
                      Sıra Sende
                    </Text>
                    <Text style={[styles.revealDesc, { color: colors.textSecondary, fontFamily: f }]}>
                      Kartını görmek için butona bas. Kimseye gösterme!
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.revealButton,
                        { backgroundColor: colors.primary, borderBottomColor: colors.primaryDark || colors.primary },
                      ]}
                      onPress={handleRevealCard}
                      activeOpacity={0.7}
                    >
                      <Eye size={24} color={colors.buttonPrimaryText} />
                      <Text style={[styles.revealButtonText, { color: colors.buttonPrimaryText, fontFamily: f }]}>
                        Kartını Gör
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : hasSeenCard && !isReady ? (
                  <>
                    <Text style={[styles.revealTitle, { color: colors.text, fontFamily: f }]}>
                      Kartını Gördün mü?
                    </Text>
                    <Text style={[styles.revealDesc, { color: colors.textSecondary, fontFamily: f }]}>
                      Tekrar görmek istersen butona basabilirsin. Hazırsan devam et.
                    </Text>

                    <View style={styles.readyButtons}>
                      <TouchableOpacity
                        style={[
                          styles.revealButton,
                          { backgroundColor: colors.surface, borderBottomColor: colors.border },
                        ]}
                        onPress={handleRevealCard}
                        activeOpacity={0.7}
                      >
                        <EyeOff size={20} color={colors.text} />
                        <Text style={[styles.revealButtonText, { color: colors.text, fontFamily: f }]}>
                          Tekrar Gör
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.revealButton,
                          { backgroundColor: colors.primary, borderBottomColor: colors.primaryDark || colors.primary },
                        ]}
                        onPress={handleReady}
                        activeOpacity={0.7}
                      >
                        <Check size={20} color={colors.buttonPrimaryText} />
                        <Text style={[styles.revealButtonText, { color: colors.buttonPrimaryText, fontFamily: f }]}>
                          Gördüm, Hazırım
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View style={styles.waitingContent}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.waitingText, { color: colors.textSecondary, fontFamily: f }]}>
                      Diğer oyuncular bekleniyor...
                    </Text>
                    <View style={styles.readyList}>
                      {players.map((p) => (
                        <View key={p.id} style={styles.readyRow}>
                          <Text style={[styles.readyName, { color: colors.text, fontFamily: f }]}>
                            {p.name}
                          </Text>
                          {p.isReady ? (
                            <Check size={16} color="#22c55e" />
                          ) : (
                            <View style={[styles.readyDot, { backgroundColor: colors.border }]} />
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <GameCard
                  word={myRole?.word || ''}
                  category={myRole?.categoryName || ''}
                  isVisible={cardVisible}
                  onClose={() => {
                    setCardVisible(false);
                    setHasSeenCard(true);
                  }}
                />
              </View>
            )}
          </View>
        )}

        {/* PLAY PHASE */}
        {phase === 'play' && (
          <ScrollView contentContainerStyle={styles.phaseScrollContent}>
            <Text style={[styles.phaseTitle, { color: colors.text, fontFamily: f }]}>
              Tartışma Aşaması
            </Text>
            <Text style={[styles.phaseDesc, { color: colors.textSecondary, fontFamily: f }]}>
              Kelimeni kimseye söyleme! Casusu bulmaya çalışın.
            </Text>

            {renderTimer()}

            <View style={styles.activePlayers}>
              <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: f }]}>
                Oyuncular ({activePlayers.length}/{players.length})
              </Text>
              {activePlayers.map((p) => (
                <View
                  key={p.id}
                  style={[styles.activePlayerCard, { backgroundColor: colors.surface }]}
                >
                  <View style={styles.playerInfo}>
                    <View style={[styles.playerAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.playerAvatarText, { color: colors.buttonPrimaryText, fontFamily: f }]}>
                        {p.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.playerName, { color: colors.text, fontFamily: f }]}>
                      {p.name}
                    </Text>
                  </View>
                </View>
              ))}

              {players.filter((p) => p.isEliminated).length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontFamily: f, marginTop: theme.spacing.lg }]}>
                    Elenenler
                  </Text>
                  {players
                    .filter((p) => p.isEliminated)
                    .map((p) => (
                      <View
                        key={p.id}
                        style={[styles.eliminatedCard, { backgroundColor: colors.surface }]}
                      >
                        <Skull size={16} color={colors.textSecondary} />
                        <Text style={[styles.eliminatedName, { color: colors.textSecondary, fontFamily: f }]}>
                          {p.name}
                        </Text>
                      </View>
                    ))}
                </>
              )}
            </View>

            {players.find((p) => p.name === username)?.isHost && (
              <View style={styles.hostActions}>
                <CustomButton
                  title="Oylama Başlat"
                  onPress={handleStartVote}
                />
              </View>
            )}
          </ScrollView>
        )}

        {/* VOTE PHASE */}
        {phase === 'vote' && (
          <View style={styles.phaseContainer}>
            <Text style={[styles.phaseTitle, { color: colors.text, fontFamily: f }]}>
              Oylama
            </Text>
            <Text style={[styles.phaseDesc, { color: colors.textSecondary, fontFamily: f }]}>
              {hasVoted
                ? `Oy kullanıldı (${voteCount}/${voteTotal})`
                : 'Kimi eleyeceğinizi seçin:'}
            </Text>

            {hasVoted ? (
              <View style={styles.votedContent}>
                <Check size={48} color="#22c55e" />
                <Text style={[styles.votedText, { color: colors.text, fontFamily: f }]}>
                  Oy verildi!
                </Text>
                <Text style={[styles.votedSubtext, { color: colors.textSecondary, fontFamily: f }]}>
                  {voteCount}/{voteTotal} oy kullanıldı
                </Text>
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ marginTop: theme.spacing.lg }}
                />
              </View>
            ) : (
              <ScrollView style={styles.voteList}>
                {activePlayers
                  .filter((p) => p.name !== username)
                  .map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.voteCard,
                        {
                          backgroundColor: voteTarget === p.id ? colors.primary : colors.surface,
                        },
                      ]}
                      onPress={() => setVoteTarget(p.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.voteCardName,
                          {
                            color: voteTarget === p.id ? colors.buttonPrimaryText : colors.text,
                            fontFamily: f,
                          },
                        ]}
                      >
                        {p.name}
                      </Text>
                      {voteTarget === p.id && (
                        <Check size={20} color={colors.buttonPrimaryText} />
                      )}
                    </TouchableOpacity>
                  ))}

                <CustomButton
                  title="Oy Ver"
                  onPress={handleCastVote}
                  disabled={!voteTarget}
                />
              </ScrollView>
            )}
          </View>
        )}

        {/* RESULT PHASE */}
        {phase === 'result' && voteResult && (
          <View style={styles.phaseContainer}>
            <ScrollView contentContainerStyle={styles.resultScrollContent}>
              {voteResult.gameOver ? (
                voteResult.winner === 'spies' ? (
                  <>
                    <Ghost size={100} color={colors.error} />
                    <Text style={[styles.resultTitle, { color: colors.text, fontFamily: f, marginTop: theme.spacing.lg }]}>
                      Spylar Kazandı!
                    </Text>
                    <Text style={[styles.resultSubtitle, { color: colors.textSecondary, fontFamily: f }]}>
                      Yanlış kişi elendi: {voteResult.eliminatedPlayer.name}
                    </Text>
                    {renderRoleSummary(voteResult.players)}
                    <View style={styles.gameOverActions}>
                      <CustomButton
                        title="Lobiye Dön"
                        onPress={handleReturnToLobby}
                      />
                      <TouchableOpacity
                        onPress={handleGoHome}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.homeLink, { color: colors.textSecondary, fontFamily: f }]}>
                          Ana Menü
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Trophy size={100} color={colors.success} />
                    <Text style={[styles.resultTitle, { color: colors.text, fontFamily: f, marginTop: theme.spacing.lg }]}>
                      Agentlar Kazandı!
                    </Text>
                    <Text style={[styles.resultSubtitle, { color: colors.textSecondary, fontFamily: f }]}>
                      Tüm Spylar temizlendi!
                    </Text>
                    {renderRoleSummary(voteResult.players)}
                    <View style={styles.gameOverActions}>
                      <CustomButton
                        title="Lobiye Dön"
                        onPress={handleReturnToLobby}
                      />
                      <TouchableOpacity
                        onPress={handleGoHome}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.homeLink, { color: colors.textSecondary, fontFamily: f }]}>
                          Ana Menü
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )
              ) : (
                <>
                  <Crosshair size={100} color={colors.warning} />
                  <Text style={[styles.resultTitle, { color: colors.text, fontFamily: f, marginTop: theme.spacing.lg }]}>
                    Bir Spy Yakalandı!
                  </Text>
                  <Text style={[styles.resultSubtitle, { color: colors.textSecondary, fontFamily: f }]}>
                    {voteResult.eliminatedPlayer.name} elendi. Oyun devam ediyor!
                  </Text>
                  <CustomButton
                    title="Devam"
                    onPress={handleReturnToPlay}
                  />
                </>
              )}
            </ScrollView>
          </View>
        )}

        {/* FINISHED PHASE (fallback, though game over is handled in result) */}
        {phase === 'finished' && voteResult && (
          <View style={styles.phaseContainer}>
            <ScrollView contentContainerStyle={styles.resultScrollContent}>
              {voteResult.winner === 'spies' ? (
                <>
                  <Ghost size={100} color={colors.error} />
                  <Text style={[styles.resultTitle, { color: colors.text, fontFamily: f, marginTop: theme.spacing.lg }]}>
                    Spylar Kazandı!
                  </Text>
                  <Text style={[styles.resultSubtitle, { color: colors.textSecondary, fontFamily: f }]}>
                    Yanlış kişi elendi: {voteResult.eliminatedPlayer.name}
                  </Text>
                  {renderRoleSummary(voteResult.players)}
                  <View style={styles.gameOverActions}>
                    <CustomButton
                      title="Lobiye Dön"
                      onPress={handleReturnToLobby}
                    />
                    <TouchableOpacity
                      onPress={handleGoHome}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.homeLink, { color: colors.textSecondary, fontFamily: f }]}>
                        Ana Menü
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Trophy size={100} color={colors.success} />
                  <Text style={[styles.resultTitle, { color: colors.text, fontFamily: f, marginTop: theme.spacing.lg }]}>
                    Agentlar Kazandı!
                  </Text>
                  <Text style={[styles.resultSubtitle, { color: colors.textSecondary, fontFamily: f }]}>
                    Tüm Spylar temizlendi!
                  </Text>
                  {renderRoleSummary(voteResult.players)}
                  <View style={styles.gameOverActions}>
                    <CustomButton
                      title="Lobiye Dön"
                      onPress={handleReturnToLobby}
                    />
                    <TouchableOpacity
                      onPress={handleGoHome}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.homeLink, { color: colors.textSecondary, fontFamily: f }]}>
                        Ana Menü
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        )}

        <CustomAlertModal
          visible={confirmModal.visible}
          title={confirmModal.title}
          message={confirmModal.message}
          buttons={[
            {
              text: 'İptal',
              style: 'cancel',
              onPress: () => setConfirmModal({ ...confirmModal, visible: false }),
            },
            {
              text: 'Evet',
              style: confirmModal.destructive ? 'destructive' : 'default',
              onPress: () => {
                const action = confirmModal.onConfirm;
                setConfirmModal({ ...confirmModal, visible: false });
                action();
              },
            },
          ]}
        />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  phaseContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseScrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  phaseTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  phaseDesc: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.md,
  },
  revealContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  revealTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.sm,
  },
  revealDesc: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
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
  readyButtons: {
    flexDirection: 'column',
    gap: theme.spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  waitingContent: {
    alignItems: 'center',
    width: '100%',
  },
  waitingText: {
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  readyList: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  readyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  readyName: {
    fontSize: theme.fontSize.md,
  },
  readyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timerSection: {
    marginBottom: theme.spacing.lg,
  },
  timerPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  timerPresetButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  timerPresetText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  timerControls: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    justifyContent: 'center',
  },
  timerControl: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerDisplay: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    fontVariant: ['tabular-nums'],
    marginBottom: theme.spacing.sm,
  },
  activePlayers: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.sm,
  },
  activePlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  playerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerAvatarText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  playerName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  eliminatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    opacity: 0.6,
  },
  eliminatedName: {
    fontSize: theme.fontSize.md,
    textDecorationLine: 'line-through',
  },
  hostActions: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  voteList: {
    flex: 1,
    width: '100%',
    gap: theme.spacing.sm,
  },
  voteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  voteCardName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  votedContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  votedText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    marginTop: theme.spacing.md,
  },
  votedSubtext: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  resultScrollContent: {
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
  roleBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  roleBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
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
  gameOverActions: {
    alignItems: 'center',
    gap: theme.spacing.md,
    width: '100%',
  },
  homeLink: {
    fontSize: theme.fontSize.md,
    textDecorationLine: 'underline',
    paddingVertical: theme.spacing.sm,
  },
});
