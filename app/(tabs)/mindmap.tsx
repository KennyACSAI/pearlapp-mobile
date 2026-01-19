// pearlapp-mobile1/app/(tabs)/mindmap.tsx
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors, SvgColors, Typography, Spacing, Shadows } from '@/constants';
import { people, Person, formatRelativeDate } from '@/data/sampleData';
import { MindmapCanvas } from '@/components/mindmap/MindmapCanvas';
import { Sheet } from '@/components/surfaces/Sheet';
import { PrimaryButton } from '@/components/inputs/PrimaryButton';
import { SecondaryButton } from '@/components/inputs/SecondaryButton';

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

export default function MindmapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const handlePersonPress = useCallback((person: Person) => {
    setSelectedPerson(person);
  }, []);

  const handleViewProfile = useCallback(() => {
    if (selectedPerson) {
      setSelectedPerson(null);
      router.push(`/person/${selectedPerson.id}`);
    }
  }, [selectedPerson, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Minimal toolbar */}
      <Animated.View 
        entering={FadeInDown.duration(300).springify()}
        style={styles.toolbar}
      >
        <Text style={styles.title}>Mindmap</Text>
        <View style={styles.toolbarActions}>
          <Pressable style={styles.toolbarButton}>
            <Search size={20} strokeWidth={2} color={SvgColors.text} />
          </Pressable>
          <Pressable style={styles.toolbarButton}>
            <Filter size={20} strokeWidth={2} color={SvgColors.text} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        <MindmapCanvas
          people={people}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  toolbar: {
    backgroundColor: Colors.surface[100] || Colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border[15],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.sm,
  },
  title: {
    ...Typography.title2,
    fontWeight: '600',
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  toolbarButton: {
    padding: Spacing.xs,
    borderRadius: 10,
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
    backgroundColor: Colors.surface[60] || Colors.surfaceOpacity[60],
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
    backgroundColor: Colors.surface[60] || Colors.surfaceOpacity[60],
    borderRadius: 999,
  },
  tagText: {
    ...Typography.footnote,
  },
  actions: {
    gap: Spacing.sm,
  },
});