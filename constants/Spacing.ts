/**
 * Pearl App Spacing & Layout System
 * 
 * Consistent spacing, border radius, and shadow values
 * matching the web app exactly.
 */

import { Platform, ViewStyle } from 'react-native';

/**
 * Shadow definitions matching web app
 */
const shadowDefinitions = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
  
  sm: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ViewStyle,
  
  md: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }) as ViewStyle,
  
  lg: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }) as ViewStyle,
  
  xl: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
    },
    android: {
      elevation: 12,
    },
    default: {},
  }) as ViewStyle,
  
  tabBar: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }) as ViewStyle,
  
  sheet: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.2,
      shadowRadius: 40,
    },
    android: {
      elevation: 16,
    },
    default: {},
  }) as ViewStyle,
};

/**
 * Animation timing values matching web app
 */
const animationDefinitions = {
  duration: {
    instant: 100,
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 400,
  },
  
  spring: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },
  
  staggerDelay: 30,
  
  scale: {
    pressed: 0.98,
    pressedSmall: 0.96,
    pressedStrong: 0.90,
  },
};

/**
 * Base spacing unit is 4px
 * Follows a 4px grid system
 */
export const Spacing = {
  // Base unit
  unit: 4,
  
  // Spacing scale
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Specific spacing values from web (numeric keys)
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  
  // Nested shadow for backward compatibility with screen files
  shadow: shadowDefinitions,
  
  // Nested animation for backward compatibility with screen files
  animation: animationDefinitions,
};

/**
 * Border radius values
 * Matching web app's rounded corners
 */
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

/**
 * Shadow definitions - standalone export
 */
export const Shadows = shadowDefinitions;

/**
 * Common layout values
 */
export const Layout = {
  maxWidth: 393,
  
  headerPaddingTop: Platform.select({ ios: 48, android: 44, default: 44 }),
  tabBarPaddingBottom: Platform.select({ ios: 34, android: 16, default: 16 }),
  
  screenPadding: 16,
  
  avatarSizes: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    xxl: 80,
  },
  
  iconSizes: {
    xs: 12,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
    xxl: 48,
  },
  
  buttonHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  
  inputHeight: 44,
  listRowHeight: 64,
  tabBarHeight: Platform.select({ ios: 83, android: 60, default: 60 }),
};

/**
 * Animation timing values - standalone export
 */
export const Animation = animationDefinitions;