import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path, Ellipse } from 'react-native-svg';

interface IconProps {
  size?: number;
  focused?: boolean;
}

export const GlassHomeIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="homeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#93C5FD" stopOpacity={opacity * 0.8} />
            <Stop offset="100%" stopColor="#2563EB" stopOpacity={opacity} />
          </LinearGradient>
          <LinearGradient id="homeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Rect x="8" y="20" width="48" height="36" rx="6" fill="url(#homeGrad1)" />
        <Rect x="8" y="14" width="20" height="12" rx="4" fill="url(#homeGrad2)" />
        <Ellipse cx="20" cy="38" rx="8" ry="8" fill="#2563EB" opacity={opacity * 0.9} />
      </Svg>
    </View>
  );
};

export const GlassTransactionsIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="transGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#93C5FD" stopOpacity={opacity * 0.7} />
            <Stop offset="100%" stopColor="#3B82F6" stopOpacity={opacity * 0.9} />
          </LinearGradient>
          <LinearGradient id="transGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Path d="M12 28 C12 22, 18 16, 24 16 L48 16 C54 16, 56 22, 56 28 L56 44 C56 50, 50 54, 44 54 L20 54 C14 54, 12 48, 12 44 Z" fill="url(#transGrad1)" />
        <Path d="M8 24 C8 18, 14 14, 20 14 L40 14 C46 14, 48 18, 48 24 L48 36 C48 42, 42 44, 36 44 L16 44 C10 44, 8 38, 8 32 Z" fill="url(#transGrad2)" />
        <Path d="M22 26 L22 34 M18 28 L22 24 L26 28 M30 34 L30 26 M26 32 L30 36 L34 32" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </Svg>
    </View>
  );
};

export const GlassOptimizerIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="optGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
            <Stop offset="100%" stopColor="#E0E7FF" stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Path d="M32 8 L36 24 L52 20 L40 32 L52 44 L36 40 L32 56 L28 40 L12 44 L24 32 L12 20 L28 24 Z" fill="url(#optGrad)" />
        <Circle cx="32" cy="32" r="6" fill="#FFFFFF" />
      </Svg>
    </View>
  );
};

export const GlassGoalsIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="goalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.6} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.8} />
          </LinearGradient>
          <LinearGradient id="goalGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3B82F6" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#2563EB" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Path d="M10 56 L32 20 L54 56 Z" fill="url(#goalGrad1)" />
        <Circle cx="32" cy="18" r="8" fill="url(#goalGrad2)" />
        <Circle cx="32" cy="18" r="4" fill="#FFFFFF" opacity={opacity * 0.9} />
      </Svg>
    </View>
  );
};

export const GlassInsightsIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="insGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#93C5FD" stopOpacity={opacity * 0.7} />
            <Stop offset="100%" stopColor="#3B82F6" stopOpacity={opacity * 0.9} />
          </LinearGradient>
          <LinearGradient id="insGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Circle cx="24" cy="32" r="18" fill="url(#insGrad1)" />
        <Circle cx="40" cy="32" r="18" fill="url(#insGrad2)" />
      </Svg>
    </View>
  );
};

export const GlassScheduleIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="schedGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.7} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.9} />
          </LinearGradient>
          <LinearGradient id="schedGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Rect x="10" y="16" width="44" height="42" rx="8" fill="url(#schedGrad1)" />
        <Circle cx="22" cy="10" r="4" fill="url(#schedGrad2)" />
        <Circle cx="42" cy="10" r="4" fill="url(#schedGrad2)" />
        <Rect x="18" y="30" width="28" height="20" rx="2" fill="#FFFFFF" opacity={opacity * 0.3} />
        <Path d="M26 38 L26 48 M32 34 L32 48 M38 42 L38 48" stroke="url(#schedGrad2)" strokeWidth="4" strokeLinecap="round" />
      </Svg>
    </View>
  );
};

export const GlassHabitsIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="habGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3B82F6" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#2563EB" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Path 
          d="M14 34 L26 46 L50 18" 
          stroke="url(#habGrad)" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none"
        />
        <Path 
          d="M14 34 L26 46 L50 18" 
          stroke="#93C5FD" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none"
          opacity={opacity * 0.5}
        />
      </Svg>
    </View>
  );
};

export const GlassCoachIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="coachGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
            <Stop offset="100%" stopColor="#E0E7FF" stopOpacity={1} />
          </LinearGradient>
          <LinearGradient id="coachGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
            <Stop offset="100%" stopColor="#DBEAFE" stopOpacity={0.9} />
          </LinearGradient>
        </Defs>
        <Rect x="8" y="12" width="40" height="32" rx="10" fill="url(#coachGrad1)" />
        <Circle cx="20" cy="28" r="3" fill="#2563EB" />
        <Circle cx="28" cy="28" r="3" fill="#2563EB" />
        <Circle cx="36" cy="28" r="3" fill="#2563EB" />
        <Path d="M12 44 L8 54 L20 44" fill="url(#coachGrad2)" />
      </Svg>
    </View>
  );
};

export const GlassProfileIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="profGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.6} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.8} />
          </LinearGradient>
          <LinearGradient id="profGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3B82F6" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#2563EB" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Circle cx="26" cy="22" r="12" fill="url(#profGrad1)" />
        <Path d="M8 56 C8 40, 18 34, 26 34 C34 34, 44 40, 44 56" fill="url(#profGrad1)" />
        <Circle cx="48" cy="18" r="10" fill="url(#profGrad2)" />
        <Path d="M44 16 L47 20 L52 14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
