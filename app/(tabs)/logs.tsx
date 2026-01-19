import { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Colors, Typography, Spacing, Animation, Shadows } from '@/constants';
import { notes, people, getPersonById, Note } from '@/data/sampleData';
import { LogRow } from '@/components/lists/LogRow';
import { SearchBar } from '@/components/inputs/SearchBar';
import { Sheet } from '@/components/surfaces/Sheet';
import { TextField } from '@/components/inputs/TextField';
import { PrimaryButton } from '@/components/inputs/PrimaryButton';
import { SecondaryButton } from '@/components/inputs/SecondaryButton';
import { EmptyState } from '@/components/surfaces/EmptyState';

export default function LogsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isNewNoteSheetOpen, setIsNewNoteSheetOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteBody, setNewNoteBody] = useState('');

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.body.toLowerCase().includes(query) ||
      n.tags.some(t => t.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleNotePress = useCallback((note: Note) => {
    setSelectedNote(note);
  }, []);

  const handleCreateNote = useCallback(() => {
    // In real app, would save to backend
    setIsNewNoteSheetOpen(false);
    setNewNoteTitle('');
    setNewNoteBody('');
  }, []);

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
            onPress={() => setIsNewNoteSheetOpen(true)}
          >
            <Plus size={24} strokeWidth={2} color={Colors.text.primary} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search logs..."
        />
      </View>

      {/* Notes list */}
      <ScrollView 
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotes.length === 0 ? (
          <EmptyState
            title="No logs found"
            description="Add your first log to get started"
            actionLabel="Add Log"
            onAction={() => setIsNewNoteSheetOpen(true)}
          />
        ) : (
          filteredNotes.map((note, index) => (
            <Animated.View
              key={note.id}
              entering={FadeIn.delay(index * Animation.staggerDelay).duration(300)}
            >
              <LogRow
                note={note}
                onPress={() => handleNotePress(note)}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* New Note Sheet */}
      <Sheet
        isOpen={isNewNoteSheetOpen}
        onClose={() => setIsNewNoteSheetOpen(false)}
        title="New Log"
      >
        <View style={sheetStyles.content}>
          <TextField
            label="Title"
            value={newNoteTitle}
            onChange={setNewNoteTitle}
            placeholder="Meeting notes, thoughts..."
          />
          <TextField
            label="Content"
            value={newNoteBody}
            onChange={setNewNoteBody}
            placeholder="What happened?"
            multiline
            rows={5}
          />
          <View style={sheetStyles.actions}>
            <SecondaryButton onPress={() => setIsNewNoteSheetOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onPress={handleCreateNote}>
              Save
            </PrimaryButton>
          </View>
        </View>
      </Sheet>

      {/* Note Detail Sheet */}
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

              <View style={detailStyles.section}>
                <Text style={detailStyles.sectionLabel}>Content</Text>
                <Text style={detailStyles.body}>{selectedNote.body}</Text>
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

              <View style={detailStyles.actions}>
                <SecondaryButton>
                  Edit
                </SecondaryButton>
                <SecondaryButton>
                  Delete
                </SecondaryButton>
              </View>
            </View>
          </View>
        )}
      </Sheet>
    </View>
  );
}

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
    ...Shadows.sm,
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
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border[5],
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
  actions: {
    flexDirection: 'row',
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
});