import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path, Ellipse, G } from 'react-native-svg';

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
            <Stop offset="0%" stopColor="#93C5FD" stopOpacity={opacity * 0.6} />
            <Stop offset="100%" stopColor="#3B82F6" stopOpacity={opacity * 0.9} />
          </LinearGradient>
          <LinearGradient id="homeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity={opacity} />
          </LinearGradient>
          <LinearGradient id="homeGlass" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.4} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.1} />
          </LinearGradient>
        </Defs>
        <Rect x="8" y="18" width="48" height="38" rx="8" fill="url(#homeGrad1)" />
        <Rect x="8" y="10" width="22" height="14" rx="4" fill="url(#homeGrad2)" />
        <Rect x="8" y="18" width="48" height="10" rx="3" fill="url(#homeGlass)" />
        <Circle cx="18" cy="17" r="3" fill="#FFFFFF" opacity={opacity * 0.8} />
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
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.7} />
            <Stop offset="100%" stopColor="#3B82F6" stopOpacity={opacity * 0.9} />
          </LinearGradient>
          <LinearGradient id="transGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity={opacity} />
          </LinearGradient>
          <LinearGradient id="transGlass" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.5} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.1} />
          </LinearGradient>
        </Defs>
        <Rect x="6" y="20" width="40" height="32" rx="6" fill="url(#transGrad1)" />
        <Rect x="18" y="12" width="40" height="32" rx="6" fill="url(#transGrad2)" />
        <Rect x="18" y="12" width="40" height="8" rx="3" fill="url(#transGlass)" />
        <Circle cx="32" cy="28" r="8" fill="#FFFFFF" opacity={0.3} />
        <Path d="M30 26 L34 26 M30 28 L34 28 M30 30 L34 30" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
      </Svg>
    </View>
  );
};

