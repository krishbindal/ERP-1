import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

const PURPLE = '#8B5CF6';

const categories = ['All', 'Teachers', 'Class', 'Unread'];

const messages = [
  {
    id: '1',
    name: 'Mr. William Carter',
    message: 'Please submit your worksheet..',
    time: '09:32 AM',
    online: true,
  },
  {
    id: '2',
    name: 'Ms. Emily Davis',
    message: "Excellent work on your lab report!",
    time: 'Yesterday',
    online: false,
  },
  {
    id: '3',
    name: 'Mr. David Wilson',
    message: "Don't forget tomorrow's presentation..",
    time: 'Yesterday',
    online: true,
  },
  {
    id: '4',
    name: 'Mr. James Miller',
    message: "I've shared the study materials..",
    time: 'Mon',
    online: false,
  },
  {
    id: '5',
    name: 'Ms. Sarah Thompson',
    message: 'Please check your assignment feedback.',
    time: 'Mon',
    online: false,
  },
];

function AvatarInitials({ name, size = 48 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  const colors = ['#AF52DE', '#5AC8FA', '#FF9500', '#34C759', '#FF3B30'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors[colorIndex],
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#FFF', fontSize: size * 0.35, fontWeight: '700' }}>{initials}</Text>
    </View>
  );
}

export default function MessagesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <LinearGradient
      colors={['#E5D9F2', '#F0EAF9', '#FFFFFF']}
      style={styles.container}
      locations={[0, 0.3, 1]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Message</Text>
            <Text style={styles.screenSubtitle}>Stay connected with your teachers.</Text>
          </View>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>K</Text>
          </View>
        </View>

        {/* Search + Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color="#999" />
            <TextInput
              placeholder="Search by teacher's name"
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>
          <Pressable style={styles.filterButton}>
            <Ionicons name="filter-outline" size={20} color={PURPLE} />
          </Pressable>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.pill,
                selectedCategory === cat && styles.pillActive,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedCategory === cat && styles.pillTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Message List */}
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {messages.map((msg) => (
            <Pressable key={msg.id} style={({ pressed }) => [styles.msgRow, pressed && { opacity: 0.75 }]}>
              <View>
                <AvatarInitials name={msg.name} />
                {msg.online && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.msgBody}>
                <Text style={styles.msgName}>{msg.name}</Text>
                <Text style={styles.msgPreview} numberOfLines={1}>{msg.message}</Text>
              </View>
              <Text style={styles.msgTime}>{msg.time}</Text>
            </Pressable>
          ))}
          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  pillsRow: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pillActive: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  pillText: { fontSize: 14, color: '#666', fontWeight: '500' },
  pillTextActive: { color: '#FFF' },
  listContent: { paddingHorizontal: 20, paddingTop: 12 },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
    gap: 12,
  },
  msgBody: { flex: 1 },
  msgName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 3 },
  msgPreview: { fontSize: 13, color: '#888' },
  msgTime: { fontSize: 12, color: '#999' },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#FFF',
  },
});
