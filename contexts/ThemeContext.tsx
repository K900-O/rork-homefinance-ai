import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState, useMemo } from 'react';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = '@domusiq_theme_mode';

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  card: string;
  cardSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  border: string;
  borderSecondary: string;
  icon: string;
  iconSecondary: string;
  tabBar: string;
  tabBarBorder: string;
  inputBackground: string;
  modalBackground: string;
  overlay: string;
  shadow: string;
  primary: string;
  primaryLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;
}

const darkTheme: ThemeColors = {
  background: '#000000',
  backgroundSecondary: '#09090B',
  surface: '#18181B',
  surfaceSecondary: '#27272A',
  card: '#18181B',
  cardSecondary: '#27272A',
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  textInverse: '#000000',
  border: '#27272A',
  borderSecondary: '#3F3F46',
  icon: '#FFFFFF',
  iconSecondary: '#A1A1AA',
  tabBar: '#000000',
  tabBarBorder: '#18181B',
  inputBackground: '#27272A',
  modalBackground: '#18181B',
  overlay: 'rgba(0, 0, 0, 0.8)',
  shadow: 'rgba(0, 0, 0, 0.5)',
  primary: '#3B82F6',
  primaryLight: 'rgba(59, 130, 246, 0.15)',
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.15)',
  info: '#6366F1',
  infoLight: 'rgba(99, 102, 241, 0.15)',
};

const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  surface: '#F1F5F9',
  surfaceSecondary: '#E2E8F0',
  card: '#FFFFFF',
  cardSecondary: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  border: '#E2E8F0',
  borderSecondary: '#CBD5E1',
  icon: '#0F172A',
  iconSecondary: '#64748B',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  inputBackground: '#F1F5F9',
  modalBackground: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  primary: '#3B82F6',
  primaryLight: 'rgba(59, 130, 246, 0.1)',
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.1)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.1)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.1)',
  info: '#6366F1',
  infoLight: 'rgba(99, 102, 241, 0.1)',
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeModeState(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = useCallback(async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeModeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    await setThemeMode(newTheme);
  }, [themeMode, setThemeMode]);

  const colors = useMemo(() => {
    return themeMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode]);

  const isDark = themeMode === 'dark';
  const isLight = themeMode === 'light';

  return useMemo(() => ({
    themeMode,
    setThemeMode,
    toggleTheme,
    colors,
    isDark,
    isLight,
    isLoading,
  }), [themeMode, setThemeMode, toggleTheme, colors, isDark, isLight, isLoading]);
});