export const GlassOptimizerIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="optGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
            <Stop offset="100%" stopColor="#E0E7FF" stopOpacity={1} />
          </LinearGradient>
          <LinearGradient id="optGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#DBEAFE" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#BFDBFE" stopOpacity={0.6} />
          </LinearGradient>
        </Defs>
        <Circle cx="32" cy="32" r="18" fill="url(#optGrad2)" />
        <Path d="M32 14 L34 26 L44 18 L38 28 L50 32 L38 36 L44 46 L34 38 L32 50 L30 38 L20 46 L26 36 L14 32 L26 28 L20 18 L30 26 Z" fill="url(#optGrad1)" />
        <Circle cx="32" cy="32" r="5" fill="#FFFFFF" />
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
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.5} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.7} />
          </LinearGradient>
          <LinearGradient id="goalGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3B82F6" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#2563EB" stopOpacity={opacity} />
          </LinearGradient>
          <LinearGradient id="goalGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#1D4ED8" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#1E40AF" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Circle cx="32" cy="32" r="24" fill="url(#goalGrad1)" />
        <Circle cx="32" cy="32" r="17" fill="url(#goalGrad2)" />
        <Circle cx="32" cy="32" r="10" fill="url(#goalGrad3)" />
        <Circle cx="32" cy="32" r="4" fill="#FFFFFF" opacity={opacity} />
        <Path d="M32 8 L34 20 M56 32 L44 32" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" opacity={opacity} />
        <Circle cx="32" cy="8" r="3" fill="#EF4444" opacity={opacity} />
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
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.6} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.8} />
          </LinearGradient>
          <LinearGradient id="insGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#3B82F6" stopOpacity={opacity} />
          </LinearGradient>
          <LinearGradient id="insGrad3" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#1D4ED8" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#2563EB" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Rect x="8" y="14" width="48" height="40" rx="8" fill="url(#insGrad1)" />
        <Rect x="14" y="36" width="10" height="14" rx="3" fill="url(#insGrad2)" />
        <Rect x="27" y="28" width="10" height="22" rx="3" fill="url(#insGrad3)" />
        <Rect x="40" y="20" width="10" height="30" rx="3" fill="url(#insGrad2)" />
        <Path d="M14 24 L24 20 L34 26 L50 16" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={opacity} />
        <Circle cx="50" cy="16" r="3" fill="#1D4ED8" opacity={opacity} />
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
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.6} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.8} />
          </LinearGradient>
          <LinearGradient id="schedGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity={opacity} />
          </LinearGradient>
          <LinearGradient id="schedGlass" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.4} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.1} />
          </LinearGradient>
        </Defs>
        <Rect x="10" y="14" width="44" height="44" rx="10" fill="url(#schedGrad1)" />
        <Rect x="10" y="14" width="44" height="14" rx="6" fill="url(#schedGrad2)" />
        <Circle cx="22" cy="8" r="4" fill="url(#schedGrad2)" />
        <Circle cx="42" cy="8" r="4" fill="url(#schedGrad2)" />
        <Rect x="10" y="14" width="44" height="6" fill="url(#schedGlass)" />
        <G opacity={opacity}>
          <Rect x="18" y="34" width="8" height="8" rx="2" fill="#FFFFFF" opacity={0.5} />
          <Rect x="28" y="34" width="8" height="8" rx="2" fill="#2563EB" />
          <Rect x="38" y="34" width="8" height="8" rx="2" fill="#FFFFFF" opacity={0.5} />
          <Rect x="18" y="44" width="8" height="8" rx="2" fill="#FFFFFF" opacity={0.5} />
          <Rect x="28" y="44" width="8" height="8" rx="2" fill="#FFFFFF" opacity={0.5} />
          <Rect x="38" y="44" width="8" height="8" rx="2" fill="#FFFFFF" opacity={0.5} />
        </G>
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
          <LinearGradient id="habGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.4} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.6} />
          </LinearGradient>
          <LinearGradient id="habGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3B82F6" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#2563EB" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Circle cx="32" cy="36" r="20" fill="url(#habGrad1)" />
        <Path 
          d="M18 36 L28 46 L48 24" 
          stroke="url(#habGrad2)" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none"
        />
        <Path 
          d="M18 36 L28 46 L48 24" 
          stroke="#FFFFFF" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none"
          opacity={0.5}
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
            <Stop offset="0%" stopColor="#DBEAFE" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#BFDBFE" stopOpacity={0.6} />
          </LinearGradient>
        </Defs>
        <Ellipse cx="28" cy="28" rx="20" ry="16" fill="url(#coachGrad2)" />
        <Ellipse cx="28" cy="28" rx="18" ry="14" fill="url(#coachGrad1)" />
        <Circle cx="20" cy="28" r="3" fill="#2563EB" />
        <Circle cx="28" cy="28" r="3" fill="#2563EB" />
        <Circle cx="36" cy="28" r="3" fill="#2563EB" />
        <Path d="M12 44 L8 54 L22 44" fill="url(#coachGrad1)" />
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
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.5} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.7} />
          </LinearGradient>
          <LinearGradient id="profGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3B82F6" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#2563EB" stopOpacity={opacity} />
          </LinearGradient>
          <LinearGradient id="profGlass" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.6} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.2} />
          </LinearGradient>
        </Defs>
        <Ellipse cx="32" cy="54" rx="20" ry="10" fill="url(#profGrad1)" />
        <Circle cx="32" cy="24" r="14" fill="url(#profGrad1)" />
        <Circle cx="32" cy="24" r="14" fill="url(#profGlass)" />
        <Circle cx="32" cy="24" r="10" fill="url(#profGrad2)" />
        <Ellipse cx="32" cy="54" rx="16" ry="8" fill="url(#profGrad2)" />
      </Svg>
    </View>
  );
};

export const GlassWalletIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="walletGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.6} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.8} />
          </LinearGradient>
          <LinearGradient id="walletGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Rect x="6" y="16" width="52" height="36" rx="8" fill="url(#walletGrad1)" />
        <Rect x="36" y="28" width="22" height="16" rx="4" fill="url(#walletGrad2)" />
        <Circle cx="44" cy="36" r="4" fill="#FFFFFF" opacity={opacity * 0.8} />
        <Rect x="6" y="16" width="52" height="8" rx="4" fill="url(#walletGrad2)" />
      </Svg>
    </View>
  );
};

export const GlassBellIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="bellGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.6} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.8} />
          </LinearGradient>
          <LinearGradient id="bellGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Path d="M32 8 C32 8 20 12 20 28 L20 40 L12 48 L52 48 L44 40 L44 28 C44 12 32 8 32 8" fill="url(#bellGrad1)" />
        <Ellipse cx="32" cy="48" rx="20" ry="4" fill="url(#bellGrad2)" />
        <Circle cx="32" cy="8" r="4" fill="url(#bellGrad2)" />
        <Ellipse cx="32" cy="56" rx="6" ry="3" fill="url(#bellGrad2)" />
      </Svg>
    </View>
  );
};

