import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  OnboardingScreen,
  TopBarOnly,
  Card,
  PrimaryButton,
} from "./OnboardingKit";
import { COLORS } from "../../theme/colors";

export default function ReferralScreen({ onBack, onContinue }) {
  return (
    <OnboardingScreen>
      <StatusBar style="dark" />
      <TopBarOnly onBack={onBack} />

      <View style={styles.hero}>
        <View style={styles.friendGroup}>
          <View style={[styles.person, styles.personBlue]}>
            <View style={styles.face} />
            <View style={styles.shoulder} />
          </View>
          <View style={styles.giftWrap}>
            <MaterialCommunityIcons name="gift-outline" size={74} color={COLORS.primary} />
            <View style={styles.sparkA} />
            <View style={styles.sparkB} />
          </View>
          <View style={[styles.person, styles.personAmber]}>
            <View style={styles.face} />
            <View style={styles.shoulderAmber} />
          </View>
        </View>
      </View>

      <Text style={styles.title}>Refer & Earn</Text>
      <Text style={styles.subtitle}>
        Refer your friends and earn exciting rewards when they join and complete their first ride.
      </Text>

      <Card style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <View style={styles.codeRow}>
          <Text style={styles.code}>CAPTAIN123</Text>
          <Pressable>
            <MaterialCommunityIcons name="content-copy" size={18} color={COLORS.primary} />
          </Pressable>
        </View>
      </Card>

      <View style={styles.howWrap}>
        <Text style={styles.howTitle}>How it works?</Text>
        {[
          "Share your code with friends",
          "They sign up using your code",
          "You both earn rewards",
        ].map((item, index) => (
          <View key={item} style={styles.stepRow}>
            <View style={styles.stepIndex}>
              <Text style={styles.stepIndexText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={onContinue} />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  code: {
    color: COLORS.textPrimary,
    fontSize: 16,
    letterSpacing: 1.2,
    fontWeight: "900"
  },
  codeCard: {
    marginTop: 18,
    borderStyle: "dashed",
    borderColor: "rgba(99,102,241,0.28)"
  },
  codeLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center"
  },
  codeRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  face: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3D1B8",
    marginBottom: 8
  },
  footer: {
    marginTop: "auto",
    paddingTop: 18
  },
  friendGroup: {
    width: 280,
    height: 176,
    borderRadius: 28,
    backgroundColor: "#F8FAFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10
  },
  giftWrap: {
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  hero: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 14
  },
  howTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800"
  },
  howWrap: {
    marginTop: 18,
    gap: 10
  },
  person: {
    width: 80,
    height: 110,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 12
  },
  personAmber: {
    backgroundColor: "#FFE9C8"
  },
  personBlue: {
    backgroundColor: "#DCE3FF"
  },
  shoulder: {
    width: 48,
    height: 38,
    borderRadius: 20,
    backgroundColor: COLORS.primary
  },
  shoulderAmber: {
    width: 48,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#F59E0B"
  },
  sparkA: {
    position: "absolute",
    top: 20,
    left: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F59E0B"
  },
  sparkB: {
    position: "absolute",
    top: 14,
    right: 18,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8B5CF6"
  },
  stepIndex: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  stepIndexText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800"
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  stepText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "500"
  },
  subtitle: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center"
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center"
  }
});
