import { Platform, TextStyle } from 'react-native';

// Helvetica Neue - ideal for fintech: clean, professional, excellent number legibility
export const fontFamily = Platform.select({
  web: 'Helvetica Neue, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif',
  ios: 'Helvetica Neue',
  android: 'sans-serif',
  default: 'Helvetica Neue',
});

export const helveticaRegular = Platform.select({
  web: 'Helvetica Neue, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif',
  ios: 'Helvetica Neue',
  android: 'sans-serif',
  default: 'Helvetica Neue',
});

export const helveticaMedium = Platform.select({
  web: 'Helvetica Neue, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif',
  ios: 'HelveticaNeue-Medium',
  android: 'sans-serif-medium',
  default: 'Helvetica Neue',
});

export const helveticaBold = Platform.select({
  web: 'Helvetica Neue, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif',
  ios: 'HelveticaNeue-Bold',
  android: 'sans-serif',
  default: 'Helvetica Neue',
});

export const helveticaLight = Platform.select({
  web: 'Helvetica Neue, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif',
  ios: 'HelveticaNeue-Light',
  android: 'sans-serif-light',
  default: 'Helvetica Neue',
});

export const helveticaThin = Platform.select({
  web: 'Helvetica Neue, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif',
  ios: 'HelveticaNeue-Thin',
  android: 'sans-serif-thin',
  default: 'Helvetica Neue',
});

// SF Pro Display - Apple's system font for landing, auth, and onboarding screens
export const sfProDisplayRegular = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const sfProDisplayMedium = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'System',
});

export const sfProDisplaySemibold = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'System',
});

export const sfProDisplayBold = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const sfProDisplayLight = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  ios: 'System',
  android: 'sans-serif-light',
  default: 'System',
});

export const paraboleRegular = Platform.select({
  web: '"Parabole", "Parabole Regular", system-ui, -apple-system, sans-serif',
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const Typography = {
  // Display styles - Helvetica Neue optimized for fintech
  largeTitle: {
    fontFamily: helveticaBold,
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.5,
    fontWeight: '700' as const,
  } as TextStyle,
  title1: {
    fontFamily: helveticaBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
    fontWeight: '700' as const,
  } as TextStyle,
  title2: {
    fontFamily: helveticaMedium,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    fontWeight: '500' as const,
  } as TextStyle,
  title3: {
    fontFamily: helveticaMedium,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.1,
    fontWeight: '500' as const,
  } as TextStyle,
  
  // Text styles - optimized for readability
  headline: {
    fontFamily: helveticaMedium,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.2,
    fontWeight: '600' as const,
  } as TextStyle,
  body: {
    fontFamily: helveticaRegular,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.2,
    fontWeight: '400' as const,
  } as TextStyle,
  callout: {
    fontFamily: helveticaRegular,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.15,
    fontWeight: '400' as const,
  } as TextStyle,
  subhead: {
    fontFamily: helveticaRegular,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.1,
    fontWeight: '400' as const,
  } as TextStyle,
  footnote: {
    fontFamily: helveticaRegular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    fontWeight: '400' as const,
  } as TextStyle,
  caption1: {
    fontFamily: helveticaRegular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    fontWeight: '400' as const,
  } as TextStyle,
  caption2: {
    fontFamily: helveticaRegular,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.05,
    fontWeight: '400' as const,
  } as TextStyle,
  
  // Fintech-specific styles for numbers and currency
  currencyLarge: {
    fontFamily: helveticaLight,
    fontSize: 42,
    lineHeight: 50,
    letterSpacing: -1,
    fontWeight: '300' as const,
  } as TextStyle,
  currencyMedium: {
    fontFamily: helveticaRegular,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    fontWeight: '400' as const,
  } as TextStyle,
  currencySmall: {
    fontFamily: helveticaMedium,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.2,
    fontWeight: '500' as const,
  } as TextStyle,
  numberTabular: {
    fontFamily: helveticaRegular,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: '400' as const,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  } as TextStyle,
  percentChange: {
    fontFamily: helveticaMedium,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
    fontWeight: '500' as const,
  } as TextStyle,
};
