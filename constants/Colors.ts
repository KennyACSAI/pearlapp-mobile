/**
 * Pearl App Color System
 * 
 * Matches the web app's color palette exactly.
 * Uses a minimal black/white/gray scheme with opacity levels.
 */

// Helper to convert hex colors to rgb for iOS SVG compatibility
export const svgSafeColor = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  return hex;
};

// Base colors object
const baseColors = {
  // Primary colors
  primary: '#000000',
  primaryForeground: '#FFFFFF',
  
  // Backgrounds
  background: '#FAFAFA',
  
  // Base surface color (solid white)
  surface: '#FFFFFF',
  
  // Surface with opacity levels (for glass effects)
  surfaceOpacity: {
    40: 'rgba(255, 255, 255, 0.40)',
    60: 'rgba(255, 255, 255, 0.60)',
    70: 'rgba(255, 255, 255, 0.70)',
    80: 'rgba(255, 255, 255, 0.80)',
    95: 'rgba(255, 255, 255, 0.95)',
    100: 'rgba(255, 255, 255, 1.00)',
  },
  
  // Base text color (solid black)
  text: '#000000',
  
  // Text opacity levels
  textOpacity: {
    20: 'rgba(0, 0, 0, 0.20)',
    40: 'rgba(0, 0, 0, 0.40)',
    50: 'rgba(0, 0, 0, 0.50)',
    60: 'rgba(0, 0, 0, 0.60)',
    80: 'rgba(0, 0, 0, 0.80)',
  },
  
  // Border opacity levels
  borderOpacity: {
    5: 'rgba(0, 0, 0, 0.05)',
    10: 'rgba(0, 0, 0, 0.10)',
    15: 'rgba(0, 0, 0, 0.15)',
    20: 'rgba(0, 0, 0, 0.20)',
    25: 'rgba(0, 0, 0, 0.25)',
    30: 'rgba(0, 0, 0, 0.30)',
    40: 'rgba(0, 0, 0, 0.40)',
    60: 'rgba(0, 0, 0, 0.60)',
  },
  
  // Overlay (for sheets, modals)
  overlay: 'rgba(0, 0, 0, 0.30)',
  
  // Icon colors
  icon: '#000000',
  iconMuted: 'rgba(0, 0, 0, 0.40)',
  iconSubtle: 'rgba(0, 0, 0, 0.20)',
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  // Press/hover states
  pressLight: 'rgba(0, 0, 0, 0.02)',
  pressMedium: 'rgba(0, 0, 0, 0.05)',
};

// Create the Colors object with nested structures for tab layout compatibility
export const Colors = {
  ...baseColors,
  
  // Nested surface structure
  surface: Object.assign('#FFFFFF', {
    base: '#FFFFFF',
    40: 'rgba(255, 255, 255, 0.40)',
    60: 'rgba(255, 255, 255, 0.60)',
    70: 'rgba(255, 255, 255, 0.70)',
    80: 'rgba(255, 255, 255, 0.80)',
    95: 'rgba(255, 255, 255, 0.95)',
    100: 'rgba(255, 255, 255, 1.00)',
  }),
  
  // Nested text structure
  text: Object.assign('#000000', {
    primary: '#000000',
    secondary: 'rgba(0, 0, 0, 0.60)',
    tertiary: 'rgba(0, 0, 0, 0.40)',
    quaternary: 'rgba(0, 0, 0, 0.20)',
    muted: 'rgba(0, 0, 0, 0.20)',
  }),
  
  // Nested border structure
  border: {
    base: 'rgba(0, 0, 0, 0.10)',
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.15)',
    strong: 'rgba(0, 0, 0, 0.20)',
    focus: 'rgba(0, 0, 0, 0.30)',
    5: 'rgba(0, 0, 0, 0.05)',
    10: 'rgba(0, 0, 0, 0.10)',
    15: 'rgba(0, 0, 0, 0.15)',
    20: 'rgba(0, 0, 0, 0.20)',
    25: 'rgba(0, 0, 0, 0.25)',
    30: 'rgba(0, 0, 0, 0.30)',
    40: 'rgba(0, 0, 0, 0.40)',
    60: 'rgba(0, 0, 0, 0.60)',
  },
};

// Alias for convenience (lowercase)
export const colors = Colors;

// SVG-safe colors for use with react-native-svg and lucide-react-native
export const SvgColors = {
  primary: 'rgb(0, 0, 0)',
  primaryForeground: 'rgb(255, 255, 255)',
  background: 'rgb(250, 250, 250)',
  surface: 'rgb(255, 255, 255)',
  text: 'rgb(0, 0, 0)',
  icon: 'rgb(0, 0, 0)',
  success: 'rgb(52, 199, 89)',
  warning: 'rgb(255, 149, 0)',
  error: 'rgb(255, 59, 48)',
  info: 'rgb(0, 122, 255)',
};