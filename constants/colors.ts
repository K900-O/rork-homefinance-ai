const tintColorLight = '#FFFFFF';
const tintColorDark = '#FFFFFF';

export default {
  light: {
    text: '#FFFFFF',
    background: '#000000',
    tint: tintColorLight,
    icon: '#A1A1AA',
    tabIconDefault: '#52525B',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: tintColorDark,
    icon: '#A1A1AA',
    tabIconDefault: '#52525B',
    tabIconSelected: tintColorDark,
  },
};

export const AppColors = {
  primary: '#FFFFFF',
  primaryDark: '#E4E4E7',
  primaryLight: '#27272A',
  
  accent: '#27272A',
  accentLight: '#3F3F46',
  
  success: '#10B981',
  successLight: '#064E3B',
  
  warning: '#F59E0B',
  warningLight: '#78350F',
  
  danger: '#EF4444',
  dangerLight: '#7F1D1D',
  
  background: '#000000',
  backgroundLight: '#121212',
  backgroundDark: '#000000',
  
  surface: '#121212',
  surfaceDark: '#09090B',
  surfaceLight: '#27272A',
  surfaceBlue: '#18181B', // Kept name for compatibility but mapped to dark
  
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textLight: '#71717A',
  textDark: '#000000',
  textInverse: '#000000',
  
  border: '#27272A',
  borderDark: '#18181B',
  
  shadow: 'rgba(255, 255, 255, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  
  gradient: {
    start: '#27272A',
    middle: '#18181B',
    end: '#000000',
  },
  
  cardGradient: {
    start: '#333333',
    end: '#111111',
  },
  
  categories: {
    food: '#F59E0B',
    transport: '#3B82F6',
    entertainment: '#EC4899',
    shopping: '#8B5CF6',
    bills: '#EF4444',
    healthcare: '#10B981',
    education: '#6366F1',
    investment: '#14B8A6',
    savings: '#059669',
    income: '#10B981',
    other: '#A1A1AA',
  },
};
