import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { SHADOWS } from "../../theme/shadows";

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getFirstName(name) {
  const first = String(name || "")
    .trim()
    .split(/\s+/)[0]
    .trim();
  return first || "Captain";
}

export default function CaptainProfileCard({
  captainName = "narsing rao",
  captainPlate = "TS11EG3375",
  captainVehicle = "Splendor",
  rating = "4.6",
  avatarSource,
  onCall = () => {},
  onMessage = () => {},
  messageLabel,
}) {
  const firstName = getFirstName(captainName);
  const initials = getInitials(captainName);
  const actionLabel = messageLabel || `Message ${firstName.toLowerCase()}`;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.copyColumn}>
          <Text style={styles.plateText} numberOfLines={1}>
            {captainPlate}
          </Text>
          <Text style={styles.vehicleText} numberOfLines={1}>
            {captainVehicle}
          </Text>
          <Text style={styles.nameText} numberOfLines={1}>
            {captainName}
          </Text>
        </View>

        <View style={styles.avatarColumn}>
          <View style={styles.avatarWrap}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Text style={styles.avatarInitials}>{initials}</Text>
            )}
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{rating}</Text>
            <MaterialIcons name="star" size={13} color="#F4C542" />
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Call ${firstName}`}
          onPress={onCall}
          style={({ pressed }) => [styles.callButton, pressed && styles.messageButtonPressed]}
        >
          <MaterialIcons name="call" size={18} color="#111827" />
        </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        onPress={onMessage}
        style={({ pressed }) => [styles.messageButton, pressed && styles.messageButtonPressed]}
      >
        <MaterialIcons name="chat-bubble-outline" size={18} color="#475467" />
        <Text style={styles.messageText} numberOfLines={1}>
          {actionLabel}
        </Text>
      </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 6,
    borderRadius: 20,
    backgroundColor: "#F7FAFF",
    borderWidth: 0,
    borderColor: "#fefefeff",
    paddingHorizontal: 13,
    paddingTop: 8,
    paddingBottom: 8,
    ...SHADOWS.card,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  copyColumn: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  plateText: {
    color: "#101828",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  vehicleText: {
    marginTop: 0,
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
  },
  nameText: {
    marginTop: 1,
    color: "#667085",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500",
  },
  avatarColumn: {
    width: 64,
    height: 66,
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#D9E2EF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    color: "#243247",
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  ratingBadge: {
    position: "absolute",
    right: 0,
    bottom: 2,
    minWidth: 42,
    height: 20,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "#F7FAFF",
    borderWidth: 0,
    borderColor: "#F7FAFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  ratingText: {
    color: "#475467",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "800",
  },
  actionRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  callButton: {
    width: 38,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    alignItems: "center",
    justifyContent: "center",
  },
  messageButton: {
    flex: 1,
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#e7e7e7ff",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  messageButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  messageText: {
    flex: 1,
    color: "#344054",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
});
