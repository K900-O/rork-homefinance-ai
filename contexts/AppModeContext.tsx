import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { router } from 'expo-router';

export type AppMode = 'financial' | 'personal';

const STORAGE_KEY = '@domusiq_app_mode';

export const [AppModeProvider, useAppMode] = createContextHook(() => {
  const [mode, setModeState] = useState<AppMode>('financial');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMode();
  }, []);

  const loadMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedMode === 'financial' || savedMode === 'personal') {
        setModeState(savedMode);
      }
    } catch (error) {
      console.error('Error loading app mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setMode = useCallback(async (newMode: AppMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newMode);
      setModeState(newMode);
    } catch (error) {
      console.error('Error saving app mode:', error);
    }
  }, []);

  const toggleMode = useCallback(async () => {
    const newMode = mode === 'financial' ? 'personal' : 'financial';
    await setMode(newMode);
    
    if (newMode === 'financial') {
      router.replace('/(tabs)/(home)/home');
    } else {
      router.replace('/(tabs)/(personal)/personal');
    }
  }, [mode, setMode]);

  const isFinancialMode = mode === 'financial';
  const isPersonalMode = mode === 'personal';

  return useMemo(() => ({
    mode,
    setMode,
    toggleMode,
    isFinancialMode,
    isPersonalMode,
    isLoading,
  }), [mode, setMode, toggleMode, isFinancialMode, isPersonalMode, isLoading]);
});
