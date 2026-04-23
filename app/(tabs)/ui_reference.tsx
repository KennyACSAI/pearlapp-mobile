import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform as RNPlatform,
  Keyboard,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import type { ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Plus, Calendar, User, Clock, Flag, Repeat, FileText, Check, X } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolateColor,
  runOnJS,
  Easing,
  useAnimatedKeyboard,
  useAnimatedReaction,
  ZoomIn,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import {
  reminders as initialReminders,
  people,
  Reminder,
  getPersonById,
  formatDueDate,
  formatDisplayDate,
  isOverdue,
} from '@/data/sampleData';

type FilterType = 'all' | 'open' | 'done';
type PriorityType = 'Low' | 'Medium' | 'High';

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
  background: '#FFFFFF',
  
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

/**
 * Pearl App Spacing & Layout System
 * 
 * Consistent spacing, border radius, and shadow values
 * matching the web app exactly.
 */


const shadowDefinitions = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
  
  sm: RNPlatform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ViewStyle,
  
  md: RNPlatform.select({
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
  
  lg: RNPlatform.select({
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
  
  xl: RNPlatform.select({
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
  
  tabBar: RNPlatform.select({
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
  
  sheet: RNPlatform.select({
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
  
  headerPaddingTop: RNPlatform.select({ ios: 48, android: 44, default: 44 }),
tabBarPaddingBottom: RNPlatform.select({ ios: 34, android: 16, default: 16 }),


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
  tabBarHeight: RNPlatform.select({ ios: 83, android: 60, default: 60 }),
};

/**
 * Animation timing values - standalone export
 */
export const Animation = animationDefinitions;

/**
 * Pearl App Typography System
 * 
 * Based on iOS HIG / SF Pro typography scale.
 * Matches the web app's typography exactly.
 */


// Font family - uses system fonts which include SF Pro on iOS
const fontFamily = RNPlatform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});


/**
 * Typography scale matching the web app exactly
 */
export const Typography = {
  largeTitle: {
    fontFamily,
    fontSize: 34,
    fontWeight: '600',
    lineHeight: 40.8,
    letterSpacing: -0.5,
  } as TextStyle,

  title1: {
    fontFamily,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 33.6,
    letterSpacing: -0.4,
  } as TextStyle,

  title2: {
    fontFamily,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28.6,
    letterSpacing: -0.3,
  } as TextStyle,

  headline: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22.1,
    letterSpacing: -0.2,
  } as TextStyle,

  body: {
    fontFamily,
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 23.8,
    letterSpacing: -0.2,
  } as TextStyle,

  callout: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22.4,
    letterSpacing: -0.1,
  } as TextStyle,

  subheadline: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.1,
  } as TextStyle,

  footnote: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18.2,
    letterSpacing: 0,
  } as TextStyle,

  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16.8,
    letterSpacing: 0,
  } as TextStyle,
};

// Font weights as numbers for StyleSheet
export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Convenience function to get text style with custom weight
export function getTextStyle(
  variant: keyof typeof Typography,
  weight?: keyof typeof FontWeights
): TextStyle {
  const baseStyle = Typography[variant];
  if (weight) {
    return { ...baseStyle, fontWeight: FontWeights[weight] };
  }
  return baseStyle;
}



export default function RemindersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [reminders, setReminders] = useState(initialReminders);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  // Use useMemo with a key to force re-render animation when filter changes
  const filteredReminders = useMemo(() => {
    if (filter === 'all') return reminders;
    return reminders.filter(r => r.status.toLowerCase() === filter);
  }, [reminders, filter]);

  const toggleReminder = useCallback((id: string) => {
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, status: r.status === 'Open' ? 'Done' : 'Open' } : r
    ));
  }, []);

  const handleReminderPress = useCallback((id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      setSelectedReminder(reminder);
    }
  }, [reminders]);

  const handleDeleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    setSelectedReminder(null);
  }, []);

  const handleSaveNewReminder = useCallback((newReminder: Omit<Reminder, 'id'>) => {
    const reminder: Reminder = {
      ...newReminder,
      id: `r${Date.now()}`,
    };
    setReminders(prev => [reminder, ...prev]);
  }, []);

  const handlePersonPress = useCallback((personId: string) => {
    setSelectedReminder(null);
    router.push(`/person/${personId}`);
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.duration(300).springify()}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.title}>Reminders</Text>
          <Pressable 
            style={styles.addButton}
            onPress={() => setIsCreateOpen(true)}
          >
            <Plus size={24} strokeWidth={2} color={Colors.text.primary} />
          </Pressable>
        </View>

        {/* Filter tabs */}
        <View style={styles.filters}>
          <Pressable onPress={() => setFilter('all')}>
            <TagPill variant={filter === 'all' ? 'filled' : 'outlined'}>
              All
            </TagPill>
          </Pressable>
          <Pressable onPress={() => setFilter('open')}>
            <TagPill variant={filter === 'open' ? 'filled' : 'outlined'}>
              Open
            </TagPill>
          </Pressable>
          <Pressable onPress={() => setFilter('done')}>
            <TagPill variant={filter === 'done' ? 'filled' : 'outlined'}>
              Done
            </TagPill>
          </Pressable>
        </View>
      </Animated.View>

      {/* Reminders list */}
      <ScrollView 
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredReminders.length === 0 ? (
          <EmptyState
            icon={<Bell size={48} strokeWidth={1} color={Colors.text.primary} />}
            title={filter === 'done' ? "No completed reminders" : "No reminders yet"}
            description={filter === 'done' ? "Completed reminders will appear here." : "Turn 'we should catch up' into 'done.'"}
            actionLabel={filter !== 'done' ? "Add Reminder" : undefined}
            onAction={filter !== 'done' ? () => setIsCreateOpen(true) : undefined}
          />
        ) : (
          filteredReminders.map((reminder, index) => (
            <Animated.View 
              key={`${filter}-${reminder.id}`}
              entering={FadeIn.delay(index * Animation.staggerDelay).duration(300)}
              exiting={FadeOut.duration(200)}
              layout={LinearTransition.springify().damping(20).stiffness(200)}
            >
              <ReminderRow
                reminder={reminder}
                onToggle={() => toggleReminder(reminder.id)}
                onPress={() => handleReminderPress(reminder.id)}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Create Reminder Sheet */}
      <CreateReminderSheet
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveNewReminder}
      />

      {/* Reminder Detail Sheet */}
      <ReminderDetailSheet
        reminder={selectedReminder}
        isOpen={!!selectedReminder}
        onClose={() => setSelectedReminder(null)}
        onToggle={() => selectedReminder && toggleReminder(selectedReminder.id)}
        onDelete={() => selectedReminder && handleDeleteReminder(selectedReminder.id)}
        onPersonPress={handlePersonPress}
      />
    </View>
  );
}

