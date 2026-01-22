import { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Plus, Calendar, User, Clock, Flag, Repeat, FileText } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeOut,
  Layout,
  LinearTransition,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { Colors, Typography, Spacing, Animation } from '@/constants';
import { 
  reminders as initialReminders, 
  people, 
  Reminder,
  getPersonById,
  formatDueDate,
  formatDisplayDate,
} from '@/data/sampleData';
import { ReminderRow } from '@/components/lists/ReminderRow';
import { TagPill } from '@/components/inputs/TagPill';
import { EmptyState } from '@/components/surfaces/EmptyState';
import { Sheet } from '@/components/surfaces/Sheet';
import { TextField } from '@/components/inputs/TextField';
import { PrimaryButton } from '@/components/inputs/PrimaryButton';
import { SecondaryButton } from '@/components/inputs/SecondaryButton';

type FilterType = 'all' | 'open' | 'done';
type PriorityType = 'Low' | 'Medium' | 'High';

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