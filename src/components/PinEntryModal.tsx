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

interface PinEntryModalProps {
    visible: boolean;
    title: string;
    onSubmit: (pin: string) => void;
    onCancel: () => void;
}

export const PinEntryModal: React.FC<PinEntryModalProps> = ({
    visible,
    title,
    onSubmit,
    onCancel,
}) => {
    const { colors } = useThemeContext();
    const [pin, setPin] = useState('');
    const f = theme.fontFamily;

    const handleSubmit = () => {
        if (pin.length === 4) {
            onSubmit(pin);
            setPin('');
        }
    };

    const handleCancel = () => {
        setPin('');
        onCancel();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
                <View style={[styles.modalContainer, { backgroundColor: colors.modalBackground, borderColor: colors.border }]}>
                    <Text style={[styles.title, { color: colors.text, fontFamily: f }]}>{title}</Text>
                    <TextInput
                        style={[styles.pinInput, {
                            backgroundColor: colors.surface,
                            borderColor: colors.primary,
                            color: colors.text,
                            fontFamily: f,
                        }]}
                        value={pin}
                        onChangeText={(text) => setPin(text.slice(0, 4))}
                        placeholder="----"
                        placeholderTextColor={colors.placeholder}
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={4}
                        autoFocus
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, {
                                backgroundColor: colors.buttonSecondary,
                                borderWidth: 2,
                                borderColor: colors.border,
                                borderBottomColor: colors.buttonSecondaryBorder,
                            }]}
                            onPress={handleCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.buttonText, { color: colors.text, fontFamily: f }]}>İptal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                {
                                    backgroundColor: colors.primary,
                                    borderBottomColor: colors.primaryDark,
                                },
                                pin.length < 4 && {
                                    backgroundColor: colors.surface,
                                    borderBottomColor: colors.buttonSecondaryBorder,
                                    opacity: 0.5,
                                },
                            ]}
                            onPress={handleSubmit}
                            activeOpacity={0.7}
                            disabled={pin.length < 4}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    { color: colors.buttonPrimaryText, fontFamily: f },
                                    pin.length < 4 && { color: colors.textMuted },
                                ]}
                            >
                                Onayla
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        padding: theme.spacing.xl,
        width: '100%',
        maxWidth: 350,
        borderWidth: 2,
        alignItems: 'center',
        ...theme.shadows.lg,
    },
    title: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    pinInput: {
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        fontSize: theme.fontSize.xxl,
        borderWidth: 2,
        width: '100%',
        textAlign: 'center',
        letterSpacing: 16,
        marginBottom: theme.spacing.xl,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        width: '100%',
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
