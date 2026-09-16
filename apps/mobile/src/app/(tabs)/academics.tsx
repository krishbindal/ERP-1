import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PURPLE = '#8B5CF6';

// ─── Data ────────────────────────────────────────────────────────────────────

const subjects = [
  { id: 'math', name: 'Mathematics', teacher: 'Mr. Sharma', grade: 'A', score: 92, color: '#8B5CF6', icon: 'calculator-outline' },
  { id: 'phy',  name: 'Physics',     teacher: 'Ms. Verma',  grade: 'A−', score: 87, color: '#5AC8FA', icon: 'planet-outline' },
  { id: 'chem', name: 'Chemistry',   teacher: 'Mr. Gupta',  grade: 'B+', score: 78, color: '#FF9500', icon: 'flask-outline' },
  { id: 'eng',  name: 'English',     teacher: 'Ms. Rao',    grade: 'A+', score: 96, color: '#34C759', icon: 'book-outline' },
  { id: 'hist', name: 'History',     teacher: 'Mr. Mehta',  grade: 'B',  score: 73, color: '#FF6B6B', icon: 'globe-outline' },
];

const upcomingExams = [
  { id: 'e1', subject: 'Mathematics', date: 'Sep 22', day: 'Mon', type: 'Unit Test', color: '#8B5CF6' },
  { id: 'e2', subject: 'Physics',     date: 'Sep 25', day: 'Thu', type: 'Practical', color: '#5AC8FA' },
  { id: 'e3', subject: 'Chemistry',   date: 'Oct 1',  day: 'Wed', type: 'Mid-Term',  color: '#FF9500' },
];

const assignments = [
  { id: 'a1', title: 'Integration Worksheet',   subject: 'Mathematics', due: 'Due Today',  status: 'pending',   color: '#FF3B30' },
  { id: 'a2', title: 'Newton\'s Laws Essay',    subject: 'Physics',     due: 'Due Sep 20', status: 'pending',   color: '#FF9500' },
  { id: 'a3', title: 'Periodic Table Quiz',     subject: 'Chemistry',   due: 'Submitted',  status: 'submitted', color: '#34C759' },
  { id: 'a4', title: 'Shakespeare Analysis',    subject: 'English',     due: 'Due Sep 23', status: 'pending',   color: '#FF9500' },
];

