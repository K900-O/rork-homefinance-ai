import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowRight, 
  ArrowLeft, 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp, 
  Check,
  Briefcase,
  Home,
  GraduationCap,
  Plane,
  Umbrella,
  Shield,
  BarChart3,
  Zap
} from 'lucide-react-native';
import { useFinance } from '@/contexts/FinanceContext';
import type { RiskTolerance } from '@/constants/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/colors';
import { sfProDisplayRegular, sfProDisplayMedium, sfProDisplayBold } from '@/constants/Typography';
import { BlueGlow } from '@/components/BlueGlow';

const { width } = Dimensions.get('window');

const AVAILABLE_GOALS = [
  { id: 'Emergency Fund', icon: Umbrella },
  { id: 'Retirement Planning', icon: Umbrella },
  { id: 'Buy a Home', icon: Home },
  { id: 'Pay Off Debt', icon: Shield },
  { id: 'Save for Vacation', icon: Plane },
  { id: 'Build Wealth', icon: TrendingUp },
  { id: 'Education Fund', icon: GraduationCap },
  { id: 'Start a Business', icon: Briefcase },
];

const RISK_OPTIONS: { value: RiskTolerance; label: string; description: string; icon: any }[] = [
  { value: 'conservative', label: 'Conservative', description: 'Lower risk, stable returns', icon: Shield },
  { value: 'moderate', label: 'Moderate', description: 'Balanced risk and growth', icon: BarChart3 },
  { value: 'aggressive', label: 'Aggressive', description: 'Higher risk, higher potential', icon: Zap },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; email?: string; password?: string }>();
  const { signup } = useFinance();

  const [currentStep, setCurrentStep] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [householdSize, setHouseholdSize] = useState('1');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('moderate');
  const [isLoading, setIsLoading] = useState(false);

  // Step Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Initial Entrance Animation
  const initialFade = useRef(new Animated.Value(0)).current;
  const initialSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Initial entrance animation
    Animated.parallel([
      Animated.timing(initialFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(initialSlide, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [initialFade, initialSlide]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / 4,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, progressAnim]);

  const animateSlide = (direction: 'forward' | 'backward') => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction === 'forward' ? -20 : 20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      slideAnim.setValue(direction === 'forward' ? 20 : -20);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    Keyboard.dismiss();
    
    if (currentStep === 0) {
      const income = parseFloat(monthlyIncome);
      if (!monthlyIncome || isNaN(income) || income <= 0) {
        Alert.alert('Invalid Input', 'Please enter a valid monthly income greater than 0');
        return;
      }
    }

    if (currentStep === 1) {
      const size = parseInt(householdSize);
      if (!householdSize || isNaN(size) || size < 1) {
        Alert.alert('Invalid Input', 'Please enter a valid household size');
        return;
      }
    }

    if (currentStep === 2) {
      if (selectedGoals.length === 0) {
        Alert.alert('Selection Required', 'Please select at least one financial goal');
        return;
      }
    }

    if (currentStep < 3) {
      animateSlide('forward');
      // Small delay to allow fade out to happen before state change
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 150);
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();
    if (currentStep > 0) {
      animateSlide('backward');
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
      }, 150);
    }
  };

  const handleComplete = async () => {
    if (!params.name || !params.email || !params.password) {
      Alert.alert('Error', 'Missing registration information. Please start over.');
      router.replace('/login' as any);
      return;
    }

    setIsLoading(true);
    try {
      const success = await signup({
        name: params.name,
        email: params.email,
        password: params.password,
        monthlyIncome: parseFloat(monthlyIncome),
        householdSize: parseInt(householdSize),
        primaryGoals: selectedGoals,
        riskTolerance,
      });

      if (success) {
        router.replace('/(tabs)/(home)/home' as any);
      } else {
        Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <View style={styles.headerContainer}>
              <View style={styles.iconContainer}>
                <DollarSign color={AppColors.textPrimary} size={32} />
              </View>
              <Text style={styles.stepTitle}>Monthly Income</Text>
              <Text style={styles.stepDescription}>
                Enter your total monthly income after taxes. This builds your budget foundation.
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.currencyPrefix}>JD</Text>
              <TextInput
                style={styles.mainInput}
                value={monthlyIncome}
                onChangeText={setMonthlyIncome}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={AppColors.textSecondary}
                autoFocus
                selectionColor={AppColors.primary}
              />
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.headerContainer}>
              <View style={styles.iconContainer}>
                <Users color={AppColors.textPrimary} size={32} />
              </View>
              <Text style={styles.stepTitle}>Household Size</Text>
              <Text style={styles.stepDescription}>
                How many people does this income support?
              </Text>
            </View>

            <View style={styles.gridContainer}>
              {[1, 2, 3, 4, 5, 6].map(size => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.gridOption,
                    householdSize === size.toString() && styles.gridOptionSelected,
                  ]}
                  onPress={() => setHouseholdSize(size.toString())}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.gridOptionText,
                      householdSize === size.toString() && styles.gridOptionTextSelected,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.otherInputContainer}>
              <Text style={styles.otherLabel}>Other amount</Text>
              <TextInput
                style={styles.otherInput}
                value={householdSize}
                onChangeText={setHouseholdSize}
                keyboardType="number-pad"
                placeholder="#"
                placeholderTextColor={AppColors.textSecondary}
                textAlign="center"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
             <View style={styles.headerContainer}>
              <View style={styles.iconContainer}>
                <Target color={AppColors.textPrimary} size={32} />
              </View>
              <Text style={styles.stepTitle}>Financial Goals</Text>
              <Text style={styles.stepDescription}>
                What are you aiming for? Select all that apply.
              </Text>
            </View>

            <ScrollView 
              style={styles.scrollContainer} 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.goalsGrid}>
                {AVAILABLE_GOALS.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                    <TouchableOpacity
                      key={goal.id}
                      style={[
                        styles.goalCard,
                        isSelected && styles.goalCardSelected,
                      ]}
                      onPress={() => toggleGoal(goal.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.goalIconWrapper, isSelected && styles.goalIconWrapperSelected]}>
                        <Icon size={24} color={isSelected ? '#000' : '#FFF'} />
                      </View>
                      <Text
                        style={[
                          styles.goalText,
                          isSelected && styles.goalTextSelected,
                        ]}
                      >
                        {goal.id}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkMark}>
                          <Check size={16} color="#000" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={styles.headerContainer}>
              <View style={styles.iconContainer}>
                <TrendingUp color={AppColors.textPrimary} size={32} />
              </View>
              <Text style={styles.stepTitle}>Risk Tolerance</Text>
              <Text style={styles.stepDescription}>
                Select the approach that best matches your investment style.
              </Text>
            </View>

            <View style={styles.riskList}>
              {RISK_OPTIONS.map(option => {
                 const Icon = option.icon;
                 const isSelected = riskTolerance === option.value;
                 return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.riskCard,
                      isSelected && styles.riskCardSelected,
                    ]}
                    onPress={() => setRiskTolerance(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.riskIconBox, isSelected && styles.riskIconBoxSelected]}>
                      <Icon size={24} color={isSelected ? '#000' : '#FFF'} />
                    </View>
                    <View style={styles.riskInfo}>
                      <Text
                        style={[
                          styles.riskTitle,
                          isSelected && styles.riskTitleSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text
                        style={[
                          styles.riskDesc,
                          isSelected && styles.riskDescSelected,
                        ]}
                      >
                        {option.description}
                      </Text>
                    </View>
                    {isSelected && <Check size={20} color="#000" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <BlueGlow />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <Animated.View 
              style={{ 
                flex: 1,
                opacity: initialFade,
                transform: [{ translateY: initialSlide }]
              }}
            >
              <View style={styles.progressBarContainer}>
                <Animated.View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      }) 
                    }
                  ]} 
                />
              </View>

              <View style={styles.mainContent}>
                <Animated.View 
                  style={[
                    styles.animatedContainer, 
                    { 
                      opacity: fadeAnim,
                      transform: [{ translateX: slideAnim }] 
                    }
                  ]}
                >
                  {renderStep()}
                </Animated.View>
              </View>

              <View style={styles.footer}>
                <View style={styles.footerButtons}>
                  {currentStep > 0 ? (
                    <TouchableOpacity 
                      style={styles.backButton} 
                      onPress={handleBack}
                      activeOpacity={0.7}
                    >
                      <ArrowLeft color={AppColors.textPrimary} size={24} />
                    </TouchableOpacity>
                  ) : <View style={{ width: 48 }} />} {/* Spacer */}
                  
                  <TouchableOpacity
                    style={[styles.nextButton, isLoading && styles.buttonDisabled]}
                    onPress={currentStep === 3 ? handleComplete : handleNext}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.nextButtonText}>
                      {isLoading ? 'Processing...' : currentStep === 3 ? 'Get Started' : 'Continue'}
                    </Text>
                    {!isLoading && <ArrowRight color="#FFFFFF" size={20} strokeWidth={2.5} />}
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#27272A',
    marginHorizontal: 24,
    marginTop: 10,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  mainContent: {
    flex: 1,
    paddingTop: 40,
  },
  animatedContainer: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerContainer: {
    marginBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  stepTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
    fontWeight: '700' as const,
  },
  stepDescription: {
    fontFamily: sfProDisplayRegular,
    fontSize: 16,
    color: '#A1A1AA',
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  
  // Input Step
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#27272A',
    paddingBottom: 12,
    marginTop: 20,
  },
  currencyPrefix: {
    fontFamily: sfProDisplayBold,
    fontSize: 40,
    color: '#FFFFFF',
    marginRight: 12,
    fontWeight: '700' as const,
  },
  mainInput: {
    fontFamily: sfProDisplayBold,
    flex: 1,
    fontSize: 40,
    color: '#FFFFFF',
    height: 60,
    fontWeight: '700' as const,
  },

  // Household Step
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  gridOption: {
    width: (width - 48 - 24) / 3,
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  gridOptionText: {
    fontFamily: sfProDisplayBold,
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  gridOptionTextSelected: {
    color: '#000000',
  },
  otherInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  otherLabel: {
    fontFamily: sfProDisplayMedium,
    fontSize: 16,
    color: '#A1A1AA',
    fontWeight: '500' as const,
  },
  otherInput: {
    fontFamily: sfProDisplayMedium,
    fontSize: 20,
    color: '#FFFFFF',
    minWidth: 60,
    textAlign: 'right' as const,
    fontWeight: '600' as const,
  },

  // Goals Step
  scrollContainer: {
    flex: 1,
    marginHorizontal: -24, // Break out of padding
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    width: (width - 48 - 12) / 2,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 110,
    justifyContent: 'space-between',
  },
  goalCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  goalIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  goalIconWrapperSelected: {
    backgroundColor: '#E4E4E7',
  },
  goalText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  goalTextSelected: {
    color: '#000000',
  },
  checkMark: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#E4E4E7',
    borderRadius: 10,
    padding: 2,
  },

  // Risk Step
  riskList: {
    gap: 12,
  },
  riskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    borderWidth: 1,
    borderColor: '#333',
  },
  riskCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  riskIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  riskIconBoxSelected: {
    backgroundColor: '#E4E4E7',
  },
  riskInfo: {
    flex: 1,
  },
  riskTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 17,
    color: '#FFFFFF',
    marginBottom: 4,
    fontWeight: '700' as const,
  },
  riskTitleSelected: {
    color: '#000000',
  },
  riskDesc: {
    fontFamily: sfProDisplayRegular,
    fontSize: 13,
    color: '#A1A1AA',
    fontWeight: '400' as const,
  },
  riskDescSelected: {
    color: '#52525B',
  },

  // Footer
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 0 : 24,
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 100,
    gap: 8,
    minWidth: 140,
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontFamily: sfProDisplayBold,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
});
