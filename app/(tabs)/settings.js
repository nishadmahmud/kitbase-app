import { StyleSheet, View, ScrollView, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useThemePreference } from '@/context/ThemePreferenceContext';
import { useHapticsPreference } from '@/context/HapticsPreferenceContext';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const tint = useThemeColor({}, 'tint');
  const { themePreference, setThemePreference } = useThemePreference();
  const { hapticsOn, setHapticsOn } = useHapticsPreference();

  const appVersion = Constants.expoConfig?.version ?? Constants.manifest?.version ?? '1.0.0';

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(24, insets.top) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.title}>
          Settings
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Appearance
          </ThemedText>
          <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <ThemedText style={styles.settingLabel}>Theme</ThemedText>
            <View style={styles.themeRow}>
              {THEME_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setThemePreference(opt.value)}
                  style={[
                    styles.themePill,
                    { borderColor: cardBorder },
                    themePreference === opt.value && { backgroundColor: tint, borderColor: tint },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.themePillText,
                      themePreference === opt.value && styles.themePillTextActive,
                      themePreference === opt.value && { color: '#fff' },
                    ]}
                  >
                    {opt.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ThemedView>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Feedback
          </ThemedText>
          <ThemedView style={[styles.card, styles.rowCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <ThemedText style={styles.settingLabelInline}>Haptic feedback</ThemedText>
            <Switch
              value={hapticsOn}
              onValueChange={setHapticsOn}
              trackColor={{ false: cardBorder, true: tint }}
              thumbColor="#fff"
            />
          </ThemedView>
          <ThemedText style={styles.settingHint}>
            Light vibration when tapping tabs (iOS).
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            About
          </ThemedText>
          <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={[styles.aboutRow, styles.aboutRowBorder]}>
              <ThemedText style={styles.settingLabel}>Version</ThemedText>
              <ThemedText style={styles.settingValue}>{appVersion}</ThemedText>
            </View>
            <Pressable
              style={styles.aboutRow}
              onPress={() => Linking.openURL('https://kitbase.tech')}
            >
              <ThemedText style={styles.settingLabel}>Website</ThemedText>
              <ThemedText style={[styles.settingValue, { color: tint }]}>kitbase.tech</ThemedText>
            </Pressable>
          </ThemedView>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>Kitbase – tools in your pocket.</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  settingLabelInline: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 15,
    opacity: 0.9,
  },
  settingHint: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 6,
    marginLeft: 4,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themePill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  themePillText: {
    fontSize: 15,
    fontWeight: '500',
  },
  themePillTextActive: {
    color: '#fff',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  aboutRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    opacity: 0.6,
  },
});
