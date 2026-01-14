import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X,
  Lock,
  Check,
  Zap,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sfProDisplayRegular, sfProDisplayMedium, sfProDisplayBold } from '@/constants/Typography';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Own Your Money,',
    highlight: 'Shape Your Life.',
    subtitle: 'From saving smart to spending wise, your financial goals begin to rise.',
  },
  {
    title: 'Track Every',
    highlight: 'Dollar Wisely.',
    subtitle: 'Intuitive expense tracking that helps you understand where your money goes.',
  },
  {
    title: 'Achieve Your',
    highlight: 'Financial Goals.',
    subtitle: 'Set targets, monitor progress, and celebrate your financial victories.',
  },
  {
    title: 'AI-Powered',
    highlight: 'Insights.',
    subtitle: 'Get personalized recommendations to optimize your spending habits.',
  },
];

const PREMIUM_FEATURES = [
  {
    title: 'Advanced Analytics',
    description: 'Get deeper insights into your spending & investments instantly!',
    isPremium: true,
  },
  {
    title: 'Smart Filters',
    description: 'Track by categories, goals, or financial intentions that matter to you.',
    isPremium: true,
  },
  {
    title: 'Unlimited Transactions',
    description: 'No limits on adding expenses, income, or goals.',
    isPremium: false,
  },
  {
    title: '3 Monthly Boosts & Priority Support',
    description: 'Highlight key goals and get faster support.',
    isPremium: false,
  },
];

function BlueGlow() {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.glowContainer, { opacity: pulseAnim }]}>
      <LinearGradient
        colors={['#3B82F6', '#1E40AF', '#000000']}
        style={styles.glowGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.4, 1]}
      />
      <View style={styles.glowOrb} />
    </Animated.View>
  );
}

function PremiumModal({ 
  visible, 
  onClose 
}: { 
  visible: boolean; 
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'infinity'>('premium');
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleContinue = () => {
    onClose();
    router.push('/signup' as any);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.modalContent,
            { 
              transform: [{ translateY: slideAnim }],
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalBrand}>
              <View style={styles.modalBrandIcon}>
                <Zap color="#3B82F6" size={16} />
              </View>
              <Text style={styles.modalBrandText}>Hayati</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X color="#A1A1AA" size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            <Text style={styles.modalTitle}>More Control</Text>
            <Text style={styles.modalSubtitle}>to grow your wealth faster!</Text>

            <View style={styles.planToggle}>
              <TouchableOpacity
                style={[
                  styles.planOption,
                  selectedPlan === 'premium' && styles.planOptionActive,
                ]}
                onPress={() => setSelectedPlan('premium')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.planOptionText,
                  selectedPlan === 'premium' && styles.planOptionTextActive,
                ]}>Premium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.planOption,
                  selectedPlan === 'infinity' && styles.planOptionActive,
                ]}
                onPress={() => setSelectedPlan('infinity')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.planOptionText,
                  selectedPlan === 'infinity' && styles.planOptionTextActive,
                ]}>infinity</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.featuresCard}>
              {PREMIUM_FEATURES.map((feature, index) => (
                <View 
                  key={feature.title}
                  style={[
                    styles.featureItem,
                    index < PREMIUM_FEATURES.length - 1 && styles.featureItemBorder,
                  ]}
                >
                  <View style={styles.featureInfo}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                  <View style={[
                    styles.featureIcon,
                    !feature.isPremium && styles.featureIconActive,
                  ]}>
                    {feature.isPremium ? (
                      <Lock color="#71717A" size={16} />
                    ) : (
                      <Check color="#FFF" size={16} />
                    )}
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.andMore}>and more!</Text>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#60A5FA', '#3B82F6']}
                style={styles.continueGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.continueText}>
                  Continue — 1 month for $4.99
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              Recurring billing. Cancel anytime. By tapping Continue you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>.
            </Text>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPremium, setShowPremium] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentSlide, fadeAnim, slideAnim]);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setShowPremium(true);
    }
  };

  const handleSkip = () => {
    router.push('/login' as any);
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const currentSlideData = SLIDES[currentSlide];

  return (
    <View style={styles.container}>
      <BlueGlow />
      
      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.topSection} />
        
        <View style={styles.bottomSection}>
          <Animated.View
            style={[
              styles.textContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.brandContainer}>
              <View style={styles.brandIcon}>
                <Zap color="#3B82F6" size={18} />
              </View>
              <Text style={styles.brandName}>Hayati</Text>
            </View>

            <Text style={styles.title}>
              {currentSlideData.title}{'\n'}
              <Text style={styles.titleHighlight}>{currentSlideData.highlight}</Text>
            </Text>

            <Text style={styles.subtitle}>{currentSlideData.subtitle}</Text>

            <View style={styles.pagination}>
              {SLIDES.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentSlide ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          </Animated.View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleNext}
              activeOpacity={1}
            >
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <LinearGradient
                  colors={['#60A5FA', '#3B82F6']}
                  style={styles.nextButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.nextButtonText}>
                    {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                  </Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <PremiumModal 
        visible={showPremium} 
        onClose={() => setShowPremium(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
    overflow: 'hidden',
  },
  glowGradient: {
    flex: 1,
  },
  glowOrb: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.2,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#3B82F6',
    opacity: 0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  topSection: {
    flex: 1,
  },
  bottomSection: {
    paddingHorizontal: 28,
  },
  textContent: {
    marginBottom: 32,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 0.3,
    fontWeight: '600' as const,
  },
  title: {
    fontFamily: sfProDisplayBold,
    fontSize: 38,
    color: '#FFFFFF',
    lineHeight: 46,
    marginBottom: 14,
    letterSpacing: -0.5,
    fontWeight: '700' as const,
  },
  titleHighlight: {
    color: '#3B82F6',
  },
  subtitle: {
    fontFamily: sfProDisplayRegular,
    fontSize: 16,
    color: '#A1A1AA',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '400' as const,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#3B82F6',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#52525B',
  },
  buttonsContainer: {
    gap: 16,
  },
  nextButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  skipButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 16,
    color: '#A1A1AA',
    fontWeight: '500' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    maxHeight: height * 0.9,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalBrandIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBrandText: {
    fontFamily: sfProDisplayBold,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  modalTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: 4,
    fontWeight: '700' as const,
  },
  modalSubtitle: {
    fontFamily: sfProDisplayRegular,
    fontSize: 16,
    color: '#71717A',
    textAlign: 'center' as const,
    marginBottom: 24,
    fontWeight: '400' as const,
  },
  planToggle: {
    flexDirection: 'row',
    backgroundColor: '#18181B',
    borderRadius: 24,
    padding: 4,
    marginBottom: 20,
    alignSelf: 'center',
  },
  planOption: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  planOptionActive: {
    backgroundColor: '#27272A',
  },
  planOptionText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 14,
    color: '#71717A',
    fontWeight: '500' as const,
  },
  planOptionTextActive: {
    color: '#FFFFFF',
  },
  featuresCard: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  featureItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  featureInfo: {
    flex: 1,
    paddingRight: 12,
  },
  featureTitle: {
    fontFamily: sfProDisplayMedium,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 4,
    fontWeight: '600' as const,
  },
  featureDescription: {
    fontFamily: sfProDisplayRegular,
    fontSize: 13,
    color: '#71717A',
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconActive: {
    backgroundColor: '#3B82F6',
  },
  andMore: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center' as const,
    marginBottom: 20,
    fontWeight: '400' as const,
  },
  continueButton: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
  },
  continueGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  termsText: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#52525B',
    textAlign: 'center' as const,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  termsLink: {
    color: '#3B82F6',
  },
});
