import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { Reminder, getPersonById, formatDueDate, isOverdue } from '@/data/sampleData';
import { colors, Typography, BorderRadius, Spacing, Animation } from '@/constants';

interface ReminderRowProps {
  reminder: Reminder;
  onToggle: () => void;
  onPress: () => void;
  animationDelay?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function ReminderRow({
  reminder,
  onToggle,
  onPress,
  animationDelay = 0,
}: ReminderRowProps) {
  const person = getPersonById(reminder.personId);
  const isDone = reminder.status === 'Done';
  const isReminderOverdue = !isDone && isOverdue(reminder.dueDate);

  const backgroundColor = useSharedValue('transparent');
  const checkboxScale = useSharedValue(1);

  const animatedRowStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  const animatedCheckboxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
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

  const handleCheckboxPressIn = () => {
    checkboxScale.value = withSpring(Animation.scale.pressedStrong, {
      damping: Animation.spring.damping,
      stiffness: Animation.spring.stiffness,
    });
  };

  const handleCheckboxPressOut = () => {
    checkboxScale.value = withSpring(1, {
      damping: Animation.spring.damping,
      stiffness: Animation.spring.stiffness,
    });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      entering={FadeIn.duration(Animation.duration.slow).delay(animationDelay)}
      style={[styles.container, animatedRowStyle]}
    >
      {/* Checkbox */}
      <Pressable
        onPress={onToggle}
        onPressIn={handleCheckboxPressIn}
        onPressOut={handleCheckboxPressOut}
        style={styles.checkboxTouchArea}
      >
        <Animated.View
          style={[
            styles.checkbox,
            isDone && styles.checkboxChecked,
            animatedCheckboxStyle,
          ]}
        >
          {isDone && (
            <Animated.View entering={FadeIn.duration(Animation.duration.fast)}>
              <Check size={12} color={colors.primaryForeground} strokeWidth={3} />
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>

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
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: colors.borderOpacity[20],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
    color: colors.textOpacity[80],
  },
  priority: {
    ...Typography.footnote,
    color: colors.textOpacity[60],
  },
});
