import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';

export default function HomeworkScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    background: isDark ? '#000000' : '#F2F2F7',
    card: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#EBEBF599' : '#3C3C4399',
    border: isDark ? '#38383A' : '#C6C6C8',
    red: '#FF3B30',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PENDING ASSIGNMENTS</Text>
      
      <Pressable style={({ pressed }) => [styles.card, { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Math Chapter 5 Exercises</Text>
          <View style={[styles.badge, { backgroundColor: isDark ? '#3A1418' : '#FFD5D2' }]}>
            <Text style={[styles.badgeText, { color: theme.red }]}>Due Tomorrow</Text>
          </View>
        </View>
        <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>Complete exercises 5.1 through 5.3 in workbook.</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '500', marginLeft: 16, marginBottom: 8, letterSpacing: -0.08 },
  card: { padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: '600', marginRight: 16 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardDescription: { fontSize: 15, lineHeight: 20 },
});
