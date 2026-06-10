import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';

interface AlertButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress: () => void;
}

interface CustomAlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
    visible,
    title,
    message,
    buttons,
}) => {
    const { colors } = useThemeContext();

    const getButtonStyle = (buttonStyle?: string) => {
        switch (buttonStyle) {
            case 'destructive':
                return { backgroundColor: colors.error, borderBottomColor: colors.buttonDangerBorder };
            case 'cancel':
                return { backgroundColor: colors.buttonSecondary, borderWidth: 2, borderColor: colors.border, borderBottomColor: colors.buttonSecondaryBorder };
            default:
                return { backgroundColor: colors.primary, borderBottomColor: colors.primaryDark };
        }
    };

    const getButtonTextStyle = (buttonStyle?: string) => {
        switch (buttonStyle) {
            case 'destructive':
                return { color: '#FFFFFF' };
            case 'cancel':
                return { color: colors.text };
            default:
                return { color: colors.buttonPrimaryText };
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
                <View style={[styles.modalContainer, { backgroundColor: colors.modalBackground, borderColor: colors.border }]}>
                    <Text style={[styles.title, { color: colors.text, fontFamily: theme.fontFamily }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.textSecondary, fontFamily: theme.fontFamily }]}>{message}</Text>
                    <View style={styles.buttonContainer}>
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.button, getButtonStyle(button.style)]}
                                onPress={button.onPress}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.buttonText, { fontFamily: theme.fontFamily }, getButtonTextStyle(button.style)]}>
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
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
        maxWidth: 400,
        borderWidth: 2,
        ...theme.shadows.lg,
    },
    title: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    message: {
        fontSize: theme.fontSize.md,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
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
