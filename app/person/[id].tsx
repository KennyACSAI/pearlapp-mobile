import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  MoreVertical, 
  Calendar, 
  FileText, 
  Users, 
  Edit3, 
  Trash2, 
  Share as ShareIcon,
  User,
  Clock,
  Flag,
  Repeat,
  ChevronRight,
} from 'lucide-react-native';
import Animated, { 
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Typography, Spacing, Animation } from '@/constants';
import { 
  getPersonById, 
  getRemindersByPersonId, 
  getNotesByPersonId,
  getConnectionsForPerson,
  getInitials,
  formatDisplayDate,
  Reminder,
  Note,
  Person,
} from '@/data/sampleData';
import { PrimaryButton } from '@/components/inputs/PrimaryButton';
import { SecondaryButton } from '@/components/inputs/SecondaryButton';
import { Sheet } from '@/components/surfaces/Sheet';
import { TextField } from '@/components/inputs/TextField';
import { TagPill } from '@/components/inputs/TagPill';

// ============================================================================
// ADD REMINDER SHEET
// ============================================================================

interface AddReminderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  onSave: (reminder: { title: string; dueDate: string; dueTime?: string; priority: string; notes?: string }) => void;
}

function AddReminderSheet({ isOpen, onClose, personName, onSave }: AddReminderSheetProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setDueTime('');
    setPriority('Medium');
    setNotes('');
  };

  const handleSave = () => {
    if (!title.trim() || !dueDate.trim()) return;
    onSave({
      title: title.trim(),
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      notes: notes.trim() || undefined,
    });
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid = title.trim() && dueDate.trim();

  return (
    <Sheet isOpen={isOpen} onClose={handleClose} title="Add Reminder">
      <View style={sheetStyles.content}>
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder={`Follow up with ${personName}...`}
        />

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

        <View style={sheetStyles.field}>
          <Text style={sheetStyles.label}>Priority</Text>
          <View style={sheetStyles.priorityRow}>
            {(['Low', 'Medium', 'High'] as const).map(p => (
              <Pressable key={p} onPress={() => setPriority(p)} style={{ flex: 1 }}>
                <TagPill variant={priority === p ? 'filled' : 'outlined'} animated={false}>
                  {p}
                </TagPill>
              </Pressable>
            ))}
          </View>
        </View>

        <TextField
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Add context..."
          multiline
          numberOfLines={3}
        />

        <View style={sheetStyles.actions}>
          <PrimaryButton onPress={handleSave} fullWidth disabled={!isValid}>
            Save Reminder
          </PrimaryButton>
          <SecondaryButton onPress={handleClose} fullWidth>
            Cancel
          </SecondaryButton>
        </View>
      </View>
    </Sheet>
  );
}

// ============================================================================
// ADD NOTE SHEET
// ============================================================================

interface AddNoteSheetProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  onSave: (note: { title: string; body: string; tags: string[] }) => void;
}

