import React from 'react';
import { ScrollView, View, Text, StyleSheet, useColorScheme } from 'react-native';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    background: isDark ? '#000000' : '#F2F2F7',
    card: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#EBEBF599' : '#3C3C4399',
    border: isDark ? '#38383A' : '#C6C6C8',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>Notices & Events</Text>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>Today</Text>
        <Text style={[styles.title, { color: theme.text }]}>School closed for Holiday</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>Please note that the school will remain closed today due to the public holiday.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  headerTitle: { fontSize: 34, fontWeight: '700', marginBottom: 24, letterSpacing: 0.41 },
  card: { padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  dateLabel: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  description: { fontSize: 15, lineHeight: 20 },
});
