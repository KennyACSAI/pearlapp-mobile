// contacts.tsx
import { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Search as SearchIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Colors, SvgColors, Typography, Spacing, Animation } from '@/constants';
import { people } from '@/data/sampleData';
import { PersonRow } from '@/components/lists/PersonRow';
import { TagPill } from '@/components/inputs/TagPill';
import { EmptyState } from '@/components/surfaces/EmptyState';

type FilterType = 'all' | 'important' | 'recent' | 'followup';

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isFocused, setIsFocused] = useState(false);

  const filteredPeople = useMemo(() => {
    let filtered = people;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.role.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Apply filter
    switch (filter) {
      case 'important':
        filtered = filtered.filter(p =>
          p.tags.includes('Investor') || p.tags.includes('Mentor')
        );
        break;
      case 'recent':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(p =>
          new Date(p.lastInteraction) >= thirtyDaysAgo
        );
        break;
      case 'followup':
        filtered = filtered.filter(p => p.nextReminder);
        break;
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, filter]);

  const handlePersonPress = useCallback((personId: string) => {
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
          <Text style={styles.title}>Contacts</Text>
          <Pressable style={styles.addButton}>
            <Plus size={24} strokeWidth={2} color={SvgColors.text} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={[
          styles.searchContainer,
          isFocused && styles.searchContainerFocused
        ]}>
          <SearchIcon 
            size={18} 
            strokeWidth={2} 
            color="rgba(0, 0, 0, 0.4)"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
      </Animated.View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <Pressable onPress={() => setFilter('all')}>
          <TagPill variant={filter === 'all' ? 'filled' : 'outlined'}>
            All ({people.length})
          </TagPill>
        </Pressable>
        <Pressable onPress={() => setFilter('important')}>
          <TagPill variant={filter === 'important' ? 'filled' : 'outlined'}>
            Important
          </TagPill>
        </Pressable>
        <Pressable onPress={() => setFilter('recent')}>
          <TagPill variant={filter === 'recent' ? 'filled' : 'outlined'}>
            Recently Active
          </TagPill>
        </Pressable>
        <Pressable onPress={() => setFilter('followup')}>
          <TagPill variant={filter === 'followup' ? 'filled' : 'outlined'}>
            Needs Follow-up
          </TagPill>
        </Pressable>
      </ScrollView>

      {/* People list */}
      <ScrollView 
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredPeople.length === 0 ? (
          <EmptyState
            title="No contacts found"
            description="Try adjusting your search or filters"
          />
        ) : (
          filteredPeople.map((person, index) => (
            <Animated.View
              key={person.id}
              entering={FadeIn.delay(index * Animation.staggerDelay).duration(300)}
            >
              <PersonRow
                person={person}
                onPress={() => handlePersonPress(person.id)}
              />
            </Animated.View>
          ))
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
    backgroundColor: Colors.surface[100] || Colors.surface,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    backgroundColor: Colors.surface[80] || Colors.surfaceOpacity[80],
    borderWidth: 2,
    borderColor: Colors.border[10],
    borderRadius: 12,
    ...Spacing.shadow.sm,
  },
  searchContainerFocused: {
    borderColor: Colors.border[25],
    ...Spacing.shadow.md,
  },
  searchInput: {
    flex: 1,
    ...Typography.callout,
    padding: 0,
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
});