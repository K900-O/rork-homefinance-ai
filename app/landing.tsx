import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sfProDisplayBold, sfProDisplayMedium } from '@/constants/Typography';
import { BlueGlow } from '@/components/BlueGlow';

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const titleAnim = useRef(new Animated.Value(100)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  
  const highlightAnim = useRef(new Animated.Value(100)).current;
  const highlightOpacity = useRef(new Animated.Value(0)).current;

  const buttonAnim = useRef(new Animated.Value(100)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.spring(titleAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(highlightAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(highlightOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(buttonAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [titleAnim, titleOpacity, highlightAnim, highlightOpacity, buttonAnim, buttonOpacity, scaleAnim]);

  return (
    <View style={styles.container}>
      <BlueGlow />
      
      <View style={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.brandContainer}>
           <View style={styles.brandIcon}>
            <Leaf color="#37C126" size={18} />
          </View>
          <Text style={styles.brandName}>Hayati</Text>
        </View>

        <View style={styles.textContainer}>
          <Animated.Text 
            style={[
              styles.title, 
              { 
                opacity: titleOpacity, 
                transform: [{ translateY: titleAnim }] 
              }
            ]}
          >
            Own Your Money,
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.highlight, 
              { 
                opacity: highlightOpacity, 
                transform: [{ translateY: highlightAnim }] 
              }
            ]}
          >
            Shape Your Life.
          </Animated.Text>
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
            activeOpacity={0.8}
            onPress={() => router.push('/signup' as any)}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={['#37C126', '#299F1A']}
              style={styles.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>I have an account</Text>
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
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
  },
  brandContainer: {
    position: 'absolute',
    top: 60,
    left: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E8F8E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    color: '#1A1A1A',
    letterSpacing: 0.3,
    fontWeight: '600',
  },
  textContainer: {
    marginBottom: 60,
  },
  title: {
    fontFamily: sfProDisplayBold,
    fontSize: 48,
    color: '#1A1A1A',
    lineHeight: 52,
    letterSpacing: -1,
    fontWeight: '700',
  },
  highlight: {
    fontFamily: sfProDisplayBold,
    fontSize: 48,
    color: '#37C126',
    lineHeight: 52,
    letterSpacing: -1,
    fontWeight: '700',
  },
  buttonsContainer: {
    gap: 16,
  },
  buttonWrapper: {
    borderRadius: 30,
    shadowColor: '#37C126',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButton: {
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 16,
    color: '#52525B',
    fontWeight: '500',
  },
});
