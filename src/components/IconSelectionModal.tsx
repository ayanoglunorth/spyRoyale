import {
    Bird, Bone, Book, Briefcase, Camera, Car, Cat, Cloud, Coffee, Compass, Crown,
    Dog, Droplet, Fish, Flag, Flame, Footprints, Gamepad, Ghost, Gift, Heart, Home,
    Map, Moon, Mountain, Music, Pizza, Plane, Rocket, Ship, ShoppingCart, Smile,
    Sparkles, Star, Sun, Target, Trees, Trophy, Umbrella, User, Wind, X, Zap
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { theme } from '../constants/theme';
import { useThemeContext } from '../context/ThemeContext';

const LucideIcons: { [key: string]: any } = {
    Zap, Home, User, Gamepad, Smile, Star, Ghost, Crown, Flag, Camera, Music, Book,
    Heart, Coffee, Pizza, Sparkles, Rocket, Target, Trophy, Gift, Map, Compass, Sun, Moon,
    Cloud, Umbrella, Trees, Flame, Droplet, Wind, Mountain, Plane, Car, Ship, Briefcase,
    ShoppingCart, Cat, Dog, Bird, Fish, Bone, Footprints
};

interface IconSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectIcon: (iconName: string) => void;
    currentIcon?: string;
}

export const IconSelectionModal: React.FC<IconSelectionModalProps> = ({
    visible,
    onClose,
    onSelectIcon,
    currentIcon = 'Folder'
}) => {
    const { colors } = useThemeContext();
    const [selectedIcon, setSelectedIcon] = useState<string>(currentIcon);
    const f = theme.fontFamily;

    const iconNames = Object.keys(LucideIcons);

    const handleSelect = () => {
        onSelectIcon(selectedIcon);
        onClose();
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
                <View style={[styles.modalContent, { backgroundColor: colors.modalBackground, borderColor: colors.primary }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.text, fontFamily: f }]}>İkon Seç</Text>
                        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.gridContainer} showsVerticalScrollIndicator={false}>
                        <View style={styles.grid}>
                            {iconNames.map((iconName) => {
                                const IconComponent = LucideIcons[iconName];
                                if (!IconComponent) return null;

                                const isSelected = selectedIcon === iconName;

                                return (
                                    <TouchableOpacity
                                        key={iconName}
                                        style={[
                                            styles.iconButton,
                                            { backgroundColor: colors.surface, borderColor: 'transparent' },
                                            isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                                        ]}
                                        onPress={() => setSelectedIcon(iconName)}
                                        activeOpacity={0.7}
                                    >
                                        <IconComponent
                                            size={32}
                                            color={isSelected ? colors.buttonPrimaryText : colors.text}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
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
                            onPress={handleSelect}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.buttonText, { color: colors.buttonPrimaryText, fontFamily: f }]}>Seç</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    modalContent: {
        width: '100%',
        maxWidth: 500,
        maxHeight: '80%',
        borderRadius: theme.borderRadius.xl,
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
    title: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
    },
    gridContainer: {
        padding: theme.spacing.md,
        maxHeight: 400,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    iconButton: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.borderRadius.lg,
        margin: theme.spacing.xs,
        borderWidth: 2,
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
