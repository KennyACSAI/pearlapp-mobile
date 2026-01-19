/**
 * Pearl App Data Layer
 * 
 * Type definitions and sample data matching the web app exactly.
 */

export interface Person {
  id: string;
  name: string;
  role: string;
  tags: string[];
  lastInteraction: string; // 'YYYY-MM-DD'
  nextReminder?: string;   // 'YYYY-MM-DD'
  details: string;
  connections: string[];   // Array of person IDs
  notes: Note[];           // Not actively used, notes stored separately
  x?: number;              // Mindmap X position
  y?: number;              // Mindmap Y position
}

export interface Reminder {
  id: string;
  title: string;
  personId: string;
  dueDate: string;         // 'YYYY-MM-DD'
  dueTime?: string;        // 'HH:mm'
  repeat?: string;         // 'Yearly', 'Monthly', etc.
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Done';
  notes?: string;
}

export interface Note {
  id: string;
  title: string;
  date: string;            // 'YYYY-MM-DD'
  linkedPeople: string[];  // Array of person IDs
  body: string;
  tags: string[];
}

// =============================================================================
// SAMPLE DATA
// =============================================================================

export const people: Person[] = [
  {
    id: '1',
    name: 'Sara Kim',
    role: 'Founder',
    tags: ['Investor', 'Mentor'],
    lastInteraction: '2026-01-10',
    nextReminder: '2026-01-20',
    details: 'Building a climate tech startup. Based in SF. Prefers coffee meetings.',
    connections: ['2', '5'],
    notes: [],
    x: 200,
    y: 150,
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Operator',
    tags: ['Community', 'Candidate'],
    lastInteraction: '2026-01-15',
    nextReminder: '2026-01-25',
    details: 'VP Eng at Series B. Looking for next role. Introduced by Sara.',
    connections: ['1', '3'],
    notes: [],
    x: 350,
    y: 200,
  },
  {
    id: '3',
    name: 'Priya Sharma',
    role: 'Recruiter',
    tags: ['Community'],
    lastInteraction: '2026-01-12',
    details: 'Executive search. Specializes in engineering leadership.',
    connections: ['2', '4'],
    notes: [],
    x: 300,
    y: 350,
  },
  {
    id: '4',
    name: 'Alex Rivera',
    role: 'Friend',
    tags: ['Friend', 'Family'],
    lastInteraction: '2026-01-18',
    nextReminder: '2026-02-01',
    details: 'College roommate. Now in NYC. Runs a design studio.',
    connections: ['3', '5'],
    notes: [],
    x: 150,
    y: 300,
  },
  {
    id: '5',
    name: 'Emma Watson',
    role: 'Investor',
    tags: ['Investor'],
    lastInteraction: '2026-01-05',
    nextReminder: '2026-01-22',
    details: 'Partner at early-stage fund. Focus on consumer and SaaS.',
    connections: ['1', '4'],
    notes: [],
    x: 100,
    y: 200,
  },
  {
    id: '6',
    name: 'David Park',
    role: 'Founder',
    tags: ['Community', 'Mentor'],
    lastInteraction: '2026-01-08',
    details: 'Serial entrepreneur. Advising 3 startups. Lives in Austin.',
    connections: ['1'],
    notes: [],
    x: 250,
    y: 100,
  },
];

export const reminders: Reminder[] = [
  {
    id: 'r1',
    title: 'Follow up with Sara',
    personId: '1',
    dueDate: '2026-01-20',
    dueTime: '10:00',
    priority: 'High',
    status: 'Open',
    notes: 'Ask about climate tech trends',
  },
  {
    id: 'r2',
    title: 'Send intro email',
    personId: '2',
    dueDate: '2026-01-19',
    dueTime: '14:00',
    priority: 'Medium',
    status: 'Open',
    notes: 'Connect Michael to Emma',
  },
  {
    id: 'r3',
    title: 'Schedule coffee',
    personId: '5',
    dueDate: '2026-01-22',
    priority: 'Medium',
    status: 'Open',
  },
  {
    id: 'r4',
    title: 'Birthday message',
    personId: '4',
    dueDate: '2026-02-01',
    repeat: 'Yearly',
    priority: 'Low',
    status: 'Open',
  },
  {
    id: 'r5',
    title: 'Check in with Michael',
    personId: '2',
    dueDate: '2026-01-25',
    priority: 'Medium',
    status: 'Open',
    notes: 'See how job search is going',
  },
  {
    id: 'r6',
    title: 'Send article',
    personId: '1',
    dueDate: '2026-01-17',
    priority: 'Low',
    status: 'Done',
  },
];

