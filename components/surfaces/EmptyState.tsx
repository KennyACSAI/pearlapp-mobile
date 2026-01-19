import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { PrimaryButton } from '../inputs/PrimaryButton';
import { colors, Typography, Spacing, Animation } from '@/constants';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(Animation.duration.slow)}
      style={[styles.container, style]}
    >
      {icon && (
        <Animated.View
          entering={ZoomIn.duration(Animation.duration.normal).delay(100)}
          style={styles.iconContainer}
        >
          {icon}
        </Animated.View>
      )}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionLabel && onAction && (
        <View style={styles.actionContainer}>
          <PrimaryButton onPress={onAction}>{actionLabel}</PrimaryButton>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
    paddingVertical: Spacing[16],
  },
  iconContainer: {
    marginBottom: Spacing[4],
    opacity: 0.2,
  },
  title: {
    ...Typography.headline,
    color: colors.text,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  description: {
    ...Typography.subheadline,
    color: colors.textOpacity[60],
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: Spacing[6],
  },
  actionContainer: {
    marginTop: Spacing[2],
  },
});
