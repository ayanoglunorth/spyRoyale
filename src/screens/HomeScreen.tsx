import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { Users, Wifi, WifiOff, Gamepad2 } from 'lucide-react-native';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { RoomCreatedPayload } from '../types/online';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors } = useThemeContext();
  const { socket, socketRef, isConnected, connect } = useSocket();
  const f = theme.fontFamily;

  const [username, setUsername] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const getSocket = () => socketRef.current;

  useEffect(() => {
    return () => {
      getSocket()?.removeAllListeners();
    };
  }, []);

  const doCreateRoom = (s: typeof socket) => {
    if (!s) return;
    s.removeAllListeners();

    s.emit('create_room', {
      username: username.trim(),
      agentCount: 3,
      spyCount: 1,
      categories: [],
    });

    s.on('room_created', (data: RoomCreatedPayload) => {
      setIsCreating(false);
      s.removeAllListeners();
      navigation.replace('Lobby', {
        roomCode: data.roomCode,
        username: username.trim(),
        isHost: true,
      });
    });

    s.on('error', (data: { message: string }) => {
      setIsCreating(false);
      setError(data.message);
    });
  };

  const handleCreateGame = () => {
    if (!username.trim()) {
      setError('Lütfen kullanıcı adı girin.');
      return;
    }
    setError('');
    setIsCreating(true);

    const s = getSocket();
    if (s?.connected) {
      doCreateRoom(s);
    } else {
      connect();
      const checkInterval = setInterval(() => {
        const connected = getSocket();
        if (connected?.connected) {
          clearInterval(checkInterval);
          doCreateRoom(connected);
        }
      }, 200);
      setTimeout(() => {
        clearInterval(checkInterval);
        if (isCreating) {
          setIsCreating(false);
          setError('Sunucuya bağlanılamadı.');
        }
      }, 10000);
    }
  };

  const handleJoinGame = () => {
    if (!username.trim()) {
      setError('Lütfen kullanıcı adı girin.');
      return;
    }
    setError('');
    connect();
    navigation.navigate('Lobby', {
      roomCode: '',
      username: username.trim(),
      isHost: false,
    });
  };

  const handleLocalGame = () => {
    navigation.replace('Setup');
  };

  return (
    <ScreenLayout>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Image
              source={require('../../assets/images/favicon.png')}
              style={styles.favicon}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, { color: colors.text, fontFamily: f }]}>SpyRoyale</Text>
        </View>

        <View style={styles.connectionStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? '#22c55e' : '#ef4444' },
            ]}
          />
          <Text style={[styles.statusText, { color: colors.textSecondary, fontFamily: f }]}>
            {isConnected ? 'Sunucuya bağlı' : 'Sunucuya bağlı değil'}
          </Text>
          {isConnected ? (
            <Wifi size={14} color="#22c55e" />
          ) : (
            <WifiOff size={14} color="#ef4444" />
          )}
        </View>

        <View style={styles.formSection}>
          <CustomInput
            label="Kullanıcı Adı"
            placeholder="Adınızı girin"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setError('');
            }}
            autoCapitalize="words"
          />

          {error ? (
            <Text style={[styles.errorText, { color: colors.error, fontFamily: f }]}>
              {error}
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: f }]}>
            Online Oyun
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.onlineButton,
                { backgroundColor: colors.primary, borderBottomColor: colors.primaryDark || colors.primary },
              ]}
              onPress={handleCreateGame}
              disabled={isCreating}
              activeOpacity={0.7}
            >
              {isCreating ? (
                <ActivityIndicator color={colors.buttonPrimaryText} size="small" />
              ) : (
                <>
                  <Users size={22} color={colors.buttonPrimaryText} />
                  <Text style={[styles.onlineButtonText, { color: colors.buttonPrimaryText, fontFamily: f }]}>
                    Oyun Oluştur
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.onlineButton,
                {
                  backgroundColor: colors.surface,
                  borderBottomColor: colors.border,
                  borderWidth: 2,
                  borderColor: colors.border,
                },
              ]}
              onPress={handleJoinGame}
              activeOpacity={0.7}
            >
              <Users size={22} color={colors.text} />
              <Text style={[styles.onlineButtonText, { color: colors.text, fontFamily: f }]}>
                Oyuna Katıl
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary, fontFamily: f }]}>veya</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity
          style={[
            styles.localButton,
            { backgroundColor: colors.surface, borderBottomColor: colors.border },
          ]}
          onPress={handleLocalGame}
          activeOpacity={0.7}
        >
          <Gamepad2 size={22} color={colors.text} />
          <Text style={[styles.localButtonText, { color: colors.text, fontFamily: f }]}>
            Yerel Oyun
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  favicon: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 1,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
  },
  formSection: {
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  sectionDesc: {
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  onlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    borderBottomWidth: 4,
  },
  onlineButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: theme.fontSize.sm,
  },
  localButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    borderBottomWidth: 4,
  },
  localButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
});
