import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AppIcon from "./AppIcon";
import { SHADOWS } from "../theme/shadows";

export default function AccountPageHeader({ title, subtitle, onBack }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
        <AppIcon name="back" size="lg" color="#20242B" />
      </Pressable>

      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.headerRightSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15,23,42,0.06)",
    ...SHADOWS.floating,
    zIndex: 10,
  },
  backButton: {
    width: 30,
    height: 30,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
    transform: [{ translateY: 7 }],
  },
  headerRightSpacer: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    color: "#202124",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "600",
  },
  headerSubtitle: {
    marginTop: 2,
    color: "#777982",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "400",
  },
});
