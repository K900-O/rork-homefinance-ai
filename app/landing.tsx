import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, Command, Sparkles, Wallet } from 'lucide-react-native';
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

  useEffect(() => {
    // Start animation after a small delay to show the "splash"
    const timeout = setTimeout(() => {
      Animated.timing(animValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false, // transforming layout properties (top, borderRadius)
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      }).start();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [animValue]);

  // Interpolations
  const bgTop = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.42], // Moves down to ~42% of screen height
  });
  
  const bgBorderRadius = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40],
  });

  // Splash Elements (Fade Out)
  const splashOpacity = animValue.interpolate({
    inputRange: [0, 0.4],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const splashTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  // Main Content (Fade In)
  const contentOpacity = animValue.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const contentTranslateY = animValue.interpolate({
    inputRange: [0.4, 1],
    outputRange: [40, 0],
    extrapolate: 'clamp',
  });

  // Top Section (Menu) (Fade In)
  const topContentOpacity = animValue.interpolate({
    inputRange: [0.6, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const topContentTranslateY = animValue.interpolate({
    inputRange: [0.4, 1],
    outputRange: [-20, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Section (Revealed behind the blue card) */}
      <View style={[styles.topSection, { paddingTop: insets.top + 40 }]}>
        <Animated.View style={{ opacity: topContentOpacity, transform: [{ translateY: topContentTranslateY }] }}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuItemInactive}>Earn</Text>
            
            <View style={styles.menuItemActiveContainer}>
              <View style={styles.activeIconContainer}>
                <Wallet color="#FFFFFF" size={20} fill="#FFFFFF" />
              </View>
              <Text style={styles.menuItemActive}>Spend</Text>
            </View>
            
            <Text style={styles.menuItemInactive}>Invest</Text>
            <Text style={styles.menuItemInactive}>Borrow</Text>
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
              transform: [{ translateY: splashTranslateY }]
            }
          ]}
          pointerEvents="none"
        >
           <View style={styles.splashIconCircle}>
             <Leaf color={AppColors.primary} size={48} fill={AppColors.primary} />
           </View>
           <Text style={styles.splashText}>Hayati</Text>
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
               <Sparkles color="#1E40AF" size={24} fill="#1E40AF" />
            </View>
            
            <Text style={styles.cardTitle}>Your money,{'\n'}upgraded</Text>
            <Text style={styles.cardSubtitle}>
              Save, earn and invest with stablecoins and digital assets.
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.appleButton}
              activeOpacity={0.9}
              onPress={() => router.push('/signup' as any)}
            >
              <Command color="#000000" size={20} />
              <Text style={styles.appleButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.recoverButton}
              activeOpacity={0.7}
              onPress={() => router.push('/login' as any)}
            >
               <Text style={styles.recoverButtonText}>Recover existing wallet</Text>
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
  splashIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  splashText: {
    fontFamily: sfProDisplayBold,
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '700',
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
    gap: 16,
  },
  appleButton: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  appleButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 17,
    color: '#000000',
    fontWeight: '600',
  },
  recoverButton: {
    height: 56,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  recoverButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
