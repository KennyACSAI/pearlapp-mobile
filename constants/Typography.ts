/**
 * Pearl App Typography System
 * 
 * Based on iOS HIG / SF Pro typography scale.
 * Matches the web app's typography exactly.
 */

import { Platform, TextStyle } from 'react-native';

// Font family - uses system fonts which include SF Pro on iOS
const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

/**
 * Typography scale matching the web app exactly
 */
export const Typography = {
  largeTitle: {
    fontFamily,
    fontSize: 34,
    fontWeight: '600',
    lineHeight: 40.8,
    letterSpacing: -0.5,
  } as TextStyle,

  title1: {
    fontFamily,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 33.6,
    letterSpacing: -0.4,
  } as TextStyle,

  title2: {
    fontFamily,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28.6,
    letterSpacing: -0.3,
  } as TextStyle,

  headline: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22.1,
    letterSpacing: -0.2,
  } as TextStyle,

  body: {
    fontFamily,
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 23.8,
    letterSpacing: -0.2,
  } as TextStyle,

  callout: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22.4,
    letterSpacing: -0.1,
  } as TextStyle,

  subheadline: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.1,
  } as TextStyle,

  footnote: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18.2,
    letterSpacing: 0,
  } as TextStyle,

  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16.8,
    letterSpacing: 0,
  } as TextStyle,
};

// Font weights as numbers for StyleSheet
export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Convenience function to get text style with custom weight
export function getTextStyle(
  variant: keyof typeof Typography,
  weight?: keyof typeof FontWeights
): TextStyle {
  const baseStyle = Typography[variant];
  if (weight) {
    return { ...baseStyle, fontWeight: FontWeights[weight] };
  }
  return baseStyle;
}