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
  StatusBar,
  Easing,
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
  Leaf
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import type { RiskTolerance } from '@/constants/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/colors';
import { sfProDisplayRegular, sfProDisplayMedium, sfProDisplayBold } from '@/constants/Typography';
import { LinearGradient } from 'expo-linear-gradient';

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
  { value: 'aggressive', label: 'Aggressive', description: 'Higher risk, higher potential', icon: Leaf },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; email?: string; password?: string }>();
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [householdSize, setHouseholdSize] = useState('1');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('moderate');
  const [isLoading, setIsLoading] = useState(false);
  
  const incomeInputRef = useRef<TextInput>(null);
  const householdInputRef = useRef<TextInput>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0.25)).current; // Start at 1/4

  // Entrance Animations
  const initialFadeAnim = useRef(new Animated.Value(0)).current;
  const initialSlideAnim = useRef(new Animated.Value(100)).current; // For card
  const headerSlideAnim = useRef(new Animated.Value(-50)).current; // For top section
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance Animation
    Animated.parallel([
      Animated.timing(initialFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(initialSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [initialFadeAnim, initialSlideAnim, headerSlideAnim]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / 4,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (currentStep === 0) {
      setTimeout(() => incomeInputRef.current?.focus(), 300);
    }
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
      router.replace('/signup' as any);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting signup process...');
      const { data: authData, error: authError } = await signUp(
        params.email,
        params.password,
        params.name
      );

      if (authError || !authData?.user) {
        console.error('Signup failed:', authError);
        Alert.alert('Error', 'Failed to create account. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('Signup successful, user ID:', authData.user.id);
      
      // Wait a moment for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create profile directly with Supabase since we have the user ID
      const { createProfileDirect } = await import('@/lib/supabase');
      const success = await createProfileDirect(authData.user.id, {
        name: params.name,
        email: params.email,
        monthlyIncome: parseFloat(monthlyIncome),
        householdSize: parseInt(householdSize),
        primaryGoals: selectedGoals,
        riskTolerance,
      });

      if (success) {
        console.log('Profile created successfully, navigating to home...');
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
              <View style={styles.iconBadge}>
                <Image 
                  source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/tuczontkm4ohdugp8m10b' }}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.stepTitle}>Monthly Income</Text>
              <Text style={styles.stepDescription}>
                Enter your total monthly income after taxes. This builds your budget foundation.
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.currencyPrefix}>JD</Text>
              <TextInput
                ref={incomeInputRef}
                style={styles.mainInput}
                value={monthlyIncome}
                onChangeText={setMonthlyIncome}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                returnKeyType="next"
                onSubmitEditing={handleNext}
                selectionColor="#FFFFFF"
                blurOnSubmit={false}
              />
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.headerContainer}>
              <View style={styles.iconBadge}>
                <Image 
                  source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/tuczontkm4ohdugp8m10b' }}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
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
                ref={householdInputRef}
                style={styles.otherInput}
                value={householdSize}
                onChangeText={setHouseholdSize}
                keyboardType="number-pad"
                placeholder="#"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                returnKeyType="next"
                onSubmitEditing={handleNext}
                selectionColor="#FFFFFF"
                blurOnSubmit={false}
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
             <View style={styles.headerContainer}>
              <View style={styles.iconBadge}>
                <Image 
                  source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/tuczontkm4ohdugp8m10b' }}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
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
                        <Icon size={24} color={isSelected ? AppColors.primary : '#FFFFFF'} />
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
                          <Check size={14} color={AppColors.primary} />
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
              <View style={styles.iconBadge}>
                <Image 
                  source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/tuczontkm4ohdugp8m10b' }}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
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
                      <Icon size={24} color={isSelected ? AppColors.primary : '#FFFFFF'} />
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
                    {isSelected && <Check size={20} color={AppColors.primary} />}
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
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.topSection, { paddingTop: insets.top }]}>
        <Animated.View 
          style={{ 
            opacity: initialFadeAnim, 
            transform: [{ translateY: headerSlideAnim }] 
          }}
        >
          {currentStep > 0 ? (
            <TouchableOpacity 
              onPress={handleBack} 
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft color="#000" size={24} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}
        </Animated.View>
      </View>

      {/* Bottom Section - Blue Card */}
      <Animated.View 
        style={[
          styles.bottomSection,
          {
            opacity: initialFadeAnim,
            transform: [{ translateY: initialSlideAnim }]
          }
        ]}
      >
        <LinearGradient
          colors={[AppColors.primaryLight, AppColors.primary, AppColors.primaryDark]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
             <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
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

                    <ScrollView
                        contentContainerStyle={[styles.mainScrollContent, { paddingBottom: insets.bottom + 20 }]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
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

                        <View style={styles.footer}>
                            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                                <TouchableOpacity
                                    style={[styles.nextButton, isLoading && styles.buttonDisabled]}
                                    onPress={currentStep === 3 ? handleComplete : handleNext}
                                    onPressIn={() => {
                                        Animated.spring(buttonScaleAnim, {
                                            toValue: 0.95,
                                            useNativeDriver: true,
                                        }).start();
                                    }}
                                    onPressOut={() => {
                                        Animated.spring(buttonScaleAnim, {
                                            toValue: 1,
                                            useNativeDriver: true,
                                        }).start();
                                    }}
                                    disabled={isLoading}
                                    activeOpacity={0.9}
                                >
                                    <Text style={styles.nextButtonText}>
                                    {isLoading ? 'Processing...' : currentStep === 3 ? 'Get Started' : 'Continue'}
                                    </Text>
                                    {!isLoading && <ArrowRight color={AppColors.primary} size={20} />}
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
    minHeight: 80, 
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonPlaceholder: {
    height: 24,
  },
  backButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 16,
    color: '#000000',
  },
  bottomSection: {
    flex: 1,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    overflow: 'hidden',
    marginTop: -20,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 32,
    marginTop: 32,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  mainScrollContent: {
    flexGrow: 1,
    paddingTop: 32,
  },
  animatedContainer: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: 32,
    flex: 1,
  },
  headerContainer: {
    marginBottom: 32,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  iconImage: {
    width: 36,
    height: 36,
  },
  stepTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  stepDescription: {
    fontFamily: sfProDisplayRegular,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
  
  // Step 0: Income
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    paddingBottom: 12,
    marginTop: 20,
  },
  currencyPrefix: {
    fontFamily: sfProDisplayBold,
    fontSize: 40,
    color: '#FFFFFF',
    marginRight: 12,
  },
  mainInput: {
    fontFamily: sfProDisplayBold,
    flex: 1,
    fontSize: 40,
    color: '#FFFFFF',
    height: 60,
    padding: 0,
  },

  // Step 1: Household
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  gridOption: {
    width: (width - 64 - 24) / 3, // 64 horizontal padding, 24 gap (12*2)
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
  },
  gridOptionTextSelected: {
    color: AppColors.primary,
  },
  otherInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  otherLabel: {
    fontFamily: sfProDisplayMedium,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherInput: {
    fontFamily: sfProDisplayMedium,
    fontSize: 20,
    color: '#FFFFFF',
    minWidth: 60,
    textAlign: 'right' as const,
    padding: 0,
  },

  // Step 2: Goals
  scrollContainer: {
    marginHorizontal: -32,
    maxHeight: 400, // Limit height to keep footer visible
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    width: (width - 64 - 12) / 2,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  goalIconWrapperSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)', // Light blue tint
  },
  goalText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 15,
    color: '#FFFFFF',
  },
  goalTextSelected: {
    color: AppColors.primary,
  },
  checkMark: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 10,
    padding: 2,
  },

  // Step 3: Risk
  riskList: {
    gap: 12,
  },
  riskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  riskCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  riskIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  riskIconBoxSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  riskInfo: {
    flex: 1,
  },
  riskTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 17,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  riskTitleSelected: {
    color: AppColors.primary,
  },
  riskDesc: {
    fontFamily: sfProDisplayRegular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  riskDescSelected: {
    color: 'rgba(37, 99, 235, 0.8)',
  },

  // Footer
  footer: {
    padding: 32,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 18,
    color: AppColors.primary,
  },
});
