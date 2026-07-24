import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const GREEN = "#0B7A33";
const RED = "#D92D20";
const INK = "#101828";
const MUTED = "#667085";
const DIVIDER = "#ECECF0";

const FALLBACK_ITEMS = [
  { id: "cancel-1", name: "Banana Robusta", unit: "1 kg", quantity: 1, price: 48 },
  { id: "cancel-2", name: "Amul Taaza Milk", unit: "500 ml", quantity: 1, price: 27 },
  { id: "cancel-3", name: "Farm Fresh Eggs", unit: "12 pcs", quantity: 1, price: 66 },
];

const REASONS = [
  "Ordered by mistake",
  "Delivery delayed",
  "Wrong items",
  "Payment issue",
  "Better price",
  "Other",
];

function money(value) {
  return `₹${Math.max(0, Number(value || 0)).toFixed(0)}`;
}

function CheckBox({ selected }) {
  return (
    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
      {selected ? <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" /> : null}
    </View>
  );
}

function ReasonOption({ label, selected, onPress }) {
  const scale = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1 : 0,
      damping: 16,
      stiffness: 220,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [selected, scale]);

  return (
    <Animated.View style={{ transform: [{ scale: scale.interpolate({ inputRange: [0, 1], outputRange: [1, 1.012] }) }] }}>
      <Pressable onPress={onPress} style={[styles.reasonRow, selected && styles.reasonRowSelected]}>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected ? <View style={styles.radioDot} /> : null}
        </View>
        <Text style={[styles.reasonText, selected && styles.reasonTextSelected]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function GroceryCancelOrderScreen({ items = [], paymentMethod = "UPI", onBack, onCancelled }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState("items");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const transition = useRef(new Animated.Value(1)).current;

  const normalizedItems = useMemo(() => {
    const source = items.length ? items : FALLBACK_ITEMS;
    return source.map((item, index) => ({
      id: item.id || item.productId || `cancel-${index}`,
      name: item.product?.name || item.name || "Grocery item",
      unit: item.unit || item.product?.unit || `${item.quantity || 1} item`,
      quantity: Number(item.quantity || item.qty || 1),
      price: Number(item.price || item.unitPrice || item.product?.price || 0),
    }));
  }, [items]);

  const [selectedIds, setSelectedIds] = useState(() => new Set(normalizedItems.map((item) => item.id)));
  const selectedItems = normalizedItems.filter((item) => selectedIds.has(item.id));
  const refundAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const allSelected = selectedIds.size === normalizedItems.length;

  const changeStep = (next) => {
    Animated.timing(transition, {
      toValue: 0,
      duration: 110,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setStep(next);
      transition.setValue(0);
      Animated.timing(transition, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  const toggleItem = (id) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(normalizedItems.map((item) => item.id)));
  };

  const confirmCancellation = () => {
    if (!reason || !selectedItems.length) return;
    onCancelled?.({ selectedItems, refundAmount, reason, details, paymentMethod });
  };

  const stepCopy = {
    items: ["Select items to cancel", "Choose one or more items from this order."],
    reason: ["Why are you cancelling?", "Choose the reason that best describes the issue."],
    refund: ["Review cancellation", "Check your refund details before confirming."],
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Pressable style={styles.backdrop} onPress={onBack} />
      <View style={[styles.sheet, { paddingBottom: Math.max(14, insets.bottom + 6) }]}>
        <View style={styles.handle} />
        <LinearGradient colors={["#DDEAFF", "#F3F7FF", "#FFFFFF"]} locations={[0, 0.58, 1]} style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>{stepCopy[step][0]}</Text>
            <Text style={styles.headerSubtitle}>{stepCopy[step][1]}</Text>
          </View>
          <Pressable onPress={onBack} hitSlop={10} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={21} color={INK} />
          </Pressable>
        </LinearGradient>

        <Animated.View style={[styles.animatedContent, {
          opacity: transition,
          transform: [{ translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        }]}>
          {step === "items" ? (
            <>
              <View style={styles.sectionTopRow}>
                <Text style={styles.sectionLabel}>{normalizedItems.length} ordered items</Text>
                <Pressable onPress={toggleAll} hitSlop={8}><Text style={styles.selectAllText}>{allSelected ? "Clear all" : "Select all"}</Text></Pressable>
              </View>
              <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                <View style={styles.itemSection}>
                  {normalizedItems.map((item, index) => {
                    const selected = selectedIds.has(item.id);
                    return (
                      <Pressable key={item.id} onPress={() => toggleItem(item.id)} style={[styles.itemRow, index > 0 && styles.divider]}>
                        <CheckBox selected={selected} />
                        <View style={styles.itemCopy}>
                          <Text numberOfLines={1} style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemMeta}>{item.unit} · Qty {item.quantity}</Text>
                        </View>
                        <View style={styles.itemAmountCopy}>
                          <Text style={styles.itemPrice}>{money(item.price * item.quantity)}</Text>
                          <Text style={[styles.itemRefund, !selected && styles.refundMuted]}>{selected ? "Refund" : "Keep"}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.refundStrip}>
                  <View><Text style={styles.refundLabel}>Expected refund</Text><Text style={styles.refundMethodText}>To original {paymentMethod}</Text></View>
                  <Text style={styles.refundAmount}>{money(refundAmount)}</Text>
                </View>
              </ScrollView>
              <View style={styles.actions}>
                <Pressable onPress={onBack} style={styles.secondaryButton}><Text style={styles.secondaryText}>Keep Order</Text></Pressable>
                <Pressable disabled={!selectedItems.length} onPress={() => changeStep("reason")} style={[styles.primaryButton, !selectedItems.length && styles.disabled]}><Text style={styles.primaryText}>Continue</Text></Pressable>
              </View>
            </>
          ) : null}

          {step === "reason" ? (
            <>
              <ScrollView style={styles.scrollArea} contentContainerStyle={styles.reasonContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.reasonSection}>
                  {REASONS.map((item) => <ReasonOption key={item} label={item} selected={reason === item} onPress={() => setReason(item)} />)}
                </View>
                <TextInput value={details} onChangeText={setDetails} placeholder="Tell us more (optional)" placeholderTextColor="#98A2B3" multiline style={styles.detailsInput} />
              </ScrollView>
              <View style={styles.actions}>
                <Pressable onPress={() => changeStep("items")} style={styles.secondaryButton}><Text style={styles.secondaryText}>Back</Text></Pressable>
                <Pressable disabled={!reason} onPress={() => changeStep("refund")} style={[styles.primaryButton, !reason && styles.disabled]}><Text style={styles.primaryText}>Review refund</Text></Pressable>
              </View>
            </>
          ) : null}

          {step === "refund" ? (
            <>
              <ScrollView style={styles.scrollArea} contentContainerStyle={styles.refundContent} showsVerticalScrollIndicator={false}>
                <View style={styles.refundHero}>
                  <View style={styles.refundIcon}><MaterialCommunityIcons name="cash-refund" size={25} color={GREEN} /></View>
                  <Text style={styles.refundHeroLabel}>Refund amount</Text>
                  <Text style={styles.refundHeroAmount}>{money(refundAmount)}</Text>
                  <Text style={styles.refundHeroMeta}>Refund to original {paymentMethod} in 3–5 working days</Text>
                </View>
                <View style={styles.summarySection}>
                  <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Items being cancelled</Text><Text style={styles.summaryValue}>{selectedItems.length}</Text></View>
                  <View style={[styles.summaryRow, styles.divider]}><Text style={styles.summaryLabel}>Reason</Text><Text numberOfLines={1} style={styles.reasonSummary}>{reason}</Text></View>
                </View>
                <View style={styles.policyRow}>
                  <MaterialCommunityIcons name="information-outline" size={20} color="#B54708" />
                  <Text style={styles.policyText}>This action cannot be undone. Discounts may be recalculated for a partial cancellation.</Text>
                </View>
              </ScrollView>
              <View style={styles.actions}>
                <Pressable onPress={() => changeStep("reason")} style={styles.secondaryButton}><Text style={styles.secondaryText}>Back</Text></Pressable>
                <Pressable onPress={confirmCancellation} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel Order</Text></Pressable>
              </View>
            </>
          ) : null}
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.42)" },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: "84%", minHeight: 440, overflow: "hidden", paddingHorizontal: 14, paddingTop: 8 },
  handle: { alignSelf: "center", backgroundColor: "#CDD1D8", borderRadius: 2, height: 4, marginBottom: 8, width: 42 },
  header: { alignItems: "flex-start", borderRadius: 18, flexDirection: "row", marginBottom: 8, padding: 13 },
  headerCopy: { flex: 1, paddingRight: 10 },
  headerTitle: { color: INK, fontFamily: "Inter_600SemiBold", fontSize: 20, lineHeight: 25 },
  headerSubtitle: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18, marginTop: 3 },
  closeButton: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  animatedContent: { flexShrink: 1 },
  sectionTopRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, paddingVertical: 8 },
  sectionLabel: { color: INK, fontFamily: "Inter_500Medium", fontSize: 14 },
  selectAllText: { color: GREEN, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  scrollArea: { flexShrink: 1 },
  itemSection: { backgroundColor: "#FFFFFF", borderRadius: 17, overflow: "hidden" },
  itemRow: { alignItems: "center", flexDirection: "row", minHeight: 62, paddingHorizontal: 4, paddingVertical: 8 },
  divider: { borderTopColor: DIVIDER, borderTopWidth: StyleSheet.hairlineWidth },
  checkbox: { alignItems: "center", borderColor: "#C5CAD1", borderRadius: 7, borderWidth: 1.5, height: 24, justifyContent: "center", marginRight: 11, width: 24 },
  checkboxSelected: { backgroundColor: GREEN, borderColor: GREEN },
  itemCopy: { flex: 1, minWidth: 0 },
  itemName: { color: INK, fontFamily: "Inter_500Medium", fontSize: 14 },
  itemMeta: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 3 },
  itemAmountCopy: { alignItems: "flex-end", marginLeft: 8 },
  itemPrice: { color: INK, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  itemRefund: { color: GREEN, fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 3 },
  refundMuted: { color: "#98A2B3" },
  refundStrip: { alignItems: "center", backgroundColor: "#F2FAF4", borderRadius: 16, flexDirection: "row", justifyContent: "space-between", marginTop: 8, padding: 13 },
  refundLabel: { color: INK, fontFamily: "Inter_500Medium", fontSize: 13 },
  refundMethodText: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 3 },
  refundAmount: { color: GREEN, fontFamily: "Inter_600SemiBold", fontSize: 21 },
  actions: { backgroundColor: "#FFFFFF", borderTopColor: DIVIDER, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 10, marginHorizontal: -14, marginTop: 10, paddingHorizontal: 14, paddingTop: 10 },
  secondaryButton: { alignItems: "center", backgroundColor: "#EEF7F0", borderRadius: 13, flex: 1, height: 48, justifyContent: "center" },
  secondaryText: { color: GREEN, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  primaryButton: { alignItems: "center", backgroundColor: GREEN, borderRadius: 13, flex: 1.35, height: 48, justifyContent: "center" },
  primaryText: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  disabled: { opacity: 0.4 },
  reasonContent: { paddingBottom: 2 },
  reasonSection: { backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden" },
  reasonRow: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 11, flexDirection: "row", minHeight: 45, paddingHorizontal: 10 },
  reasonRowSelected: { backgroundColor: "#EAF7EE" },
  radio: { alignItems: "center", borderColor: "#B6BCC4", borderRadius: 10, borderWidth: 1.5, height: 20, justifyContent: "center", marginRight: 11, width: 20 },
  radioSelected: { borderColor: GREEN },
  radioDot: { backgroundColor: GREEN, borderRadius: 5, height: 10, width: 10 },
  reasonText: { color: INK, fontFamily: "Inter_500Medium", fontSize: 14 },
  reasonTextSelected: { color: GREEN, fontFamily: "Inter_600SemiBold" },
  detailsInput: { backgroundColor: "#F7F7F9", borderRadius: 14, color: INK, fontFamily: "Inter_400Regular", fontSize: 14, height: 68, marginTop: 8, padding: 12, textAlignVertical: "top" },
  refundContent: { gap: 9, paddingBottom: 2 },
  refundHero: { alignItems: "center", backgroundColor: "#F2FAF4", borderRadius: 19, padding: 16 },
  refundIcon: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 22, height: 44, justifyContent: "center", marginBottom: 7, width: 44 },
  refundHeroLabel: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 12 },
  refundHeroAmount: { color: GREEN, fontFamily: "Inter_600SemiBold", fontSize: 28, marginTop: 1 },
  refundHeroMeta: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4, textAlign: "center" },
  summarySection: { backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden" },
  summaryRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 48, paddingHorizontal: 5 },
  summaryLabel: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 13 },
  summaryValue: { color: INK, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  reasonSummary: { color: INK, flex: 1, fontFamily: "Inter_500Medium", fontSize: 13, marginLeft: 20, textAlign: "right" },
  policyRow: { alignItems: "flex-start", backgroundColor: "#FFF8ED", borderRadius: 15, flexDirection: "row", gap: 9, padding: 12 },
  policyText: { color: "#7A2E0E", flex: 1, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17 },
  cancelButton: { alignItems: "center", backgroundColor: RED, borderRadius: 13, flex: 1.35, height: 48, justifyContent: "center" },
  cancelText: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
