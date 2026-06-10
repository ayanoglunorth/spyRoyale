export interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;

  text: string;
  textSecondary: string;
  textMuted: string;

  primary: string;
  primaryDark: string;
  danger: string;
  accent: string;

  success: string;
  warning: string;
  error: string;

  border: string;
  borderLight: string;
  divider: string;

  inputBackground: string;
  inputBorder: string;
  inputBorderFocused: string;
  inputText: string;
  inputFocusedBackground: string;
  placeholder: string;

  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonPrimaryBorder: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  buttonSecondaryBorder: string;
  buttonDanger: string;
  buttonDangerText: string;
  buttonDangerBorder: string;

  cardBackground: string;
  cardBorder: string;
  cardShadow: string;

  modalOverlay: string;
  modalBackground: string;
  modalBorder: string;

  iconPickerBackground: string;

  categorySelectedBackground: string;

  webContainerBackground: string;
}

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F7F7F7',
  surfaceLight: '#EFEFEF',

  text: '#3C3C3C',
  textSecondary: '#777777',
  textMuted: '#ABABAB',

  primary: '#00BCD4',
  primaryDark: '#0097A7',
  danger: '#FF4B4B',
  accent: '#FF9600',

  success: '#58CC02',
  warning: '#FF9600',
  error: '#FF4B4B',

  border: '#E5E5E5',
  borderLight: '#EBEBEB',
  divider: '#F0F0F0',

  inputBackground: '#F7F7F7',
  inputBorder: '#E5E5E5',
  inputBorderFocused: '#00BCD4',
  inputText: '#3C3C3C',
  inputFocusedBackground: '#FFFFFF',
  placeholder: '#ABABAB',

  buttonPrimary: '#00BCD4',
  buttonPrimaryText: '#FFFFFF',
  buttonPrimaryBorder: '#0097A7',
  buttonSecondary: '#F7F7F7',
  buttonSecondaryText: '#3C3C3C',
  buttonSecondaryBorder: '#D5D5D5',
  buttonDanger: '#FF4B4B',
  buttonDangerText: '#FFFFFF',
  buttonDangerBorder: '#CC3C3C',

  cardBackground: '#FFFFFF',
  cardBorder: '#E5E5E5',
  cardShadow: 'rgba(0, 0, 0, 0.08)',

  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: '#FFFFFF',
  modalBorder: '#E5E5E5',

  iconPickerBackground: '#E0F7FA',

  categorySelectedBackground: '#E0F7FA',

  webContainerBackground: '#F0F0F0',
};

export const darkColors: ThemeColors = {
  background: '#0D0D0D',
  surface: '#171717',
  surfaceLight: '#262626',

  text: '#E8E8F0',
  textSecondary: '#A0A0B8',
  textMuted: '#6E6E88',

  primary: '#00D4E8',
  primaryDark: '#00A8BA',
  danger: '#FF5E5E',
  accent: '#FFAA22',

  success: '#66DD22',
  warning: '#FFAA22',
  error: '#FF5E5E',

  border: '#262626',
  borderLight: '#1F1F1F',
  divider: '#171717',

  inputBackground: '#171717',
  inputBorder: '#262626',
  inputBorderFocused: '#00D4E8',
  inputText: '#E5E5E5',
  inputFocusedBackground: '#262626',
  placeholder: '#737373',

  buttonPrimary: '#00D4E8',
  buttonPrimaryText: '#0D0D0D',
  buttonPrimaryBorder: '#0097A7',
  buttonSecondary: '#171717',
  buttonSecondaryText: '#E5E5E5',
  buttonSecondaryBorder: '#262626',
  buttonDanger: '#FF5E5E',
  buttonDangerText: '#FFFFFF',
  buttonDangerBorder: '#CC4444',

  cardBackground: '#171717',
  cardBorder: '#262626',
  cardShadow: 'rgba(0, 0, 0, 0.4)',

  modalOverlay: 'rgba(0, 0, 0, 0.7)',
  modalBackground: '#171717',
  modalBorder: '#262626',

  iconPickerBackground: '#0F1A1B',

  categorySelectedBackground: '#0F1A1B',

  webContainerBackground: '#0A0A0A',
};

export const theme = {
  colors: lightColors,

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  fontFamily: 'Nunito_700Bold',

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;
