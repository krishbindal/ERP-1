import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const PURPLE = '#8B5CF6';

type RoleOption = {
  id: string;
  title: string;
  description: string;
  icon: string;
  isAddCategory?: boolean;
};

const roles: RoleOption[] = [
  { id: 'student', title: 'Student', description: 'Are you planning to use our platform for learning?', icon: 'school-outline' },
  { id: 'parents', title: 'Parents', description: 'Learning through meaningful engaging experiences', icon: 'people-outline' },
  { id: 'teacher', title: 'Teacher', description: 'Are you planning to use our platform for teaching?', icon: 'person-outline' },
  { id: 'add', title: 'Add Category', description: '', icon: 'add', isAddCategory: true },
];

export default function OnboardingScreen() {
  const [selectedRole, setSelectedRole] = useState<string>('student');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
        </Pressable>

        {/* Header Text */}
        <Text style={styles.title}>Tell Us About Yourself</Text>
        <Text style={styles.subtitle}>
          Tell us a little about yourself so we can get to know you better.
        </Text>

        {/* Role Grid */}
        <View style={styles.grid}>
          {roles.map((role) => (
            <Pressable
              key={role.id}
              style={[
                styles.roleCard,
                role.isAddCategory && styles.addCard,
                selectedRole === role.id && !role.isAddCategory && styles.roleCardSelected,
              ]}
              onPress={() => !role.isAddCategory && setSelectedRole(role.id)}
            >
              {role.isAddCategory ? (
                <View style={styles.addCardContent}>
                  <View style={styles.addIconCircle}>
                    <Ionicons name="add" size={28} color={PURPLE} />
                  </View>
                  <Text style={styles.addCategoryText}>Add Category</Text>
                </View>
              ) : (
                <>
                  <View style={styles.roleIconContainer}>
                    <Ionicons
                      name={role.icon as any}
                      size={44}
                      color={selectedRole === role.id ? PURPLE : '#888'}
                    />
                  </View>
                  <Text style={[styles.roleTitle, selectedRole === role.id && styles.roleTitleSelected]}>
                    {role.title}
                  </Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </>
              )}
            </Pressable>
          ))}
        </View>

        {/* Continue Button */}
        <Pressable
          style={({ pressed }) => [styles.continueButton, pressed && { opacity: 0.85 }]}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  content: { paddingHorizontal: 24, paddingTop: 20 },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 32,
  },
  roleCard: {
    width: '47%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  roleCardSelected: {
    borderColor: PURPLE,
    backgroundColor: '#FAFAFF',
  },
  addCard: {
    backgroundColor: '#FFF',
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardContent: { alignItems: 'center', gap: 10 },
  addIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3EFFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCategoryText: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  roleIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
  roleTitleSelected: { color: PURPLE },
  roleDescription: { fontSize: 12, color: '#888', lineHeight: 16 },
  continueButton: {
    backgroundColor: PURPLE,
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  continueText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
