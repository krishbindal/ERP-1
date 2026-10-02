import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 4;

export default function HomeScreen() {
  const quickAccessModules = [
    { id: 'hw', title: 'Homework', icon: 'book', color: '#E8A375' },
    { id: 'tt', title: 'Timetable', icon: 'calendar', color: '#5AC8FA' },
    { id: 'att', title: 'Attendance', icon: 'checkmark-circle', color: '#FF3B30' },
    { id: 'res', title: 'Result', icon: 'ribbon', color: '#4CD964' },
  ];

  return (
    <LinearGradient
      colors={['#E5D9F2', '#F8F8F9', '#FFFFFF']}
      style={styles.container}
      locations={[0, 0.4, 1]}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.profileSection}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>K</Text>
              </View>
              <View>
                <Text style={styles.greetingText}>Hello, Kartik</Text>
                <Text style={styles.classText}>Grade 10 • Section A</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.iconButton}>
                <Ionicons name="search" size={20} color="#000" />
              </Pressable>
              <Pressable style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={20} color="#000" />
              </Pressable>
            </View>
          </View>

          {/* Banner */}
          <View style={styles.banner}>
            <LinearGradient
              colors={['#F5E8FF', '#E4D3FA']}
              style={styles.bannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Ready to Learn? ⭐</Text>
                <Text style={styles.bannerText}>
                  Assignments, and upcoming events with your personalized dashboard.
                </Text>
                <Pressable style={styles.bannerButton}>
                  <Text style={styles.bannerButtonText}>View Schedule</Text>
                </Pressable>
              </View>
              <View style={styles.illustrationPlaceholder}>
                <Ionicons name="school" size={60} color="#AF52DE" opacity={0.3} />
              </View>
            </LinearGradient>
          </View>

          {/* Quick Access */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Access</Text>
              <Text style={styles.seeAllText}>See all</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickAccessScroll}>
              {quickAccessModules.map((item) => (
                <Pressable key={item.id} style={styles.quickAccessItem}>
                  <View style={styles.quickAccessIconBox}>
                    <Ionicons name={item.icon as any} size={28} color={item.color} />
                  </View>
                  <Text style={styles.quickAccessTitle}>{item.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Academic Overview */}
          <View style={styles.section}>
            <View style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Academic Overview</Text>
                  <Text style={styles.overviewSubtitle}>Track your progress</Text>
                </View>
                <View style={styles.dropdownButton}>
                  <Text style={styles.dropdownText}>Month</Text>
                  <Ionicons name="chevron-down" size={14} color="#000" />
                </View>
              </View>

              <View style={styles.progressRow}>
                <View style={styles.progressHeaderRow}>
                  <Text style={styles.progressTitle}>Attendance</Text>
                  <Text style={styles.progressValue}>75/100%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: '75%', backgroundColor: '#B3B5F5' }]} />
                </View>
              </View>

              <View style={styles.progressRow}>
                <View style={styles.progressHeaderRow}>
                  <Text style={styles.progressTitle}>Pending Assignments</Text>
                  <Text style={styles.progressValue}>45/100%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: '45%', backgroundColor: '#FFB6C1' }]} />
                </View>
              </View>
            </View>
          </View>

          {/* Today's Schedule */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Schedule</Text>
              <Text style={styles.seeAllText}>See all</Text>
            </View>
            <View style={styles.scheduleCard}>
              <Text style={styles.scheduleEmptyText}>No classes scheduled for today.</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { paddingTop: 10, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#C5A3E8', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  greetingText: { fontSize: 20, fontWeight: '600', color: '#1A1A1A' },
  classText: { fontSize: 13, color: '#666', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  banner: { marginBottom: 28 },
  bannerGradient: { borderRadius: 24, padding: 24, flexDirection: 'row', overflow: 'hidden' },
  bannerContent: { flex: 1, zIndex: 2 },
  bannerTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  bannerText: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 16, paddingRight: 20 },
  bannerButton: { backgroundColor: '#8B5CF6', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'flex-start' },
  bannerButtonText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  illustrationPlaceholder: { position: 'absolute', right: -10, bottom: -10, width: 120, height: 120, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1A1A1A' },
  seeAllText: { fontSize: 14, color: '#8B5CF6', fontWeight: '500' },
  quickAccessScroll: { gap: 16 },
  quickAccessItem: { width: ITEM_WIDTH, alignItems: 'center' },
  quickAccessIconBox: { width: ITEM_WIDTH, height: ITEM_WIDTH, borderRadius: 16, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  quickAccessTitle: { fontSize: 12, fontWeight: '500', color: '#1A1A1A', textAlign: 'center' },
  overviewCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  overviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  overviewSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  dropdownButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, gap: 4 },
  dropdownText: { fontSize: 13, fontWeight: '500', color: '#333' },
  progressRow: { marginBottom: 20 },
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  progressValue: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  progressBarBackground: { height: 32, backgroundColor: '#F5F5F5', borderRadius: 16, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 16 },
  scheduleCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, minHeight: 150, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  scheduleEmptyText: { color: '#999', fontSize: 15 },
});
