import React from 'react';
import { ScrollView, View, Text, StyleSheet, useColorScheme } from 'react-native';

export default function TimetableScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    background: isDark ? '#000000' : '#F2F2F7',
    card: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#EBEBF599' : '#3C3C4399',
    border: isDark ? '#38383A' : '#C6C6C8',
    blue: '#007AFF',
    green: '#34C759',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>TODAY'S SCHEDULE</Text>
      
      <View style={[styles.listContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.listItem}>
          <View style={styles.timeColumn}>
            <Text style={[styles.timeText, { color: theme.text }]}>09:00</Text>
            <Text style={[styles.amPmText, { color: theme.textSecondary }]}>AM</Text>
          </View>
          <View style={[styles.detailsColumn, { borderLeftColor: theme.blue }]}>
            <Text style={[styles.subjectText, { color: theme.text }]}>Mathematics</Text>
            <Text style={[styles.roomText, { color: theme.textSecondary }]}>Room 101 • Mr. Smith</Text>
          </View>
        </View>
        
        <View style={[styles.separator, { backgroundColor: theme.border }]} />
        
        <View style={styles.listItem}>
          <View style={styles.timeColumn}>
            <Text style={[styles.timeText, { color: theme.text }]}>10:30</Text>
            <Text style={[styles.amPmText, { color: theme.textSecondary }]}>AM</Text>
          </View>
          <View style={[styles.detailsColumn, { borderLeftColor: theme.green }]}>
            <Text style={[styles.subjectText, { color: theme.text }]}>Science Lab</Text>
            <Text style={[styles.roomText, { color: theme.textSecondary }]}>Lab 2 • Mrs. Davis</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '500', marginLeft: 16, marginBottom: 8, letterSpacing: -0.08 },
  listContainer: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  timeColumn: { width: 60 },
  timeText: { fontSize: 17, fontWeight: '600' },
  amPmText: { fontSize: 13, marginTop: 2 },
  detailsColumn: { flex: 1, marginLeft: 16, paddingLeft: 16, borderLeftWidth: 3 },
  subjectText: { fontSize: 17, fontWeight: '600' },
  roomText: { fontSize: 15, marginTop: 2 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 92 }, // 16 + 60 + 16
});
