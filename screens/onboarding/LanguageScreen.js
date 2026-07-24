import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

import {
  OnboardingScreen,
  TitleBlock,
  ChoiceRow,
  PrimaryButton,
} from "./OnboardingKit";
import { COLORS } from "../../theme/colors";

const LANGUAGES = [
  { key: "en", label: "English", subtitle: "English" },
  { key: "hi", label: "हिंदी", subtitle: "Hindi" },
  { key: "te", label: "తెలుగు", subtitle: "Telugu" },
  { key: "ta", label: "தமிழ்", subtitle: "Tamil" },
  { key: "kn", label: "ಕನ್ನಡ", subtitle: "Kannada" },
  { key: "ml", label: "മലയാളം", subtitle: "Malayalam" },
];

export default function LanguageScreen({ onContinue }) {
  const [selected, setSelected] = useState("en");

  return (
    <OnboardingScreen>
      <StatusBar style="dark" />
      <TitleBlock title="Choose Language" subtitle="Select your preferred language" />

      <View style={styles.list}>
        {LANGUAGES.map((item) => (
          <ChoiceRow
            key={item.key}
            label={item.label}
            subtitle={item.subtitle}
            selected={selected === item.key}
            onPress={() => setSelected(item.key)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={() => onContinue?.(selected)} />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: "auto",
    paddingTop: 18
  },
  list: {
    marginTop: 18,
    gap: 10
  }
});
