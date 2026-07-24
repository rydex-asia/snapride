import React from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import SimplePageHeader from "../../components/SimplePageHeader";

const SAFETY_TOOLS = [
  {
    key: "share",
    icon: "share-variant-outline",
    title: "Share live trip",
    subtitle: "Let a trusted person follow your route",
  },
  {
    key: "contacts",
    icon: "account-heart-outline",
    title: "Trusted contacts",
    subtitle: "Choose who can receive safety updates",
  },
  {
    key: "verify",
    icon: "badge-account-horizontal-outline",
    title: "Verify your ride",
    subtitle: "Match the captain and vehicle before boarding",
  },
  {
    key: "audio",
    icon: "microphone-outline",
    title: "Audio protection",
    subtitle: "Review recording preferences for active trips",
  },
];

const READINESS_ITEMS = [
  { icon: "crosshairs-gps", label: "Live location", value: "Ready" },
  { icon: "shield-account-outline", label: "Emergency contact", value: "Added" },
  { icon: "lock-check-outline", label: "Ride PIN", value: "Enabled" },
];

function SafetyToolRow({ item, last, onPress }) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.toolRow, pressed && styles.rowPressed]}
      >
        <View style={styles.toolIcon}>
          <MaterialCommunityIcons name={item.icon} size={21} color="#343941" />
        </View>
        <View style={styles.toolCopy}>
          <Text style={styles.toolTitle}>{item.title}</Text>
          <Text style={styles.toolSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#999DA4" />
      </Pressable>
      {!last ? <View style={styles.softDivider} /> : null}
    </>
  );
}

