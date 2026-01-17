import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, ArrowRight, TrendingUp, Target, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sfProDisplayBold, sfProDisplayMedium } from '@/constants/Typography';
import { AppColors } from '@/constants/colors';

const { height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(50)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(buttonAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, slideAnim, cardAnim, buttonAnim, buttonOpacity, floatAnim]);

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#F0F7FF', '#E8F2FF']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.brandContainer}>
            <LinearGradient
              colors={[AppColors.primary, AppColors.primaryDark]}
              style={styles.brandIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Leaf color="#FFFFFF" size={20} />
            </LinearGradient>
            <Text style={styles.brandName}>Hayati</Text>
          </View>
        </Animated.View>

        <View style={styles.heroSection}>
          <Animated.View
            style={[
              styles.cardsContainer,
              {
                opacity: cardAnim,
                transform: [{ translateY: floatTranslate }],
              }
            ]}
          >
            <View style={styles.featureCard}>
              <LinearGradient
                colors={[AppColors.primary, AppColors.primaryDark]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardIconContainer}>
                  <TrendingUp color="#FFFFFF" size={28} />
                </View>
                <Text style={styles.cardTitle}>Track Finances</Text>
                <Text style={styles.cardSubtitle}>Smart insights for your money</Text>
                <View style={styles.cardStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>+24%</Text>
                    <Text style={styles.statLabel}>Savings</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>$2.4k</Text>
                    <Text style={styles.statLabel}>This Month</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.smallCardsRow}>
              <View style={styles.smallCard}>
                <View style={[styles.smallCardIcon, { backgroundColor: AppColors.blue[100] }]}>
                  <Target color={AppColors.primary} size={20} />
                </View>
                <Text style={styles.smallCardTitle}>Goals</Text>
                <Text style={styles.smallCardValue}>5 Active</Text>
              </View>
              <View style={styles.smallCard}>
                <View style={[styles.smallCardIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Sparkles color="#F59E0B" size={20} />
                </View>
                <Text style={styles.smallCardTitle}>Habits</Text>
                <Text style={styles.smallCardValue}>12 Streak</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <Text style={styles.title}>Take Control of</Text>
            <Text style={styles.titleHighlight}>Your Future</Text>
            <Text style={styles.subtitle}>
              Track spending, build habits, and achieve your goals with intelligent insights.
            </Text>
          </Animated.View>
        </View>

        <Animated.View 
          style={[
            styles.buttonsContainer, 
            { 
              opacity: buttonOpacity, 
              transform: [{ translateY: buttonAnim }] 
            }
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/signup' as any)}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={[AppColors.primary, AppColors.primaryDark]}
              style={styles.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <View style={styles.buttonArrow}>
                <ArrowRight color="#FFFFFF" size={20} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: AppColors.blue[100],
    opacity: 0.5,
  },
  decorativeCircle2: {
    position: 'absolute',
    top: height * 0.3,
    left: -120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: AppColors.blue[50],
    opacity: 0.6,
  },
  decorativeCircle3: {
    position: 'absolute',
    bottom: 100,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: AppColors.blue[100],
    opacity: 0.4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: sfProDisplayBold,
    fontSize: 22,
    color: AppColors.textPrimary,
    letterSpacing: -0.3,
    fontWeight: '700',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
  },
  cardsContainer: {
    gap: 16,
  },
  featureCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  cardGradient: {
    padding: 24,
    borderRadius: 24,
  },
  cardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: sfProDisplayMedium,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 20,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: sfProDisplayMedium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  smallCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  smallCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  smallCardTitle: {
    fontFamily: sfProDisplayMedium,
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  smallCardValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    color: AppColors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  textContainer: {
    gap: 8,
  },
  title: {
    fontFamily: sfProDisplayBold,
    fontSize: 36,
    color: AppColors.textPrimary,
    lineHeight: 42,
    letterSpacing: -0.8,
    fontWeight: '700',
  },
  titleHighlight: {
    fontFamily: sfProDisplayBold,
    fontSize: 36,
    color: AppColors.primary,
    lineHeight: 42,
    letterSpacing: -0.8,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: sfProDisplayMedium,
    fontSize: 16,
    color: AppColors.textSecondary,
    lineHeight: 24,
    fontWeight: '400',
    marginTop: 8,
  },
  buttonsContainer: {
    gap: 14,
  },
  buttonWrapper: {
    borderRadius: 16,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButton: {
    height: 58,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 15,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
});
