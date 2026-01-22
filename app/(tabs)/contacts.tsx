// contacts.tsx - Fixed version
import { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Search as SearchIcon, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

import { Colors, SvgColors, Typography, Spacing, Animation } from '@/constants';
import { people, Person } from '@/data/sampleData';
import { PersonRow } from '@/components/lists/PersonRow';
import { TagPill } from '@/components/inputs/TagPill';
import { EmptyState } from '@/components/surfaces/EmptyState';
import { Sheet } from '@/components/surfaces/Sheet';
import { TextField } from '@/components/inputs/TextField';
import { PrimaryButton } from '@/components/inputs/PrimaryButton';
import { SecondaryButton } from '@/components/inputs/SecondaryButton';

type FilterType = 'all' | 'important' | 'recent' | 'followup';

// ============================================================================
// CREATE PERSON SHEET
// ============================================================================

interface CreatePersonSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: Omit<Person, 'id' | 'notes' | 'x' | 'y'>) => void;
}

function CreatePersonSheet({ isOpen, onClose, onSave }: CreatePersonSheetProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [details, setDetails] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const availableTags = ['Investor', 'Mentor', 'Community', 'Candidate', 'Friend', 'Family'];

  const resetForm = () => {
    setName('');
    setRole('');
    setDetails('');
    setSelectedTags([]);
  };

  const handleSave = () => {
    if (!name.trim() || !role.trim()) return;

    const today = new Date().toISOString().split('T')[0];

    onSave({
      name: name.trim(),
      role: role.trim(),
      tags: selectedTags,
      lastInteraction: today,
      details: details.trim(),
      connections: [],
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

  const isValid = name.trim() && role.trim();

  return (
    <Sheet isOpen={isOpen} onClose={handleClose} title="New Contact">
      <View style={sheetStyles.content}>
        {/* Name */}
        <TextField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Full name..."
        />

        {/* Role */}
        <TextField
          label="Role"
          value={role}
          onChangeText={setRole}
          placeholder="e.g., Founder, Investor, Friend..."
        />

        {/* Tags Selection */}
        <View style={sheetStyles.field}>
          <Text style={sheetStyles.label}>Tags</Text>
          <View style={sheetStyles.tagsRow}>
            {availableTags.map(tag => (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
              >
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

        {/* Details/Notes */}
        <TextField
          label="Details (optional)"
          value={details}
          onChangeText={setDetails}
          placeholder="Add context about this person..."
          multiline
          numberOfLines={4}
        />

        {/* Actions - vertical layout, Save on top */}
        <View style={sheetStyles.actions}>
          <PrimaryButton onPress={handleSave} fullWidth disabled={!isValid}>
            Save Contact
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
// MAIN SCREEN
// ============================================================================

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isFocused, setIsFocused] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [contactsList, setContactsList] = useState(people);

  const filteredPeople = useMemo(() => {
    let filtered = contactsList;

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
  }, [searchQuery, filter, contactsList]);

  const handlePersonPress = useCallback((personId: string) => {
    router.push(`/person/${personId}`);
  }, [router]);

  const handleSaveNewPerson = useCallback((newPerson: Omit<Person, 'id' | 'notes' | 'x' | 'y'>) => {
    const person: Person = {
      ...newPerson,
      id: `p${Date.now()}`,
      notes: [],
    };
    setContactsList(prev => [person, ...prev]);
  }, []);

  // Get counts for filter labels
  const importantCount = contactsList.filter(p =>
    p.tags.includes('Investor') || p.tags.includes('Mentor')
  ).length;
  
  const recentCount = (() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return contactsList.filter(p => new Date(p.lastInteraction) >= thirtyDaysAgo).length;
  })();
  
  const followupCount = contactsList.filter(p => p.nextReminder).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header - matches reminders page structure */}
      <Animated.View 
        entering={FadeInDown.duration(300).springify()}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.title}>Contacts</Text>
          <Pressable 
            style={styles.addButton}
            onPress={() => setIsCreateOpen(true)}
          >
            <Plus size={24} strokeWidth={2} color={SvgColors.text} />
          </Pressable>
        </View>

        {/* Search - inside header */}
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

        {/* Filters - horizontally scrollable inside header */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          <Pressable onPress={() => setFilter('all')}>
            <TagPill variant={filter === 'all' ? 'filled' : 'outlined'}>
              All ({contactsList.length})
            </TagPill>
          </Pressable>
          <Pressable onPress={() => setFilter('important')}>
            <TagPill variant={filter === 'important' ? 'filled' : 'outlined'}>
              Important ({importantCount})
            </TagPill>
          </Pressable>
          <Pressable onPress={() => setFilter('recent')}>
            <TagPill variant={filter === 'recent' ? 'filled' : 'outlined'}>
              Recent ({recentCount})
            </TagPill>
          </Pressable>
          <Pressable onPress={() => setFilter('followup')}>
            <TagPill variant={filter === 'followup' ? 'filled' : 'outlined'}>
              Follow-up ({followupCount})
            </TagPill>
          </Pressable>
        </ScrollView>
      </Animated.View>

      {/* People list - starts immediately after header */}
      <ScrollView 
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredPeople.length === 0 ? (
          <EmptyState
            icon={<Users size={48} strokeWidth={1} color={Colors.text.primary} />}
            title={filter === 'all' && !searchQuery ? "No contacts yet" : "No contacts found"}
            description={filter === 'all' && !searchQuery 
              ? "Add your first contact to get started." 
              : "Try adjusting your search or filters"}
            actionLabel={filter === 'all' && !searchQuery ? "Add Contact" : undefined}
            onAction={filter === 'all' && !searchQuery ? () => setIsCreateOpen(true) : undefined}
          />
        ) : (
          filteredPeople.map((person, index) => (
            <Animated.View
              key={`${filter}-${person.id}`}
              entering={FadeIn.delay(index * Animation.staggerDelay).duration(300)}
              exiting={FadeOut.duration(200)}
              layout={LinearTransition.springify().damping(20).stiffness(200)}
            >
              <PersonRow
                person={person}
                onPress={() => handlePersonPress(person.id)}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Create Contact Sheet */}
      <CreatePersonSheet
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveNewPerson}
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
    marginBottom: Spacing.md,
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
  filtersScroll: {
    marginHorizontal: -Spacing.md, // Extend to edges for full-width scroll
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