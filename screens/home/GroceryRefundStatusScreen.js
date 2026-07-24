import React from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { withReadableGroceryTypography } from "./groceryReadableTypography";

const PAGE_BG = "#F5F6F8";
const GREEN = "#0B7A33";
const INK = "#101828";
const MUTED = "#667085";
const BORDER = "#E4E7EC";

function money(value) {
  return `₹${Math.max(0, Number(value || 0)).toFixed(0)}`;
}

function UpdateRow({ icon, title, subtitle, tone = "green" }) {
  const active = tone === "green";
  return (
    <View style={styles.updateRow}>
      <View style={[styles.updateIcon, !active && styles.updateIconPending]}><MaterialCommunityIcons name={icon} size={20} color={active ? GREEN : "#667085"} /></View>
      <View style={styles.updateCopy}><Text style={styles.updateTitle}>{title}</Text><Text style={styles.updateSubtitle}>{subtitle}</Text></View>
      {active ? <MaterialCommunityIcons name="check-circle" size={20} color={GREEN} /> : <MaterialCommunityIcons name="clock-outline" size={20} color="#98A2B3" />}
    </View>
  );
}

export default function GroceryRefundStatusScreen({ refund = {}, onDone }) {
  const insets = useSafeAreaInsets();
  const amount = Number(refund.refundAmount || 0);
  const count = refund.selectedItems?.length || 0;
  const paymentMethod = refund.paymentMethod || "UPI";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <View style={styles.header}>
        <Pressable onPress={onDone} hitSlop={10} style={styles.headerButton}><MaterialCommunityIcons name="arrow-left" size={25} color={INK} /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.headerTitle}>Refund status</Text><Text style={styles.headerSubtitle}>Cancellation completed</Text></View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}><MaterialCommunityIcons name="check" size={34} color="#FFFFFF" /></View>
          <Text style={styles.successTitle}>Order cancelled</Text>
          <Text style={styles.successSubtitle}>{count || "Selected"} {count === 1 ? "item has" : "items have"} been cancelled successfully.</Text>
          <View style={styles.amountPanel}><Text style={styles.amountLabel}>Refund initiated</Text><Text style={styles.amountValue}>{money(amount)}</Text><Text style={styles.amountHint}>to your original {paymentMethod}</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Refund details</Text>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Refund method</Text><Text style={styles.detailValue}>{paymentMethod}</Text></View>
          <View style={styles.divider} />
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Expected by</Text><Text style={styles.detailValue}>3–5 working days</Text></View>
          <View style={styles.divider} />
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Reference ID</Text><Text style={styles.detailValue}>FRZ-RF-24821</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What happens next</Text>
          <UpdateRow icon="close-circle-outline" title="Cancellation confirmed" subtitle="The selected items have been removed from your order." />
          <View style={styles.divider} />
          <UpdateRow icon="cash-refund" title="Refund initiated" subtitle={`${money(amount)} has been sent for processing.`} />
          <View style={styles.divider} />
          <UpdateRow icon="bank-outline" title="Credit to your account" subtitle="Your bank will notify you when the refund is credited." tone="pending" />
        </View>

        <Pressable style={styles.helpCard}>
          <View style={styles.helpIcon}><MaterialCommunityIcons name="headset" size={22} color={GREEN} /></View>
          <View style={styles.helpCopy}><Text style={styles.helpTitle}>Need help with your refund?</Text><Text style={styles.helpSubtitle}>Chat with Frezo support</Text></View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={MUTED} />
        </Pressable>

        <Pressable onPress={onDone} style={styles.doneButton}><Text style={styles.doneButtonText}>Done</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create(withReadableGroceryTypography({
  safe: { flex: 1, backgroundColor: PAGE_BG },
  header: { alignItems: "center", flexDirection: "row", minHeight: 72, paddingHorizontal: 14, paddingVertical: 8 },
  headerButton: { alignItems: "center", height: 42, justifyContent: "center", width: 42 },
  headerCopy: { flex: 1, paddingRight: 42 },
  headerTitle: { color: INK, fontFamily: "Manrope_800ExtraBold", fontSize: 20 },
  headerSubtitle: { color: MUTED, fontFamily: "Manrope_500Medium", fontSize: 11, marginTop: 2 },
  scroll: { flex: 1 },
  content: { gap: 12, paddingHorizontal: 14, paddingTop: 6 },
  successCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: BORDER, borderRadius: 18, borderWidth: 1, padding: 18 },
  successIcon: { alignItems: "center", backgroundColor: GREEN, borderRadius: 30, height: 60, justifyContent: "center", width: 60 },
  successTitle: { color: INK, fontFamily: "Manrope_800ExtraBold", fontSize: 21, marginTop: 12 },
  successSubtitle: { color: MUTED, fontFamily: "Manrope_500Medium", fontSize: 12, lineHeight: 17, marginTop: 4, textAlign: "center" },
  amountPanel: { alignItems: "center", backgroundColor: "#EAF7EE", borderRadius: 14, marginTop: 16, padding: 13, width: "100%" },
  amountLabel: { color: GREEN, fontFamily: "Manrope_700Bold", fontSize: 11 },
  amountValue: { color: GREEN, fontFamily: "Manrope_800ExtraBold", fontSize: 32, lineHeight: 39, marginTop: 2 },
  amountHint: { color: "#39704C", fontFamily: "Manrope_500Medium", fontSize: 10 },
  card: { backgroundColor: "#FFFFFF", borderColor: BORDER, borderRadius: 15, borderWidth: 1, padding: 14 },
  cardTitle: { color: INK, fontFamily: "Manrope_800ExtraBold", fontSize: 15, marginBottom: 8 },
  detailRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 42 },
  detailLabel: { color: MUTED, fontFamily: "Manrope_500Medium", fontSize: 12 },
  detailValue: { color: INK, fontFamily: "Manrope_700Bold", fontSize: 12 },
  divider: { backgroundColor: BORDER, height: StyleSheet.hairlineWidth },
  updateRow: { alignItems: "center", flexDirection: "row", minHeight: 66, paddingVertical: 8 },
  updateIcon: { alignItems: "center", backgroundColor: "#EAF7EE", borderRadius: 19, height: 38, justifyContent: "center", marginRight: 11, width: 38 },
  updateIconPending: { backgroundColor: "#F2F4F7" },
  updateCopy: { flex: 1, minWidth: 0, paddingRight: 8 },
  updateTitle: { color: INK, fontFamily: "Manrope_700Bold", fontSize: 12 },
  updateSubtitle: { color: MUTED, fontFamily: "Manrope_500Medium", fontSize: 10, lineHeight: 15, marginTop: 3 },
  helpCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: BORDER, borderRadius: 15, borderWidth: 1, flexDirection: "row", padding: 14 },
  helpIcon: { alignItems: "center", backgroundColor: "#EAF7EE", borderRadius: 20, height: 40, justifyContent: "center", marginRight: 11, width: 40 },
  helpCopy: { flex: 1 },
  helpTitle: { color: INK, fontFamily: "Manrope_700Bold", fontSize: 13 },
  helpSubtitle: { color: MUTED, fontFamily: "Manrope_500Medium", fontSize: 11, marginTop: 3 },
  doneButton: { alignItems: "center", backgroundColor: GREEN, borderRadius: 12, height: 52, justifyContent: "center", marginTop: 2 },
  doneButtonText: { color: "#FFFFFF", fontFamily: "Manrope_800ExtraBold", fontSize: 15 },
}));
