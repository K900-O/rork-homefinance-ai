import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { AppColors } from '@/constants/colors';
import { fontFamily, helveticaMedium, helveticaBold } from '@/constants/Typography';

const { width } = Dimensions.get('window');

interface SuccessAnimationProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  onComplete?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  type?: 'transaction' | 'habit' | 'goal' | 'activity' | 'contribution' | 'budget' | 'general';
}

const TYPE_CONFIG = {
  transaction: {
    title: 'Transaction Added!',
    subtitle: 'Your transaction has been recorded successfully',
    icon: 'wallet',
  },
  habit: {
    title: 'Habit Created!',
    subtitle: 'Start building your new habit today',
    icon: 'check',
  },
  goal: {
    title: 'Goal Created!',
    subtitle: 'Your savings goal is now active',
    icon: 'target',
  },
  activity: {
    title: 'Activity Added!',
    subtitle: 'Your activity has been scheduled',
    icon: 'calendar',
  },
  contribution: {
    title: 'Contribution Added!',
    subtitle: 'Great progress towards your goal',
    icon: 'plus',
  },
  budget: {
    title: 'Budget Created!',
    subtitle: 'Start tracking your spending',
    icon: 'chart',
  },
  general: {
    title: 'Success!',
    subtitle: 'Action completed successfully',
    icon: 'check',
  },
};

export default function SuccessAnimation({
  visible,
  title,
  subtitle,
  onComplete,
  autoHide = true,
  autoHideDelay = 2000,
  type = 'general',
}: SuccessAnimationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const checkScaleAnim = useRef(new Animated.Value(0)).current;
  const ringScaleAnim = useRef(new Animated.Value(0.8)).current;
  const ringOpacityAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(1),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  const config = TYPE_CONFIG[type];
  const displayTitle = title || config.title;
  const displaySubtitle = subtitle || config.subtitle;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
      checkScaleAnim.setValue(0);
      ringScaleAnim.setValue(0.8);
      ringOpacityAnim.setValue(0);
      textOpacityAnim.setValue(0);
      slideAnim.setValue(30);
      particleAnims.forEach((anim) => {
        anim.scale.setValue(0);
        anim.opacity.setValue(1);
        anim.translateX.setValue(0);
        anim.translateY.setValue(0);
      });

      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(checkScaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 120,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(ringScaleAnim, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
          ...particleAnims.map((anim, index) => {
            const angle = (index / 8) * Math.PI * 2;
            const distance = 60 + Math.random() * 20;
            return Animated.parallel([
              Animated.timing(anim.scale, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateX, {
                toValue: Math.cos(angle) * distance,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateY, {
                toValue: Math.sin(angle) * distance,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.delay(300),
                Animated.timing(anim.opacity, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }),
              ]),
            ]);
          }),
        ]),
        Animated.parallel([
          Animated.timing(textOpacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            tension: 80,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      if (autoHide && onComplete) {
        const timer = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            onComplete();
          });
        }, autoHideDelay);

        return () => clearTimeout(timer);
      }
    }
  }, [visible, autoHide, autoHideDelay, onComplete, fadeAnim, scaleAnim, checkScaleAnim, ringScaleAnim, ringOpacityAnim, textOpacityAnim, slideAnim, particleAnims]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.backdrop} />
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.gradientCircle}>
            <Svg width={120} height={120} viewBox="0 0 120 120">
              <Defs>
                <LinearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={AppColors.blue[400]} stopOpacity={1} />
                  <Stop offset="100%" stopColor={AppColors.blue[600]} stopOpacity={1} />
                </LinearGradient>
                <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={AppColors.blue[200]} stopOpacity={0.8} />
                  <Stop offset="100%" stopColor={AppColors.blue[400]} stopOpacity={0.4} />
                </LinearGradient>
              </Defs>
              <Circle cx="60" cy="60" r="50" fill="url(#successGrad)" />
              <Circle cx="60" cy="60" r="45" fill="white" opacity={0.1} />
            </Svg>
          </View>

          <Animated.View
            style={[
              styles.ringContainer,
              {
                opacity: ringOpacityAnim,
                transform: [{ scale: ringScaleAnim }],
              },
            ]}
          >
            <View style={styles.ring} />
          </Animated.View>

          <Animated.View
            style={[
              styles.checkContainer,
              {
                transform: [{ scale: checkScaleAnim }],
              },
            ]}
          >
            <Svg width={50} height={50} viewBox="0 0 50 50">
              <Path
                d="M14 26 L22 34 L36 18"
                stroke="white"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </Animated.View>

          {particleAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  opacity: anim.opacity,
                  transform: [
                    { translateX: anim.translateX },
                    { translateY: anim.translateY },
                    { scale: anim.scale },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.particleDot,
                  {
                    backgroundColor: index % 2 === 0 ? AppColors.blue[400] : AppColors.blue[300],
                    width: 6 + (index % 3) * 2,
                    height: 6 + (index % 3) * 2,
                  },
                ]}
              />
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacityAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.subtitle}>{displaySubtitle}</Text>
        </Animated.View>

        {!autoHide && onComplete && (
          <Animated.View style={{ opacity: textOpacityAnim }}>
            <TouchableOpacity style={styles.button} onPress={onComplete} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  gradientCircle: {
    position: 'absolute',
    shadowColor: AppColors.blue[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  ringContainer: {
    position: 'absolute',
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: AppColors.blue[200],
  },
  checkContainer: {
    position: 'absolute',
  },
  particle: {
    position: 'absolute',
  },
  particleDot: {
    borderRadius: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: helveticaBold,
    fontSize: 28,
    fontWeight: '700' as const,
    color: AppColors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fontFamily,
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.75,
  },
  button: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontFamily: helveticaMedium,
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
