import React from 'react';
import { ScrollView, View, Text, StyleSheet, useColorScheme } from 'react-native';

export default function ExamsScreen() {
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
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>UPCOMING EXAMS</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 32 }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Mid-Term Physics</Text>
          <Text style={[styles.dateText, { color: theme.blue }]}>Nov 15</Text>
        </View>
        <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Chapters 1-5 | Duration: 2 Hours</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>RECENT RESULTS</Text>
      <View style={[styles.listContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.listItem}>
          <Text style={[styles.itemText, { color: theme.text }]}>Mathematics Unit Test</Text>
          <Text style={[styles.scoreText, { color: theme.green }]}>A (92%)</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: theme.border }]} />
        <View style={styles.listItem}>
          <Text style={[styles.itemText, { color: theme.text }]}>English Essay</Text>
          <Text style={[styles.scoreText, { color: theme.blue }]}>B+ (85%)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '500', marginLeft: 16, marginBottom: 8, letterSpacing: -0.08 },
  card: { padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  dateText: { fontSize: 15, fontWeight: '600' },
  cardSubtitle: { fontSize: 15 },
  listContainer: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  itemText: { fontSize: 17 },
  scoreText: { fontSize: 17, fontWeight: '600' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
});
