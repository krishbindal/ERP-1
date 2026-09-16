import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { SymbolView } from 'expo-symbols';

export default function ProfileScreen() {
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
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }]}>
          <SymbolView name="person.fill" size={60} tintColor={theme.textSecondary} />
        </View>
        <Text style={[styles.nameText, { color: theme.text }]}>Student Name</Text>
        <Text style={[styles.classText, { color: theme.textSecondary }]}>Class 10 - A | Roll No: 42</Text>
      </View>

      <View style={[styles.listContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Pressable style={({ pressed }) => [styles.listItem, { opacity: pressed ? 0.7 : 1 }]}>
          <View style={[styles.iconBox, { backgroundColor: theme.red }]}>
            <SymbolView name="bell.badge.fill" size={18} tintColor="#FFF" />
          </View>
          <Text style={[styles.itemText, { color: theme.text }]}>Notification Settings</Text>
          <SymbolView name="chevron.right" size={20} tintColor={theme.textSecondary} />
        </Pressable>
        <View style={[styles.separator, { backgroundColor: theme.border }]} />
        <Pressable style={({ pressed }) => [styles.listItem, { opacity: pressed ? 0.7 : 1 }]}>
          <Text style={[styles.logoutText, { color: theme.red }]}>Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  avatarContainer: { alignItems: 'center', marginVertical: 32 },
  avatar: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  nameText: { fontSize: 22, fontWeight: '700' },
  classText: { fontSize: 15, marginTop: 4 },
  listContainer: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBox: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  itemText: { flex: 1, fontSize: 17 },
  logoutText: { flex: 1, fontSize: 17, textAlign: 'center' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 62 },
});
