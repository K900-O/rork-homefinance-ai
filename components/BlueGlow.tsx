import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export function BlueGlow({ scale = 1, opacity = 0.6 }: { scale?: number, opacity?: number }) {
  const pulseAnim = useRef(new Animated.Value(opacity)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: opacity,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, opacity]);

  return (
    <Animated.View style={[styles.glowContainer, { opacity: pulseAnim }]}>
      <LinearGradient
        colors={['#3B82F6', '#1E40AF', '#000000']}
        style={styles.glowGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.4, 1]}
      />
      <View style={[styles.glowOrb, { transform: [{ scale }] }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.65,
    overflow: 'hidden',
  },
  glowGradient: {
    flex: 1,
  },
  glowOrb: {
    position: 'absolute',
    top: -height * 0.1,
    left: width * 0.1,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#3B82F6',
    opacity: 0.4,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 100,
  },
});
