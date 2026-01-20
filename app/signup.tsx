import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Mail, User, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sfProDisplayRegular, sfProDisplayMedium, sfProDisplayBold } from '@/constants/Typography';
import { AppColors } from '@/constants/colors';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const cardSlideAnim = useRef(new Animated.Value(100)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const inputAnimations = useRef([0, 1, 2, 3, 4, 5].map(() => new Animated.Value(0))).current;
  const buttonScaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(cardSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 35,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();

    const inputDelay = 300;
    inputAnimations.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: inputDelay + index * 80,
        useNativeDriver: true,
      }).start();
    });

    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      delay: 750,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, slideAnim, cardFadeAnim, cardSlideAnim, inputAnimations, buttonScaleAnim]);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);

    router.replace({
      pathname: '/onboarding' as any,
      params: { name, email, password },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Section - White Background */}
      <Animated.View 
        style={[
          styles.topSection, 
          { 
            paddingTop: insets.top,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft color="#000" size={24} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Section - Blue Card */}
      <Animated.View 
        style={[
          styles.bottomSection,
          {
            opacity: cardFadeAnim,
            transform: [{ translateY: cardSlideAnim }],
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
            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View 
                style={[
                  styles.header,
                  {
                    opacity: inputAnimations[0],
                    transform: [{
                      translateY: inputAnimations[0].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      })
                    }],
                  }
                ]}
              >
                <Text style={styles.title}>Initiate</Text>
                <Text style={styles.subtitle}>Begin your path to mastery</Text>
              </Animated.View>

              <View style={styles.form}>
                <Animated.View 
                  style={[
                    styles.inputContainer,
                    {
                      opacity: inputAnimations[1],
                      transform: [{
                        translateX: inputAnimations[1].interpolate({
                          inputRange: [0, 1],
                          outputRange: [-30, 0],
                        })
                      }],
                    }
                  ]}
                >
                  <View style={styles.inputIcon}>
                    <User color="rgba(255,255,255,0.7)" size={20} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </Animated.View>

                <Animated.View 
                  style={[
                    styles.inputContainer,
                    {
                      opacity: inputAnimations[2],
                      transform: [{
                        translateX: inputAnimations[2].interpolate({
                          inputRange: [0, 1],
                          outputRange: [-30, 0],
                        })
                      }],
                    }
                  ]}
                >
                  <View style={styles.inputIcon}>
                    <Mail color="rgba(255,255,255,0.7)" size={20} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Animated.View>

                <Animated.View 
                  style={[
                    styles.inputContainer,
                    {
                      opacity: inputAnimations[3],
                      transform: [{
                        translateX: inputAnimations[3].interpolate({
                          inputRange: [0, 1],
                          outputRange: [-30, 0],
                        })
                      }],
                    }
                  ]}
                >
                  <View style={styles.inputIcon}>
                    <Lock color="rgba(255,255,255,0.7)" size={20} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </Animated.View>

                <Animated.View 
                  style={[
                    styles.inputContainer,
                    {
                      opacity: inputAnimations[4],
                      transform: [{
                        translateX: inputAnimations[4].interpolate({
                          inputRange: [0, 1],
                          outputRange: [-30, 0],
                        })
                      }],
                    }
                  ]}
                >
                  <View style={styles.inputIcon}>
                    <Lock color="rgba(255,255,255,0.7)" size={20} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </Animated.View>

                <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSignup}
                    disabled={isLoading}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? 'Initiating...' : 'Begin Journey'}
                    </Text>
                    {!isLoading && <ArrowRight color={AppColors.primary} size={20} />}
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already initialized?</Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.footerLink}>Access</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontFamily: sfProDisplayBold,
    fontSize: 40,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: sfProDisplayRegular,
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    height: 60,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    fontFamily: sfProDisplayRegular,
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    height: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 30,
    marginTop: 16,
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
  buttonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 18,
    color: AppColors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
  },
  footerText: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  footerLink: {
    fontFamily: sfProDisplayMedium,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