export const notes: Note[] = [
  {
    id: 'n1',
    title: 'Coffee with Sara - Climate investing',
    date: '2026-01-10',
    linkedPeople: ['1'],
    body: "Sara mentioned her fund is looking at carbon capture startups. She's particularly interested in direct air capture tech. Wants to see more technical founders in this space.",
    tags: ['climate', 'investing'],
  },
  {
    id: 'n2',
    title: 'Michael job search update',
    date: '2026-01-15',
    linkedPeople: ['2'],
    body: 'Michael is looking for VP Eng or CTO roles at Series A/B companies. Interested in consumer tech or dev tools. Not interested in crypto. Open to relocation.',
    tags: ['career', 'intro'],
  },
  {
    id: 'n3',
    title: 'Dinner conversation - AI policy',
    date: '2026-01-12',
    linkedPeople: ['3', '2'],
    body: 'Discussed the impact of AI regulation on hiring practices. Priya sees a shift toward governance roles in tech companies.',
    tags: ['ai', 'policy'],
  },
  {
    id: 'n4',
    title: "Emma's investment thesis",
    date: '2026-01-05',
    linkedPeople: ['5'],
    body: "Emma's fund just raised $200M for Fund III. Focus: B2B SaaS with strong unit economics. Ticket size: $2-5M seed.",
    tags: ['investing', 'saas'],
  },
  {
    id: 'n5',
    title: "Alex's new studio launch",
    date: '2026-01-18',
    linkedPeople: ['4'],
    body: 'Alex just signed a major client - a fintech unicorn. The studio is growing to 15 people. Looking to expand into brand strategy.',
    tags: ['design', 'business'],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a person by their ID
 */
export function getPersonById(id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

/**
 * Get all open reminders for a specific person
 */
export function getRemindersByPersonId(personId: string): Reminder[] {
  return reminders.filter((r) => r.personId === personId && r.status === 'Open');
}

/**
 * Get all notes that mention a specific person
 */
export function getNotesByPersonId(personId: string): Note[] {
  return notes.filter((n) => n.linkedPeople.includes(personId));
}

/**
 * Get all people connected to a specific person
 */
export function getConnectionsForPerson(personId: string): Person[] {
  const person = getPersonById(personId);
  if (!person) return [];
  return person.connections
    .map((connId) => getPersonById(connId))
    .filter((p): p is Person => p !== undefined);
}

/**
 * Format a date string relative to today
 * Returns: 'Today', 'Yesterday', 'Xd ago', 'Xw ago', 'Xmo ago'
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

/**
 * Format a due date for reminders
 * Returns: 'Today', 'Tomorrow', 'Yesterday', 'Xd overdue', weekday name, or 'Month Day'
 */
export function formatDueDate(dateString: string, timeString?: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let dateText = '';
  if (diffDays === 0) dateText = 'Today';
  else if (diffDays === 1) dateText = 'Tomorrow';
  else if (diffDays === -1) dateText = 'Yesterday';
  else if (diffDays < 0) dateText = `${Math.abs(diffDays)}d overdue`;
  else if (diffDays < 7) {
    dateText = date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    dateText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return timeString ? `${dateText} at ${timeString}` : dateText;
}

/**
 * Format a date for display (e.g., 'Jan 15' or 'Jan 15, 2025')
 */
export function formatDisplayDate(dateString: string, includeYear = false): string {
  const date = new Date(dateString);
  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (includeYear || dateYear !== currentYear) {
    options.year = 'numeric';
  }
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a full date with time for note details
 */
export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/**
 * Check if a date is overdue
 */
export function isOverdue(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}
