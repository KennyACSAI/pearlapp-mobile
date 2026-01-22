import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { Reminder, getPersonById, formatDueDate, isOverdue } from '@/data/sampleData';
import { colors, Typography, BorderRadius, Spacing, Animation } from '@/constants';
import * as Haptics from 'expo-haptics';

interface ReminderRowProps {
  reminder: Reminder;
  onToggle: () => void;
  onPress: () => void;
  animationDelay?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ReminderRow({
  reminder,
  onToggle,
  onPress,
  animationDelay = 0,
}: ReminderRowProps) {
  const person = getPersonById(reminder.personId);
  const isDone = reminder.status === 'Done';
  const isReminderOverdue = !isDone && isOverdue(reminder.dueDate);

  // Row animations
  const rowBackgroundColor = useSharedValue('transparent');
  
  // Checkbox animations
  const checkboxScale = useSharedValue(1);
  const checkboxProgress = useSharedValue(isDone ? 1 : 0);
  const checkmarkScale = useSharedValue(isDone ? 1 : 0);
  const checkmarkRotate = useSharedValue(isDone ? 0 : -45);

  const animatedRowStyle = useAnimatedStyle(() => ({
    backgroundColor: rowBackgroundColor.value,
  }));

  const animatedCheckboxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
    backgroundColor: interpolateColor(
      checkboxProgress.value,
      [0, 1],
      ['transparent', colors.primary]
    ),
    borderColor: interpolateColor(
      checkboxProgress.value,
      [0, 1],
      [colors.borderOpacity[20], colors.primary]
    ),
  }));

  const animatedCheckmarkStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: checkmarkScale.value },
      { rotate: `${checkmarkRotate.value}deg` },
    ],
    opacity: checkmarkScale.value,
  }));

  // Row press handlers
  const handleRowPressIn = () => {
    rowBackgroundColor.value = withTiming(colors.surfaceOpacity[80], {
      duration: Animation.duration.fast,
    });
  };

  const handleRowPressOut = () => {
    rowBackgroundColor.value = withTiming('transparent', {
      duration: Animation.duration.fast,
    });
  };

  // Checkbox press handlers with enhanced animation
  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Haptics not available
    }
  };

  const handleCheckboxPress = () => {
    // Trigger haptic feedback
    runOnJS(triggerHaptic)();
    
    // Bounce animation
    checkboxScale.value = withSequence(
      withSpring(0.8, { damping: 10, stiffness: 400 }),
      withSpring(1.2, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );

    if (isDone) {
      // Unchecking
      checkboxProgress.value = withTiming(0, { duration: 200 });
      checkmarkScale.value = withTiming(0, { duration: 150 });
      checkmarkRotate.value = withTiming(-45, { duration: 150 });
    } else {
      // Checking
      checkboxProgress.value = withTiming(1, { duration: 200 });
      checkmarkScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1.2, { damping: 12, stiffness: 400 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
      checkmarkRotate.value = withSequence(
        withTiming(-45, { duration: 0 }),
        withSpring(0, { damping: 12, stiffness: 300 })
      );
    }

    // Call the actual toggle
    onToggle();
  };

  const handleCheckboxPressIn = () => {
    checkboxScale.value = withSpring(0.85, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handleCheckboxPressOut = () => {
    // Scale will be handled by handleCheckboxPress animation
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handleRowPressIn}
      onPressOut={handleRowPressOut}
      activeOpacity={1}
      entering={FadeIn.duration(Animation.duration.slow).delay(animationDelay)}
      style={[styles.container, animatedRowStyle]}
    >
      {/* Checkbox */}
      <AnimatedPressable
        onPress={handleCheckboxPress}
        onPressIn={handleCheckboxPressIn}
        onPressOut={handleCheckboxPressOut}
        style={styles.checkboxTouchArea}
      >
        <Animated.View style={[styles.checkbox, animatedCheckboxStyle]}>
          <Animated.View style={animatedCheckmarkStyle}>
            <Check size={12} color={colors.primaryForeground} strokeWidth={3} />
          </Animated.View>
        </Animated.View>
      </AnimatedPressable>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, isDone && styles.titleDone]}
          numberOfLines={1}
        >
          {reminder.title}
        </Text>

        <View style={styles.metaRow}>
          {person && (
            <>
              <Text style={styles.personName}>{person.name}</Text>
              <Text style={styles.separator}>•</Text>
            </>
          )}

          <Text style={[styles.dueDate, isReminderOverdue && styles.dueDateOverdue]}>
            {formatDueDate(reminder.dueDate, reminder.dueTime)}
          </Text>

          {reminder.priority === 'High' && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.priority}>High priority</Text>
            </>
          )}
        </View>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderOpacity[5],
  },
  checkboxTouchArea: {
    padding: Spacing[1],
    marginTop: Spacing[1],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...Typography.callout,
    color: colors.text,
  },
  titleDone: {
    opacity: 0.4,
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  personName: {
    ...Typography.footnote,
    color: colors.textOpacity[60],
  },
  separator: {
    ...Typography.footnote,
    color: colors.textOpacity[20],
  },
  dueDate: {
    ...Typography.footnote,
    color: colors.textOpacity[40],
  },
  dueDateOverdue: {
    color: colors.error || colors.textOpacity[80],
  },
  priority: {
    ...Typography.footnote,
    color: colors.textOpacity[60],
  },
});