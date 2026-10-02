import React from 'react';
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
import { Link } from 'expo-router';

const PURPLE = '#8B5CF6';

const settingsItems = [
  { id: 'language', label: 'Language', icon: 'language-outline' },
  { id: 'privacy', label: 'Privacy & Security', icon: 'shield-outline' },
  { id: 'appearance', label: 'Appearance', icon: 'color-palette-outline', href: '/appearance' },
  { id: 'report', label: 'Download Report Card', icon: 'download-outline' },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' },
  { id: 'onboarding', label: 'Setup / Onboarding', icon: 'person-add-outline', href: '/onboarding' },
  { id: 'logout', label: 'Sign Out', icon: 'log-out-outline', danger: true },
];

export default function ProfileScreen() {
  return (
    <LinearGradient
      colors={['#8B5CF6', '#A78BFA', '#F0EAF9']}
      style={styles.container}
      locations={[0, 0.25, 0.55]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Purple Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable style={styles.bellButton}>
            <Ionicons name="notifications-outline" size={22} color={PURPLE} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Avatar — overlapping the purple area */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>K</Text>
              </View>
            </View>

            <Pressable style={styles.editButton}>
              <Ionicons name="pencil-outline" size={14} color={PURPLE} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </Pressable>

            <Text style={styles.studentName}>Kartik Kaushik</Text>
            <Text style={styles.studentId}>Student ID: ST20260018</Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>A</Text>
                <Text style={styles.statLabel}>Section</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>18</Text>
                <Text style={styles.statLabel}>Roll No</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>10</Text>
                <Text style={styles.statLabel}>Grade</Text>
              </View>
            </View>
          </View>

          {/* Settings Items */}
          <View style={styles.settingsList}>
            {settingsItems.map((item) => {
              const row = (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.settingsRow, pressed && { opacity: 0.7 }]}
                >
                  <View style={styles.settingsLeft}>
                    <View style={[styles.settingsIconBox, item.danger && { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={item.danger ? '#EF4444' : PURPLE}
                      />
                    </View>
                    <Text style={[styles.settingsLabel, item.danger && { color: '#EF4444' }]}>
                      {item.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#CCC" />
                </Pressable>
              );
              if (item.href) {
                return (
                  <Link key={item.id} href={item.href as any} asChild>
                    {row}
                  </Link>
                );
              }
              return row;
            })}
          </View>
          <View style={{ height: 30 }} />
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#FFF' },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    marginHorizontal: 20,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 64,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    position: 'relative',
  },
  avatarWrapper: {
    position: 'absolute',
    top: -46,
    alignSelf: 'center',
  },
  avatarCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#C5A3E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  avatarText: { color: '#FFF', fontSize: 36, fontWeight: '700' },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: PURPLE,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
    marginBottom: 12,
  },
  editButtonText: { fontSize: 12, color: PURPLE, fontWeight: '600' },
  studentName: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  studentId: { fontSize: 13, color: '#888', marginBottom: 20 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA' },
  settingsList: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  settingsIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3EFFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsLabel: { fontSize: 15, color: '#1A1A1A', fontWeight: '500' },
});