const semesterStats = [
  { label: 'GPA',        value: '3.85', icon: 'star',          color: '#8B5CF6' },
  { label: 'Attendance', value: '92%',  icon: 'checkmark-circle', color: '#34C759' },
  { label: 'Rank',       value: '#4',   icon: 'trophy',        color: '#FF9500' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function GradeChip({ grade, color }: { grade: string; color: string }) {
  return (
    <View style={[chipStyles.chip, { backgroundColor: color + '18' }]}>
      <Text style={[chipStyles.text, { color }]}>{grade}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  text: { fontSize: 13, fontWeight: '700' },
});

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function AcademicsScreen() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'submitted'>('all');

  const filteredAssignments =
    activeFilter === 'all'
      ? assignments
      : assignments.filter((a) => a.status === activeFilter);

  return (
    <LinearGradient
      colors={['#EDE8FB', '#F5F2FE', '#FFFFFF']}
      style={styles.container}
      locations={[0, 0.35, 1]}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.screenTitle}>Academics</Text>
              <Text style={styles.screenSubtitle}>Semester 1 • Grade 10 – Section A</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>K</Text>
            </View>
          </View>

          {/* ── Semester Stats ── */}
          <View style={styles.statsRow}>
            {semesterStats.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: s.color + '1A' }]}>
                  <Ionicons name={s.icon as any} size={18} color={s.color} />
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* ── My Subjects ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Subjects</Text>
              <Text style={[styles.seeAll, { color: PURPLE }]}>See all</Text>
            </View>

            {subjects.map((subj) => (
              <Pressable key={subj.id} style={({ pressed }) => [styles.subjectRow, pressed && { opacity: 0.75 }]}>
                {/* Icon badge */}
                <View style={[styles.subjectIcon, { backgroundColor: subj.color + '1A' }]}>
                  <Ionicons name={subj.icon as any} size={22} color={subj.color} />
                </View>

                {/* Info */}
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName}>{subj.name}</Text>
                  <Text style={styles.subjectTeacher}>{subj.teacher}</Text>
                  {/* Progress bar */}
                  <View style={styles.miniTrack}>
                    <View style={[styles.miniFill, { width: `${subj.score}%`, backgroundColor: subj.color }]} />
                  </View>
                </View>

                {/* Grade */}
                <View style={styles.subjectRight}>
                  <GradeChip grade={subj.grade} color={subj.color} />
                  <Text style={styles.subjectScore}>{subj.score}%</Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* ── Upcoming Exams ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Exams</Text>
              <Text style={[styles.seeAll, { color: PURPLE }]}>See all</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {upcomingExams.map((exam) => (
                <View key={exam.id} style={[styles.examCard, { borderTopColor: exam.color }]}>
                  <View style={[styles.examDateBubble, { backgroundColor: exam.color + '1A' }]}>
                    <Text style={[styles.examDay, { color: exam.color }]}>{exam.date}</Text>
                    <Text style={[styles.examDayName, { color: exam.color }]}>{exam.day}</Text>
                  </View>
                  <Text style={styles.examSubject}>{exam.subject}</Text>
                  <View style={[styles.examTypeBadge, { backgroundColor: exam.color + '18' }]}>
                    <Text style={[styles.examTypeText, { color: exam.color }]}>{exam.type}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ── Assignments ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Assignments</Text>
              {/* Filter pills */}
              <View style={styles.filterRow}>
                {(['all', 'pending', 'submitted'] as const).map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => setActiveFilter(f)}
                    style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
                  >
                    <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {filteredAssignments.map((a) => (
              <View key={a.id} style={styles.assignmentRow}>
                <View style={[styles.assignmentDot, { backgroundColor: a.color }]} />
                <View style={styles.assignmentBody}>
                  <Text style={styles.assignmentTitle}>{a.title}</Text>
                  <Text style={styles.assignmentSubject}>{a.subject}</Text>
                </View>
                <View style={styles.assignmentRight}>
                  <Text style={[styles.assignmentDue, { color: a.color }]}>{a.due}</Text>
                  {a.status === 'submitted' ? (
                    <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                  ) : (
                    <Ionicons name="time-outline" size={18} color="#FF9500" />
                  )}
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { paddingTop: 12, paddingHorizontal: 20 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  screenTitle: { fontSize: 26, fontWeight: '700', color: '#1A1A1A' },
  screenSubtitle: { fontSize: 13, color: '#666', marginTop: 3 },
  avatarCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#C5A3E8', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  statIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },

  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  seeAll: { fontSize: 13, fontWeight: '500' },

  // Subjects
  subjectRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 18, padding: 14, marginBottom: 10, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  subjectIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  subjectTeacher: { fontSize: 12, color: '#888', marginTop: 2, marginBottom: 6 },
  miniTrack: { height: 5, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  miniFill: { height: '100%', borderRadius: 3 },
  subjectRight: { alignItems: 'flex-end', gap: 4 },
  subjectScore: { fontSize: 12, color: '#888', marginTop: 4 },

  // Exams
  examCard: { width: 140, backgroundColor: '#FFF', borderRadius: 18, padding: 16, borderTopWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  examDateBubble: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  examDay: { fontSize: 13, fontWeight: '700' },
  examDayName: { fontSize: 10, fontWeight: '500', opacity: 0.8 },
  examSubject: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  examTypeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  examTypeText: { fontSize: 11, fontWeight: '600' },

  // Assignments
  filterRow: { flexDirection: 'row', gap: 6 },
  filterPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#F0F0F0' },
  filterPillActive: { backgroundColor: PURPLE },
  filterText: { fontSize: 11, color: '#888', fontWeight: '500' },
  filterTextActive: { color: '#FFF' },
  assignmentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 10, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  assignmentDot: { width: 10, height: 10, borderRadius: 5 },
  assignmentBody: { flex: 1 },
  assignmentTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  assignmentSubject: { fontSize: 12, color: '#888', marginTop: 2 },
  assignmentRight: { alignItems: 'flex-end', gap: 4 },
  assignmentDue: { fontSize: 11, fontWeight: '600' },
});
