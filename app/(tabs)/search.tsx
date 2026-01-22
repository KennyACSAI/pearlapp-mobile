import { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Bell, FileText, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Colors, Typography, Spacing } from '@/constants';
import { people, reminders, notes, getPersonById, getInitials } from '@/data/sampleData';
import { SearchBar } from '@/components/inputs/SearchBar';
import { TagPill } from '@/components/inputs/TagPill';

type SearchCategory = 'all' | 'people' | 'reminders' | 'logs';

const RECENT_SEARCHES = ['Sara Kim', 'climate tech', 'coffee meetings'];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');

  const results = useMemo(() => {
    if (!searchQuery) return { people: [], reminders: [], notes: [] };

    const query = searchQuery.toLowerCase();

    const filteredPeople = people.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.role.toLowerCase().includes(query) ||
      p.tags.some(t => t.toLowerCase().includes(query))
    );

    const filteredReminders = reminders.filter(r =>
      r.title.toLowerCase().includes(query) ||
      r.notes?.toLowerCase().includes(query)
    );

    const filteredNotes = notes.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.body.toLowerCase().includes(query) ||
      n.tags.some(t => t.toLowerCase().includes(query))
    );

    return { 
      people: filteredPeople, 
      reminders: filteredReminders, 
      notes: filteredNotes 
    };
  }, [searchQuery]);

  const hasResults = results.people.length > 0 || 
    results.reminders.length > 0 || 
    results.notes.length > 0;

  const showPeople = category === 'all' || category === 'people';
  const showReminders = category === 'all' || category === 'reminders';
  const showNotes = category === 'all' || category === 'logs';

  const handlePersonPress = useCallback((personId: string) => {
    router.push(`/person/${personId}`);
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with search */}
      <Animated.View 
        entering={FadeInDown.duration(300).springify()}
        style={styles.header}
      >
        <Text style={styles.title}>Search</Text>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="People, reminders, or notes..."
          autoFocus
        />
      </Animated.View>

      {/* Category filters */}
      {searchQuery && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <Pressable onPress={() => setCategory('all')}>
            <TagPill variant={category === 'all' ? 'filled' : 'outlined'}>
              All
            </TagPill>
          </Pressable>
          <Pressable onPress={() => setCategory('people')}>
            <TagPill variant={category === 'people' ? 'filled' : 'outlined'}>
              People ({results.people.length})
            </TagPill>
          </Pressable>
          <Pressable onPress={() => setCategory('reminders')}>
            <TagPill variant={category === 'reminders' ? 'filled' : 'outlined'}>
              Reminders ({results.reminders.length})
            </TagPill>
          </Pressable>
          <Pressable onPress={() => setCategory('logs')}>
            <TagPill variant={category === 'logs' ? 'filled' : 'outlined'}>
              Logs ({results.notes.length})
            </TagPill>
          </Pressable>
        </ScrollView>
      )}

      {/* Results or recent searches */}
      <ScrollView 
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {!searchQuery ? (
          // Recent searches
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <View style={styles.recentList}>
              {RECENT_SEARCHES.map((search, idx) => (
                <Pressable
                  key={idx}
                  style={styles.recentItem}
                  onPress={() => setSearchQuery(search)}
                >
                  <Text style={styles.recentText}>{search}</Text>
                  <ChevronRight size={20} strokeWidth={1.5} color={Colors.text.quaternary} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : !hasResults ? (
          // No results
          <View style={styles.noResults}>
            <Text style={styles.noResultsTitle}>No results found</Text>
            <Text style={styles.noResultsSubtitle}>Try a different search term</Text>
          </View>
        ) : (
          // Search results
          <View style={styles.results}>
            {/* People results */}
            {showPeople && results.people.length > 0 && (
              <View style={styles.resultSection}>
                <View style={styles.resultHeader}>
                  <User size={18} strokeWidth={1.5} color={Colors.text.tertiary} />
                  <Text style={styles.resultTitle}>People</Text>
                  <Text style={styles.resultCount}>({results.people.length})</Text>
                </View>
                {results.people.map((person, index) => (
                  <Animated.View
                    key={person.id}
                    entering={FadeIn.delay(index * 30).duration(200)}
                  >
                    <Pressable
                      style={styles.personResult}
                      onPress={() => handlePersonPress(person.id)}
                    >
                      <View style={styles.personAvatar}>
                        <Text style={styles.personInitials}>
                          {getInitials(person.name)}
                        </Text>
                      </View>
                      <View style={styles.personInfo}>
                        <Text style={styles.personName}>{person.name}</Text>
                        <Text style={styles.personRole}>{person.role}</Text>
                      </View>
                      <ChevronRight size={20} strokeWidth={1.5} color={Colors.text.quaternary} />
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            )}

            {/* Reminders results */}
            {showReminders && results.reminders.length > 0 && (
              <View style={styles.resultSection}>
                <View style={styles.resultHeader}>
                  <Bell size={18} strokeWidth={1.5} color={Colors.text.tertiary} />
                  <Text style={styles.resultTitle}>Reminders</Text>
                  <Text style={styles.resultCount}>({results.reminders.length})</Text>
                </View>
                {results.reminders.map((reminder, index) => (
                  <Animated.View
                    key={reminder.id}
                    entering={FadeIn.delay(index * 30).duration(200)}
                  >
                    <Pressable style={styles.reminderResult}>
                      <View style={styles.reminderInfo}>
                        <Text style={styles.reminderTitle}>{reminder.title}</Text>
                        <Text style={styles.reminderDate}>
                          {new Date(reminder.dueDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </View>
                      <ChevronRight size={20} strokeWidth={1.5} color={Colors.text.quaternary} />
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            )}

            {/* Notes results */}
            {showNotes && results.notes.length > 0 && (
              <View style={styles.resultSection}>
                <View style={styles.resultHeader}>
                  <FileText size={18} strokeWidth={1.5} color={Colors.text.tertiary} />
                  <Text style={styles.resultTitle}>Logs</Text>
                  <Text style={styles.resultCount}>({results.notes.length})</Text>
                </View>
                {results.notes.map((note, index) => (
                  <Animated.View
                    key={note.id}
                    entering={FadeIn.delay(index * 30).duration(200)}
                  >
                    <Pressable style={styles.noteResult}>
                      <View style={styles.noteInfo}>
                        <Text style={styles.noteTitle}>{note.title}</Text>
                        <Text style={styles.noteBody} numberOfLines={1}>
                          {note.body}
                        </Text>
                      </View>
                      <ChevronRight size={20} strokeWidth={1.5} color={Colors.text.quaternary} />
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
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
    gap: Spacing.md,
  },
  title: {
    ...Typography.largeTitle,
    fontWeight: '600',
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border[5],
  },
  filtersContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    flexDirection: 'row',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  // Recent searches
  recentSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.headline,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  recentList: {
    gap: Spacing.xs,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
  },
  recentText: {
    ...Typography.callout,
  },
  // No results
  noResults: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 64,
    alignItems: 'center',
  },
  noResultsTitle: {
    ...Typography.headline,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  noResultsSubtitle: {
    ...Typography.subheadline,
    color: Colors.text.quaternary,
  },
  // Results
  results: {
    paddingVertical: Spacing.md,
  },
  resultSection: {
    marginBottom: Spacing.lg,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  resultTitle: {
    ...Typography.headline,
  },
  resultCount: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
  // Person result
  personResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border[5],
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface[60],
    borderWidth: 1,
    borderColor: Colors.border[10],
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInitials: {
    ...Typography.subheadline,
    color: Colors.text.tertiary,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    ...Typography.callout,
    fontWeight: '500',
  },
  personRole: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
  // Reminder result
  reminderResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border[5],
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    ...Typography.callout,
    fontWeight: '500',
  },
  reminderDate: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
  // Note result
  noteResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border[5],
  },
  noteInfo: {
    flex: 1,
  },
  noteTitle: {
    ...Typography.callout,
    fontWeight: '500',
  },
  noteBody: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
});
