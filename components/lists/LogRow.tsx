import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import { Note, getPersonById, formatDisplayDate } from '@/data/sampleData';
import { colors, Typography, BorderRadius, Spacing, Animation } from '@/constants';

interface LogRowProps {
  note: Note;
  onPress: () => void;
  animationDelay?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function LogRow({ note, onPress, animationDelay = 0 }: LogRowProps) {
  const backgroundColor = useSharedValue('transparent');

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  const handlePressIn = () => {
    backgroundColor.value = withTiming(colors.surfaceOpacity[40], {
      duration: Animation.duration.fast,
    });
  };

  const handlePressOut = () => {
    backgroundColor.value = withTiming('transparent', {
      duration: Animation.duration.fast,
    });
  };

  // Get first 2 linked people names
  const linkedPeopleNames = note.linkedPeople
    .slice(0, 2)
    .map((id) => {
      const person = getPersonById(id);
      return person?.name || null;
    })
    .filter((name): name is string => name !== null);

  const remainingCount = note.linkedPeople.length - 2;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      entering={FadeIn.duration(Animation.duration.slow).delay(animationDelay)}
      style={[styles.container, animatedStyle]}
    >
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>

        <Text style={styles.body} numberOfLines={2}>
          {note.body}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.date}>{formatDisplayDate(note.date)}</Text>

          {linkedPeopleNames.length > 0 && (
            <>
              <Text style={styles.separator}>•</Text>
              <View style={styles.peopleContainer}>
                {linkedPeopleNames.map((name, index) => (
                  <View key={index} style={styles.personTag}>
                    <Text style={styles.personName}>{name}</Text>
                  </View>
                ))}
                {remainingCount > 0 && (
                  <Text style={styles.moreCount}>+{remainingCount}</Text>
                )}
              </View>
            </>
          )}
        </View>
      </View>

      {/* Chevron */}
      <ChevronRight
        size={20}
        color={colors.text}
        strokeWidth={1.5}
        style={styles.chevron}
      />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderOpacity[5],
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...Typography.callout,
    fontWeight: '500',
    color: colors.text,
  },
  body: {
    ...Typography.footnote,
    color: colors.textOpacity[40],
    marginTop: Spacing[1],
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  date: {
    ...Typography.footnote,
    color: colors.textOpacity[40],
  },
  separator: {
    ...Typography.footnote,
    color: colors.textOpacity[20],
  },
  peopleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  personTag: {
    backgroundColor: colors.surfaceOpacity[60],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[0.5] || 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderOpacity[5],
  },
  personName: {
    ...Typography.footnote,
    color: colors.textOpacity[60],
  },
  moreCount: {
    ...Typography.footnote,
    color: colors.textOpacity[40],
  },
  chevron: {
    opacity: 0.2,
    flexShrink: 0,
    marginTop: Spacing[0.5] || 2,
  },
});
