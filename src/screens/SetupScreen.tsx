import AsyncStorage from '@react-native-async-storage/async-storage';
import { HelpCircle, Moon, Sun } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryEditorModal } from '../components/CategoryEditorModal';
import { CategorySelector } from '../components/CategorySelector';
import { CustomAlertModal } from '../components/CustomAlertModal';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { HelpContactModal } from '../components/HelpContactModal';
import { theme } from '../constants/theme';
import { useCategories } from '../context/CategoriesContext';
import { useThemeContext } from '../context/ThemeContext';
import { Category } from '../data/categories';
import { validateGameRules } from '../utils/gameLogic';

interface SetupScreenProps {
  onNext: (config: { agentCount: number; spyCount: number; categoryIds: string[] }) => void;
  initialConfig?: {
    agentCount: number;
    spyCount: number;
    categoryIds: string[];
  };
}

const STORAGE_KEY = '@spyroyale:lastConfig';

export const SetupScreen: React.FC<SetupScreenProps> = ({ onNext, initialConfig }) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { colors, isDark, toggleTheme } = useThemeContext();
  const f = theme.fontFamily;

  const [agentCount, setAgentCount] = useState<string>(initialConfig?.agentCount.toString() || '3');
  const [spyCount, setSpyCount] = useState<string>(initialConfig?.spyCount.toString() || '1');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialConfig?.categoryIds || []
  );
  const [error, setError] = useState<string>('');
  const [editorModalVisible, setEditorModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [] as Array<{ text: string; style?: 'default' | 'cancel'; onPress: () => void; }>,
  });

  const isWeb = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadLastConfig = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && !initialConfig) {
          const config = JSON.parse(stored);
          setAgentCount(config.agentCount?.toString() || '3');
          setSpyCount(config.spyCount?.toString() || '1');
          setSelectedCategoryIds(config.categoryIds || []);
        }
      } catch (e) {}
    };
    loadLastConfig();
  }, [initialConfig]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleNext = async () => {
    const agentNum = parseInt(agentCount, 10);
    const spyNum = parseInt(spyCount, 10);
    if (isNaN(agentNum) || agentNum < 1) { setError('Geçerli bir Agent sayısı giriniz.'); return; }
    if (isNaN(spyNum) || spyNum < 1) { setError('Geçerli bir Spy sayısı giriniz.'); return; }
    if (selectedCategoryIds.length === 0) { setError('En az bir kategori seçmelisiniz.'); return; }
    const validation = validateGameRules(agentNum, spyNum);
    if (!validation.valid) { setError(validation.error || 'Geçersiz oyun ayarları.'); return; }
    setError('');
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ agentCount: agentNum, spyCount: spyNum, categoryIds: selectedCategoryIds }));
    } catch (e) {}
    onNext({ agentCount: agentNum, spyCount: spyNum, categoryIds: selectedCategoryIds });
  };

  const handleLongPress = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
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

  const RootComponent = isWeb ? View : SafeAreaView;

  return (
    <RootComponent style={rootContainerStyle}>
      {isWeb ? (
        <View style={{ flex: 1, height: '100%' }}>
           {renderScrollContent()}
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {renderScrollContent()}
        </KeyboardAvoidingView>
      )}

      <CategoryEditorModal
        visible={editorModalVisible}
        onClose={() => setEditorModalVisible(false)}
        category={editingCategory}
        onSave={handleSaveCategory}
        onDelete={editingCategory?.isCustom ? handleDeleteCategory : undefined}
      />
      <HelpContactModal visible={helpModalVisible} onClose={() => setHelpModalVisible(false)} />
      <CustomAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
    </RootComponent>
  );

  function renderScrollContent() {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          padding: theme.spacing.lg,
          paddingBottom: isWeb ? 200 : insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={[styles.themeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              {isDark ? (
                <Sun size={28} color={colors.warning} />
              ) : (
                <Moon size={28} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.helpButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setHelpModalVisible(true)}
              activeOpacity={0.7}
            >
              <HelpCircle size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.title, { color: colors.text, fontFamily: f }]}>Oyun Kurulumu</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: f }]}>Oyuncu sayılarını ve kategorileri seçiniz.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <CustomInput
            label="Agent Sayısı"
            value={agentCount}
            onChangeText={setAgentCount}
            keyboardType="number-pad"
            placeholder="Örn: 3"
          />
          <CustomInput
            label="Spy Sayısı"
            value={spyCount}
            onChangeText={setSpyCount}
            keyboardType="number-pad"
            placeholder="Örn: 1"
          />
        </View>

        <View style={styles.section}>
          <CategorySelector
            categories={categories}
            selectedIds={selectedCategoryIds}
            onToggle={handleCategoryToggle}
            onLongPress={handleLongPress}
            onAddNew={handleAddNew}
          />
        </View>

        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.errorText, { color: colors.error, fontFamily: f }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.footerButtons}>
          <CustomButton title="Devam Et" onPress={handleNext} />
        </View>
      </ScrollView>
    );
  }
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
  },
  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    zIndex: 10,
  },
  headerContent: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    marginTop: -theme.spacing.sm,
  },
  headerTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  themeToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  helpButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    textAlign: 'center',
  },
  section: {
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