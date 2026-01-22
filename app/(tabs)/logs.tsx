// logs.tsx - Fully functional with original modal design
import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, FileText, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  FadeIn, 
  FadeInDown,
  FadeOut,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Typography, Spacing, Animation, Shadows } from '@/constants';
import { notes as initialNotes, people, getPersonById, Note } from '@/data/sampleData';
import { SearchBar } from '@/components/inputs/SearchBar';
import { Sheet } from '@/components/surfaces/Sheet';
import { TextField } from '@/components/inputs/TextField';
import { PrimaryButton } from '@/components/inputs/PrimaryButton';
import { SecondaryButton } from '@/components/inputs/SecondaryButton';
import { TagPill } from '@/components/inputs/TagPill';
import { EmptyState } from '@/components/surfaces/EmptyState';

type FilterType = 'all' | 'recent' | 'thisWeek' | 'thisMonth';

// ============================================================================
// PRESSABLE LOG ROW
// ============================================================================

interface LogRowProps {
  note: Note;
  onPress: () => void;
}

function LogRow({ note, onPress }: LogRowProps) {
  const backgroundColor = useSharedValue('transparent');

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  const handlePressIn = () => {
    backgroundColor.value = withTiming(Colors.surface[60], { duration: 100 });
  };

  const handlePressOut = () => {
    backgroundColor.value = withTiming('transparent', { duration: 150 });
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.logRow, animatedStyle]}>
        {/* Content */}
        <View style={styles.logContent}>
          <Text style={styles.logTitle} numberOfLines={1}>
            {note.title}
          </Text>

          <Text style={styles.logBody} numberOfLines={2}>
            {note.body}
          </Text>

          <View style={styles.logMeta}>
            <Text style={styles.logDate}>{formatDate(note.date)}</Text>

            {linkedPeopleNames.length > 0 && (
              <>
                <Text style={styles.logSeparator}>•</Text>
                <View style={styles.logPeopleContainer}>
                  {linkedPeopleNames.map((name, index) => (
                    <View key={index} style={styles.logPersonTag}>
                      <Text style={styles.logPersonName}>{name}</Text>
                    </View>
                  ))}
                  {remainingCount > 0 && (
                    <Text style={styles.logMoreCount}>+{remainingCount}</Text>
                  )}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Chevron - shows it's pressable */}
        <ChevronRight
          size={20}
          color={Colors.text.tertiary}
          strokeWidth={1.5}
          style={styles.logChevron}
        />
      </Animated.View>
    </Pressable>
  );
}

// ============================================================================
// NEW LOG SHEET
// ============================================================================

interface NewLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: { title: string; body: string; tags: string[]; linkedPeople: string[] }) => void;
}

