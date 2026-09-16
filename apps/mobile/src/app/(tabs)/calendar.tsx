import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const PURPLE = '#8B5CF6';

const eventCategories = ['All Events', 'Exam', 'Holidays', 'Activities'];

// Sample calendar data for July 2026
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// July 2026 starts on Wednesday (index 3)
const JULY_START_DAY = 3;
const JULY_DAYS = 31;

type DotType = 'class' | 'assignment' | 'event' | 'exam' | 'holiday';

const dotColors: Record<DotType, string> = {
  class: '#5AC8FA',
  assignment: '#AF52DE',
  event: '#34C759',
  exam: '#FF3B30',
  holiday: '#FFCC00',
};

const eventDots: Record<number, DotType[]> = {
  1: ['class'],
  3: ['class', 'assignment'],
  8: ['exam'],
  9: ['class', 'event'],
  10: ['holiday'],
  14: ['class'],
  15: ['assignment', 'exam'],
  17: ['class'],
  22: ['event'],
  23: ['class', 'assignment'],
  28: ['class'],
  29: ['holiday'],
  31: ['exam'],
};

const upcomingEvents = [
  { id: '1', title: 'Physics Exam', date: 'July 8, 2026', type: 'exam' },
  { id: '2', title: 'Science Fair', date: 'July 9, 2026', type: 'event' },
  { id: '3', title: 'Summer Break', date: 'July 10, 2026', type: 'holiday' },
];

export default function CalendarScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All Events');
  const [selectedDay, setSelectedDay] = useState(17);
  const [currentMonth] = useState({ month: 'July', year: 2026 });

  const cells: (number | null)[] = [
    ...Array(JULY_START_DAY).fill(null),
    ...Array.from({ length: JULY_DAYS }, (_, i) => i + 1),
  ];

  return (
    <LinearGradient
      colors={['#E5D9F2', '#F0EAF9', '#FFFFFF']}
      style={styles.container}
      locations={[0, 0.3, 1]}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.screenTitle}>Calendar</Text>
              <Text style={styles.screenSubtitle}>Manage your schedule</Text>
            </View>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>K</Text>
            </View>
          </View>

          {/* Category Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
          >
            {eventCategories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.pill, selectedCategory === cat && styles.pillActive]}
              >
                <Text style={[styles.pillText, selectedCategory === cat && styles.pillTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Calendar Card */}
          <View style={styles.calendarCard}>
            {/* Month Navigation */}
            <View style={styles.monthNav}>
              <Pressable style={styles.monthNavBtn}>
                <Ionicons name="chevron-back" size={20} color="#1A1A1A" />
              </Pressable>
              <Text style={styles.monthTitle}>
                {currentMonth.month} {currentMonth.year}
              </Text>
              <Pressable style={styles.monthNavBtn}>
                <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
              </Pressable>
            </View>

            {/* Day Labels */}
            <View style={styles.dayLabelsRow}>
              {DAYS_OF_WEEK.map((d) => (
                <Text key={d} style={styles.dayLabel}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {cells.map((day, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.dayCell,
                    day === selectedDay && styles.dayCellSelected,
                  ]}
                  onPress={() => day && setSelectedDay(day)}
                  disabled={!day}
                >
                  {day !== null ? (
                    <>
                      <Text
                        style={[
                          styles.dayNumber,
                          day === selectedDay && styles.dayNumberSelected,
                        ]}
                      >
                        {day}
                      </Text>
                      {eventDots[day] && (
                        <View style={styles.dotsRow}>
                          {eventDots[day].slice(0, 3).map((type, di) => (
                            <View
                              key={di}
                              style={[styles.dot, { backgroundColor: dotColors[type] }]}
                            />
                          ))}
                        </View>
                      )}
                    </>
                  ) : null}
                </Pressable>
              ))}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              {(Object.entries(dotColors) as [DotType, string][]).map(([type, color]) => (
                <View key={type} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={styles.legendText}>
                    {type === 'class' ? 'Class' :
                     type === 'assignment' ? 'Assignment Due' :
                     type === 'event' ? 'Event' :
                     type === 'exam' ? 'Exam' : 'Holiday'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Upcoming Events */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <Text style={styles.seeAllText}>See all</Text>
            </View>
            {upcomingEvents.map((event) => (
              <Pressable key={event.id} style={styles.eventRow}>
                <View style={[styles.eventDotBig, { backgroundColor: dotColors[event.type as DotType] }]} />
                <View style={styles.eventBody}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CCC" />
              </Pressable>
            ))}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { paddingTop: 12, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: { fontSize: 26, fontWeight: '700', color: '#1A1A1A' },
  screenSubtitle: { fontSize: 13, color: '#666', marginTop: 2 },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#C5A3E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  pillsRow: { gap: 10, marginBottom: 20 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pillActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  pillText: { fontSize: 13, color: '#666', fontWeight: '500' },
  pillTextActive: { color: '#FFF' },
  calendarCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 10,
    minHeight: 46,
    justifyContent: 'center',
  },
  dayCellSelected: { backgroundColor: PURPLE },
  dayNumber: { fontSize: 13, fontWeight: '500', color: '#1A1A1A' },
  dayNumberSelected: { color: '#FFF', fontWeight: '700' },
  dotsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#666' },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  seeAllText: { fontSize: 13, color: PURPLE, fontWeight: '500' },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  eventDotBig: { width: 14, height: 14, borderRadius: 7 },
  eventBody: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  eventDate: { fontSize: 12, color: '#888', marginTop: 2 },
});
