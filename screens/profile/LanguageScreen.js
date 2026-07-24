import React, { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AccountPageHeader from "../../components/AccountPageHeader";

const LANGUAGES = [
  { key: "en", label: "English", subtitle: "English" },
  { key: "hi", label: "हिंदी", subtitle: "Hindi" },
  { key: "te", label: "తెలుగు", subtitle: "Telugu" },
  { key: "ta", label: "தமிழ்", subtitle: "Tamil" },
  { key: "kn", label: "ಕನ್ನಡ", subtitle: "Kannada" },
  { key: "ml", label: "മലയാളം", subtitle: "Malayalam" },
];

function LanguageRow({ item, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button"
    >
      <View>
        <Text style={styles.rowLabel}>{item.label}</Text>
        <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
      </View>
      {selected ? <MaterialCommunityIcons name="check-circle" size={22} color="#138A36" /> : <View style={styles.rowRadio} />}
    </Pressable>
  );
}

export default function LanguageScreen({ onBack, initialLanguage = "en", onContinue }) {
  const [selected, setSelected] = useState(initialLanguage);

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8FC" />
      <AccountPageHeader title="Language" subtitle="Choose your preferred language" onBack={onBack} />

      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
          <MaterialCommunityIcons name="translate" size={24} color="#138A36" />
          </View>
          <Text style={styles.heroTitle}>Pick a language</Text>
          <Text style={styles.heroSubtitle}>
            Rydex will use your selected language for labels, prompts and the booking flow.
          </Text>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Available languages</Text>
          <View style={styles.card}>
            {LANGUAGES.map((item, index) => (
              <View key={item.key}>
                <LanguageRow item={item} selected={selected === item.key} onPress={() => setSelected(item.key)} />
                {index !== LANGUAGES.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]} onPress={onBack}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
            onPress={() => onContinue?.(selected)}
          >
            <Text style={styles.primaryButtonText}>Save changes</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14
  },
  content: {
    padding: 16,
    paddingBottom: 28
  },
  divider: {
    height: 1,
    marginLeft: 0,
    backgroundColor: "#F0F2F5"
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 18,
    marginBottom: 16
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
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#138A36",
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButtonPressed: {
    opacity: 0.86
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700"
  },
  row: {
    minHeight: 64,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  rowPressed: {
    opacity: 0.76
  },
  rowLabel: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700"
  },
  rowRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D0D5DD"
  },
  rowSelected: {
    backgroundColor: "#F8FAFF"
  },
  rowSubtitle: {
    marginTop: 2,
    color: "#667085",
    fontSize: 11.5,
    fontWeight: "500"
  },
  safe: {
    flex: 1,
    backgroundColor: "#F6F8FC"
  },
  screen: {
    flex: 1,
    backgroundColor: "#F6F8FC"
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D0D5DD"
  },
  secondaryButtonPressed: {
    opacity: 0.78
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700"
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
