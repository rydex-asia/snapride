import React from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AccountPageHeader from "../../components/AccountPageHeader";

const STEPS = [
  { label: "Refund requested", time: "10 Jun, 1:05 PM", done: true },
  { label: "Bank processing", time: "Usually 2-4 working days", done: true },
  { label: "Credit to source", time: "Expected by 14 Jun", done: false },
];

export default function RefundScreen({ onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8FC" />
      <AccountPageHeader title="Refund status" subtitle="Track cancelled ride refunds" onBack={onBack} />
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 34 }]}>
        <View style={styles.statusCard}>
          <View style={styles.statusTop}>
            <View>
              <Text style={styles.statusLabel}>Refund amount</Text>
              <Text style={styles.statusAmount}>₹42</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>Processing</Text>
            </View>
          </View>
          <Text style={styles.statusNote}>Refund will be credited to your Visa card ending 5678.</Text>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          {STEPS.map((step, index) => (
            <View key={step.label} style={styles.stepRow}>
              <View style={styles.stepRail}>
                <View style={[styles.stepDot, step.done && styles.stepDotDone]} />
                {index !== STEPS.length - 1 ? <View style={[styles.stepLine, step.done && styles.stepLineDone]} /> : null}
              </View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>{step.label}</Text>
                <Text style={styles.stepTime}>{step.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable style={styles.helpCard}>
          <MaterialCommunityIcons name="headset" size={22} color="#1754E8" />
          <Text style={styles.helpText}>Need help with this refund?</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#98A2B3" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  helpCard: { marginTop: 14, minHeight: 66, borderRadius: 22, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8EDF5", paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  helpText: { flex: 1, color: "#111827", fontSize: 14, fontWeight: "800" },
  safe: { flex: 1, backgroundColor: "#F6F8FC" },
  screen: { flex: 1, backgroundColor: "#F6F8FC" },
  sectionTitle: { marginBottom: 14, color: "#111827", fontSize: 16, fontWeight: "900" },
  statusAmount: { marginTop: 6, color: "#111827", fontSize: 36, lineHeight: 42, fontWeight: "900" },
  statusCard: { minHeight: 150, borderRadius: 26, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8EDF5", padding: 18 },
  statusLabel: { color: "#667085", fontSize: 13, fontWeight: "700" },
  statusNote: { marginTop: 14, color: "#667085", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  statusPill: { height: 32, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "#FFF4E6", alignItems: "center", justifyContent: "center" },
  statusPillText: { color: "#B85C00", fontSize: 12, fontWeight: "900" },
  statusTop: { flexDirection: "row", justifyContent: "space-between" },
  stepCopy: { flex: 1, paddingBottom: 20 },
  stepDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#D0D5DD" },
  stepDotDone: { backgroundColor: "#0F9F6E" },
  stepLine: { width: 2, flex: 1, marginVertical: 4, backgroundColor: "#D0D5DD" },
  stepLineDone: { backgroundColor: "#0F9F6E" },
  stepRail: { width: 24, alignItems: "center" },
  stepRow: { flexDirection: "row" },
  stepTime: { marginTop: 4, color: "#667085", fontSize: 12, fontWeight: "600" },
  stepTitle: { color: "#111827", fontSize: 14, fontWeight: "800" },
  timelineCard: { marginTop: 14, borderRadius: 24, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8EDF5", padding: 16 },
});
