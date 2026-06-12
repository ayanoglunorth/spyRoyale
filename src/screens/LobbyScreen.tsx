import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {
  Copy,
  Check,
  Users,
  Plus,
  Minus,
  ArrowLeft,
  LogIn,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { CategoryEditorModal } from '../components/CategoryEditorModal';
import { CategorySelector } from '../components/CategorySelector';
import { CustomAlertModal } from '../components/CustomAlertModal';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { ScreenLayout } from '../components/ScreenLayout';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';
import { useCategories } from '../context/CategoriesContext';
import { useSocket } from '../context/SocketContext';
import { LobbyPlayer, RoomJoinedPayload, CategoryData } from '../types/online';
import { Category } from '../data/categories';

interface LobbyScreenProps {
  navigation: any;
  route: {
    params: {
      roomCode: string;
      username: string;
      isHost: boolean;
      initialPlayers?: Array<{ id: string; name: string; isHost: boolean; isReady: boolean; isEliminated: boolean }>;
    };
  };
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ navigation, route }) => {
  const { colors } = useThemeContext();
  const { socket, isConnected } = useSocket();
  const { categories: allCategories, addCategory, updateCategory, deleteCategory } = useCategories();
  const f = theme.fontFamily;

  const { roomCode: initialCode, username, isHost, initialPlayers } = route.params;

  const [roomCode, setRoomCode] = useState(initialCode || '');
  const roomCodeRef = useRef(roomCode);
  roomCodeRef.current = roomCode;
  const [joinCode, setJoinCode] = useState('');
  const [players, setPlayers] = useState<LobbyPlayer[]>(initialPlayers || []);
  const [isInRoom, setIsInRoom] = useState(initialCode ? true : false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [pendingRole, setPendingRole] = useState<{ role: string; word: string; categoryName: string } | null>(null);
  const pendingRoleRef = useRef(pendingRole);
  pendingRoleRef.current = pendingRole;

  const [agentCount, setAgentCount] = useState(3);
  const [spyCount, setSpyCount] = useState(1);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    allCategories.map((c) => c.id)
  );
  const [editorModalVisible, setEditorModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);

  const listenerCleanups = useRef<(() => void)[]>([]);

  const cleanup = () => {
    listenerCleanups.current.forEach((fn) => fn());
    listenerCleanups.current = [];
  };

  useEffect(() => {
    if (!socket || !isConnected) return;

    const onJoined = (data: { players: LobbyPlayer[] }) => setPlayers(data.players);
    const onLeft = (data: { players: LobbyPlayer[] }) => setPlayers(data.players);
    const onError = (data: { message: string }) => setError(data.message);
    const onYourRole = (data: { role: string; word: string; categoryName: string }) => {
      setPendingRole(data);
    };
    const onReturnedToLobby = (data: { players: LobbyPlayer[] }) => {
      setPlayers(data.players);
      setIsStarting(false);
      setError('');
    };

    const onGameStarted = (data: any) => {
      cleanup();
      socket.removeAllListeners();
      navigation.replace('OnlineGame', {
        roomCode: roomCodeRef.current,
        username,
        role: pendingRoleRef.current,
      });
    };

    socket.on('player_joined', onJoined);
    socket.on('player_left', onLeft);
    socket.on('error', onError);
    socket.on('your_role', onYourRole);
    socket.on('returned_to_lobby', onReturnedToLobby);
    socket.on('game_started', onGameStarted);

    listenerCleanups.current = [
      () => socket.off('player_joined', onJoined),
      () => socket.off('player_left', onLeft),
      () => socket.off('error', onError),
      () => socket.off('your_role', onYourRole),
      () => socket.off('returned_to_lobby', onReturnedToLobby),
      () => socket.off('game_started', onGameStarted),
    ];

    return () => {
      listenerCleanups.current.forEach((fn) => fn());
      listenerCleanups.current = [];
    };
  }, [socket, isConnected, initialCode]);

  const handleJoinRoom = () => {
    if (!joinCode.trim()) {
      setError('Lütfen oda kodu girin.');
      return;
    }
    setError('');
    setIsJoining(true);

    const code = joinCode.trim().toUpperCase();

    const onRoomJoined = (data: RoomJoinedPayload) => {
      setIsJoining(false);
      setRoomCode(data.roomCode);
      setIsInRoom(true);
      setPlayers(data.players);
      socket?.off('room_joined', onRoomJoined);
      socket?.off('error', onJoinError);
    };
    const onJoinError = (data: { message: string }) => {
      setIsJoining(false);
      setError(data.message);
      socket?.off('room_joined', onRoomJoined);
      socket?.off('error', onJoinError);
    };

    socket?.on('room_joined', onRoomJoined);
    socket?.on('error', onJoinError);
    socket?.emit('join_room', { roomCode: code, username });
  };

  const handleStartGame = () => {
    setError('');
    setIsStarting(true);
    const selectedCategories = allCategories
      .filter((c) => selectedCategoryIds.includes(c.id))
      .map((c) => ({ id: c.id, name: c.name, words: c.words }));
    socket?.emit('start_game', {
      roomCode: roomCodeRef.current,
      agentCount,
      spyCount,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleLongPress = (categoryId: string) => {
    const category = allCategories.find((c) => c.id === categoryId);
    if (!category) return;
    setEditingCategory(category);
    setEditorModalVisible(true);
  };

  const handleAddNew = () => {
    setEditingCategory(undefined);
    setEditorModalVisible(true);
  };

  const handleSaveCategory = async (id: string | undefined, name: string, words: string[], icon: string) => {
    if (id) await updateCategory(id, name, words, icon);
    else await addCategory(name, words, icon);
    setEditorModalVisible(false);
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    setSelectedCategoryIds((prev) => prev.filter((cid) => cid !== id));
    setEditorModalVisible(false);
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleLeave = () => {
    setLeaveModalVisible(true);
  };

  const handleConfirmLeave = () => {
    setLeaveModalVisible(false);
    cleanup();
    socket?.disconnect();
    navigation.replace('Home');
  };

  if (!socket || !isConnected) {
    return (
      <ScreenLayout>
        <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary, fontFamily: f }]}>
            Sunucuya bağlanıyor...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleLeave} activeOpacity={0.7} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { color: colors.text, fontFamily: f }]}>
            {isHost ? 'Lobi' : isInRoom ? 'Lobi' : 'Odaya Katıl'}
          </Text>
          <View style={styles.backButton} />
        </View>

        {!isInRoom && !isHost ? (
          <View style={styles.joinContainer}>
            <View style={styles.joinCenter}>
              <Text style={[styles.joinTitle, { color: colors.text, fontFamily: f }]}>
                Oda Kodunu Gir
              </Text>
              <Text style={[styles.joinDesc, { color: colors.textSecondary, fontFamily: f }]}>
                Arkadaşının oluşturduğu odaya katılmak için kodu gir.
              </Text>

              <TextInput
                style={[
                  styles.joinCodeInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.surface,
                    borderColor: error ? colors.error : colors.border,
                    fontFamily: f,
                  },
                ]}
                value={joinCode}
                onChangeText={(text) => {
                  setJoinCode(text.toUpperCase());
                  setError('');
                }}
                placeholder="KOD"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
                maxLength={6}
              />

              {error ? (
                <Text style={[styles.errorText, { color: colors.error, fontFamily: f }]}>
                  {error}
                </Text>
              ) : null}
            </View>

            <View style={styles.joinBottom}>
              <TouchableOpacity
                style={[
                  styles.joinBottomButton,
                  { backgroundColor: colors.primary, borderBottomColor: colors.primaryDark || colors.primary },
                ]}
                onPress={handleJoinRoom}
                disabled={isJoining}
                activeOpacity={0.7}
              >
                {isJoining ? (
                  <ActivityIndicator color={colors.buttonPrimaryText} />
                ) : (
                  <>
                    <LogIn size={20} color={colors.buttonPrimaryText} />
                    <Text style={[styles.joinButtonText, { color: colors.buttonPrimaryText, fontFamily: f }]}>
                      Katıl
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {isHost && (
              <View style={styles.codeSection}>
                <Text style={[styles.codeLabel, { color: colors.textSecondary, fontFamily: f }]}>
                  Oda Kodu
                </Text>
                <View style={styles.codeDisplay}>
                  <Text style={[styles.codeText, { color: colors.text, fontFamily: f }]}>
                    {roomCode}
                  </Text>
                  <TouchableOpacity
                    style={[styles.copyButton, { backgroundColor: colors.surface }]}
                    onPress={handleCopyCode}
                    activeOpacity={0.7}
                  >
                    {copied ? (
                      <Check size={18} color="#22c55e" />
                    ) : (
                      <Copy size={18} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={[styles.codeHint, { color: colors.textSecondary, fontFamily: f }]}>
                  Bu kodu arkadaşlarınla paylaş
                </Text>
              </View>
            )}

            {isHost && (
              <View style={styles.settingsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: f }]}>
                  Oyun Ayarları
                </Text>

                <View style={styles.settingRow}>
                  <Text style={[styles.settingLabel, { color: colors.text, fontFamily: f }]}>
                    Ajan Sayısı
                  </Text>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={[styles.stepperButton, { backgroundColor: colors.surface }]}
                      onPress={() => setAgentCount(Math.max(3, agentCount - 1))}
                      activeOpacity={0.7}
                    >
                      <Minus size={18} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.stepperValue, { color: colors.text, fontFamily: f }]}>
                      {agentCount}
                    </Text>
                    <TouchableOpacity
                      style={[styles.stepperButton, { backgroundColor: colors.surface }]}
                      onPress={() => setAgentCount(Math.min(10, agentCount + 1))}
                      activeOpacity={0.7}
                    >
                      <Plus size={18} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.settingRow}>
                  <Text style={[styles.settingLabel, { color: colors.text, fontFamily: f }]}>
                    Casus Sayısı
                  </Text>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={[styles.stepperButton, { backgroundColor: colors.surface }]}
                      onPress={() => setSpyCount(Math.max(1, spyCount - 1))}
                      activeOpacity={0.7}
                    >
                      <Minus size={18} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.stepperValue, { color: colors.text, fontFamily: f }]}>
                      {spyCount}
                    </Text>
                    <TouchableOpacity
                      style={[styles.stepperButton, { backgroundColor: colors.surface }]}
                      onPress={() => setSpyCount(Math.min(agentCount - 2, spyCount + 1))}
                      activeOpacity={0.7}
                    >
                      <Plus size={18} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.settingHint, { color: colors.textSecondary, fontFamily: f }]}>
                  Toplam: {agentCount + spyCount} oyuncu
                </Text>

                <CategorySelector
                  categories={allCategories}
                  selectedIds={selectedCategoryIds}
                  onToggle={handleCategoryToggle}
                  onLongPress={handleLongPress}
                  onAddNew={handleAddNew}
                />
              </View>
            )}

            <View style={styles.playersSection}>
              <View style={styles.playersHeader}>
                <Users size={18} color={colors.textSecondary} />
                <Text style={[styles.playersTitle, { color: colors.textSecondary, fontFamily: f }]}>
                  Oyuncular ({players.length})
                </Text>
              </View>

              {players.map((player, index) => (
                <View
                  key={player.id}
                  style={[
                    styles.playerCard,
                    { backgroundColor: colors.surface },
                    player.isHost && { borderColor: colors.primary, borderWidth: 1 },
                  ]}
                >
                  <View style={styles.playerInfo}>
                    <View
                      style={[
                        styles.playerAvatar,
                        { backgroundColor: player.isHost ? colors.primary : colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.playerAvatarText,
                          { color: player.isHost ? colors.buttonPrimaryText : colors.textSecondary, fontFamily: f },
                        ]}
                      >
                        {player.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.playerName, { color: colors.text, fontFamily: f }]}>
                      {player.name}
                      {player.isHost ? ' (Host)' : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {error ? (
              <Text style={[styles.errorText, { color: colors.error, fontFamily: f }]}>
                {error}
              </Text>
            ) : null}

            {isHost && (
              <View style={styles.startSection}>
                <CustomButton
                  title={
                    isStarting
                      ? 'Başlatılıyor...'
                      : `Oyunu Başlat (${players.length}/${agentCount + spyCount})`
                  }
                  onPress={handleStartGame}
                  disabled={
                    isStarting ||
                    players.length < 4 ||
                    players.length < agentCount + spyCount
                  }
                />
                {players.length < agentCount + spyCount ? (
                  <Text style={[styles.startHint, { color: colors.textSecondary, fontFamily: f }]}>
                    En az {agentCount + spyCount} oyuncu gerekli
                  </Text>
                ) : null}
                {players.length >= agentCount + spyCount && players.length < 4 ? (
                  <Text style={[styles.startHint, { color: colors.textSecondary, fontFamily: f }]}>
                    Minimum 4 oyuncu gereklidir
                  </Text>
                ) : null}
              </View>
            )}

            {!isHost && (
              <View style={[styles.waitingSection, { backgroundColor: colors.surface }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.waitingText, { color: colors.textSecondary, fontFamily: f }]}>
                  Host oyunu başlatırken bekleyin...
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        <CategoryEditorModal
          visible={editorModalVisible}
          onClose={() => setEditorModalVisible(false)}
          category={editingCategory}
          onSave={handleSaveCategory}
          onDelete={editingCategory?.isCustom ? handleDeleteCategory : undefined}
        />

        <CustomAlertModal
          visible={leaveModalVisible}
          title="Lobiden Ayrıl"
          message="Lobiden ayrılmak istediğine emin misin?"
          buttons={[
            {
              text: 'İptal',
              style: 'cancel',
              onPress: () => setLeaveModalVisible(false),
            },
            {
              text: 'Ayrıl',
              style: 'destructive',
              onPress: handleConfirmLeave,
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  joinContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  joinCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.sm,
  },
  joinDesc: {
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  joinCodeInput: {
    width: '100%',
    height: 64,
    borderWidth: 2,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    textAlign: 'center',
    letterSpacing: 8,
  },
  joinBottom: {
    paddingBottom: theme.spacing.lg,
  },
  joinBottomButton: {
    width: '100%',
    height: 56,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderBottomWidth: 4,
  },
  joinButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  codeSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  codeLabel: {
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  codeText: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 6,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeHint: {
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.sm,
  },
  settingsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  settingLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    minWidth: 30,
    textAlign: 'center',
  },
  settingHint: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  playersSection: {
    marginBottom: theme.spacing.xl,
  },
  playersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  playersTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  playerCard: {
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
  startSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  startHint: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.sm,
  },
  waitingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.lg,
  },
  waitingText: {
    fontSize: theme.fontSize.sm,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
});
