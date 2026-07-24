import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  OnboardingScreen,
  PrimaryButton,
  GhostButton,
  PermissionBullet,
} from "./OnboardingKit";
import { COLORS } from "../../theme/colors";

export default function NotifyPermissionScreen({ onAllow, onNotNow }) {
  return (
    <OnboardingScreen>
      <StatusBar style="dark" />

      <View style={styles.hero}>
        <View style={styles.bellWrap}>
          <MaterialCommunityIcons name="bell" size={88} color={COLORS.primary} />
          <View style={styles.checkBadge}>
            <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Stay Updated</Text>
        <Text style={styles.subtitle}>
          Allow notifications to get ride requests, important updates and offers.
        </Text>

        <View style={styles.bullets}>
          <PermissionBullet icon="clipboard-text-outline" text="Ride requests" />
          <PermissionBullet icon="cash-plus" text="Earnings & incentives" />
          <PermissionBullet icon="tag-outline" text="Offers & updates" />
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Allow Notifications" onPress={onAllow} />
          <GhostButton label="Not Now" onPress={onNotNow} style={styles.notNow} textStyle={styles.notNowText} />
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  bellWrap: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  bullets: {
    marginTop: 18
  },
  checkBadge: {
    position: "absolute",
    right: 28,
    top: 30,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  content: {
    flex: 1,
    paddingTop: 8
  },
  footer: {
    marginTop: "auto",
    paddingTop: 16
  },
  hero: {
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 14
  },
  notNow: {
    marginTop: 10
  },
  notNowText: {
    color: COLORS.textSecondary
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