function NewLogSheet({ isOpen, onClose, onSave }: NewLogSheetProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  const availableTags = ['meeting', 'call', 'email', 'intro', 'followup', 'personal', 'work'];

  const resetForm = () => {
    setTitle('');
    setBody('');
    setSelectedTags([]);
    setSelectedPeople([]);
  };

  const handleSave = () => {
    if (!title.trim() || !body.trim()) return;
    onSave({
      title: title.trim(),
      body: body.trim(),
      tags: selectedTags,
      linkedPeople: selectedPeople,
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

  const togglePerson = (personId: string) => {
    if (selectedPeople.includes(personId)) {
      setSelectedPeople(selectedPeople.filter(p => p !== personId));
    } else {
      setSelectedPeople([...selectedPeople, personId]);
    }
  };

  const isValid = title.trim() && body.trim();

  return (
    <Sheet isOpen={isOpen} onClose={handleClose} title="New Log">
      <View style={sheetStyles.content}>
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Meeting notes, thoughts..."
        />

        <TextField
          label="Content"
          value={body}
          onChangeText={setBody}
          placeholder="What happened? Key takeaways..."
          multiline
          numberOfLines={5}
        />

        {/* Link People */}
        <View style={sheetStyles.field}>
          <Text style={sheetStyles.label}>Link People (optional)</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={sheetStyles.peopleScroll}
            contentContainerStyle={sheetStyles.peopleScrollContent}
          >
            {people.map(person => (
              <Pressable key={person.id} onPress={() => togglePerson(person.id)}>
                <TagPill 
                  variant={selectedPeople.includes(person.id) ? 'filled' : 'outlined'}
                  animated={false}
                >
                  {person.name}
                </TagPill>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Tags */}
        <View style={sheetStyles.field}>
          <Text style={sheetStyles.label}>Tags (optional)</Text>
          <View style={sheetStyles.tagsRow}>
            {availableTags.map(tag => (
              <Pressable key={tag} onPress={() => toggleTag(tag)}>
                <TagPill 
                  variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                  animated={false}
                >
                  {tag}
                </TagPill>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={sheetStyles.actions}>
          <PrimaryButton onPress={handleSave} fullWidth disabled={!isValid}>
            Save Log
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
// EDIT LOG SHEET
// ============================================================================

interface EditLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onSave: (updates: { title: string; body: string; tags: string[]; linkedPeople: string[] }) => void;
}

function EditLogSheet({ isOpen, onClose, note, onSave }: EditLogSheetProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [body, setBody] = useState(note?.body || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(note?.tags || []);
  const [selectedPeople, setSelectedPeople] = useState<string[]>(note?.linkedPeople || []);

  const availableTags = ['meeting', 'call', 'email', 'intro', 'followup', 'personal', 'work'];

  // Update state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.body);
      setSelectedTags(note.tags);
      setSelectedPeople(note.linkedPeople);
    }
  }, [note]);

  const handleSave = () => {
    if (!title.trim() || !body.trim()) return;
    onSave({
      title: title.trim(),
      body: body.trim(),
      tags: selectedTags,
      linkedPeople: selectedPeople,
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

  const togglePerson = (personId: string) => {
    if (selectedPeople.includes(personId)) {
      setSelectedPeople(selectedPeople.filter(p => p !== personId));
    } else {
      setSelectedPeople([...selectedPeople, personId]);
    }
  };

  const isValid = title.trim() && body.trim();

  if (!note) return null;

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Edit Log">
      <View style={sheetStyles.content}>
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Meeting notes, thoughts..."
        />

        <TextField
          label="Content"
          value={body}
          onChangeText={setBody}
          placeholder="What happened? Key takeaways..."
          multiline
          numberOfLines={5}
        />

        {/* Link People */}
        <View style={sheetStyles.field}>
          <Text style={sheetStyles.label}>Link People</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={sheetStyles.peopleScroll}
            contentContainerStyle={sheetStyles.peopleScrollContent}
          >
            {people.map(person => (
              <Pressable key={person.id} onPress={() => togglePerson(person.id)}>
                <TagPill 
                  variant={selectedPeople.includes(person.id) ? 'filled' : 'outlined'}
                  animated={false}
                >
                  {person.name}
                </TagPill>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Tags */}
        <View style={sheetStyles.field}>
          <Text style={sheetStyles.label}>Tags</Text>
          <View style={sheetStyles.tagsRow}>
            {availableTags.map(tag => (
              <Pressable key={tag} onPress={() => toggleTag(tag)}>
                <TagPill 
                  variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                  animated={false}
                >
                  {tag}
                </TagPill>
              </Pressable>
            ))}
          </View>
        </View>

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
// MAIN SCREEN
// ============================================================================

export default function LogsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [logsList, setLogsList] = useState(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isNewLogOpen, setIsNewLogOpen] = useState(false);
  const [isEditLogOpen, setIsEditLogOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);

  // Filter logic
  const filteredLogs = useMemo(() => {
    let filtered = logsList;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.body.toLowerCase().includes(query) ||
        n.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Apply time filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'recent':
        // Last 7 days
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filtered = filtered.filter(n => new Date(n.date) >= sevenDaysAgo);
        break;
      case 'thisWeek':
        // This week (starting Monday)
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        filtered = filtered.filter(n => new Date(n.date) >= monday);
        break;
      case 'thisMonth':
        // This month
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(n => new Date(n.date) >= firstOfMonth);
        break;
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchQuery, filter, logsList]);

  // Get counts for filter labels
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const recentCount = useMemo(() => {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return logsList.filter(n => new Date(n.date) >= sevenDaysAgo).length;
  }, [logsList]);

  const thisWeekCount = useMemo(() => {
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return logsList.filter(n => new Date(n.date) >= monday).length;
  }, [logsList]);

  const thisMonthCount = useMemo(() => {
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return logsList.filter(n => new Date(n.date) >= firstOfMonth).length;
  }, [logsList]);

  const handleNotePress = useCallback((note: Note) => {
    setSelectedNote(note);
  }, []);

  const handleSaveNewLog = useCallback((logData: { title: string; body: string; tags: string[]; linkedPeople: string[] }) => {
    const newNote: Note = {
      id: `n${Date.now()}`,
      title: logData.title,
      date: new Date().toISOString().split('T')[0],
      linkedPeople: logData.linkedPeople,
      body: logData.body,
      tags: logData.tags,
    };
    setLogsList(prev => [newNote, ...prev]);
  }, []);

  const handleEditLog = useCallback(() => {
    if (selectedNote) {
      setNoteToEdit(selectedNote);
      setSelectedNote(null);
      setIsEditLogOpen(true);
    }
  }, [selectedNote]);

  const handleSaveEditLog = useCallback((updates: { title: string; body: string; tags: string[]; linkedPeople: string[] }) => {
    if (!noteToEdit) return;
    setLogsList(prev => prev.map(n => 
      n.id === noteToEdit.id 
        ? { ...n, ...updates }
        : n
    ));
    setNoteToEdit(null);
  }, [noteToEdit]);

  const handleDeleteLog = useCallback(() => {
    if (!selectedNote) return;
    
    Alert.alert(
      'Delete Log',
      'Are you sure you want to delete this log? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            setLogsList(prev => prev.filter(n => n.id !== selectedNote.id));
            setSelectedNote(null);
          }
        },
      ]
    );
  }, [selectedNote]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.duration(300).springify()}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.title}>Logs</Text>
          <Pressable 
            style={styles.addButton}
            onPress={() => setIsNewLogOpen(true)}
          >
            <Plus size={24} strokeWidth={2} color={Colors.text.primary} />
          </Pressable>
        </View>

        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search logs..."
        />

        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          <Pressable onPress={() => setFilter('all')}>
            <TagPill variant={filter === 'all' ? 'filled' : 'outlined'} animated={false}>
              All ({logsList.length})
            </TagPill>
          </Pressable>
          <Pressable onPress={() => setFilter('recent')}>
            <TagPill variant={filter === 'recent' ? 'filled' : 'outlined'} animated={false}>
              Last 7 Days ({recentCount})
            </TagPill>
          </Pressable>
          <Pressable onPress={() => setFilter('thisWeek')}>
            <TagPill variant={filter === 'thisWeek' ? 'filled' : 'outlined'} animated={false}>
              This Week ({thisWeekCount})
            </TagPill>
          </Pressable>
          <Pressable onPress={() => setFilter('thisMonth')}>
            <TagPill variant={filter === 'thisMonth' ? 'filled' : 'outlined'} animated={false}>
              This Month ({thisMonthCount})
            </TagPill>
          </Pressable>
        </ScrollView>
      </Animated.View>

      {/* Logs list */}
      <ScrollView 
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon={<FileText size={48} strokeWidth={1} color={Colors.text.primary} />}
            title={filter === 'all' && !searchQuery ? "No logs yet" : "No logs found"}
            description={filter === 'all' && !searchQuery 
              ? "Add your first log to get started." 
              : "Try adjusting your search or filters"}
            actionLabel={filter === 'all' && !searchQuery ? "Add Log" : undefined}
            onAction={filter === 'all' && !searchQuery ? () => setIsNewLogOpen(true) : undefined}
          />
        ) : (
          filteredLogs.map((note, index) => (
            <Animated.View
              key={`${filter}-${note.id}`}
              entering={FadeIn.delay(index * Animation.staggerDelay).duration(300)}
              exiting={FadeOut.duration(200)}
              layout={LinearTransition.springify().damping(20).stiffness(200)}
            >
              <LogRow
                note={note}
                onPress={() => handleNotePress(note)}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* New Log Sheet */}
      <NewLogSheet
        isOpen={isNewLogOpen}
        onClose={() => setIsNewLogOpen(false)}
        onSave={handleSaveNewLog}
      />

      {/* Note Detail Sheet - Original design with functionality */}
      <Sheet
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        title={selectedNote?.title || 'Log'}
      >
        {selectedNote && (
          <View style={detailStyles.container}>
            <View style={detailStyles.content}>
              <Text style={detailStyles.title}>{selectedNote.title}</Text>
              <Text style={detailStyles.date}>
                {new Date(selectedNote.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>

              {/* Content section with visible box */}
              <View style={detailStyles.section}>
                <Text style={detailStyles.sectionLabel}>Content</Text>
                <View style={detailStyles.contentBox}>
                  <Text style={detailStyles.body}>{selectedNote.body}</Text>
                </View>
              </View>

              {selectedNote.linkedPeople.length > 0 && (
                <View style={detailStyles.section}>
                  <Text style={detailStyles.sectionLabel}>People</Text>
                  <View style={detailStyles.tags}>
                    {selectedNote.linkedPeople.map(personId => {
                      const person = getPersonById(personId);
                      return person ? (
                        <View key={personId} style={detailStyles.personTag}>
                          <Text style={detailStyles.personTagText}>{person.name}</Text>
                        </View>
                      ) : null;
                    })}
                  </View>
                </View>
              )}

              {selectedNote.tags.length > 0 && (
                <View style={detailStyles.section}>
                  <Text style={detailStyles.sectionLabel}>Tags</Text>
                  <View style={detailStyles.tags}>
                    {selectedNote.tags.map(tag => (
                      <View key={tag} style={detailStyles.tag}>
                        <Text style={detailStyles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Actions - Edit (black) and Delete (red) */}
              <View style={detailStyles.actions}>
                <Pressable 
                  style={detailStyles.editButton}
                  onPress={handleEditLog}
                >
                  <Text style={detailStyles.editButtonText}>Edit</Text>
                </Pressable>
                <Pressable 
                  style={detailStyles.deleteButton}
                  onPress={handleDeleteLog}
                >
                  <Text style={detailStyles.deleteButtonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </Sheet>

      {/* Edit Log Sheet */}
      <EditLogSheet
        isOpen={isEditLogOpen}
        onClose={() => { setIsEditLogOpen(false); setNoteToEdit(null); }}
        note={noteToEdit}
        onSave={handleSaveEditLog}
      />
    </View>
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
    backgroundColor: Colors.surface[100] || Colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border[15],
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...Typography.largeTitle,
    fontWeight: '600',
  },
  addButton: {
    padding: Spacing.xs,
    borderRadius: 10,
  },
  filtersScroll: {
    marginHorizontal: -Spacing.md,
    marginTop: Spacing.xs,
  },
  filtersContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    flexDirection: 'row',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  // Log row styles
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border[5],
  },
  logContent: {
    flex: 1,
    minWidth: 0,
  },
  logTitle: {
    ...Typography.callout,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  logBody: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  logMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  logDate: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
  logSeparator: {
    ...Typography.footnote,
    color: Colors.text.quaternary,
  },
  logPeopleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logPersonTag: {
    backgroundColor: Colors.surface[60],
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border[5],
  },
  logPersonName: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  logMoreCount: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  logChevron: {
    marginTop: 2,
    opacity: 0.3,
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
  peopleScroll: {
    marginHorizontal: -Spacing.md,
  },
  peopleScrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    flexDirection: 'row',
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

const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    ...Typography.title2,
    marginBottom: Spacing.xs,
  },
  date: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.subheadline,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  // Content box - visible rectangle, NOT pressable
  contentBox: {
    backgroundColor: Colors.surface[60] || Colors.surfaceOpacity[60],
    borderRadius: 10,
    padding: Spacing.md,
  },
  body: {
    ...Typography.callout,
    lineHeight: 22.4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  personTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    backgroundColor: Colors.surface[60] || Colors.surfaceOpacity[60],
    borderWidth: 1,
    borderColor: Colors.border[10],
    borderRadius: 999,
  },
  personTagText: {
    ...Typography.footnote,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.surface[60] || Colors.surfaceOpacity[60],
    borderWidth: 1,
    borderColor: Colors.border[10],
    borderRadius: 999,
  },
  tagText: {
    ...Typography.footnote,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  // Edit button - Black bg, white text
  editButton: {
    flex: 1,
    backgroundColor: '#000000',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    ...Typography.callout,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Delete button - Red warning
  deleteButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    ...Typography.callout,
    fontWeight: '600',
    color: '#FF3B30',
  },
});