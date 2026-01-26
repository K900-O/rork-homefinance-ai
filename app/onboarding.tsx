import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowRight, 
  ArrowLeft, 
  TrendingUp, 
  Check,
  Briefcase,
  Home,
  GraduationCap,
  Plane,
  Umbrella,
  Shield,
  BarChart3,
  Leaf,
  DollarSign,
  Heart,
  Layers,
  Dumbbell,
  BookOpen,
  Users,
  Coffee,
  Music,
  Film,
  Gamepad2,
  Target,
  Sun,
  Moon
} from 'lucide-react-native';
import { useAppMode } from '@/contexts/AppModeContext';
import type { RiskTolerance } from '@/constants/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/colors';
import { sfProDisplayRegular, sfProDisplayMedium, sfProDisplayBold } from '@/constants/Typography';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MODE_OPTIONS = [
  { value: 'financial' as const, label: 'Financial', description: 'Manage money & budgets', icon: DollarSign, color: AppColors.primary },
  { value: 'personal' as const, label: 'Personal', description: 'Track habits & activities', icon: Heart, color: '#EC4899' },
  { value: 'both' as const, label: 'Both', description: 'Complete life management', icon: Layers, color: '#8B5CF6' },
];

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

const PERSONAL_INTERESTS = [
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'socializing', label: 'Socializing', icon: Users },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'work', label: 'Work', icon: Briefcase },
  { id: 'hobbies', label: 'Hobbies', icon: Coffee },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'entertainment', label: 'Entertainment', icon: Film },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'travel', label: 'Travel', icon: Plane },
];

const FOCUS_AREAS = [
  { id: 'productivity', label: 'Productivity', icon: Target },
  { id: 'health', label: 'Health & Wellness', icon: Heart },
  { id: 'learning', label: 'Learning & Growth', icon: BookOpen },
  { id: 'relationships', label: 'Relationships', icon: Users },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'mindfulness', label: 'Mindfulness', icon: Leaf },
];

