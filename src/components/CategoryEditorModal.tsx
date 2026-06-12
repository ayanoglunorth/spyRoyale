import * as Clipboard from 'expo-clipboard';
import {
    Bird, Bone, Book, Briefcase, Camera, Car, Cat, Cloud, Coffee, Compass, Crown,
    Dog, Download, Droplet, Fish, Flag, Flame, Folder, Footprints, Gamepad, Ghost,
    Gift, Heart, Home, Map, Moon, Mountain, Music, Pizza, Plane, Plus, Rocket,
    Share2, Ship, ShoppingCart, Smile, Sparkles, Star, Sun, Target, Trash2, Trees,
    Trophy, Umbrella, Upload, User, Wind, X, Zap
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';
import { Category } from '../data/categories';
import { CustomAlertModal } from './CustomAlertModal';
import { IconSelectionModal } from './IconSelectionModal';
import { ImportCategoryModal } from './ImportCategoryModal';
import { encryptData } from '../utils/crypto';

interface CategoryEditorModalProps {
    visible: boolean;
    onClose: () => void;
    category?: Category;
    onSave: (id: string | undefined, name: string, words: string[], icon: string) => void;
    onDelete?: (id: string) => void;
}

const LucideIcons: { [key: string]: any } = {
    Zap, Home, User, Gamepad, Smile, Star, Ghost, Crown, Flag, Camera, Music, Book,
    Heart, Coffee, Pizza, Sparkles, Rocket, Target, Trophy, Gift, Map, Compass, Sun, Moon,
    Cloud, Umbrella, Trees, Flame, Droplet, Wind, Mountain, Plane, Car, Ship, Briefcase,
    ShoppingCart, Cat, Dog, Bird, Fish, Bone, Footprints, Folder, Download, Plus, Share2,
    Trash2, X
};

export const CategoryEditorModal: React.FC<CategoryEditorModalProps> = ({
    visible,
    onClose,
    category,
    onSave,
    onDelete,
}) => {
    const { colors } = useThemeContext();
    const [categoryName, setCategoryName] = useState<string>('');
    const [words, setWords] = useState<string[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<string>('Folder');
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [iconModalVisible, setIconModalVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        buttons: [] as Array<{
            text: string;
            style?: 'default' | 'cancel' | 'destructive';
            onPress: () => void;
        }>,
    });

    const f = theme.fontFamily;

    useEffect(() => {
        if (visible) {
            if (category) {
                setCategoryName(category.name);
                setWords([...category.words]);
                setSelectedIcon(category.icon || 'Folder');
            } else {
                setCategoryName('');
                setWords(['']);
                setSelectedIcon('Folder');
            }
        }
    }, [visible, category]);

    const handleAddWord = () => {
        setWords([...words, '']);
    };

    const handleRemoveWord = (index: number) => {
        const updated = words.filter((_, i) => i !== index);
        setWords(updated);
    };

    const handleWordChange = (index: number, value: string) => {
        const trimmedValue = value.trim();

        if (trimmedValue !== '') {
            const isDuplicate = words.some(
                (w, i) => i !== index && w.trim().toLowerCase() === trimmedValue.toLowerCase()
            );

            if (isDuplicate) {
                setAlertConfig({
                    visible: true,
                    title: 'Hata',
                    message: 'Bu kelime zaten listede mevcut',
                    buttons: [
                        {
                            text: 'Tamam',
                            onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
                        },
                    ],
                });
                return;
            }
        }

        const updated = [...words];
        updated[index] = value;
        setWords(updated);
    };

    const handleSave = () => {
        if (!categoryName.trim()) {
            setAlertConfig({
                visible: true,
                title: 'Hata',
                message: 'Kategori ismi boş olamaz.',
                buttons: [
                    {
                        text: 'Tamam',
                        onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
                    },
                ],
            });
            return;
        }

        const filteredWords = words.filter((w) => w.trim() !== '');
        if (filteredWords.length < 2) {
            setAlertConfig({
                visible: true,
                title: 'Hata',
                message: 'En az 2 kelime girmelisiniz.',
                buttons: [
                    {
                        text: 'Tamam',
                        onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
                    },
                ],
            });
            return;
        }

        if (!category && selectedIcon === 'Folder') {
            setAlertConfig({
                visible: true,
                title: 'Hata',
                message: 'Lütfen bir ikon seçin.',
                buttons: [
                    {
                        text: 'Tamam',
                        onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
                    },
                ],
            });
            return;
        }

        onSave(category?.id, categoryName.trim(), filteredWords, selectedIcon);
        onClose();
    };

    const handleDelete = () => {
        if (!category?.id || !onDelete) return;

        setAlertConfig({
            visible: true,
            title: 'Kategoriyi Sil',
            message: `"${category.name}" kategorisini silmek istediğinize emin misiniz?`,
            buttons: [
                {
                    text: 'İptal',
                    style: 'cancel',
                    onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
                },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: () => {
                        onDelete(category.id);
                        onClose();
                        setAlertConfig({ ...alertConfig, visible: false });
                    },
                },
            ],
        });
    };

    const handleExportCategory = async () => {
        if (!category) return;

        try {
            const exportData = {
                name: categoryName,
                words: words.filter((w) => w.trim() !== ''),
                icon: category.icon,
            };

            const { iv, ciphertext } = encryptData(exportData);
            const finalCode = `SPY::${iv}::${ciphertext}`;

            await Clipboard.setStringAsync(finalCode);

            setAlertConfig({
                visible: true,
                title: 'Başarılı',
                message: 'Gizli kategori kodu kopyalandı!',
                buttons: [
                    {
                        text: 'Tamam',
                        onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
                    },
                ],
            });
        } catch (error) {
            let errorMessage = 'Kod kopyalanırken bir hata oluştu.';

            if (error instanceof Error) {
                errorMessage += ` Detay: ${error.message}`;
                if (error.message.includes('Latin1') || error.message.includes('characters outside')) {
                    errorMessage = 'Türkçe karakter hatası. Lütfen tekrar deneyin.';
                }
            }

            setAlertConfig({
                visible: true,
                title: 'Hata',
                message: errorMessage,
                buttons: [
                    {
                        text: 'Tamam',
                        onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
                    },
                ],
            });
        }
    };

    const handleImportCategory = (name: string, importedWords: string[], icon: string) => {
        const isDefaultCategory = category && !category.isCustom;

        if (isDefaultCategory) {
            setWords(importedWords);
        } else {
            setCategoryName(name);
            setWords(importedWords);
            setSelectedIcon(icon);
        }

        setImportModalVisible(false);

        setAlertConfig({
            visible: true,
            title: 'Başarılı',
            message: 'Kategori başarıyla içeri aktarıldı.',
            buttons: [
                {
                    text: 'Tamam',
                    onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
                },
            ],
        });
    };

    const isCreateMode = !category;
    const canEditName = isCreateMode || category?.isCustom;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
                <View style={[styles.modalContainer, { backgroundColor: colors.modalBackground, borderColor: colors.primary }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <View style={styles.headerLeft}>
                            <Text
                                style={[styles.headerTitle, { color: colors.text, fontFamily: f }]}
                                numberOfLines={1}
                                adjustsFontSizeToFit={true}
                            >
                                {isCreateMode ? 'Yeni Kategori' : 'Edit'}
                            </Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => setImportModalVisible(true)}
                                activeOpacity={0.7}
                            >
                                <Download size={20} color={colors.primary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={handleExportCategory}
                                activeOpacity={0.7}
                            >
                                <Upload size={20} color={colors.primary} />
                            </TouchableOpacity>

                            {onDelete && category?.isCustom && (
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={handleDelete}
                                    activeOpacity={0.7}
                                >
                                    <Trash2 size={20} color={colors.error} />
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={onClose}
                                activeOpacity={0.7}
                            >
                                <X size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: f }]}>Kategori İsmi</Text>
                            <View style={styles.nameContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.iconPickerButton,
                                        { backgroundColor: colors.iconPickerBackground, borderColor: colors.primary },
                                        !canEditName && { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.5 },
                                    ]}
                                    onPress={() => canEditName && setIconModalVisible(true)}
                                    disabled={!canEditName}
                                    activeOpacity={0.7}
                                >
                                    {(() => {
                                        const IconComponent = (LucideIcons as any)[selectedIcon];
                                        return IconComponent ? (
                                            <IconComponent
                                                size={32}
                                                color={
                                                    canEditName
                                                        ? colors.primary
                                                        : colors.textSecondary
                                                }
                                            />
                                        ) : (
                                            <LucideIcons.Folder
                                                size={32}
                                                color={colors.textSecondary}
                                            />
                                        );
                                    })()}
                                </TouchableOpacity>

                                <View style={styles.nameInputContainer} pointerEvents={canEditName ? 'auto' : 'none'}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            styles.nameInput,
                                            {
                                                backgroundColor: colors.surface,
                                                borderColor: colors.border,
                                                color: colors.text,
                                                fontFamily: f,
                                            },
                                            !canEditName && { color: colors.textMuted, opacity: 0.6 },
                                        ]}
                                        value={categoryName}
                                        onChangeText={setCategoryName}
                                        placeholder="Örn: Meyveler"
                                        placeholderTextColor={colors.placeholder}
                                        editable={canEditName}
                                        selectTextOnFocus={canEditName}
                                    />
                                </View>
                            </View>
                            {!canEditName && (
                                <Text style={[styles.helperText, { color: colors.textSecondary, fontFamily: f }]}>
                                    Varsayılan kategorilerin ismi değiştirilemez
                                </Text>
                            )}
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: f }]}>Kelimeler</Text>
                            {words.map((word, index) => (
                                <View key={index} style={styles.wordRow}>
                                    <TextInput
                                        style={[styles.input, styles.wordInput, {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                            color: colors.text,
                                            fontFamily: f,
                                        }]}
                                        value={word}
                                        onChangeText={(value) => handleWordChange(index, value)}
                                        placeholder={`Kelime ${index + 1}`}
                                        placeholderTextColor={colors.placeholder}
                                    />
                                    <TouchableOpacity
                                        style={styles.removeWordButton}
                                        onPress={() => handleRemoveWord(index)}
                                        activeOpacity={0.7}
                                    >
                                        <X size={20} color={colors.error} />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={[styles.addWordButton, { borderColor: colors.primary }]}
                                onPress={handleAddWord}
                                activeOpacity={0.7}
                            >
                                <Plus size={20} color={colors.primary} />
                                <Text style={[styles.addWordText, { color: colors.primary, fontFamily: f }]}>Kelime Ekle</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            style={[styles.button, {
                                backgroundColor: colors.buttonSecondary,
                                borderWidth: 2,
                                borderColor: colors.border,
                                borderBottomColor: colors.buttonSecondaryBorder,
                            }]}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.buttonText, { color: colors.text, fontFamily: f }]}>İptal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, {
                                backgroundColor: colors.primary,
                                borderBottomColor: colors.primaryDark,
                            }]}
                            onPress={handleSave}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.buttonText, { color: colors.buttonPrimaryText, fontFamily: f }]}>Kaydet</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <CustomAlertModal
                    visible={alertConfig.visible}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    buttons={alertConfig.buttons}
                />

                <ImportCategoryModal
                    visible={importModalVisible}
                    onClose={() => setImportModalVisible(false)}
                    onImport={handleImportCategory}
                />

                <IconSelectionModal
                    visible={iconModalVisible}
                    onClose={() => setIconModalVisible(false)}
                    onSelectIcon={(icon) => setSelectedIcon(icon)}
                    currentIcon={selectedIcon}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    modalContainer: {
        borderRadius: theme.borderRadius.xl,
        width: '100%',
        maxWidth: 500,
        maxHeight: '80%',
        borderWidth: 2,
        ...theme.shadows.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
        borderBottomWidth: 2,
    },
    headerLeft: {
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    headerTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        gap: theme.spacing.xs,
    },
    iconButton: {
        padding: theme.spacing.sm,
    },
    body: {
        padding: theme.spacing.lg,
    },
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionLabel: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        marginBottom: theme.spacing.sm,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    iconPickerButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        flexShrink: 0,
    },
    nameInputContainer: {
        flex: 1,
    },
    input: {
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        borderWidth: 2,
    },
    nameInput: {
        marginBottom: theme.spacing.xs,
    },
    helperText: {
        fontSize: theme.fontSize.sm,
        fontStyle: 'italic',
    },
    wordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    wordInput: {
        flex: 1,
    },
    removeWordButton: {
        padding: theme.spacing.xs,
    },
    addWordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 2,
        borderStyle: 'dashed',
        marginTop: theme.spacing.sm,
        gap: theme.spacing.xs,
    },
    addWordText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
    },
    footer: {
        flexDirection: 'row',
        padding: theme.spacing.lg,
        borderTopWidth: 2,
        gap: theme.spacing.md,
    },
    button: {
        flex: 1,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 4,
    },
    buttonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
    },
});
