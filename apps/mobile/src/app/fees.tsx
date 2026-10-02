import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';

export default function FeesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    background: isDark ? '#000000' : '#F2F2F7',
    card: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#EBEBF599' : '#3C3C4399',
    border: isDark ? '#38383A' : '#C6C6C8',
    tint: '#007AFF',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Total Outstanding</Text>
        <Text style={[styles.amount, { color: theme.text }]}>$1,250</Text>
        <Pressable style={({ pressed }) => [styles.payButton, { opacity: pressed ? 0.7 : 1, backgroundColor: theme.tint }]}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>FEE BREAKDOWN</Text>
      <View style={[styles.listContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.listItem}>
          <Text style={[styles.itemLabel, { color: theme.text }]}>Tuition Fee</Text>
          <Text style={[styles.itemValue, { color: theme.textSecondary }]}>$1,000</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: theme.border }]} />
        <View style={styles.listItem}>
          <Text style={[styles.itemLabel, { color: theme.text }]}>Transport Fee</Text>
          <Text style={[styles.itemValue, { color: theme.textSecondary }]}>$250</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  mainCard: { alignItems: 'center', padding: 24, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, marginBottom: 32 },
  cardLabel: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  amount: { fontSize: 48, fontWeight: '700', letterSpacing: 0.5, marginBottom: 24 },
  payButton: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  payButtonText: { color: '#FFF', fontSize: 17, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '500', marginLeft: 16, marginBottom: 8, letterSpacing: -0.08 },
  listContainer: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  itemLabel: { fontSize: 17 },
  itemValue: { fontSize: 17 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
});
