import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';

const NAMES_STORAGE_KEY = '@spyroyale:previousNames';

interface InputNamesScreenProps {
  totalPlayers: number;
  onStart: (names: string[]) => void;
  navigation: any;
}

export const InputNamesScreen: React.FC<InputNamesScreenProps> = ({
  totalPlayers,
  onStart,
  navigation,
}) => {
  const { colors } = useThemeContext();
  const f = theme.fontFamily;

  const [names, setNames] = useState<string[]>(Array(totalPlayers).fill(''));
  const [previousNames, setPreviousNames] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const isWeb = Platform.OS === 'web';
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadPreviousNames = async () => {
      try {
        const stored = await AsyncStorage.getItem(NAMES_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreviousNames(parsed);
          if (parsed.length >= totalPlayers) {
            setNames(parsed.slice(0, totalPlayers));
          }
        }
      } catch (e) {}
    };
    loadPreviousNames();
  }, [totalPlayers]);

  const handleNameChange = (index: number, value: string) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
    setError('');
  };

  const handleStart = async () => {
    const trimmedNames = names.map((n) => n.trim());
    if (trimmedNames.some((n) => !n)) {
      setError('Lütfen tüm oyuncu isimlerini giriniz.');
      return;
    }
    const uniqueNames = new Set(trimmedNames.map((n) => n.toLowerCase()));
    if (uniqueNames.size !== trimmedNames.length) {
      setError('Oyuncu isimleri birbirinden farklı olmalıdır.');
      return;
    }
    try {
      await AsyncStorage.setItem(NAMES_STORAGE_KEY, JSON.stringify(trimmedNames));
    } catch (e) {}
    onStart(trimmedNames);
  };

  const handleClearPreviousName = (nameToRemove: string) => {
    const updated = previousNames.filter((n) => n !== nameToRemove);
    setPreviousNames(updated);
    AsyncStorage.setItem(NAMES_STORAGE_KEY, JSON.stringify(updated));
  };

  const rootContainerStyle = isWeb
    ? {
        position: 'absolute' as 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        overflow: 'hidden' as 'hidden',
      }
    : { flex: 1, backgroundColor: colors.background };

  const RootComponent = isWeb ? View : SafeAreaView;

  return (
    <RootComponent style={rootContainerStyle}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text, fontFamily: f }]}>Oyuncular</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: isWeb ? 200 : insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: f }]}>
          {totalPlayers} oyuncunun isimlerini giriniz.
        </Text>

        {names.map((name, index) => (
          <CustomInput
            key={index}
            label={`Oyuncu ${index + 1}`}
            value={name}
            onChangeText={(value) => handleNameChange(index, value)}
            placeholder={`Oyuncu ${index + 1} ismi`}
          />
        ))}

        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.errorText, { color: colors.error, fontFamily: f }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.footerButtons}>
          <CustomButton title="Başlat" onPress={handleStart} />
        </View>
      </ScrollView>
    </RootComponent>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    textAlign: 'center',
  },
  topBarSpacer: {
    width: 40,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  errorContainer: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  footerButtons: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
});