const RISK_OPTIONS: { value: RiskTolerance; label: string; description: string; icon: any }[] = [
  { value: 'conservative', label: 'Conservative', description: 'Lower risk, stable returns', icon: Shield },
  { value: 'moderate', label: 'Moderate', description: 'Balanced risk and growth', icon: BarChart3 },
  { value: 'aggressive', label: 'Aggressive', description: 'Higher risk, higher potential', icon: Leaf },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; email?: string; userId?: string }>();
  const { setMode } = useAppMode();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<'financial' | 'personal' | 'both'>('financial');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [householdSize, setHouseholdSize] = useState('1');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('moderate');
  const [personalInterests, setPersonalInterests] = useState<string[]>([]);
  const [dailyRoutineStart, setDailyRoutineStart] = useState('07:00');
  const [dailyRoutineEnd, setDailyRoutineEnd] = useState('22:00');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const incomeInputRef = useRef<TextInput>(null);
  const householdInputRef = useRef<TextInput>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const getTotalSteps = useCallback(() => {
    if (selectedMode === 'financial') return 5;
    if (selectedMode === 'personal') return 4;
    return 7;
  }, [selectedMode]);

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
    const totalSteps = getTotalSteps();
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / totalSteps,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, selectedMode, progressAnim, getTotalSteps]);

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
    
    const totalSteps = getTotalSteps();
    const isLastStep = currentStep === totalSteps - 1;

    if (selectedMode === 'financial' || selectedMode === 'both') {
      const incomeStep = selectedMode === 'both' ? 1 : 1;
      const householdStep = selectedMode === 'both' ? 2 : 2;
      const goalsStep = selectedMode === 'both' ? 3 : 3;

      if (currentStep === incomeStep) {
        const income = parseFloat(monthlyIncome);
        if (!monthlyIncome || isNaN(income) || income <= 0) {
          Alert.alert('Invalid Input', 'Please enter a valid monthly income greater than 0');
          return;
        }
      }

      if (currentStep === householdStep) {
        const size = parseInt(householdSize);
        if (!householdSize || isNaN(size) || size < 1) {
          Alert.alert('Invalid Input', 'Please enter a valid household size');
          return;
        }
      }

      if (currentStep === goalsStep) {
        if (selectedGoals.length === 0) {
          Alert.alert('Selection Required', 'Please select at least one financial goal');
          return;
        }
      }
    }

    if (selectedMode === 'personal' || selectedMode === 'both') {
      const interestsStep = selectedMode === 'both' ? 5 : 1;
      const focusStep = selectedMode === 'both' ? 6 : 3;

      if (currentStep === interestsStep) {
        if (personalInterests.length === 0) {
          Alert.alert('Selection Required', 'Please select at least one interest');
          return;
        }
      }

      if (currentStep === focusStep) {
        if (focusAreas.length === 0) {
          Alert.alert('Selection Required', 'Please select at least one focus area');
          return;
        }
      }
    }

    if (!isLastStep) {
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
    if (!params.name || !params.email || !params.userId) {
      Alert.alert('Error', 'Missing registration information. Please start over.');
      router.replace('/signup' as any);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating user profile for user ID:', params.userId);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      const { createProfileDirect } = await import('@/lib/supabase');
      const success = await createProfileDirect(params.userId, {
        name: params.name,
        email: params.email,
        preferredMode: selectedMode,
        monthlyIncome: selectedMode !== 'personal' ? parseFloat(monthlyIncome) : 0,
        householdSize: selectedMode !== 'personal' ? parseInt(householdSize) : 1,
        primaryGoals: selectedMode !== 'personal' ? selectedGoals : [],
        riskTolerance: selectedMode !== 'personal' ? riskTolerance : 'moderate',
        personalInterests: selectedMode !== 'financial' ? personalInterests : [],
        dailyRoutineStart: selectedMode !== 'financial' ? dailyRoutineStart : undefined,
        dailyRoutineEnd: selectedMode !== 'financial' ? dailyRoutineEnd : undefined,
        focusAreas: selectedMode !== 'financial' ? focusAreas : [],
      });

      if (success) {
        console.log('Profile created successfully');
        
        const targetMode = selectedMode === 'both' ? 'financial' : selectedMode;
        console.log('Setting app mode to:', targetMode);
        await setMode(targetMode);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log('Navigating to home page...');
        const destination = selectedMode === 'personal' 
          ? '/(tabs)/(personal)/personal' 
          : '/(tabs)/(home)/home';
        
        router.replace(destination as any);
        
        console.log('Navigation complete to:', destination);
      } else {
        console.error('Profile creation failed');
        Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
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

  const toggleInterest = (interest: string) => {
    if (personalInterests.includes(interest)) {
      setPersonalInterests(personalInterests.filter(i => i !== interest));
    } else {
      setPersonalInterests([...personalInterests, interest]);
    }
  };

  const toggleFocusArea = (area: string) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter(a => a !== area));
    } else {
      setFocusAreas([...focusAreas, area]);
    }
  };

  const renderStep = () => {
    if (selectedMode === 'financial') {
      return renderFinancialSteps();
    } else if (selectedMode === 'personal') {
      return renderPersonalSteps();
    } else {
      return renderBothSteps();
    }
  };

  const renderFinancialSteps = () => {
    switch (currentStep) {
      case 0:
        return renderModeSelection();
      case 1:
        return renderMonthlyIncome();
      case 2:
        return renderHouseholdSize();
      case 3:
        return renderFinancialGoals();
      case 4:
        return renderRiskTolerance();
      default:
        return null;
    }
  };

  const renderPersonalSteps = () => {
    switch (currentStep) {
      case 0:
        return renderModeSelection();
      case 1:
        return renderPersonalInterests();
      case 2:
        return renderDailyRoutine();
      case 3:
        return renderFocusAreas();
      default:
        return null;
    }
  };

  const renderBothSteps = () => {
    switch (currentStep) {
      case 0:
        return renderModeSelection();
      case 1:
        return renderMonthlyIncome();
      case 2:
        return renderHouseholdSize();
      case 3:
        return renderFinancialGoals();
      case 4:
        return renderRiskTolerance();
      case 5:
        return renderPersonalInterests();
      case 6:
        return renderFocusAreas();
      default:
        return null;
    }
  };

  const renderModeSelection = () => {
    return (
      <View style={styles.stepContent}>
        <View style={styles.headerContainer}>
          <View style={styles.iconBadge}>
            <Image 
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/fb2ysglec16vmb3t12bzh' }}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.stepTitle}>Choose Your Mode</Text>
          <Text style={styles.stepDescription}>
            How do you want to use DomusIQ?
          </Text>
        </View>

        <View style={styles.modeList}>
          {MODE_OPTIONS.map(option => {
            const Icon = option.icon;
            const isSelected = selectedMode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modeCard,
                  isSelected && styles.modeCardSelected,
                ]}
                onPress={() => setSelectedMode(option.value)}
                activeOpacity={0.7}
              >
                <View style={[styles.modeIconBox, isSelected && { backgroundColor: `${option.color}15` }]}>
                  <Icon size={28} color={isSelected ? option.color : '#FFFFFF'} />
                </View>
                <View style={styles.modeInfo}>
                  <Text
                    style={[
                      styles.modeTitle,
                      isSelected && styles.modeTitleSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.modeDesc,
                      isSelected && styles.modeDescSelected,
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
                {isSelected && <Check size={20} color={option.color} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderMonthlyIncome = () => {
    return (
      <View style={styles.stepContent}>
        <View style={styles.headerContainer}>
          <View style={styles.iconBadge}>
            <Image 
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/fb2ysglec16vmb3t12bzh' }}
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
  };

  const renderHouseholdSize = () => {
    return (
      <View style={styles.stepContent}>
        <View style={styles.headerContainer}>
          <View style={styles.iconBadge}>
            <Image 
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/fb2ysglec16vmb3t12bzh' }}
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
  };

  const renderFinancialGoals = () => {
    return (
      <View style={styles.stepContent}>
        <View style={styles.headerContainer}>
          <View style={styles.iconBadge}>
            <Image 
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/fb2ysglec16vmb3t12bzh' }}
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
  };

  const renderRiskTolerance = () => {
    return (
      <View style={styles.stepContent}>
        <View style={styles.headerContainer}>
          <View style={styles.iconBadge}>
            <Image 
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/fb2ysglec16vmb3t12bzh' }}
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
  };

  const renderPersonalInterests = () => {
    return (
      <View style={styles.stepContent}>
        <View style={styles.headerContainer}>
          <View style={styles.iconBadge}>
            <Image 
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/fb2ysglec16vmb3t12bzh' }}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.stepTitle}>Your Interests</Text>
          <Text style={styles.stepDescription}>
            What matters most to you? Select all that apply.
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.goalsGrid}>
            {PERSONAL_INTERESTS.map((interest) => {
              const Icon = interest.icon;
              const isSelected = personalInterests.includes(interest.id);
              return (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.goalCard,
                    isSelected && styles.goalCardSelected,
                  ]}
                  onPress={() => toggleInterest(interest.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.goalIconWrapper, isSelected && styles.goalIconWrapperSelected]}>
                    <Icon size={24} color={isSelected ? '#EC4899' : '#FFFFFF'} />
                  </View>
                  <Text
                    style={[
                      styles.goalText,
                      isSelected && { color: '#EC4899' },
                    ]}
                  >
                    {interest.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkMark, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
                      <Check size={14} color="#EC4899" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderDailyRoutine = () => {
    return (
      <View style={styles.stepContent}>
        <View style={styles.headerContainer}>
          <View style={styles.iconBadge}>
            <Image 
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/fb2ysglec16vmb3t12bzh' }}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.stepTitle}>Daily Routine</Text>
          <Text style={styles.stepDescription}>
            When does your typical day start and end?
          </Text>
        </View>

        <View style={styles.routineContainer}>
          <View style={styles.routineItem}>
            <View style={styles.routineIconWrapper}>
              <Sun size={24} color="#FFFFFF" />
            </View>
            <View style={styles.routineContent}>
              <Text style={styles.routineLabel}>Day Starts</Text>
              <TextInput
                style={styles.routineInput}
                value={dailyRoutineStart}
                onChangeText={setDailyRoutineStart}
                placeholder="07:00"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                selectionColor="#FFFFFF"
              />
            </View>
          </View>

          <View style={styles.routineItem}>
            <View style={styles.routineIconWrapper}>
              <Moon size={24} color="#FFFFFF" />
            </View>
            <View style={styles.routineContent}>
              <Text style={styles.routineLabel}>Day Ends</Text>
              <TextInput
                style={styles.routineInput}
                value={dailyRoutineEnd}
                onChangeText={setDailyRoutineEnd}
                placeholder="22:00"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                selectionColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderFocusAreas = () => {
    return (
      <View style={styles.stepContent}>
        <View style={styles.headerContainer}>
          <View style={styles.iconBadge}>
            <Image 
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/fb2ysglec16vmb3t12bzh' }}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.stepTitle}>Focus Areas</Text>
          <Text style={styles.stepDescription}>
            What do you want to improve? Select all that apply.
          </Text>
        </View>

        <View style={styles.focusList}>
          {FOCUS_AREAS.map((area) => {
            const Icon = area.icon;
            const isSelected = focusAreas.includes(area.id);
            return (
              <TouchableOpacity
                key={area.id}
                style={[
                  styles.riskCard,
                  isSelected && styles.riskCardSelected,
                ]}
                onPress={() => toggleFocusArea(area.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.riskIconBox, isSelected && { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
                  <Icon size={24} color={isSelected ? '#EC4899' : '#FFFFFF'} />
                </View>
                <View style={styles.riskInfo}>
                  <Text
                    style={[
                      styles.riskTitle,
                      isSelected && { color: '#EC4899' },
                    ]}
                  >
                    {area.label}
                  </Text>
                </View>
                {isSelected && <Check size={20} color="#EC4899" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
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
                                    onPress={currentStep === getTotalSteps() - 1 ? handleComplete : handleNext}
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
                                    {isLoading ? 'Processing...' : currentStep === getTotalSteps() - 1 ? 'Get Started' : 'Continue'}
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
    width: 48,
    height: 48,
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

  // Mode Selection
  modeList: {
    gap: 12,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modeCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  modeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 17,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modeTitleSelected: {
    color: '#000000',
  },
  modeDesc: {
    fontFamily: sfProDisplayRegular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  modeDescSelected: {
    color: 'rgba(0, 0, 0, 0.6)',
  },

  // Daily Routine
  routineContainer: {
    gap: 16,
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  routineIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  routineContent: {
    flex: 1,
  },
  routineLabel: {
    fontFamily: sfProDisplayMedium,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  routineInput: {
    fontFamily: sfProDisplayBold,
    fontSize: 20,
    color: '#FFFFFF',
    padding: 0,
  },

  // Focus Areas
  focusList: {
    gap: 12,
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
