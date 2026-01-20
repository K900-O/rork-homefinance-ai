import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Command } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  sfProDisplayBold, 
  sfProDisplayMedium,
} from '@/constants/Typography';
import { AppColors } from '@/constants/colors';

const { height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Animation Values
  // 0: Initial Splash State (Full Screen Blue)
  // 1: Final Landing State (Split Screen)
  const animValue = useRef(new Animated.Value(0)).current;
  
  // Logo animation
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animation after a small delay to show the "splash"
    const timeout = setTimeout(() => {
      Animated.timing(animValue, {
        toValue: 1,
        duration: 1000, // Slightly faster for snappier feel
        useNativeDriver: false, // transforming layout properties (top, borderRadius)
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Cubic Bezier for smooth "Apple-like" motion
      }).start();
    }, 1200);

    return () => clearTimeout(timeout);
  }, [animValue]);

  // Logo breathing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.03,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
      ])
    ).start();
  }, [logoScale]);

  // Interpolations
  const bgTop = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.45], // Moves down slightly more to give breathing room
  });
  
  const bgBorderRadius = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 48], // Slightly rounder
  });

  // Splash Elements (Fade Out & Scale)
  const splashOpacity = animValue.interpolate({
    inputRange: [0, 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const splashScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9], // Subtle scale down
  });

  const splashTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100], // Move up faster
  });

  // Main Content (Fade In & Slide Up)
  const contentOpacity = animValue.interpolate({
    inputRange: [0.4, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const contentTranslateY = animValue.interpolate({
    inputRange: [0.4, 1],
    outputRange: [50, 0],
    extrapolate: 'clamp',
  });

  // Top Section (Menu) (Fade In)
  const topContentOpacity = animValue.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const topContentTranslateY = animValue.interpolate({
    inputRange: [0.5, 1],
    outputRange: [-30, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Section (Revealed behind the blue card) */}
      <View style={[styles.topSection, { paddingTop: insets.top + 40 }]}>
        <Animated.View style={{ opacity: topContentOpacity, transform: [{ translateY: topContentTranslateY }] }}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuItemInactive}>Plan</Text>
            
            <View style={styles.menuItemActiveContainer}>
              <View style={styles.activeIconContainer}>
                <Image 
                  source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/tuczontkm4ohdugp8m10b' }}
                  style={styles.activeIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.menuItemActive}>Finance</Text>
            </View>
            
            <Text style={styles.menuItemInactive}>Habits</Text>
            <Text style={styles.menuItemInactive}>Growth</Text>
          </View>
        </Animated.View>
      </View>

      {/* Blue Card / Background */}
      <Animated.View 
        style={[
          styles.blueCard, 
          { 
            top: bgTop, 
            borderTopLeftRadius: bgBorderRadius,
            borderTopRightRadius: bgBorderRadius,
          }
        ]}
      >
        <LinearGradient
          colors={[AppColors.primaryLight, AppColors.primary, AppColors.primaryDark]} // Bright Blue Gradient
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        
        {/* Splash State: Centered Logo */}
        {/* We use pointerEvents="none" to let clicks pass through when it's invisible, 
            but since it's inside the card, we just rely on opacity */}
        <Animated.View 
          style={[
            styles.splashContainer, 
            { 
              opacity: splashOpacity,
              transform: [
                { translateY: splashTranslateY },
                { scale: splashScale }
              ]
            }
          ]}
          pointerEvents="none"
        >
          <View style={styles.logoContainer}>
            <Animated.Image 
              source={{ 
                uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/d0wbottxjej9u7ixm40mn',
              }}
              style={[
                styles.logoImage,
                {
                  transform: [{ scale: logoScale }],
                }
              ]}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Final State: Card Content */}
        <Animated.View 
          style={[
            styles.cardContent, 
            { 
              opacity: contentOpacity, 
              transform: [{ translateY: contentTranslateY }],
              paddingBottom: insets.bottom + 20 
            }
          ]}
        >
          <View style={styles.contentHeader}>
            <View style={styles.iconBadge}>
               <Image 
                 source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/tuczontkm4ohdugp8m10b' }}
                 style={styles.iconBadgeImage}
                 resizeMode="contain"
               />
            </View>
            
            <Text style={styles.cardTitle}>Your life,{'\n'}mastered</Text>
            <Text style={styles.cardSubtitle}>
              Control and track your financial and personal activity every day.
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.appleButton}
              activeOpacity={0.85}
              onPress={() => router.push('/signup' as any)}
            >
              <Command color="#000000" size={18} />
              <Text style={styles.appleButtonText}>Initiate Your Journey</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.recoverButton}
              activeOpacity={0.75}
              onPress={() => router.push('/login' as any)}
            >
              <Text style={styles.recoverButtonText}>Access Your Account</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
    flex: 1,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
  },
  menuContainer: {
    gap: 24,
  },
  menuItemInactive: {
    fontFamily: sfProDisplayBold,
    fontSize: 34,
    color: '#E5E7EB',
    fontWeight: '700',
  },
  menuItemActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  activeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItemActive: {
    fontFamily: sfProDisplayBold,
    fontSize: 34,
    color: '#111827',
    fontWeight: '700',
  },
  
  // Blue Card
  blueCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  
  // Splash
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  logoContainer: {
    width: 380,
    height: 380,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 380,
    height: 380,
  },
  
  // Content
  cardContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 48,
    justifyContent: 'space-between',
  },
  contentHeader: {
    gap: 20,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconBadgeImage: {
    width: 48,
    height: 48,
  },
  activeIcon: {
    width: 40,
    height: 40,
  },
  cardTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 40,
    lineHeight: 44,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cardSubtitle: {
    fontFamily: sfProDisplayMedium,
    fontSize: 18,
    lineHeight: 26,
    color: 'rgba(255, 255, 255, 0.8)',
    maxWidth: '90%',
  },
  
  // Buttons
  buttonsContainer: {
    gap: 14,
    marginBottom: 8,
  },
  appleButton: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  appleButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 16,
    color: '#000000',
    fontWeight: '600' as const,
  },
  recoverButton: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  recoverButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
});
