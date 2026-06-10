import AsyncStorage from '@react-native-async-storage/async-storage';
import { Crosshair, Gamepad2, Timer } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { CustomButton } from '../components/CustomButton';
import { EliminationPanel } from '../components/EliminationPanel';
import { ScreenLayout } from '../components/ScreenLayout';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';
import { GameState } from '../utils/gameLogic';

interface DashboardScreenProps {
  onNewGame: () => void;
  gameState?: GameState;
  lastConfig?: {
    agentCount: number;
    spyCount: number;
    categoryIds: string[];
  };
}

const COUNTDOWN_OPTIONS = [
  { label: '30 Saniye', value: 30 },
  { label: '1 Dakika', value: 60 },
  { label: '5 Dakika', value: 300 },
  { label: '10 Dakika', value: 600 },
];

const STORAGE_KEY_TIMER = '@spyroyale:lastTimer';

type TabType = 'timer' | 'elimination';

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNewGame, lastConfig, gameState }) => {
  const { colors } = useThemeContext();
  const f = theme.fontFamily;

  const [selectedTime, setSelectedTime] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isNewGameModalVisible, setIsNewGameModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('elimination');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const loadLastTimer = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_TIMER);
        if (stored) {
          setSelectedTime(parseInt(stored, 10));
        }
      } catch (e) {}
    };
    loadLastTimer();
  }, []);

  useEffect(() => {
    const saveTimer = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_TIMER, selectedTime.toString());
      } catch (e) {}
    };
    saveTimer();
  }, [selectedTime]);

  useEffect(() => {
    if (isRunning && timeLeft !== null) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleStartTimer = () => {
    if (timeLeft === null) {
      setTimeLeft(selectedTime);
    }
    setIsRunning(true);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(selectedTime);
  };

  const handleNewGameClick = () => {
    setIsNewGameModalVisible(true);
  };

  const handleConfirmNewGame = () => {
    setIsNewGameModalVisible(false);
    onNewGame();
  };

  const handleCancelNewGame = () => {
    setIsNewGameModalVisible(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isWeb = Platform.OS === 'web';

  const rootContainerStyle = isWeb
    ? {
        position: 'absolute' as 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        overflow: 'hidden' as 'hidden'
      }
    : { flex: 1, backgroundColor: colors.background };

  return (
    <ScreenLayout>
      <View style={rootContainerStyle}>
        <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: f }]}>Oyun Paneli</Text>
        </View>

        <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'elimination' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('elimination')}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Crosshair size={16} color={activeTab === 'elimination' ? colors.buttonPrimaryText : colors.textSecondary} />
              <Text style={[styles.tabText, { color: colors.textSecondary, fontFamily: f }, activeTab === 'elimination' && { color: colors.buttonPrimaryText }]}>
                Eleme
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'timer' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('timer')}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Timer size={16} color={activeTab === 'timer' ? colors.buttonPrimaryText : colors.textSecondary} />
              <Text style={[styles.tabText, { color: colors.textSecondary, fontFamily: f }, activeTab === 'timer' && { color: colors.buttonPrimaryText }]}>
                Sayaç
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {activeTab === 'timer' ? (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: f }]}>Geri Sayım Sayacı</Text>

              <View style={[styles.timerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {timeLeft !== null ? (
                  <View style={styles.timerDisplay}>
                    <Text style={[
                      styles.timerText,
                      { color: colors.primary, fontFamily: f },
                      timeLeft <= 10 && { color: colors.warning },
                      timeLeft === 0 && { color: colors.error }
                    ]}>
                      {formatTime(timeLeft)}
                    </Text>
                    {timeLeft === 0 && (
                      <Text style={[styles.timerAlert, { color: colors.error, fontFamily: f }]}>Süre Doldu!</Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.timerDisplay}>
                    <Text style={[styles.timerTextPlaceholder, { color: colors.textMuted, fontFamily: f }]}>
                      {formatTime(selectedTime)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.timerControls}>
                {!isRunning && timeLeft === null && (
                  <CustomButton title="Başlat" onPress={handleStartTimer} />
                )}
                {isRunning && (
                  <>
                    <CustomButton
                      title="Duraklat"
                      onPress={handlePauseTimer}
                      style={{ backgroundColor: colors.warning }}
                      textStyle={{ color: '#000000' }}
                    />
                    <View style={styles.spacer} />
                    <CustomButton
                      title="Sıfırla"
                      onPress={handleResetTimer}
                      variant="secondary"
                    />
                  </>
                )}
                {timeLeft !== null && !isRunning && (
                  <>
                    <CustomButton title="Başlat" onPress={handleStartTimer} />
                    <View style={styles.spacer} />
                    <CustomButton title="Sıfırla" onPress={handleResetTimer} variant="secondary" />
                  </>
                )}
              </View>

              <View style={styles.pickerContainer}>
                <Text style={[styles.pickerLabel, { color: colors.textSecondary, fontFamily: f }]}>Süre Seçin:</Text>
                <View style={styles.pickerWrapper}>
                  {COUNTDOWN_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.pickerOption,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        selectedTime === option.value && { borderColor: colors.primary, backgroundColor: colors.surfaceLight }
                      ]}
                      onPress={() => {
                        setSelectedTime(option.value);
                        setIsRunning(false);
                        setTimeLeft(option.value);
                      }}
                      disabled={isRunning}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        { color: colors.textSecondary, fontFamily: f },
                        selectedTime === option.value && { color: colors.primary, fontWeight: theme.fontWeight.semibold }
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <CustomButton
                title="Yeni Oyun"
                onPress={handleNewGameClick}
                variant="primary"
              />
            </View>
          </>
        ) : (
          <View style={styles.eliminationContainer}>
            {gameState ? (
              <EliminationPanel
                players={gameState.players}
                onNewGame={onNewGame}
              />
            ) : (
              <View style={styles.noGameState}>
                <Gamepad2 size={48} color={colors.textMuted} />
                <Text style={[styles.noGameStateText, { color: colors.textSecondary, fontFamily: f }]}>
                  Eleme sistemi için aktif bir oyun gereklidir.
                </Text>
                <CustomButton title="Yeni Oyun Başlat" onPress={onNewGame} />
              </View>
            )}
          </View>
        )}
      </View>
      </View>

      <Modal
        visible={isNewGameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelNewGame}
      >
        <TouchableWithoutFeedback onPress={handleCancelNewGame}>
          <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: colors.modalBackground, borderColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text, fontFamily: f }]}>Yeni Oyun</Text>
                <Text style={[styles.modalDescription, { color: colors.textSecondary, fontFamily: f }]}>
                  Mevcut oyun sonlandırılacak. Emin misiniz?
                </Text>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalCancelButton, { borderColor: colors.border }]}
                    onPress={handleCancelNewGame}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalCancelButtonText, { color: colors.textSecondary, fontFamily: f }]}>İptal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalConfirmButton, { backgroundColor: colors.success }]}
                    onPress={handleConfirmNewGame}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalConfirmButtonText, { color: '#FFFFFF', fontFamily: f }]}>Evet</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  tabText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  timerContainer: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
  },
  timerDisplay: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
  },
  timerTextPlaceholder: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
  },
  timerAlert: {
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  timerControls: {
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    width: theme.spacing.md,
  },
  pickerContainer: {
    marginTop: theme.spacing.md,
  },
  pickerLabel: {
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.sm,
  },
  pickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  pickerOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  pickerOptionText: {
    fontSize: theme.fontSize.sm,
  },
  eliminationContainer: {
    flex: 1,
  },
  noGameState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  noGameStateText: {
    fontSize: theme.fontSize.md,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '90%',
    maxWidth: 400,
    borderWidth: 2,
    ...theme.shadows.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: theme.fontSize.md,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  modalConfirmButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
});