function AddNoteSheet({ isOpen, onClose, personName, onSave }: AddNoteSheetProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const availableTags = ['meeting', 'call', 'email', 'intro', 'followup', 'personal'];

  const resetForm = () => {
    setTitle('');
    setBody('');
    setSelectedTags([]);
  };

  const handleSave = () => {
    if (!title.trim() || !body.trim()) return;
    onSave({
      title: title.trim(),
      body: body.trim(),
      tags: selectedTags,
    });
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const isValid = title.trim() && body.trim();

  return (
    <Sheet isOpen={isOpen} onClose={handleClose} title="Add Note">
      <View style={sheetStyles.content}>
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder={`Meeting with ${personName}...`}
        />

        <TextField
          label="Content"
          value={body}
          onChangeText={setBody}
          placeholder="What happened? Key takeaways..."
          multiline
          numberOfLines={5}
        />

        <View style={sheetStyles.field}>
          <Text style={sheetStyles.label}>Tags (optional)</Text>
          <View style={sheetStyles.tagsRow}>
            {availableTags.map(tag => (
              <Pressable key={tag} onPress={() => toggleTag(tag)}>
                <TagPill variant={selectedTags.includes(tag) ? 'filled' : 'outlined'} animated={false}>
                  {tag}
                </TagPill>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={sheetStyles.actions}>
          <PrimaryButton onPress={handleSave} fullWidth disabled={!isValid}>
            Save Note
          </PrimaryButton>
          <SecondaryButton onPress={handleClose} fullWidth>
            Cancel
          </SecondaryButton>
        </View>
      </View>
    </Sheet>
  );
}

// ============================================================================
// EDIT CONTACT SHEET
// ============================================================================

interface EditContactSheetProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person;
  onSave: (updates: { name: string; role: string; details: string; tags: string[] }) => void;
}

function EditContactSheet({ isOpen, onClose, person, onSave }: EditContactSheetProps) {
  const [name, setName] = useState(person.name);
  const [role, setRole] = useState(person.role);
  const [details, setDetails] = useState(person.details);
  const [selectedTags, setSelectedTags] = useState<string[]>(person.tags);

  const availableTags = ['Investor', 'Mentor', 'Community', 'Candidate', 'Friend', 'Family'];

  const handleSave = () => {
    if (!name.trim() || !role.trim()) return;
    onSave({
      name: name.trim(),
      role: role.trim(),
      details: details.trim(),
      tags: selectedTags,
    });
    onClose();
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const isValid = name.trim() && role.trim();

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Edit Contact">
      <View style={sheetStyles.content}>
        <TextField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Full name..."
        />

        <TextField
          label="Role"
          value={role}
          onChangeText={setRole}
          placeholder="e.g., Founder, Investor, Friend..."
        />

        <View style={sheetStyles.field}>
          <Text style={sheetStyles.label}>Tags</Text>
          <View style={sheetStyles.tagsRow}>
            {availableTags.map(tag => (
              <Pressable key={tag} onPress={() => toggleTag(tag)}>
                <TagPill variant={selectedTags.includes(tag) ? 'filled' : 'outlined'} animated={false}>
                  {tag}
                </TagPill>
              </Pressable>
            ))}
          </View>
        </View>

        <TextField
          label="Details"
          value={details}
          onChangeText={setDetails}
          placeholder="Add context about this person..."
          multiline
          numberOfLines={4}
        />

        <View style={sheetStyles.actions}>
          <PrimaryButton onPress={handleSave} fullWidth disabled={!isValid}>
            Save Changes
          </PrimaryButton>
          <SecondaryButton onPress={onClose} fullWidth>
            Cancel
          </SecondaryButton>
        </View>
      </View>
    </Sheet>
  );
}

// ============================================================================
// MORE OPTIONS SHEET (Three dots menu)
// ============================================================================

interface MoreOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
}

function MoreOptionsSheet({ isOpen, onClose, onEdit, onShare, onDelete }: MoreOptionsSheetProps) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Options">
      <View style={menuStyles.content}>
        <Pressable style={menuStyles.menuItem} onPress={() => { onClose(); onEdit(); }}>
          <Edit3 size={20} strokeWidth={1.5} color={Colors.text.primary} />
          <Text style={menuStyles.menuText}>Edit Contact</Text>
        </Pressable>

        <Pressable style={menuStyles.menuItem} onPress={() => { onClose(); onShare(); }}>
          <ShareIcon size={20} strokeWidth={1.5} color={Colors.text.primary} />
          <Text style={menuStyles.menuText}>Share Contact</Text>
        </Pressable>

        <View style={menuStyles.divider} />

        <Pressable style={menuStyles.menuItem} onPress={() => { onClose(); onDelete(); }}>
          <Trash2 size={20} strokeWidth={1.5} color={Colors.error} />
          <Text style={[menuStyles.menuText, { color: Colors.error }]}>Delete Contact</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

// ============================================================================
// REMINDER DETAIL SHEET (Matches Reminders page exactly)
// ============================================================================

interface ReminderDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  reminder: Reminder | null;
  personName: string;
  onToggle: () => void;
  onDelete: () => void;
}

function ReminderDetailSheet({ isOpen, onClose, reminder, personName, onToggle, onDelete }: ReminderDetailSheetProps) {
  if (!reminder) return null;

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
          <View style={detailStyles.infoRow}>
            <View style={detailStyles.infoIcon}>
              <User size={18} strokeWidth={1.5} color={Colors.text.tertiary} />
            </View>
            <View style={detailStyles.infoContent}>
              <Text style={detailStyles.infoLabel}>Person</Text>
              <Text style={detailStyles.infoValue}>{personName}</Text>
            </View>
          </View>

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
          <PrimaryButton onPress={() => { onToggle(); onClose(); }} fullWidth>
            {isDone ? 'Mark as Open' : 'Mark as Done'}
          </PrimaryButton>
          <SecondaryButton onPress={() => { onDelete(); onClose(); }} fullWidth>
            Delete Reminder
          </SecondaryButton>
        </View>
      </View>
    </Sheet>
  );
}

