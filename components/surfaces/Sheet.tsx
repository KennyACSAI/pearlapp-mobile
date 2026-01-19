// pearlapp-mobile1/components/surfaces/Sheet.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
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
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        {/* Overlay */}
        <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View style={[styles.sheet, sheetAnimatedStyle]}>
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

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
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
    backgroundColor: colors.surfaceOpacity[95],
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: SCREEN_HEIGHT * 0.9,
    ...Shadows.sheet,
    // Glass effect border
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.borderOpacity[10],
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing[2],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderOpacity[20],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderBottomWidth: 2,
    borderBottomColor: colors.borderOpacity[10],
  },
  title: {
    ...Typography.headline,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: Spacing[1.5],
    borderRadius: BorderRadius.full,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});