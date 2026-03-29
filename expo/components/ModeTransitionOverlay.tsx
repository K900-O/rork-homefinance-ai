import React from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import { useAppMode } from '@/contexts/AppModeContext';
import { DollarSign, User } from 'lucide-react-native';

export default function ModeTransitionOverlay() {
  const { isTransitioning, transitionProgress, mode } = useAppMode();

  if (!isTransitioning) return null;

  const overlayOpacity = transitionProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 1],
  });

  const iconScale = transitionProgress.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0.3, 1.2, 1.2, 0.3],
  });

  const iconOpacity = transitionProgress.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  const iconRotate = transitionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rippleScale = transitionProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.5, 3],
  });

  const rippleOpacity = transitionProgress.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 0.3, 0.1, 0],
  });

  const isGoingToPersonal = mode === 'financial';
  const primaryColor = isGoingToPersonal ? '#10B981' : '#2563EB';
  const secondaryColor = isGoingToPersonal ? '#059669' : '#1D4ED8';

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <View style={styles.gradientBackground}>
        <View style={[styles.gradientTop, { backgroundColor: primaryColor }]} />
        <View style={[styles.gradientBottom, { backgroundColor: secondaryColor }]} />
      </View>
      
      <Animated.View
        style={[
          styles.ripple,
          {
            backgroundColor: '#FFFFFF',
            transform: [{ scale: rippleScale }],
            opacity: rippleOpacity,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { scale: iconScale },
              { rotate: iconRotate },
            ],
            opacity: iconOpacity,
          },
        ]}
      >
        <View style={styles.iconBackground}>
          {isGoingToPersonal ? (
            <User color="#10B981" size={48} strokeWidth={2.5} />
          ) : (
            <DollarSign color="#2563EB" size={48} strokeWidth={2.5} />
          )}
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.particles,
          {
            opacity: iconOpacity,
          },
        ]}
      >
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const particleTranslateX = transitionProgress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, Math.cos(angle) * 60, Math.cos(angle) * 100],
          });
          const particleTranslateY = transitionProgress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, Math.sin(angle) * 60, Math.sin(angle) * 100],
          });
          const particleOpacity = transitionProgress.interpolate({
            inputRange: [0, 0.3, 0.7, 1],
            outputRange: [0, 1, 0.5, 0],
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  backgroundColor: '#FFFFFF',
                  transform: [
                    { translateX: particleTranslateX },
                    { translateY: particleTranslateY },
                  ],
                  opacity: particleOpacity,
                },
              ]}
            />
          );
        })}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  ripple: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  particles: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
