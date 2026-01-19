import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Plus } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Colors, Typography, Spacing } from '@/constants';
import { reminders as initialReminders, people, Reminder } from '@/data/sampleData';
import { ReminderRow } from '@/components/lists/ReminderRow';
import { TagPill } from '@/components/inputs/TagPill';
import { EmptyState } from '@/components/surfaces/EmptyState';
import { Sheet } from '@/components/surfaces/Sheet';
import { TextField } from '@/components/inputs/TextField';
import { PrimaryButton } from '@/components/inputs/PrimaryButton';
import { SecondaryButton } from '@/components/inputs/SecondaryButton';

type FilterType = 'all' | 'open' | 'done';

export default function RemindersScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('all');
  const [reminders, setReminders] = useState(initialReminders);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<string | null>(null);

  const filteredReminders = filter === 'all'
    ? reminders
    : reminders.filter(r => r.status.toLowerCase() === filter);

  const toggleReminder = useCallback((id: string) => {
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, status: r.status === 'Open' ? 'Done' : 'Open' } : r
    ));
  }, []);

  const handleReminderPress = useCallback((id: string) => {
    setSelectedReminder(id);
  }, []);

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
            title="No reminders yet"
            description="Turn 'we should catch up' into 'done.'"
            actionLabel="Add Reminder"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          filteredReminders.map((reminder, index) => (
            <Animated.View 
              key={reminder.id}
              entering={FadeIn.delay(index * Spacing.animation.staggerDelay).duration(300)}
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
      />
    </View>
  );
}

interface CreateReminderSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateReminderSheet({ isOpen, onClose }: CreateReminderSheetProps) {
  const [title, setTitle] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    // TODO: Actually save the reminder
    onClose();
    // Reset form
    setTitle('');
    setSelectedPerson('');
    setDueDate('');
    setNotes('');
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="New Reminder">
      <View style={sheetStyles.content}>
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Follow up with..."
        />

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

        <TextField
          label="Due Date"
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
        />

        <TextField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Add context..."
          multiline
          numberOfLines={4}
        />

        <View style={sheetStyles.actions}>
          <SecondaryButton onPress={onClose} fullWidth>
            Cancel
          </SecondaryButton>
          <PrimaryButton onPress={handleSave} fullWidth>
            Save
          </PrimaryButton>
        </View>
      </View>
    </Sheet>
  );
}

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
    ...Spacing.shadow.sm,
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});
