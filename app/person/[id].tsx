import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical, Calendar, FileText, Users } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Colors, Typography, Spacing } from '@/constants';
import { 
  getPersonById, 
  getRemindersByPersonId, 
  getNotesByPersonId,
  getConnectionsForPerson,
  getInitials,
  formatDisplayDate,
} from '@/data/sampleData';
import { PrimaryButton } from '@/components/inputs/PrimaryButton';
import { SecondaryButton } from '@/components/inputs/SecondaryButton';

export default function PersonProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const person = getPersonById(id);
  const reminders = person ? getRemindersByPersonId(id) : [];
  const notes = person ? getNotesByPersonId(id) : [];
  const connections = person ? getConnectionsForPerson(id) : [];

  if (!person) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Person not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <Animated.View 
        entering={FadeInDown.duration(300).springify()}
        style={styles.topBar}
      >
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} strokeWidth={1.5} color={Colors.text.primary} />
        </Pressable>
        <View style={styles.topBarSpacer} />
        <Pressable style={styles.moreButton}>
          <MoreVertical size={24} strokeWidth={1.5} color={Colors.text.primary} />
        </Pressable>
      </Animated.View>

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
                {getInitials(person.name)}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{person.name}</Text>
              <Text style={styles.role}>{person.role}</Text>
              <View style={styles.tags}>
                {person.tags.map(tag => (
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
          <Text style={styles.contextText}>{person.details}</Text>
        </Animated.View>

        {/* Actions */}
        <Animated.View 
          entering={FadeIn.delay(100).duration(300)}
          style={styles.actionsSection}
        >
          <PrimaryButton>Add Reminder</PrimaryButton>
          <SecondaryButton>Add Note</SecondaryButton>
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
                  style={styles.reminderCard}
                >
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderDate}>
                    Due: {formatDisplayDate(reminder.dueDate)}
                    {reminder.dueTime && ` at ${reminder.dueTime}`}
                  </Text>
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
              {notes.slice(0, 3).map(note => (
                <View key={note.id} style={styles.noteItem}>
                  <Text style={styles.noteTitle}>{note.title}</Text>
                  <Text style={styles.noteBody} numberOfLines={2}>{note.body}</Text>
                  <Text style={styles.noteDate}>{formatDisplayDate(note.date)}</Text>
                </View>
              ))}
            </View>
            {notes.length > 3 && (
              <Pressable style={styles.seeAllButton}>
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
            <Pressable style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>View in Mindmap →</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface[80],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border[10],
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  topBarSpacer: {
    flex: 1,
  },
  moreButton: {
    padding: 4,
    marginRight: -4,
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
    padding: Spacing.sm,
    backgroundColor: Colors.surface[40],
    borderWidth: 1,
    borderColor: Colors.border[10],
    borderRadius: 10,
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
    gap: Spacing.sm,
  },
  noteItem: {
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border[5],
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
