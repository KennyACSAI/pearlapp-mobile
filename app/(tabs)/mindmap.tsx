// app/(tabs)/mindmap.tsx
import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Filter, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Colors, SvgColors, Typography, Spacing, Shadows } from '@/constants';
import { people, Person, formatRelativeDate } from '@/data/sampleData';
import { MindmapCanvas } from '@/components/mindmap/MindmapCanvas';
import { Sheet } from '@/components/surfaces/Sheet';
import { PrimaryButton } from '@/components/inputs/PrimaryButton';
import { SecondaryButton } from '@/components/inputs/SecondaryButton';
import { TagPill } from '@/components/inputs/TagPill';

// ============================================================================
// PERSON QUICK SHEET
// ============================================================================

interface PersonQuickSheetProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: () => void;
}

function PersonQuickSheet({ person, isOpen, onClose, onViewProfile }: PersonQuickSheetProps) {
  if (!person) return null;

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Quick View">
      <View style={sheetStyles.content}>
        {/* Header */}
        <View style={sheetStyles.header}>
          <View style={sheetStyles.avatar}>
            <Text style={sheetStyles.avatarText}>
              {person.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <Text style={sheetStyles.name}>{person.name}</Text>
          <Text style={sheetStyles.role}>{person.role}</Text>
        </View>

        {/* Info */}
        <View style={sheetStyles.infoList}>
          <View style={sheetStyles.infoRow}>
            <Text style={sheetStyles.infoLabel}>Last Contact</Text>
            <Text style={sheetStyles.infoValue}>
              {formatRelativeDate(person.lastInteraction)}
            </Text>
          </View>
          {person.nextReminder && (
            <View style={sheetStyles.infoRow}>
              <Text style={sheetStyles.infoLabel}>Next Reminder</Text>
              <Text style={sheetStyles.infoValue}>
                {new Date(person.nextReminder).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
          )}
          <View style={sheetStyles.infoRow}>
            <Text style={sheetStyles.infoLabel}>Connections</Text>
            <Text style={sheetStyles.infoValue}>{person.connections.length}</Text>
          </View>
        </View>

        {/* Tags */}
        {person.tags.length > 0 && (
          <View style={sheetStyles.tags}>
            {person.tags.map(tag => (
              <View key={tag} style={sheetStyles.tag}>
                <Text style={sheetStyles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={sheetStyles.actions}>
          <PrimaryButton fullWidth>
            Add Reminder
          </PrimaryButton>
          <SecondaryButton fullWidth>
            Add Note
          </SecondaryButton>
          <SecondaryButton onPress={onViewProfile} fullWidth>
            View Profile
          </SecondaryButton>
        </View>
      </View>
    </Sheet>
  );
}

// ============================================================================
// SEARCH SHEET
// ============================================================================

interface SearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPerson: (person: Person) => void;
}

function SearchSheet({ isOpen, onClose, onSelectPerson }: SearchSheetProps) {
  const [query, setQuery] = useState('');

  const filteredPeople = useMemo(() => {
    if (!query.trim()) return people;
    const q = query.toLowerCase();
    return people.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [query]);

  const handleSelect = (person: Person) => {
    onSelectPerson(person);
    setQuery('');
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Search People">
      <View style={searchStyles.content}>
        {/* Search Input */}
        <View style={searchStyles.searchContainer}>
          <Search size={18} strokeWidth={2} color={Colors.text.tertiary} />
          <TextInput
            style={searchStyles.searchInput}
            placeholder="Search by name, role, or tag..."
            placeholderTextColor={Colors.text.tertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <X size={18} strokeWidth={2} color={Colors.text.tertiary} />
            </Pressable>
          )}
        </View>

        {/* Results */}
        <ScrollView style={searchStyles.results} showsVerticalScrollIndicator={false}>
          {filteredPeople.map((person, index) => (
            <Animated.View
              key={person.id}
              entering={FadeIn.delay(index * 30).duration(200)}
            >
              <Pressable 
                style={searchStyles.resultRow}
                onPress={() => handleSelect(person)}
              >
                <View style={searchStyles.resultAvatar}>
                  <Text style={searchStyles.resultInitials}>
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={searchStyles.resultInfo}>
                  <Text style={searchStyles.resultName}>{person.name}</Text>
                  <Text style={searchStyles.resultRole}>{person.role}</Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
          {filteredPeople.length === 0 && (
            <View style={searchStyles.emptyState}>
              <Text style={searchStyles.emptyText}>No people found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Sheet>
  );
}

// ============================================================================
// FILTER SHEET
// ============================================================================

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

function FilterSheet({ isOpen, onClose, selectedTags, onTagsChange }: FilterSheetProps) {
  // Get all unique tags from people
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    people.forEach(p => p.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, []);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearAll = () => {
    onTagsChange([]);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Filter by Tags">
      <View style={filterStyles.content}>
        {/* Tag List */}
        <View style={filterStyles.tagList}>
          {allTags.map(tag => (
            <Pressable key={tag} onPress={() => toggleTag(tag)}>
              <TagPill variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}>
                {tag}
              </TagPill>
            </Pressable>
          ))}
        </View>

        {/* Active Filters Info */}
        {selectedTags.length > 0 && (
          <View style={filterStyles.activeInfo}>
            <Text style={filterStyles.activeText}>
              Showing {people.filter(p => 
                selectedTags.some(t => p.tags.includes(t))
              ).length} people
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={filterStyles.actions}>
          <SecondaryButton onPress={clearAll} fullWidth disabled={selectedTags.length === 0}>
            Clear All
          </SecondaryButton>
          <PrimaryButton onPress={onClose} fullWidth>
            Apply Filters
          </PrimaryButton>
        </View>
      </View>
    </Sheet>
  );
}

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function MindmapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterTags, setFilterTags] = useState<string[]>([]);

  // Filter people based on selected tags
  const filteredPeople = useMemo(() => {
    if (filterTags.length === 0) return people;
    return people.filter(p => filterTags.some(t => p.tags.includes(t)));
  }, [filterTags]);

  const handlePersonPress = useCallback((person: Person) => {
    setSelectedPerson(person);
  }, []);

  const handleViewProfile = useCallback(() => {
    if (selectedPerson) {
      setSelectedPerson(null);
      router.push(`/person/${selectedPerson.id}`);
    }
  }, [selectedPerson, router]);

  const handleSearchSelect = useCallback((person: Person) => {
    setSelectedPerson(person);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header - Fixed to match other pages */}
      <Animated.View 
        entering={FadeInDown.duration(300).springify()}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.title}>Mindmap</Text>
          <View style={styles.headerActions}>
            <Pressable 
              style={styles.headerButton}
              onPress={() => setIsSearchOpen(true)}
            >
              <Search size={24} strokeWidth={2} color={SvgColors.text} />
            </Pressable>
            <Pressable 
              style={[
                styles.headerButton,
                filterTags.length > 0 && styles.headerButtonActive
              ]}
              onPress={() => setIsFilterOpen(true)}
            >
              <Filter size={24} strokeWidth={2} color={SvgColors.text} />
              {filterTags.length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{filterTags.length}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Active Filter Pills */}
        {filterTags.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterPillsContainer}
            contentContainerStyle={styles.filterPillsContent}
          >
            {filterTags.map(tag => (
              <Pressable key={tag} onPress={() => setFilterTags(filterTags.filter(t => t !== tag))}>
                <TagPill variant="filled" onRemove={() => setFilterTags(filterTags.filter(t => t !== tag))}>
                  {tag}
                </TagPill>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </Animated.View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        <MindmapCanvas
          people={filteredPeople}
          onPersonPress={handlePersonPress}
        />
      </View>

      {/* Person Quick Sheet */}
      <PersonQuickSheet
        person={selectedPerson}
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
        onViewProfile={handleViewProfile}
      />

      {/* Search Sheet */}
      <SearchSheet
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPerson={handleSearchSelect}
      />

      {/* Filter Sheet */}
      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedTags={filterTags}
        onTagsChange={setFilterTags}
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
  // Fixed header to match other pages
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
  // Fixed: Use largeTitle to match other pages
  title: {
    ...Typography.largeTitle,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  headerButton: {
    padding: Spacing.xs,
    borderRadius: 10,
  },
  headerButtonActive: {
    backgroundColor: Colors.surface[60],
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.primaryForeground,
    fontWeight: '600',
  },
  filterPillsContainer: {
    marginTop: Spacing.sm,
    marginHorizontal: -Spacing.md,
  },
  filterPillsContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    flexDirection: 'row',
  },
  canvasContainer: {
    flex: 1,
  },
});

const sheetStyles = StyleSheet.create({
  content: {
    padding: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface[60] || Colors.surfaceOpacity?.[60],
    borderWidth: 1,
    borderColor: Colors.border[10],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    ...Typography.title2,
    color: Colors.text.tertiary,
  },
  name: {
    ...Typography.title2,
    marginBottom: 4,
  },
  role: {
    ...Typography.callout,
    color: Colors.text.secondary,
  },
  infoList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border[5],
  },
  infoLabel: {
    ...Typography.subheadline,
    color: Colors.text.secondary,
  },
  infoValue: {
    ...Typography.subheadline,
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    backgroundColor: Colors.surface[60] || Colors.surfaceOpacity?.[60],
    borderRadius: 999,
  },
  tagText: {
    ...Typography.footnote,
  },
  actions: {
    gap: Spacing.sm,
  },
});

const searchStyles = StyleSheet.create({
  content: {
    padding: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface[80] || Colors.surfaceOpacity?.[80],
    borderWidth: 1,
    borderColor: Colors.border[10],
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    ...Typography.callout,
    padding: 0,
  },
  results: {
    maxHeight: 400,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border[5],
  },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface[60],
    borderWidth: 1,
    borderColor: Colors.border[10],
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInitials: {
    ...Typography.footnote,
    fontWeight: '600',
    color: Colors.text.tertiary,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    ...Typography.callout,
    fontWeight: '500',
  },
  resultRole: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.subheadline,
    color: Colors.text.tertiary,
  },
});

const filterStyles = StyleSheet.create({
  content: {
    padding: Spacing.md,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  activeInfo: {
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  activeText: {
    ...Typography.subheadline,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.sm,
  },
});