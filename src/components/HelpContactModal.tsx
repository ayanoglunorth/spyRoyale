import { HelpCircle, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Linking,
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
import { CustomButton } from './CustomButton';

interface HelpContactModalProps {
    visible: boolean;
    onClose: () => void;
}

export const HelpContactModal: React.FC<HelpContactModalProps> = ({ visible, onClose }) => {
    const [message, setMessage] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const { colors } = useThemeContext();

    const handleSendEmail = async () => {
        if (!message.trim()) {
            setFeedbackMessage('Lütfen bir mesaj yazın.');
            return;
        }

        const email = 'ayanogluinthenorth@gmail.com';
        const subject = encodeURIComponent('SPY APP Geri Bildirim');
        const body = encodeURIComponent(message);
        const url = `mailto:${email}?subject=${subject}&body=${body}`;

        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
                setMessage('');
                setFeedbackMessage('Email uygulamanız açıldı!');
                setTimeout(() => {
                    setFeedbackMessage('');
                    onClose();
                }, 2000);
            } else {
                setFeedbackMessage('Email uygulaması açılamadı.');
            }
        } catch (error) {
            setFeedbackMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    const f = theme.fontFamily;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
                <View style={[styles.modalContainer, { backgroundColor: colors.modalBackground, borderColor: colors.primary }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <View style={styles.headerLeft}>
                            <HelpCircle size={24} color={colors.primary} />
                            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: f }]}>Yardım & İletişim</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: f }]}>Spy Royale Nedir?</Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                Spy Royale, klasikleşmiş Spy oyununun aksine çok daha zorlayıcı ve eğlenceli bir oyundur.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: f }]}>Nasıl Oynanır?</Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • <Text style={[styles.subLabel, { color: colors.text }]}>Rol Dağılımı:</Text> Belirlenen sayıda oyuncu Spy, diğerleri Agent olur.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • <Text style={[styles.subLabel, { color: colors.text }]}>Gizem:</Text> Herkes sırayla telefonu eline alır ve kelimesini görür. <Text style={[styles.subLabel, { color: colors.text }]}>DİKKAT:</Text> Spy, kartında Agent'larla aynı kategoriden farklı bir kelime görür. Kartında "Senin rolün Spy!" yazmaz! Bu yüzden Spy, oyunun başında Spy olduğunu bilmez.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • <Text style={[styles.subLabel, { color: colors.text }]}>Oyun Turu:</Text> Herkes sırayla kendi kelimesiyle ilgili ipucu olarak bir kelime söyler. Sırası gelmeyen konuşamaz, herhangi bir tepki veremez.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • <Text style={[styles.subLabel, { color: colors.text }]}>Strateji:</Text> İlk turlarda kimse rolünden emin değildir. Bu sebeple oyuncular hem Spy olma ihtimaline karşı temkinli bir kelime söyleyip rolünü açıkça belli etmemeli, hem de Agent olma ihtimaline karşı diğer Agent`ların kendisinden şüphelenmemeleri için çok alakasız bir kelime söylememelidir. İlk turlarda her oyuncu dengeyi korumalıdır.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • <Text style={[styles.subLabel, { color: colors.text }]}>Tartışma:</Text> Tur bitince sayaç açılır ve tartışma başlar. Herkes birbirini sorgular. Sayaç dolduğunda herkes susar ve yeni tur başlar, herkes birer ipucu daha verir.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: f }]}>Amaçlar & Kazanma</Text>
                            <Text style={[styles.subHeader, { color: colors.text, fontFamily: f }]}>Spy'ın Görevi:</Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • Önce diğer oyuncuların konuşmalarından kendi rolünün Spy olduğunu fark etmelidir.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • Agent'ların kelimesini çözmeye çalışmalıdır.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • Bir tartışma bölümü sırasında rolünün Spy olduğunu açıklayıp Agent`ların kelimesini doğru tahmin ederse Spy oyunu kazanır.
                            </Text>

                            <Text style={[styles.subHeader, { color: colors.text, fontFamily: f, marginTop: 15 }]}>Agent'ın Görevi:</Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • Önce diğer oyuncuların konuşmalarından kendi rolünün Agent olduğunu fark etmelidir.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • Kendisi gibi Agent olanları fark edip bunları olası Spy adayları arasından elemelidir.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • Bir tartışma bölümü esnasında, en az 2 Agent oylamaya geçmek isterse, oylama bölümüne geçilir.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: f }]}>Oylama Sistemi ve Sonuç</Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                Çoğunluk oyuyla bir kişi elenir.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • <Text style={[styles.subLabel, { color: colors.text }]}>Elenen Agent ise:</Text> Oyun devam eder, o kişi oyun bitene kadar susar.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • <Text style={[styles.subLabel, { color: colors.text }]}>Elenen Spy ise:</Text> Oyuncuya son bir şans verilir, Agentların kelimesini tahmin eder.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f, marginLeft: 20 }]}>
                                - <Text style={[styles.subLabel, { color: colors.text }]}>Doğru bilirse:</Text> Berabere.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f, marginLeft: 20 }]}>
                                - <Text style={[styles.subLabel, { color: colors.text }]}>Bilemezse:</Text> Agent'lar Kazanır!
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: f }]}>Çoklu Spy Senaryosu</Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • Bir oyunda maximum Spy sayısı, Agent sayısının 2 eksiği kadar olabilmektedir.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • Oyunda 1`den fazla Spy olduğu senaryoda: tek bir Spy`ın ifşa olması Agent`ların galibiyeti için, tek bir Spyın Agent`ların kelimesini doğru tahmin etmesi Spy`ların galibiyeti için yeterlidir.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • Burada Spy sayısının 1`den fazla seçilmesi işlevsiz görünüyor olabilir fakat bu sayede Spy`lar da birbirlerine yakın kelimeler söylediği için onlar da Agent gibi algılanabilir. Oyunu zorlaştıran detay Spy`ların da bir uyum yakalaması ve Agent`ları manipüle etmesidir.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: f }]}>Kategori Düzenleme</Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • Bir kategoriyi düzenlemek/paylaşmak için üzerine uzun basabilirsiniz.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • <Text style={[styles.subLabel, { color: colors.text }]}>Export:</Text> Bir kategoriyi kod olarak kopyalayıp arkadaşlarınızla paylaşabilirsiniz.
                            </Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                • <Text style={[styles.subLabel, { color: colors.text }]}>Import:</Text> Sizinle paylaşılan bir kategorinin kodunu yapıştırıp o kategoriyi kendi oyununuza ekleyebilirsiniz.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: f }]}>İletişim / Hata Bildirimi</Text>
                            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: f }]}>
                                Hata bildirimi, öneri veya geri bildiriminizi bize iletin:
                            </Text>
                            <TextInput
                                style={[styles.textInput, {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    color: colors.text,
                                    fontFamily: f,
                                }]}
                                value={message}
                                onChangeText={setMessage}
                                placeholder="Mesajınızı buraya yazın..."
                                placeholderTextColor={colors.placeholder}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                            />
                            {feedbackMessage ? (
                                <Text style={[styles.feedbackText, { color: colors.primary, fontFamily: f }]}>{feedbackMessage}</Text>
                            ) : null}
                            <CustomButton title="Gönder" onPress={handleSendEmail} />
                        </View>
                    </ScrollView>
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
        width: '100%',
        maxWidth: 500,
        maxHeight: '85%',
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    headerTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
    },
    closeButton: {
        padding: theme.spacing.xs,
    },
    body: {
        padding: theme.spacing.lg,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: theme.fontWeight.bold,
        marginTop: 15,
        marginBottom: 10,
    },
    subHeader: {
        fontSize: 15,
        fontWeight: theme.fontWeight.bold,
        marginBottom: 10,
    },
    subLabel: {
        fontWeight: theme.fontWeight.bold,
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 10,
    },
    textInput: {
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        borderWidth: 2,
        marginBottom: theme.spacing.md,
        minHeight: 120,
    },
    feedbackText: {
        fontSize: theme.fontSize.sm,
        marginBottom: theme.spacing.sm,
        fontStyle: 'italic',
        fontWeight: theme.fontWeight.medium,
    },
});
