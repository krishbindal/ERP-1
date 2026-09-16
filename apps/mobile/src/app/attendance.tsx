import React from 'react';
import { ScrollView, View, Text, StyleSheet, useColorScheme } from 'react-native';

export default function AttendanceScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    background: isDark ? '#000000' : '#F2F2F7',
    card: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#EBEBF599' : '#3C3C4399',
    border: isDark ? '#38383A' : '#C6C6C8',
    green: '#34C759',
    red: '#FF3B30',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.chartContainer}>
        <View style={[styles.circle, { borderColor: theme.green }]}>
          <Text style={[styles.percentage, { color: theme.text }]}>92%</Text>
        </View>
        <Text style={[styles.chartLabel, { color: theme.textSecondary }]}>Overall Attendance</Text>
      </View>
      
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>RECENT HISTORY</Text>
      <View style={[styles.listContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.listItem}>
          <Text style={[styles.dateText, { color: theme.text }]}>Oct 12, Wed</Text>
          <Text style={[styles.statusText, { color: theme.green }]}>Present</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: theme.border }]} />
        <View style={styles.listItem}>
          <Text style={[styles.dateText, { color: theme.text }]}>Oct 11, Tue</Text>
          <Text style={[styles.statusText, { color: theme.red }]}>Absent</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  chartContainer: { alignItems: 'center', marginVertical: 32 },
  circle: { width: 140, height: 140, borderRadius: 70, borderWidth: 12, alignItems: 'center', justifyContent: 'center' },
  percentage: { fontSize: 34, fontWeight: '700' },
  chartLabel: { fontSize: 15, marginTop: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '500', marginLeft: 16, marginBottom: 8, letterSpacing: -0.08 },
  listContainer: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  dateText: { fontSize: 17 },
  statusText: { fontSize: 17, fontWeight: '500' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
});
