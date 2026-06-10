import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';
import { resolveShortcutCode } from '../data/embeddedCategories';
import { CustomAlertModal } from './CustomAlertModal';

interface ImportCategoryModalProps {
    visible: boolean;
    onClose: () => void;
    onImport: (name: string, words: string[], icon: string) => void;
}

const decodeData = (base64String: string): any => {
    try {
        const jsonString = decodeURIComponent(escape(atob(base64String)));
        return JSON.parse(jsonString);
    } catch (e) {
        throw new Error('Kod çözme hatası.');
    }
};

export const ImportCategoryModal: React.FC<ImportCategoryModalProps> = ({
    visible,
    onClose,
    onImport,
}) => {
    const { colors } = useThemeContext();
    const [code, setCode] = useState<string>('');
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

    const handleImport = () => {
        // Check for shortcut codes before SPY:: validation
        const shortcut = resolveShortcutCode(code);
        if (shortcut) {
            onImport(shortcut.name, shortcut.words, shortcut.icon);
            setCode('');
            onClose();
            return;
        }

        if (!code.trim().startsWith('SPY::')) {
            setAlertConfig({
                visible: true,
                title: 'Hata',
                message: 'Geçersiz kod formatı.',
                buttons: [
                    {
                        text: 'Tamam',
                        onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
                    },
                ],
            });
            return;
        }

        try {
            const encodedData = code.trim().substring(5);
            const categoryData = decodeData(encodedData);

            if (!categoryData.name || !Array.isArray(categoryData.words)) {
                setAlertConfig({
                    visible: true,
                    title: 'Hata',
                    message: 'Kategori verisi geçersiz.',
                    buttons: [
                        {
                            text: 'Tamam',
                            onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
                        },
                    ],
                });
                return;
            }

            if (categoryData.words.length < 2) {
                setAlertConfig({
                    visible: true,
                    title: 'Hata',
                    message: 'Kategori en az 2 kelime içermelidir.',
                    buttons: [
                        {
                            text: 'Tamam',
                            onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
                        },
                    ],
                });
                return;
            }

            onImport(
                categoryData.name,
                categoryData.words,
                categoryData.icon || 'Folder'
            );

            setCode('');
            onClose();
        } catch (error) {
            let errorMessage = 'Kod çözümlenirken bir hata oluştu. Lütfen geçerli bir kod giriniz.';

            if (error instanceof Error) {
                errorMessage += ` Detay: ${error.message}`;
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

    const handleClose = () => {
        setCode('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
                <View style={[styles.modalContainer, { backgroundColor: colors.modalBackground, borderColor: colors.primary }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <View style={styles.headerLeft}>
                            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: f }]}>Kategori İçe Aktar</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleClose}
                                activeOpacity={0.7}
                            >
                                <X size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.body}>
                        <Text style={[styles.label, { color: colors.text, fontFamily: f }]}>Kategori Kodu</Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                color: colors.text,
                                fontFamily: f,
                            }]}
                            value={code}
                            onChangeText={setCode}
                            placeholder="SPY:: kodu veya kısayol kodu girin..."
                            placeholderTextColor={colors.placeholder}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                        <Text style={[styles.helperText, { color: colors.textSecondary, fontFamily: f }]}>
                            Kategori kodunu buraya yapıştırın ve "Yükle" butonuna basın.
                        </Text>
                    </View>

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            style={[styles.button, {
                                backgroundColor: colors.buttonSecondary,
                                borderWidth: 2,
                                borderColor: colors.border,
                                borderBottomColor: colors.buttonSecondaryBorder,
                            }]}
                            onPress={handleClose}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.buttonText, { color: colors.text, fontFamily: f }]}>İptal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, {
                                backgroundColor: colors.primary,
                                borderBottomColor: colors.primaryDark,
                            }]}
                            onPress={handleImport}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.buttonText, { color: colors.buttonPrimaryText, fontFamily: f }]}>Yükle</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <CustomAlertModal
                    visible={alertConfig.visible}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    buttons={alertConfig.buttons}
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
    },
    headerTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeButton: {
        padding: theme.spacing.xs,
    },
    body: {
        padding: theme.spacing.lg,
    },
    label: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        marginBottom: theme.spacing.sm,
    },
    input: {
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        borderWidth: 2,
        minHeight: 120,
        marginBottom: theme.spacing.sm,
    },
    helperText: {
        fontSize: theme.fontSize.sm,
        fontStyle: 'italic',
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