// ============================================================================
// NOTE DETAIL SHEET
// ============================================================================

interface NoteDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onDelete: () => void;
}

function NoteDetailSheet({ isOpen, onClose, note, onDelete }: NoteDetailSheetProps) {
  if (!note) return null;

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Note Details">
      <View style={detailStyles.content}>
        {/* Title */}
        <Text style={detailStyles.title}>{note.title}</Text>
        
        {/* Date */}
        <Text style={detailStyles.noteDate}>
          {new Date(note.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {/* Body */}
        <View style={detailStyles.noteBodySection}>
          <Text style={detailStyles.noteBodyText}>{note.body}</Text>
        </View>

        {/* Tags */}
        {note.tags.length > 0 && (
          <View style={detailStyles.tagsSection}>
            <Text style={detailStyles.tagsSectionTitle}>Tags</Text>
            <View style={detailStyles.tagsRow}>
              {note.tags.map(tag => (
                <View key={tag} style={detailStyles.tagBadge}>
                  <Text style={detailStyles.tagBadgeText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={detailStyles.actions}>
          <SecondaryButton onPress={() => { onDelete(); onClose(); }} fullWidth>
            Delete Note
          </SecondaryButton>
        </View>
      </View>
    </Sheet>
  );
}

// ============================================================================
// PRESSABLE REMINDER CARD
// ============================================================================

interface ReminderCardProps {
  reminder: Reminder;
  onPress: () => void;
}

function ReminderCard({ reminder, onPress }: ReminderCardProps) {
  const backgroundColor = useSharedValue(Colors.surface[40]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  const handlePressIn = () => {
    backgroundColor.value = withTiming(Colors.surface[60], { duration: Animation.duration.fast });
  };

  const handlePressOut = () => {
    backgroundColor.value = withTiming(Colors.surface[40], { duration: Animation.duration.fast });
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.reminderCard, animatedStyle]}>
        <View style={styles.reminderCardContent}>
          <Text style={styles.reminderTitle}>{reminder.title}</Text>
          <Text style={styles.reminderDate}>
            Due: {formatDisplayDate(reminder.dueDate)}
            {reminder.dueTime && ` at ${reminder.dueTime}`}
          </Text>
        </View>
        <ChevronRight size={18} strokeWidth={1.5} color={Colors.text.tertiary} />
      </Animated.View>
    </Pressable>
  );
}

// ============================================================================
// PRESSABLE NOTE CARD
// ============================================================================

interface NoteCardProps {
  note: Note;
  onPress: () => void;
}

function NoteCard({ note, onPress }: NoteCardProps) {
  const backgroundColor = useSharedValue('transparent');

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  const handlePressIn = () => {
    backgroundColor.value = withTiming(Colors.surface[60], { duration: Animation.duration.fast });
  };

  const handlePressOut = () => {
    backgroundColor.value = withTiming('transparent', { duration: Animation.duration.fast });
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.noteCard, animatedStyle]}>
        <View style={styles.noteCardContent}>
          <Text style={styles.noteTitle}>{note.title}</Text>
          <Text style={styles.noteBody} numberOfLines={2}>{note.body}</Text>
          <Text style={styles.noteDate}>{formatDisplayDate(note.date)}</Text>
        </View>
        <ChevronRight size={18} strokeWidth={1.5} color={Colors.text.tertiary} />
      </Animated.View>
    </Pressable>
  );
}

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function PersonProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [personData, setPersonData] = useState(() => getPersonById(id));
  const [reminders, setReminders] = useState(personData ? getRemindersByPersonId(id) : []);
  const [notes, setNotes] = useState(personData ? getNotesByPersonId(id) : []);
  const connections = personData ? getConnectionsForPerson(id) : [];

  // Sheet states
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Handlers
  const handleAddReminder = useCallback((reminderData: { title: string; dueDate: string; dueTime?: string; priority: string; notes?: string }) => {
    const newReminder: Reminder = {
      id: `r${Date.now()}`,
      title: reminderData.title,
      personId: id,
      dueDate: reminderData.dueDate,
      dueTime: reminderData.dueTime,
      priority: reminderData.priority as 'Low' | 'Medium' | 'High',
      status: 'Open',
      notes: reminderData.notes,
    };
    setReminders(prev => [newReminder, ...prev]);
  }, [id]);

  const handleAddNote = useCallback((noteData: { title: string; body: string; tags: string[] }) => {
    const newNote: Note = {
      id: `n${Date.now()}`,
      title: noteData.title,
      date: new Date().toISOString().split('T')[0],
      linkedPeople: [id],
      body: noteData.body,
      tags: noteData.tags,
    };
    setNotes(prev => [newNote, ...prev]);
  }, [id]);

  const handleEditContact = useCallback((updates: { name: string; role: string; details: string; tags: string[] }) => {
    if (!personData) return;
    setPersonData({
      ...personData,
      name: updates.name,
      role: updates.role,
      details: updates.details,
      tags: updates.tags,
    });
  }, [personData]);

  const handleShareContact = useCallback(async () => {
    if (!personData) return;
    try {
      await Share.share({
        title: `Contact: ${personData.name}`,
        message: `${personData.name}\n${personData.role}\n\n${personData.details}\n\nTags: ${personData.tags.join(', ')}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [personData]);

  const handleDeleteContact = useCallback(() => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${personData?.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            // In real app, would delete from backend
            router.back();
          }
        },
      ]
    );
  }, [personData?.name, router]);

  const handleReminderPress = useCallback((reminder: Reminder) => {
    setSelectedReminder(reminder);
  }, []);

  const handleNotePress = useCallback((note: Note) => {
    setSelectedNote(note);
  }, []);

  const handleToggleReminder = useCallback(() => {
    if (!selectedReminder) return;
    setReminders(prev => prev.map(r => 
      r.id === selectedReminder.id 
        ? { ...r, status: r.status === 'Done' ? 'Open' : 'Done' }
        : r
    ));
    setSelectedReminder(prev => prev ? { ...prev, status: prev.status === 'Done' ? 'Open' : 'Done' } : null);
  }, [selectedReminder]);

  const handleDeleteReminder = useCallback(() => {
    if (!selectedReminder) return;
    setReminders(prev => prev.filter(r => r.id !== selectedReminder.id));
  }, [selectedReminder]);

  const handleDeleteNote = useCallback(() => {
    if (!selectedNote) return;
    setNotes(prev => prev.filter(n => n.id !== selectedNote.id));
  }, [selectedNote]);

  const handleSeeAllNotes = useCallback(() => {
    router.push('/(tabs)/logs');
  }, [router]);

  const handleViewInMindmap = useCallback(() => {
    router.push('/(tabs)/mindmap');
  }, [router]);

  if (!personData) {
    return (
      <>
        <Stack.Screen options={{ 
          title: 'Not Found',
          headerBackTitle: '',
        }} />
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.errorText}>Person not found</Text>
        </View>
      </>
    );
  }

  return (
    <>
      {/* Configure the Stack header */}
      <Stack.Screen 
        options={{ 
          title: 'Contact',
          headerBackTitle: '',
          headerRight: () => (
            <Pressable 
              style={styles.moreButton}
              onPress={() => setIsMoreOptionsOpen(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreVertical size={20} strokeWidth={1.5} color={Colors.text.primary} />
            </Pressable>
          ),
        }} 
      />
      
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={styles.header}
          >
            <View style={styles.headerRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(personData.name)}
                </Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{personData.name}</Text>
                <Text style={styles.role}>{personData.role}</Text>
                <View style={styles.tags}>
                  {personData.tags.map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Context */}
          <Animated.View 
            entering={FadeIn.delay(50).duration(300)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Context</Text>
            <Text style={styles.contextText}>{personData.details}</Text>
          </Animated.View>

          {/* Actions */}
          <Animated.View 
            entering={FadeIn.delay(100).duration(300)}
            style={styles.actionsSection}
          >
            <PrimaryButton onPress={() => setIsAddReminderOpen(true)}>Add Reminder</PrimaryButton>
            <SecondaryButton onPress={() => setIsAddNoteOpen(true)}>Add Note</SecondaryButton>
          </Animated.View>

          {/* Open Reminders */}
          {reminders.length > 0 && (
            <Animated.View 
              entering={FadeIn.delay(150).duration(300)}
              style={styles.section}
            >
              <View style={styles.sectionHeader}>
                <Calendar size={18} strokeWidth={1.5} color={Colors.text.tertiary} />
                <Text style={styles.sectionTitle}>Open Reminders</Text>
                <Text style={styles.sectionCount}>({reminders.length})</Text>
              </View>
              <View style={styles.remindersList}>
                {reminders.map((reminder, index) => (
                  <Animated.View 
                    key={reminder.id}
                    entering={FadeIn.delay(150 + index * 50).duration(300)}
                  >
                    <ReminderCard 
                      reminder={reminder} 
                      onPress={() => handleReminderPress(reminder)} 
                    />
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Recent Notes */}
          {notes.length > 0 && (
            <Animated.View 
              entering={FadeIn.delay(200).duration(300)}
              style={styles.section}
            >
              <View style={styles.sectionHeader}>
                <FileText size={18} strokeWidth={1.5} color={Colors.text.tertiary} />
                <Text style={styles.sectionTitle}>Recent Notes</Text>
                <Text style={styles.sectionCount}>({notes.length})</Text>
              </View>
              <View style={styles.notesList}>
                {notes.slice(0, 3).map((note, index) => (
                  <Animated.View 
                    key={note.id}
                    entering={FadeIn.delay(200 + index * 50).duration(300)}
                  >
                    <NoteCard 
                      note={note} 
                      onPress={() => handleNotePress(note)} 
                    />
                  </Animated.View>
                ))}
              </View>
              {notes.length > 3 && (
                <Pressable style={styles.seeAllButton} onPress={handleSeeAllNotes}>
                  <Text style={styles.seeAllText}>See all notes →</Text>
                </Pressable>
              )}
            </Animated.View>
          )}

          {/* Connections */}
          {connections.length > 0 && (
            <Animated.View 
              entering={FadeIn.delay(250).duration(300)}
              style={styles.section}
            >
              <View style={styles.sectionHeader}>
                <Users size={18} strokeWidth={1.5} color={Colors.text.tertiary} />
                <Text style={styles.sectionTitle}>Connections</Text>
                <Text style={styles.sectionCount}>({connections.length})</Text>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.connectionsScroll}
              >
                {connections.slice(0, 5).map(conn => (
                  <Pressable 
                    key={conn.id} 
                    style={styles.connectionItem}
                    onPress={() => router.push(`/person/${conn.id}`)}
                  >
                    <View style={styles.connectionAvatar}>
                      <Text style={styles.connectionInitials}>
                        {getInitials(conn.name)}
                      </Text>
                    </View>
                    <Text style={styles.connectionName} numberOfLines={1}>
                      {conn.name.split(' ')[0]}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Pressable style={styles.seeAllButton} onPress={handleViewInMindmap}>
                <Text style={styles.seeAllText}>View in Mindmap →</Text>
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>
      </View>

      {/* Sheets */}
      <AddReminderSheet
        isOpen={isAddReminderOpen}
        onClose={() => setIsAddReminderOpen(false)}
        personName={personData.name}
        onSave={handleAddReminder}
      />

      <AddNoteSheet
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        personName={personData.name}
        onSave={handleAddNote}
      />

      <MoreOptionsSheet
        isOpen={isMoreOptionsOpen}
        onClose={() => setIsMoreOptionsOpen(false)}
        onEdit={() => setIsEditContactOpen(true)}
        onShare={handleShareContact}
        onDelete={handleDeleteContact}
      />

      <EditContactSheet
        isOpen={isEditContactOpen}
        onClose={() => setIsEditContactOpen(false)}
        person={personData}
        onSave={handleEditContact}
      />

      <ReminderDetailSheet
        isOpen={!!selectedReminder}
        onClose={() => setSelectedReminder(null)}
        reminder={selectedReminder}
        personName={personData.name}
        onToggle={handleToggleReminder}
        onDelete={handleDeleteReminder}
      />

      <NoteDetailSheet
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        note={selectedNote}
        onDelete={handleDeleteNote}
      />
    </>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface[100],
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...Typography.subheadline,
    color: Colors.text.tertiary,
  },
  moreButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Header
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border[5],
  },
  headerRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface[60],
    borderWidth: 1,
    borderColor: Colors.border[10],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.title2,
    color: Colors.text.tertiary,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    ...Typography.title1,
    marginBottom: 4,
  },
  role: {
    ...Typography.callout,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.surface[60],
    borderWidth: 1,
    borderColor: Colors.border[10],
    borderRadius: 999,
  },
  tagText: {
    ...Typography.footnote,
  },
  // Sections
  section: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border[5],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.headline,
  },
  sectionCount: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
  contextText: {
    ...Typography.callout,
    color: Colors.text.secondary,
    lineHeight: 22.4,
  },
  // Actions
  actionsSection: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border[5],
  },
  // Reminders
  remindersList: {
    gap: Spacing.xs,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border[10],
    borderRadius: 10,
  },
  reminderCardContent: {
    flex: 1,
  },
  reminderTitle: {
    ...Typography.callout,
    fontWeight: '500',
    marginBottom: 4,
  },
  reminderDate: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
  // Notes
  notesList: {
    gap: Spacing.xs,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: 8,
    marginHorizontal: -Spacing.xs,
  },
  noteCardContent: {
    flex: 1,
  },
  noteTitle: {
    ...Typography.callout,
    fontWeight: '500',
    marginBottom: 4,
  },
  noteBody: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  noteDate: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  seeAllButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  seeAllText: {
    ...Typography.callout,
    color: Colors.text.secondary,
  },
  // Connections
  connectionsScroll: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  connectionItem: {
    alignItems: 'center',
    gap: 6,
  },
  connectionAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface[60],
    borderWidth: 1,
    borderColor: Colors.border[10],
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionInitials: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
  connectionName: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
    maxWidth: 60,
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
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});

const menuStyles = StyleSheet.create({
  content: {
    padding: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  menuText: {
    ...Typography.callout,
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border[10],
    marginVertical: Spacing.xs,
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
  // Note detail specific
  noteDate: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  noteBodySection: {
    backgroundColor: Colors.surface[60],
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  noteBodyText: {
    ...Typography.callout,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  tagsSection: {
    marginBottom: Spacing.lg,
  },
  tagsSectionTitle: {
    ...Typography.subheadline,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tagBadge: {
    backgroundColor: Colors.surface[60],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border[10],
  },
  tagBadgeText: {
    ...Typography.footnote,
    color: Colors.text.secondary,
  },
});