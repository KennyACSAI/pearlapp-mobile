// pearlapp-mobile1/components/lists/PersonRow.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import { Person, formatRelativeDate, formatDisplayDate, getInitials } from '@/data/sampleData';
import { colors, SvgColors, Typography, BorderRadius, Spacing, Shadows, Animation } from '@/constants';

interface PersonRowProps {
  person: Person;
  onPress: () => void;
  showChevron?: boolean;
  animationDelay?: number;
}

export function PersonRow({
  person,
  onPress,
  showChevron = true,
  animationDelay = 0,
}: PersonRowProps) {
  const backgroundColor = useSharedValue('transparent');

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  const handlePressIn = () => {
    backgroundColor.value = withTiming(colors.surfaceOpacity[80], {
      duration: Animation.duration.fast,
    });
  };

  const handlePressOut = () => {
    backgroundColor.value = withTiming('transparent', {
      duration: Animation.duration.fast,
    });
  };

  return (
    <Animated.View
      entering={FadeIn.duration(Animation.duration.slow).delay(animationDelay)}
      style={[styles.wrapper, animatedStyle]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
      >
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.initials}>{getInitials(person.name)}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {person.name}
            </Text>
            <Text style={styles.role} numberOfLines={1}>
              {person.role}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.lastInteraction}>
              Last: {formatRelativeDate(person.lastInteraction)}
            </Text>

            {person.nextReminder && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.nextReminder}>
                  Next: {formatDisplayDate(person.nextReminder)}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Chevron */}
        {showChevron && (
          <ChevronRight
            size={20}
            color={SvgColors.text}
            strokeWidth={1.5}
            style={styles.chevron}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderOpacity[5],
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderOpacity[10],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  initials: {
    ...Typography.callout,
    fontWeight: '500',
    color: colors.text,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing[2],
  },
  name: {
    ...Typography.callout,
    fontWeight: '500',
    color: colors.text,
    flexShrink: 1,
  },
  role: {
    ...Typography.footnote,
    color: colors.textOpacity[40],
    flexShrink: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[0.5] || 2,
  },
  lastInteraction: {
    ...Typography.footnote,
    color: colors.textOpacity[40],
  },
  separator: {
    ...Typography.footnote,
    color: colors.textOpacity[20],
  },
  nextReminder: {
    ...Typography.footnote,
    color: colors.textOpacity[60],
  },
  chevron: {
    opacity: 0.2,
    flexShrink: 0,
  },
});