import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Switch,
  ColorSchemeName,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemePreference } from '@/hooks/useThemePreference';

const PURPLE = '#8B5CF6';

type ThemeOption = {
  id: ColorSchemeName;
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const themeOptions: ThemeOption[] = [
  {
    id: 'light',
    label: 'Light',
    description: 'Always use light appearance',
    icon: 'sunny',
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Always use dark appearance',
    icon: 'moon',
  },
  {
    id: null,
    label: 'System',
    description: 'Follow system setting',
    icon: 'phone-portrait-outline',
  },
];

export default function AppearanceScreen() {
  const { colorScheme, setColorScheme } = useThemePreference();
  const isDark = colorScheme === 'dark';

  const handleToggle = (val: boolean) => {
    setColorScheme(val ? 'dark' : 'light');
  };

  return (
    <LinearGradient
      colors={isDark ? ['#1C1C1E', '#2C2C2E', '#1C1C1E'] : ['#EDE8FB', '#F5F2FE', '#FFFFFF']}
      style={styles.container}
      locations={[0, 0.4, 1]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="chevron-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
          </Pressable>
          <Text style={[styles.headerTitle, isDark && styles.textLight]}>Appearance</Text>
          <View style={styles.backButton} />
        </View>

        {/* Quick Dark Mode Toggle Card */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[styles.iconBubble, { backgroundColor: isDark ? '#3A2E5C' : '#F3EFFE' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={PURPLE} />
              </View>
              <View>
                <Text style={[styles.toggleLabel, isDark && styles.textLight]}>Dark Mode</Text>
                <Text style={[styles.toggleSub, isDark && styles.textMuted]}>
                  {isDark ? 'Dark theme is on' : 'Light theme is on'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleToggle}
              trackColor={{ false: '#E5E5EA', true: PURPLE }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E5EA"
            />
          </View>
        </View>

        {/* Theme Options */}
        <Text style={[styles.sectionLabel, isDark && styles.textMuted]}>THEME</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          {themeOptions.map((opt, idx) => {
            const selected = colorScheme === opt.id;
            return (
              <Pressable
                key={String(opt.id)}
                onPress={() => setColorScheme(opt.id)}
                style={({ pressed }) => [
                  styles.optionRow,
                  idx < themeOptions.length - 1 && [
                    styles.optionRowBorder,
                    isDark && styles.optionRowBorderDark,
                  ],
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={[styles.iconBubble, { backgroundColor: selected ? (isDark ? '#3A2E5C' : '#F3EFFE') : (isDark ? '#2C2C2E' : '#F5F5F5') }]}>
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color={selected ? PURPLE : (isDark ? '#8E8E93' : '#AEAEB2')}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, isDark && styles.textLight, selected && { color: PURPLE }]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.optionDesc, isDark && styles.textMuted]}>
                    {opt.description}
                  </Text>
                </View>
                {selected && (
                  <Ionicons name="checkmark-circle" size={20} color={PURPLE} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Info note */}
        <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
          <Ionicons name="information-circle-outline" size={16} color={isDark ? '#8E8E93' : '#888'} />
          <Text style={[styles.infoText, isDark && styles.textMuted]}>
            Changes apply instantly across the entire app.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginBottom: 8,
    marginTop: 20,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  toggleSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  optionRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  optionRowBorderDark: {
    borderBottomColor: '#3A3A3C',
  },
  optionText: { flex: 1 },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  optionDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
  },
  infoBoxDark: {
    backgroundColor: '#2C2C2E',
  },
  infoText: {
    fontSize: 12,
    color: '#888',
    flex: 1,
    lineHeight: 17,
  },

  // Dark mode text helpers
  textLight: { color: '#FFFFFF' },
  textMuted: { color: '#8E8E93' },
});