export default function SafetyScreen({
  onBack,
  onShareLiveTrip,
  onOpenContacts,
  onVerifyRide,
  onOpenAudio,
}) {
  const insets = useSafeAreaInsets();

  const handleTool = (key) => {
    if (key === "share") return onShareLiveTrip?.();
    if (key === "contacts") return onOpenContacts?.();
    if (key === "verify") return onVerifyRide?.();
    if (key === "audio") return onOpenAudio?.();
    return undefined;
  };

  const callEmergency = () => {
    Linking.openURL("tel:112").catch(() => undefined);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SimplePageHeader title="Safety centre" eyebrow="Rydex protection" onBack={onBack} />

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(30, insets.bottom + 20) }]}
      >
        <LinearGradient
          colors={["#FFF0BF", "#FFF8E6", "#FFFFFF"]}
          locations={[0, 0.58, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.readinessCard}
        >
          <View style={styles.readinessTop}>
            <View style={styles.shieldMark}>
              <MaterialCommunityIcons name="shield-check" size={25} color="#7C4C00" />
            </View>
            <View style={styles.readinessCopy}>
              <Text style={styles.readinessEyebrow}>SAFETY STATUS</Text>
              <Text style={styles.readinessTitle}>Protection is ready</Text>
              <Text style={styles.readinessSubtitle}>
                Your essential ride-safety settings are active.
              </Text>
            </View>
          </View>

          <View style={styles.readinessItems}>
            {READINESS_ITEMS.map((item) => (
              <View key={item.label} style={styles.readinessItem}>
                <MaterialCommunityIcons name={item.icon} size={16} color="#7C4C00" />
                <View style={styles.readinessItemCopy}>
                  <Text style={styles.readinessItemLabel}>{item.label}</Text>
                  <Text style={styles.readinessItemValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.emergencyCard}>
          <View style={styles.emergencyCopy}>
            <Text style={styles.emergencyTitle}>Need emergency help?</Text>
            <Text style={styles.emergencySubtitle}>
              Call India’s emergency response service immediately.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Call emergency services 112"
            onPress={callEmergency}
            style={({ pressed }) => [styles.emergencyButton, pressed && styles.emergencyPressed]}
          >
            <MaterialCommunityIcons name="phone" size={18} color="#FFFFFF" />
            <Text style={styles.emergencyButtonText}>Call 112</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Safety tools</Text>
          <Text style={styles.sectionSubtitle}>Manage protection before or during a trip</Text>
        </View>
        <View style={styles.toolGroup}>
          {SAFETY_TOOLS.map((item, index) => (
            <SafetyToolRow
              key={item.key}
              item={item}
              last={index === SAFETY_TOOLS.length - 1}
              onPress={() => handleTool(item.key)}
            />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Before you ride</Text>
          <Text style={styles.sectionSubtitle}>Three quick checks for every pickup</Text>
        </View>
        <View style={styles.guideCard}>
          <View style={styles.guideRow}>
            <View style={styles.guideNumber}><Text style={styles.guideNumberText}>1</Text></View>
            <Text style={styles.guideText}>Match the vehicle number and captain photo.</Text>
          </View>
          <View style={styles.guideConnector} />
          <View style={styles.guideRow}>
            <View style={styles.guideNumber}><Text style={styles.guideNumberText}>2</Text></View>
            <Text style={styles.guideText}>Confirm the ride PIN before the trip begins.</Text>
          </View>
          <View style={styles.guideConnector} />
          <View style={styles.guideRow}>
            <View style={styles.guideNumber}><Text style={styles.guideNumberText}>3</Text></View>
            <Text style={styles.guideText}>Share your live trip when travelling alone.</Text>
          </View>
        </View>

        <View style={styles.privacyNote}>
          <MaterialCommunityIcons name="lock-outline" size={17} color="#747980" />
          <Text style={styles.privacyText}>
            Safety data is used only to protect and support your trip.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#F1F0F5" },
  content: { paddingHorizontal: 16, paddingTop: 14 },
  readinessCard: {
    minHeight: 194,
    padding: 16,
    borderRadius: 22,
    overflow: "hidden",
  },
  readinessTop: { flexDirection: "row", alignItems: "center" },
  shieldMark: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.82)",
    alignItems: "center",
    justifyContent: "center",
  },
  readinessCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  readinessEyebrow: {
    fontFamily: "Inter_600SemiBold",
    color: "#A96700",
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.8,
  },
  readinessTitle: {
    marginTop: 3,
    fontFamily: "Inter_600SemiBold",
    color: "#29251D",
    fontSize: 19,
    lineHeight: 24,
  },
  readinessSubtitle: {
    marginTop: 3,
    fontFamily: "Inter_400Regular",
    color: "#716958",
    fontSize: 11,
    lineHeight: 16,
  },
  readinessItems: { marginTop: 17, flexDirection: "row", gap: 7 },
  readinessItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 57,
    paddingHorizontal: 9,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.76)",
    flexDirection: "row",
    alignItems: "center",
  },
  readinessItemCopy: { flex: 1, minWidth: 0, marginLeft: 6 },
  readinessItemLabel: {
    fontFamily: "Inter_400Regular",
    color: "#777062",
    fontSize: 8,
    lineHeight: 11,
  },
  readinessItemValue: {
    marginTop: 2,
    fontFamily: "Inter_600SemiBold",
    color: "#494236",
    fontSize: 9.5,
    lineHeight: 13,
  },
  emergencyCard: {
    minHeight: 90,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  emergencyCopy: { flex: 1, minWidth: 0, paddingRight: 12 },
  emergencyTitle: {
    fontFamily: "Inter_600SemiBold",
    color: "#25272B",
    fontSize: 15,
    lineHeight: 20,
  },
  emergencySubtitle: {
    marginTop: 3,
    fontFamily: "Inter_400Regular",
    color: "#777B82",
    fontSize: 10.5,
    lineHeight: 15,
  },
  emergencyButton: {
    height: 43,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: "#D92D20",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  emergencyPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  emergencyButtonText: {
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 16,
  },
  sectionHeader: { marginTop: 23, marginBottom: 9, paddingHorizontal: 2 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    color: "#202124",
    fontSize: 16,
    lineHeight: 21,
  },
  sectionSubtitle: {
    marginTop: 2,
    fontFamily: "Inter_400Regular",
    color: "#7C8087",
    fontSize: 10.5,
    lineHeight: 15,
  },
  toolGroup: { overflow: "hidden", borderRadius: 20, backgroundColor: "#FFFFFF" },
  toolRow: {
    minHeight: 72,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  rowPressed: { backgroundColor: "#F8F8F9" },
  toolIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#F4F5F6",
    alignItems: "center",
    justifyContent: "center",
  },
  toolCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
  toolTitle: {
    fontFamily: "Inter_500Medium",
    color: "#2B2D31",
    fontSize: 13.5,
    lineHeight: 18,
  },
  toolSubtitle: {
    marginTop: 3,
    fontFamily: "Inter_400Regular",
    color: "#7B7F86",
    fontSize: 10.5,
    lineHeight: 14,
  },
  softDivider: { height: StyleSheet.hairlineWidth, marginLeft: 67, backgroundColor: "#E9EAEC" },
  guideCard: { padding: 15, borderRadius: 20, backgroundColor: "#FFFFFF" },
  guideRow: { minHeight: 38, flexDirection: "row", alignItems: "center" },
  guideNumber: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: "#FFF2CC",
    alignItems: "center",
    justifyContent: "center",
  },
  guideNumberText: {
    fontFamily: "Inter_600SemiBold",
    color: "#8C5900",
    fontSize: 11,
    lineHeight: 15,
  },
  guideText: {
    flex: 1,
    marginLeft: 11,
    fontFamily: "Inter_400Regular",
    color: "#53575E",
    fontSize: 11.5,
    lineHeight: 16,
  },
  guideConnector: {
    width: 1,
    height: 8,
    marginLeft: 13,
    backgroundColor: "#E3E5E8",
  },
  privacyNote: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  privacyText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    color: "#777B82",
    fontSize: 10.5,
    lineHeight: 15,
  },
});
