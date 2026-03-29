import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface AnimatedListItemProps {
  children: React.ReactNode;
  index?: number;
  style?: ViewStyle;
  animateOnMount?: boolean;
  isCompleted?: boolean;
  onCompletionChange?: boolean;
}

export function AnimatedListItem({ 
  children, 
  index = 0, 
  style,
  animateOnMount = true,
}: AnimatedListItemProps) {
  const fadeAnim = useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(animateOnMount ? 20 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(animateOnMount ? 0.95 : 1)).current;

  useEffect(() => {
    if (animateOnMount) {
      const delay = index * 50;
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 50,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animateOnMount, fadeAnim, slideAnim, scaleAnim, index]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

interface AnimatedCompletionItemProps {
  children: React.ReactNode;
  isCompleted: boolean;
  style?: ViewStyle;
  onComplete?: () => void;
}

export function AnimatedCompletionItem({ 
  children, 
  isCompleted,
  style,
  onComplete,
}: AnimatedCompletionItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const prevCompleted = useRef(isCompleted);

  useEffect(() => {
    if (isCompleted && !prevCompleted.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.03,
            friction: 3,
            tension: 200,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onComplete?.();
      });
    }
    prevCompleted.current = isCompleted;
  }, [isCompleted, scaleAnim, glowAnim, onComplete]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

interface AnimatedAddItemProps {
  children: React.ReactNode;
  style?: ViewStyle;
  itemKey: string;
}

export function AnimatedAddItem({ 
  children, 
  style,
  itemKey,
}: AnimatedAddItemProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      
      Animated.parallel([
        Animated.spring(fadeAnim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fadeAnim, slideAnim, scaleAnim, itemKey]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function useItemAnimation() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const triggerPressAnimation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerSuccessAnimation = (callback?: () => void) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  return {
    scaleAnim,
    triggerPressAnimation,
    triggerSuccessAnimation,
  };
}