// ============================================================================
// CREATE REMINDER SHEET
// ============================================================================

interface CreateReminderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: Omit<Reminder, 'id'>) => void;
}

function CreateReminderSheet({ isOpen, onClose, onSave }: CreateReminderSheetProps) {
  const [title, setTitle] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<PriorityType>('Medium');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setTitle('');
    setSelectedPerson('');
    setDueDate('');
    setDueTime('');
    setPriority('Medium');
    setNotes('');
  };

  const handleSave = () => {
    if (!title.trim() || !selectedPerson || !dueDate) return;

    onSave({
      title: title.trim(),
      personId: selectedPerson,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      status: 'Open',
      notes: notes.trim() || undefined,
    });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid = title.trim() && selectedPerson && dueDate;

  return (
    <Sheet isOpen={isOpen} onClose={handleClose} title="New Reminder">
      <View style={sheetStyles.content}>
        {/* Title */}
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Follow up with..."
        />

        {/* Person Selection */}
        <View style={sheetStyles.field}>
          <Text style={sheetStyles.label}>Person</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={sheetStyles.personScroll}
            contentContainerStyle={sheetStyles.personScrollContent}
          >
            {people.map(person => (
              <Pressable
                key={person.id}
                onPress={() => setSelectedPerson(person.id)}
              >
                <TagPill 
                  variant={selectedPerson === person.id ? 'filled' : 'outlined'}
                >
                  {person.name}
                </TagPill>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Due Date & Time */}
        <View style={sheetStyles.row}>
          <View style={sheetStyles.halfField}>
            <TextField
              label="Due Date"
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={sheetStyles.halfField}>
            <TextField
              label="Time (optional)"
              value={dueTime}
              onChangeText={setDueTime}
              placeholder="HH:MM"
            />
          </View>
        </View>

        {/* Priority Selection */}
        <View style={sheetStyles.field}>
          <Text style={sheetStyles.label}>Priority</Text>
          <View style={sheetStyles.priorityRow}>
            {(['Low', 'Medium', 'High'] as PriorityType[]).map(p => (
              <Pressable
                key={p}
                onPress={() => setPriority(p)}
                style={{ flex: 1 }}
              >
                <TagPill variant={priority === p ? 'filled' : 'outlined'}>
                  {p}
                </TagPill>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Notes */}
        <TextField
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Add context..."
          multiline
          numberOfLines={3}
        />

        {/* Actions */}
        <View style={sheetStyles.actions}>
          <SecondaryButton onPress={handleClose} fullWidth>
            Cancel
          </SecondaryButton>
          <PrimaryButton onPress={handleSave} fullWidth disabled={!isValid}>
            Save
          </PrimaryButton>
        </View>
      </View>
    </Sheet>
  );
}

// ============================================================================
// REMINDER DETAIL SHEET
// ============================================================================

interface ReminderDetailSheetProps {
  reminder: Reminder | null;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onPersonPress: (personId: string) => void;
}

function ReminderDetailSheet({ 
  reminder, 
  isOpen, 
  onClose, 
  onToggle, 
  onDelete,
  onPersonPress,
}: ReminderDetailSheetProps) {
  if (!reminder) return null;

  const person = getPersonById(reminder.personId);
  const isDone = reminder.status === 'Done';

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return Colors.error;
      case 'Medium': return Colors.warning;
      default: return Colors.text.tertiary;
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Reminder Details">
      <View style={detailStyles.content}>
        {/* Title & Status */}
        <View style={detailStyles.header}>
          <Text style={[
            detailStyles.title,
            isDone && detailStyles.titleDone
          ]}>
            {reminder.title}
          </Text>
          <View style={[
            detailStyles.statusBadge,
            isDone ? detailStyles.statusDone : detailStyles.statusOpen
          ]}>
            <Text style={[
              detailStyles.statusText,
              isDone ? detailStyles.statusTextDone : detailStyles.statusTextOpen
            ]}>
              {reminder.status}
            </Text>
          </View>
        </View>

        {/* Info Rows */}
        <View style={detailStyles.infoSection}>
          {/* Person */}
          {person && (
            <Pressable 
              style={detailStyles.infoRow}
              onPress={() => onPersonPress(person.id)}
            >
              <View style={detailStyles.infoIcon}>
                <User size={18} strokeWidth={1.5} color={Colors.text.tertiary} />
              </View>
              <View style={detailStyles.infoContent}>
                <Text style={detailStyles.infoLabel}>Person</Text>
                <Text style={detailStyles.infoValueLink}>{person.name}</Text>
              </View>
            </Pressable>
          )}

          {/* Due Date */}
          <View style={detailStyles.infoRow}>
            <View style={detailStyles.infoIcon}>
              <Calendar size={18} strokeWidth={1.5} color={Colors.text.tertiary} />
            </View>
            <View style={detailStyles.infoContent}>
              <Text style={detailStyles.infoLabel}>Due Date</Text>
              <Text style={detailStyles.infoValue}>
                {formatDisplayDate(reminder.dueDate)}
              </Text>
            </View>
          </View>

          {/* Due Time */}
          {reminder.dueTime && (
            <View style={detailStyles.infoRow}>
              <View style={detailStyles.infoIcon}>
                <Clock size={18} strokeWidth={1.5} color={Colors.text.tertiary} />
              </View>
              <View style={detailStyles.infoContent}>
                <Text style={detailStyles.infoLabel}>Time</Text>
                <Text style={detailStyles.infoValue}>{reminder.dueTime}</Text>
              </View>
            </View>
          )}

          {/* Priority */}
          <View style={detailStyles.infoRow}>
            <View style={detailStyles.infoIcon}>
              <Flag size={18} strokeWidth={1.5} color={getPriorityColor(reminder.priority)} />
            </View>
            <View style={detailStyles.infoContent}>
              <Text style={detailStyles.infoLabel}>Priority</Text>
              <Text style={[
                detailStyles.infoValue,
                { color: getPriorityColor(reminder.priority) }
              ]}>
                {reminder.priority}
              </Text>
            </View>
          </View>

          {/* Repeat */}
          {reminder.repeat && (
            <View style={detailStyles.infoRow}>
              <View style={detailStyles.infoIcon}>
                <Repeat size={18} strokeWidth={1.5} color={Colors.text.tertiary} />
              </View>
              <View style={detailStyles.infoContent}>
                <Text style={detailStyles.infoLabel}>Repeat</Text>
                <Text style={detailStyles.infoValue}>{reminder.repeat}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Notes */}
        {reminder.notes && (
          <View style={detailStyles.notesSection}>
            <View style={detailStyles.notesSectionHeader}>
              <FileText size={18} strokeWidth={1.5} color={Colors.text.tertiary} />
              <Text style={detailStyles.notesSectionTitle}>Notes</Text>
            </View>
            <Text style={detailStyles.notesText}>{reminder.notes}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={detailStyles.actions}>
          <PrimaryButton onPress={onToggle} fullWidth>
            {isDone ? 'Mark as Open' : 'Mark as Done'}
          </PrimaryButton>
          <SecondaryButton onPress={onDelete} fullWidth>
            Delete Reminder
          </SecondaryButton>
        </View>
      </View>
    </Sheet>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface[100],
    borderBottomWidth: 2,
    borderBottomColor: Colors.border[15],
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.largeTitle,
    fontWeight: '600',
  },
  addButton: {
    padding: Spacing.xs,
    borderRadius: 10,
  },
  filters: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
});

const sheetStyles = StyleSheet.create({
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  field: {
    gap: 6,
  },
  label: {
    ...Typography.subheadline,
    fontWeight: '500',
  },
  personScroll: {
    marginHorizontal: -Spacing.md,
  },
  personScrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});

const detailStyles = StyleSheet.create({
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.title2,
    flex: 1,
  },
  titleDone: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusOpen: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  statusDone: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  statusText: {
    ...Typography.footnote,
    fontWeight: '600',
  },
  statusTextOpen: {
    color: Colors.info,
  },
  statusTextDone: {
    color: Colors.success,
  },
  infoSection: {
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border[5],
  },
  infoIcon: {
    width: 32,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  infoValue: {
    ...Typography.callout,
  },
  infoValueLink: {
    ...Typography.callout,
    color: Colors.info,
  },
  notesSection: {
    backgroundColor: Colors.surface[60],
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  notesSectionTitle: {
    ...Typography.subheadline,
    fontWeight: '500',
  },
  notesText: {
    ...Typography.callout,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  actions: {
    gap: Spacing.sm,
  },
});


// components/lists/ReminderRow.tsx

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
      style={[reminderRowStyles.container, animatedRowStyle]}
    >
      {/* Checkbox */}
      <AnimatedPressable
        onPress={handleCheckboxPress}
        onPressIn={handleCheckboxPressIn}
        onPressOut={handleCheckboxPressOut}
        style={reminderRowStyles.checkboxTouchArea}
      >
        <Animated.View style={[reminderRowStyles.checkbox, animatedCheckboxStyle]}>
          <Animated.View style={animatedCheckmarkStyle}>
            <Check size={12} color={colors.primaryForeground} strokeWidth={3} />
          </Animated.View>
        </Animated.View>
      </AnimatedPressable>

      {/* Content */}
      <View style={reminderRowStyles.content}>
        <Text
          style={[reminderRowStyles.title, isDone && reminderRowStyles.titleDone]}
          numberOfLines={1}
        >
          {reminder.title}
        </Text>

        <View style={reminderRowStyles.metaRow}>
          {person && (
            <>
              <Text style={reminderRowStyles.personName}>{person.name}</Text>
              <Text style={reminderRowStyles.separator}>â€¢</Text>
            </>
          )}

          <Text style={[reminderRowStyles.dueDate, isReminderOverdue && reminderRowStyles.dueDateOverdue]}>
            {formatDueDate(reminder.dueDate, reminder.dueTime)}
          </Text>

          {reminder.priority === 'High' && (
            <>
              <Text style={reminderRowStyles.separator}>â€¢</Text>
              <Text style={reminderRowStyles.priority}>High priority</Text>
            </>
          )}
        </View>
      </View>
    </AnimatedTouchable>
  );
}

const reminderRowStyles = StyleSheet.create({
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
// pearlapp-mobile1/components/inputs/TagPill.tsx

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
          tagPillStyles.text,
          variant === 'filled' ? tagPillStyles.textFilled : tagPillStyles.textOutlined,
        ]}
      >
        {children}
      </Text>

      {onRemove && (
        <Pressable
          onPress={onRemove}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 4 }}
          style={tagPillStyles.removeButton}
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
    tagPillStyles.container,
    variant === 'filled' ? tagPillStyles.filled : tagPillStyles.outlined,
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

const tagPillStyles = StyleSheet.create({
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


// components/surfaces/EmptyState.tsx

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
      style={[emptyStateStyles.container, style]}
    >
      {icon && (
        <Animated.View
          entering={ZoomIn.duration(Animation.duration.normal).delay(100)}
          style={emptyStateStyles.iconContainer}
        >
          {icon}
        </Animated.View>
      )}

      <Text style={emptyStateStyles.title}>{title}</Text>
      <Text style={emptyStateStyles.description}>{description}</Text>

      {actionLabel && onAction && (
        <View style={emptyStateStyles.actionContainer}>
          <PrimaryButton onPress={onAction}>{actionLabel}</PrimaryButton>
        </View>
      )}
    </Animated.View>
  );
}

const emptyStateStyles = StyleSheet.create({
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

// components/surfaces/Sheet.tsx

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
      <View style={sheetComponentStyles.modalContainer}>
        {/* Overlay */}
        <Animated.View style={[sheetComponentStyles.overlay, overlayAnimatedStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Sheet - positioned at bottom with maxHeight constraint */}
        <Animated.View 
          style={[
            sheetComponentStyles.sheet, 
            sheetAnimatedStyle,
            { 
              maxHeight: maxSheetHeight,
              paddingBottom: Math.max(insets.bottom, 20),
            }
          ]}
        >
          {/* Handle */}
          <View style={sheetComponentStyles.handleContainer}>
            <View style={sheetComponentStyles.handle} />
          </View>

          {/* Header */}
          <View style={sheetComponentStyles.header}>
            <Text style={sheetComponentStyles.title}>{title}</Text>
            <Pressable
              onPress={handleClose}
              style={sheetComponentStyles.closeButton}
            >
              <X size={24} color={SvgColors.text} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Content - ScrollView handles keyboard internally */}
          <ScrollView
            style={sheetComponentStyles.scrollView}
            contentContainerStyle={sheetComponentStyles.scrollContent}
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

const sheetComponentStyles = StyleSheet.create({
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


// components/inputs/TextField.tsx

interface TextFieldProps extends Omit<TextInputProps, 'onChange'> {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export function TextField({
  label,
  value,
  onChange,
  onChangeText,
  placeholder,
  error,
  helper,
  multiline = false,
  rows = 3,
  disabled = false,
  containerStyle,
  inputStyle,
  ...props
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const borderColor = useSharedValue(colors.borderOpacity[15]);
  const shadowOpacity = useSharedValue(0.1);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderColor.value = withTiming(
      error ? colors.borderOpacity[60] : colors.borderOpacity[30],
      { duration: Animation.duration.normal }
    );
    shadowOpacity.value = withTiming(0.15, { duration: Animation.duration.normal });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderColor.value = withTiming(
      error ? colors.borderOpacity[60] : colors.borderOpacity[15],
      { duration: Animation.duration.normal }
    );
    shadowOpacity.value = withTiming(0.1, { duration: Animation.duration.normal });
  };

  const handleChangeText = (text: string) => {
    onChange?.(text);
    onChangeText?.(text);
  };

  const inputHeight = multiline ? Math.max(80, rows * 22.4) : undefined;

  return (
    <View style={[textFieldStyles.container, containerStyle]}>
      {label && <Text style={textFieldStyles.label}>{label}</Text>}
      
      <Animated.View
        style={[
          textFieldStyles.inputContainer,
          error && textFieldStyles.inputError,
          isFocused && Shadows.md,
          animatedContainerStyle,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textOpacity[40]}
          multiline={multiline}
          numberOfLines={multiline ? rows : 1}
          editable={!disabled}
          style={[
            textFieldStyles.input,
            multiline && textFieldStyles.multilineInput,
            multiline && { height: inputHeight },
            disabled && textFieldStyles.inputDisabled,
            inputStyle,
          ]}
          {...props}
        />
      </Animated.View>

      {error && <Text style={textFieldStyles.errorText}>{error}</Text>}
      {helper && !error && <Text style={textFieldStyles.helperText}>{helper}</Text>}
    </View>
  );
}

const textFieldStyles = StyleSheet.create({
  container: {
    gap: Spacing[1.5],
  },
  label: {
    ...Typography.subheadline,
    fontWeight: '500',
    color: colors.text,
  },
  inputContainer: {
    backgroundColor: colors.surfaceOpacity[80],
    borderWidth: 1,
    borderColor: colors.borderOpacity[15],
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  input: {
    ...Typography.callout,
    color: colors.text,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    minHeight: 44,
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: Spacing[2.5],
  },
  inputError: {
    borderColor: colors.borderOpacity[60],
  },
  inputDisabled: {
    opacity: 0.5,
  },
  errorText: {
    ...Typography.footnote,
    color: colors.textOpacity[60],
  },
  helperText: {
    ...Typography.footnote,
    color: colors.textOpacity[40],
  },
});

// pearlapp-mobile1/components/inputs/PrimaryButton.tsx

interface PrimaryButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function PrimaryButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(Animation.scale.pressed, {
      damping: Animation.spring.damping,
      stiffness: Animation.spring.stiffness,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: Animation.spring.damping,
      stiffness: Animation.spring.stiffness,
    });
  };

  return (
    <Animated.View
      style={[
        primaryButtonStyles.buttonContainer,
        fullWidth && primaryButtonStyles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          primaryButtonStyles.button,
          disabled && primaryButtonStyles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primaryForeground} size="small" />
        ) : (
          <Text style={[primaryButtonStyles.text, textStyle]}>{children}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const primaryButtonStyles = StyleSheet.create({
  buttonContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  fullWidth: {
    width: '100%',
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    ...Typography.callout,
    fontWeight: '600',
    color: colors.primaryForeground,
  },
});


// components/inputs/SecondaryButton.tsx

interface SecondaryButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function SecondaryButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: SecondaryButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(Animation.scale.pressed, {
      damping: Animation.spring.damping,
      stiffness: Animation.spring.stiffness,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: Animation.spring.damping,
      stiffness: Animation.spring.stiffness,
    });
  };

  return (
    <Animated.View
      style={[
        secondaryButtonStyles.buttonContainer,
        fullWidth && secondaryButtonStyles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          secondaryButtonStyles.button,
          disabled && secondaryButtonStyles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Text style={[secondaryButtonStyles.text, textStyle]}>{children}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const secondaryButtonStyles = StyleSheet.create({
  buttonContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  button: {
    backgroundColor: colors.surface,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: colors.borderOpacity[15],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    ...Typography.callout,
    fontWeight: '500',
    color: colors.text,
  },
});