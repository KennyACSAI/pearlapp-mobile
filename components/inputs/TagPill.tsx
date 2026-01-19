// pearlapp-mobile1/components/inputs/TagPill.tsx
import React from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { colors, SvgColors, Typography, BorderRadius, Spacing, Shadows, Animation } from '@/constants';

interface TagPillProps {
  children: React.ReactNode;
  variant?: 'outlined' | 'filled';
  onPress?: () => void;
  onRemove?: () => void;
  style?: ViewStyle;
  animated?: boolean;
}

export function TagPill({
  children,
  variant = 'outlined',
  onPress,
  onRemove,
  style,
  animated = true,
}: TagPillProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(Animation.scale.pressedSmall, {
        damping: Animation.spring.damping,
        stiffness: Animation.spring.stiffness,
      });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: Animation.spring.damping,
      stiffness: Animation.spring.stiffness,
    });
  };

  const content = (
    <>
      <Text
        style={[
          styles.text,
          variant === 'filled' ? styles.textFilled : styles.textOutlined,
        ]}
      >
        {children}
      </Text>

      {onRemove && (
        <Pressable
          onPress={onRemove}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 4 }}
          style={styles.removeButton}
        >
          <X
            size={12}
            color={variant === 'filled' ? SvgColors.primaryForeground : SvgColors.text}
            strokeWidth={2}
          />
        </Pressable>
      )}
    </>
  );

  const containerStyle = [
    styles.container,
    variant === 'filled' ? styles.filled : styles.outlined,
    onPress && animatedStyle,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          entering={animated ? FadeIn.duration(Animation.duration.fast) : undefined}
          exiting={animated ? FadeOut.duration(Animation.duration.fast) : undefined}
          style={containerStyle}
        >
          {content}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Animated.View
      entering={animated ? FadeIn.duration(Animation.duration.fast) : undefined}
      exiting={animated ? FadeOut.duration(Animation.duration.fast) : undefined}
      style={containerStyle}
    >
      {content}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  outlined: {
    backgroundColor: colors.surfaceOpacity[70],
    borderWidth: 1,
    borderColor: colors.borderOpacity[15],
  },
  filled: {
    backgroundColor: colors.primary,
  },
  text: {
    ...Typography.footnote,
    fontWeight: '500',
  },
  textOutlined: {
    color: colors.text,
  },
  textFilled: {
    color: colors.primaryForeground,
  },
  removeButton: {
    marginLeft: Spacing[0.5] || 2,
  },
});