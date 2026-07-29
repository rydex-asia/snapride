import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AppIcon from "./AppIcon";

export default function SimplePageHeader({
  title,
  eyebrow,
  onBack,
  actionLabel,
  onAction,
  elevated = false,
  backgroundColor = "#FFFFFF",
  largeTitle = false,
}) {
  return (
    <View style={[styles.header, { backgroundColor }, elevated && styles.headerElevated]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        hitSlop={10}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <AppIcon name="back" size={22} color="#202124" />
      </Pressable>

      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={[styles.title, largeTitle && styles.titleLarge]} numberOfLines={1}>{title}</Text>
      </View>

      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          hitSlop={8}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : (
        <View style={styles.rightSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    minWidth: 52,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E5E8",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { color: "#3730A3", fontSize: 13, lineHeight: 17, fontWeight: "700" },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E5E8",
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, minWidth: 0, marginHorizontal: 12 },
  eyebrow: {
    marginBottom: 1,
    color: "#80838A",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
  },
  header: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 20,
  },
  headerElevated: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E1E3E6",
    shadowColor: "#17202B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  pressed: { opacity: 0.6, transform: [{ scale: 0.97 }] },
  rightSpacer: { width: 38, height: 38 },
  title: { color: "#202124", fontSize: 21, lineHeight: 26, fontWeight: "700" },
  titleLarge: { fontSize: 22, lineHeight: 27, fontWeight: "700" },
});
