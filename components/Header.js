import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AppIcon from "./AppIcon";
import PremiumCard from "./PremiumCard";

import { COLORS } from "../theme/colors";
import { SHADOWS } from "../theme/shadows";
export default function Header({
  title,
  subtitle,
  walletAmount,
  notificationCount = 0,
  onWalletPress,
  onNotificationsPress
}) {
  return (
    <View style={styles.container}>
      <View style={styles.copyWrap}>
        <View style={styles.titleRow}>
          <AppIcon name="location" active size="sm" color={COLORS.primary} />
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.actions}>
        <PremiumCard onPress={onWalletPress} style={styles.walletBadge} contentStyle={styles.walletBadgeContent} pressScale={0.96}>
          <AppIcon name="wallet" size="sm" color={COLORS.primary} />
          <Text style={styles.walletText}>{walletAmount}</Text>
        </PremiumCard>

        <PremiumCard onPress={onNotificationsPress} style={styles.iconButton} contentStyle={styles.iconButtonContent} pressScale={0.96}>
          <AppIcon name="notifications" size="md" color="#252A31" />
          {notificationCount > 0 ? (
            <View style={styles.notificationDot}>
              <Text style={styles.notificationText}>{notificationCount}</Text>
            </View>
          ) : null}
        </PremiumCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  copyWrap: {
    flex: 1,
    minWidth: 0
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  title: {
    flex: 1,
    color: "#111827",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4
  },
  subtitle: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500"
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  walletBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "COLORS.primaryLight",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.12)"
  },
  walletBadgeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  walletText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800"
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.floating
  },
  iconButtonContent: {
    alignItems: "center",
    justifyContent: "center"
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F04438",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3
  },
  notificationText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800"
  }
});
