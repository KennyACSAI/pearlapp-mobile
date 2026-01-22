// components/surfaces/Sheet.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
  Keyboard,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
  useAnimatedKeyboard,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { colors, SvgColors, Typography, BorderRadius, Spacing, Shadows, Animation } from '@/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Sheet({ isOpen, onClose, title, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);
  
  // Calculate max height accounting for safe areas
  const maxSheetHeight = SCREEN_HEIGHT - insets.top - 20; // 20px buffer from top

  useEffect(() => {
    if (isOpen) {
      overlayOpacity.value = withTiming(1, {
        duration: Animation.duration.normal,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 300,
        mass: 0.8,
      });
    } else {
      overlayOpacity.value = withTiming(0, {
        duration: Animation.duration.fast,
      });
      translateY.value = withTiming(SCREEN_HEIGHT, {
        duration: Animation.duration.slow,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [isOpen]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleClose = () => {
    Keyboard.dismiss();
    overlayOpacity.value = withTiming(0, {
      duration: Animation.duration.fast,
    });
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      {
        duration: Animation.duration.slow,
        easing: Easing.in(Easing.ease),
      },
      () => {
        runOnJS(onClose)();
      }
    );
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        {/* Overlay */}
        <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Sheet - positioned at bottom with maxHeight constraint */}
        <Animated.View 
          style={[
            styles.sheet, 
            sheetAnimatedStyle,
            { 
              maxHeight: maxSheetHeight,
              paddingBottom: Math.max(insets.bottom, 20),
            }
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              onPress={handleClose}
              style={styles.closeButton}
            >
              <X size={24} color={SvgColors.text} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Content - ScrollView handles keyboard internally */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            bounces={true}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surfaceOpacity?.[95] || 'rgba(255, 255, 255, 0.98)',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    ...Shadows.sheet,
    // Clean border, no heavy shadow
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.borderOpacity?.[10] || 'rgba(0, 0, 0, 0.1)',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing[2] || 8,
    paddingBottom: Spacing[1] || 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderOpacity?.[20] || 'rgba(0, 0, 0, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4] || 16,
    paddingVertical: Spacing[3] || 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderOpacity?.[10] || 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    ...Typography.headline,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: Spacing[1.5] || 6,
    borderRadius: BorderRadius.full,
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: Spacing[4] || 16,
  },
});