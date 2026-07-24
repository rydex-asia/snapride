import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  OnboardingScreen,
  TopBarOnly,
  Card,
  PrimaryButton,
} from "./OnboardingKit";
import { COLORS } from "../../theme/colors";

export default function LegalScreen({ onBack, onContinue }) {
  return (
    <OnboardingScreen>
      <StatusBar style="dark" />
      <TopBarOnly onBack={onBack} />

      <View style={styles.hero}>
        <View style={styles.shieldWrap}>
          <MaterialCommunityIcons name="shield-check" size={92} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>We Value Your Trust</Text>
        <Text style={styles.subtitle}>
          By continuing, you agree to our{"\n"}
          <Text style={styles.link}>Terms of Service</Text> and{" "}
          <Text style={styles.link}>Privacy Policy</Text>.
        </Text>
      </View>

      <View style={styles.cards}>
        <Card style={styles.linkCard}>
          <View style={styles.linkLeft}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color={COLORS.textPrimary} />
            <View style={styles.linkCopy}>
              <Text style={styles.linkTitle}>Terms of Service</Text>
              <Text style={styles.linkSub}>Read our terms and conditions</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
        </Card>

        <Card style={styles.linkCard}>
          <View style={styles.linkLeft}>
            <MaterialCommunityIcons name="shield-lock-outline" size={20} color={COLORS.textPrimary} />
            <View style={styles.linkCopy}>
              <Text style={styles.linkTitle}>Privacy Policy</Text>
              <Text style={styles.linkSub}>Learn how we protect you</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
        </Card>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="I Agree & Continue" onPress={onContinue} />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  cards: {
    marginTop: 22,
    gap: 12
  },
  footer: {
    marginTop: "auto",
    paddingTop: 18
  },
  hero: {
    alignItems: "center",
    paddingTop: 28
  },
  link: {
    color: COLORS.primary,
    fontWeight: "700"
  },
  linkCard: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  linkCopy: {
    flex: 1
  },
  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1
  },
  linkSub: {
    marginTop: 3,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "500"
  },
  linkTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800"
  },
  shieldWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  subtitle: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "500"
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "900"
  }
});
