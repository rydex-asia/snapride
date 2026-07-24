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

export default function LocationPermissionScreen({ onAllow, onNotNow }) {
  return (
    <OnboardingScreen>
      <StatusBar style="dark" />

      <View style={styles.mapCard}>
        <View style={styles.mapGlow} />
        <View style={styles.mapGrid}>
          <View style={styles.mapLineOne} />
          <View style={styles.mapLineTwo} />
          <View style={styles.mapLineThree} />
          <View style={styles.routeLine} />
          <View style={styles.routePin} />
          <View style={styles.car}>
            <MaterialCommunityIcons name="car-side" size={24} color={COLORS.primary} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Allow Location Access</Text>
        <Text style={styles.subtitle}>
          We need your location to find rides near you and provide better service.
        </Text>

        <View style={styles.bullets}>
          <PermissionBullet icon="map-marker-radius-outline" text="Find nearby rides" />
          <PermissionBullet icon="navigation-outline" text="Accurate navigation" />
          <PermissionBullet icon="shield-check-outline" text="Better experience" />
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Allow Location" onPress={onAllow} />
          <GhostButton label="Not Now" onPress={onNotNow} style={styles.notNow} textStyle={styles.notNowText} />
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  bullets: {
    marginTop: 18
  },
  car: {
    position: "absolute",
    right: 42,
    bottom: 34,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3
    },
    elevation: 0
  },
  content: {
    flex: 1,
    paddingTop: 20
  },
  footer: {
    marginTop: "auto",
    paddingTop: 16
  },
  mapCard: {
    height: 230,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginTop: 6,
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 0
  },
  mapGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(99,102,241,0.08)",
    top: -40,
    right: -30
  },
  mapGrid: {
    flex: 1,
    backgroundColor: "#F7F8FC"
  },
  mapLineOne: {
    position: "absolute",
    left: 20,
    top: 36,
    width: 140,
    height: 1,
    backgroundColor: "rgba(99,102,241,0.08)"
  },
  mapLineThree: {
    position: "absolute",
    right: 20,
    top: 120,
    width: 160,
    height: 1,
    backgroundColor: "rgba(99,102,241,0.08)"
  },
  mapLineTwo: {
    position: "absolute",
    left: 80,
    top: 72,
    width: 110,
    height: 1,
    backgroundColor: "rgba(99,102,241,0.08)",
    transform: [{
      rotate: "18deg"
    }]
  },
  notNow: {
    marginTop: 10
  },
  notNowText: {
    color: COLORS.textSecondary
  },
  routeLine: {
    position: "absolute",
    left: 112,
    top: 72,
    width: 112,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    transform: [{
      rotate: "-18deg"
    }]
  },
  routePin: {
    position: "absolute",
    left: 128,
    top: 52,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 14,
    borderColor: "rgba(99,102,241,0.18)",
    backgroundColor: "rgba(99,102,241,0.08)"
  },
  subtitle: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500"
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "900"
  }
});