export const GlassSettingsIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="setGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.6} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.8} />
          </LinearGradient>
          <LinearGradient id="setGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Circle cx="32" cy="32" r="22" fill="url(#setGrad1)" />
        <Path d="M32 10 L36 18 L46 14 L42 24 L54 28 L46 34 L50 44 L40 40 L36 52 L32 44 L28 52 L24 40 L14 44 L18 34 L10 28 L22 24 L18 14 L28 18 Z" fill="url(#setGrad2)" />
        <Circle cx="32" cy="32" r="8" fill="#FFFFFF" opacity={opacity * 0.8} />
      </Svg>
    </View>
  );
};

export const GlassChartIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="chartGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.5} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.7} />
          </LinearGradient>
          <LinearGradient id="chartGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#3B82F6" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Circle cx="32" cy="32" r="24" fill="url(#chartGrad1)" />
        <Path d="M32 32 L32 10 A22 22 0 0 1 52 26 Z" fill="url(#chartGrad2)" />
        <Path d="M32 32 L52 26 A22 22 0 0 1 44 50 Z" fill="#1D4ED8" opacity={opacity * 0.8} />
        <Circle cx="32" cy="32" r="8" fill="#FFFFFF" opacity={0.9} />
      </Svg>
    </View>
  );
};

export const GlassDocumentIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="docGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.6} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.8} />
          </LinearGradient>
          <LinearGradient id="docGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Rect x="12" y="8" width="40" height="48" rx="6" fill="url(#docGrad1)" />
        <Path d="M36 8 L36 20 L52 20" fill="url(#docGrad2)" />
        <Rect x="20" y="28" width="24" height="4" rx="2" fill="url(#docGrad2)" />
        <Rect x="20" y="36" width="20" height="4" rx="2" fill="url(#docGrad2)" />
        <Rect x="20" y="44" width="16" height="4" rx="2" fill="url(#docGrad2)" />
      </Svg>
    </View>
  );
};

export const GlassClockIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="clockGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.6} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.8} />
          </LinearGradient>
          <LinearGradient id="clockGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Circle cx="32" cy="32" r="24" fill="url(#clockGrad1)" />
        <Circle cx="32" cy="32" r="20" fill="#FFFFFF" opacity={0.4} />
        <Circle cx="32" cy="32" r="4" fill="url(#clockGrad2)" />
        <Path d="M32 32 L32 16" stroke="url(#clockGrad2)" strokeWidth="4" strokeLinecap="round" />
        <Path d="M32 32 L44 38" stroke="url(#clockGrad2)" strokeWidth="4" strokeLinecap="round" />
      </Svg>
    </View>
  );
};

export const GlassFlameIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="flameGrad1" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#F59E0B" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#FBBF24" stopOpacity={opacity} />
          </LinearGradient>
          <LinearGradient id="flameGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#EF4444" stopOpacity={opacity * 0.8} />
            <Stop offset="100%" stopColor="#F59E0B" stopOpacity={opacity * 0.8} />
          </LinearGradient>
        </Defs>
        <Path d="M32 8 C32 8 18 24 18 40 C18 50 24 56 32 56 C40 56 46 50 46 40 C46 24 32 8 32 8" fill="url(#flameGrad1)" />
        <Path d="M32 24 C32 24 24 34 24 44 C24 50 28 54 32 54 C36 54 40 50 40 44 C40 34 32 24 32 24" fill="url(#flameGrad2)" />
        <Ellipse cx="32" cy="46" rx="4" ry="6" fill="#FBBF24" opacity={opacity} />
      </Svg>
    </View>
  );
};

export const GlassTrendUpIcon: React.FC<IconProps> = ({ size = 28, focused = false }) => {
  const opacity = focused ? 1 : 0.6;
  return (
    <View style={[styles.iconWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="trendGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={opacity * 0.5} />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity={opacity * 0.7} />
          </LinearGradient>
          <LinearGradient id="trendGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity={opacity} />
          </LinearGradient>
        </Defs>
        <Rect x="8" y="14" width="48" height="40" rx="8" fill="url(#trendGrad1)" />
        <Path d="M16 44 L28 32 L36 38 L52 22" stroke="url(#trendGrad2)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M44 22 L52 22 L52 30" stroke="url(#trendGrad2)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
