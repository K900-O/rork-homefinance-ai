import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { router } from 'expo-router';
import { Animated, Easing } from 'react-native';

export type AppMode = 'financial' | 'personal';

const STORAGE_KEY = '@domusiq_app_mode';

export const [AppModeProvider, useAppMode] = createContextHook(() => {
  const [mode, setModeState] = useState<AppMode>('financial');
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionProgress = useRef(new Animated.Value(0)).current;
  const transitionScale = useRef(new Animated.Value(1)).current;

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
    
    setIsTransitioning(true);
    
    Animated.parallel([
      Animated.timing(transitionProgress, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Cubic bezier for smooth ease-in-out
      }),
      Animated.sequence([
        Animated.timing(transitionScale, {
          toValue: 0.95,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(transitionScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
      ])
    ]).start(async () => {
      await setMode(newMode);
      
      if (newMode === 'financial') {
        router.replace('/(tabs)/(home)/home');
      } else {
        router.replace('/(tabs)/(personal)/personal');
      }
      
      setTimeout(() => {
        Animated.timing(transitionProgress, {
          toValue: 0,
          duration: 0, // Reset instantly after navigation, overlay handles fade out if needed or we animate it back
          useNativeDriver: true,
        }).start(() => {
          setIsTransitioning(false);
        });
      }, 50); // Small delay to ensure render
    });
  }, [mode, setMode, transitionProgress, transitionScale]);

  const isFinancialMode = mode === 'financial';
  const isPersonalMode = mode === 'personal';

  return useMemo(() => ({
    mode,
    setMode,
    toggleMode,
    isFinancialMode,
    isPersonalMode,
    isLoading,
    isTransitioning,
    transitionProgress,
    transitionScale,
  }), [mode, setMode, toggleMode, isFinancialMode, isPersonalMode, isLoading, isTransitioning, transitionProgress, transitionScale]);
});
