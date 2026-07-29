import React, { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AccountPageHeader from "../../components/AccountPageHeader";

const PREFERENCES = [
  {
    key: "voice",
    icon: "microphone-outline",
    title: "Voice navigation",
    subtitle: "Hear turn-by-turn directions while you travel",
  },
  {
    key: "history",
    icon: "history",
    title: "Save recent trips",
    subtitle: "Keep your last destinations handy for faster rebooking",
  },
  {
    key: "motion",
    icon: "run",
    title: "Reduce motion",
    subtitle: "Tone down page animations across the app",
  },
  {
    key: "quiet",
    icon: "weather-night",
    title: "Quiet hours",
    subtitle: "Mute non-critical alerts at night",
  },
];

function PreferenceRow({ item, value, onToggle }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons name={item.icon} size={22} color="#1754E8" />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
      </View>
      <Switch
        trackColor={{ false: "#D0D5DD", true: "#9CC0FF" }}
        thumbColor={value ? "#1754E8" : "#FFFFFF"}
        ios_backgroundColor="#D0D5DD"
        onValueChange={onToggle}
        value={value}
      />
    </View>
  );
}

export default function PreferencesScreen({ onBack, onOpenLanguage }) {
  const [state, setState] = useState({
    voice: true,
    history: true,
    motion: false,
    quiet: false,
  });

  const toggle = (key) => (value) => {
    setState((current) => ({ ...current, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AccountPageHeader title="Preferences" subtitle="Fine-tune how Rydex behaves" onBack={onBack} />

      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="tune-variant" size={24} color="#1754E8" />
          </View>
          <Text style={styles.heroTitle}>Your app, your rules</Text>
          <Text style={styles.heroSubtitle}>
            Pick the defaults that make booking, tracking and daily use feel a little more like your own.
          </Text>
        </View>

        <Pressable style={styles.languageCard} onPress={onOpenLanguage} accessibilityRole="button">
          <View style={styles.languageCopy}>
            <Text style={styles.languageLabel}>Language</Text>
            <Text style={styles.languageValue}>English</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#98A2B3" />
        </Pressable>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>App preferences</Text>
          <View style={styles.card}>
            {PREFERENCES.map((item, index) => (
              <View key={item.key} style={index !== PREFERENCES.length - 1 && styles.rowSpacing}>
                <PreferenceRow item={item} value={state[item.key]} onToggle={toggle(item.key)} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.noteCard}>
          <MaterialCommunityIcons name="information-outline" size={18} color="#1754E8" />
          <Text style={styles.noteText}>
            These preferences apply immediately. You can come back any time to adjust them for a ride or a quieter day.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "transparent",
  },
  content: {
    padding: 16,
    paddingBottom: 28
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 18,
    marginBottom: 14
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center"
  },
  heroSubtitle: {
    marginTop: 8,
    color: "#667085",
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: "500"
  },
  heroTitle: {
    marginTop: 14,
    color: "#111827",
    fontSize: 22,
    fontWeight: "800"
  },
  languageCard: {
    minHeight: 62,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  languageCopy: {
    flex: 1
  },
  languageLabel: {
    color: "#667085",
    fontSize: 11.5,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4
  },
  languageValue: {
    marginTop: 3,
    color: "#111827",
    fontSize: 14,
    fontWeight: "700"
  },
  noteCard: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  noteText: {
    flex: 1,
    color: "#475467",
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "500"
  },
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  rowSpacing: {
    marginBottom: 12,
  },
  rowCopy: {
    flex: 1
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center"
  },
  rowSubtitle: {
    marginTop: 3,
    color: "#667085",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "500"
  },
  rowTitle: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600"
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  sectionBlock: {
    marginBottom: 2
  },
  sectionLabel: {
    marginBottom: 8,
    color: "#475467",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  }
});
