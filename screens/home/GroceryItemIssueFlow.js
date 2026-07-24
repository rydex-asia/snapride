import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
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
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const GREEN = "#0B7A33";
const INK = "#15181C";
const MUTED = "#69717D";
const DIVIDER = "#E8EAF0";

const ISSUE_TYPES = [
  { key: "WRONG_ITEM", title: "Wrong item received", subtitle: "The delivered item is different", icon: "swap-horizontal" },
  { key: "DAMAGED_ITEM", title: "Item is damaged", subtitle: "Packaging or product is damaged", icon: "package-variant-remove" },
  { key: "MISSING_ITEM", title: "Item is missing", subtitle: "An item was not delivered", icon: "package-variant-closed-minus" },
  { key: "QUALITY_ISSUE", title: "Quality issue", subtitle: "Freshness or quality is not acceptable", icon: "leaf-circle-outline" },
];

const RESOLUTIONS = [
  { key: "REFUND", title: "Refund", subtitle: "Refund to your original payment method", icon: "cash-refund" },
  { key: "REPLACEMENT", title: "Replacement", subtitle: "Deliver a replacement when available", icon: "truck-delivery-outline" },
];

function imageSource(value) {
  if (!value) return null;
  return typeof value === "string" ? { uri: value } : value;
}

function money(value) {
  return `₹${Math.max(0, Number(value || 0)).toFixed(0)}`;
}

function CheckBox({ selected }) {
  return <View style={[styles.checkbox, selected && styles.checkboxSelected]}>{selected ? <MaterialCommunityIcons name="check" size={15} color="#FFFFFF" /> : null}</View>;
}

export default function GroceryItemIssueFlow({ items = [], paymentMethod = "UPI", onClose, onSubmit }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState("type");
  const [issueType, setIssueType] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [resolution, setResolution] = useState("REFUND");
  const [note, setNote] = useState("");
  const [photoSlots, setPhotoSlots] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const normalizedItems = useMemo(() => items.map((item, index) => ({
    ...item,
    id: item.id || item.productId || `issue-${index}`,
    name: item.product?.name || item.name || "Grocery item",
    image: item.image || item.product?.image,
    quantity: Number(item.quantity || item.qty || 1),
    price: Number(item.price || item.unitPrice || item.product?.price || 0),
    unit: item.unit || item.product?.unit || "item",
  })), [items]);

  const selectedItems = normalizedItems.filter((item) => selectedIds.has(item.id));
  const refundAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const toggleItem = (id) => setSelectedIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const addPhoto = () => {
    if (photoSlots >= 3) return;
    Alert.alert("Add evidence", "Camera and gallery access will open here when media upload is connected.", [
      { text: "Cancel", style: "cancel" },
      { text: "Add placeholder", onPress: () => setPhotoSlots((value) => Math.min(3, value + 1)) },
    ]);
  };

  const submit = async () => {
    if (!selectedItems.length || !issueType || !resolution) return;
    setSubmitting(true);
    try {
      await onSubmit?.({ issueType, items: selectedItems, resolution, note, photoCount: photoSlots, refundAmount });
    } catch (error) {
      Alert.alert("Couldn’t submit report", error?.message || "Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "evidence") {
    return (
      <KeyboardAvoidingView style={styles.fullScreen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <View style={[styles.fullHeader, { paddingTop: insets.top + 7 }]}>
          <Pressable style={styles.backButton} onPress={() => setStep("items")}><MaterialCommunityIcons name="arrow-left" size={24} color={INK} /></Pressable>
          <View style={styles.fullHeaderCopy}><Text style={styles.fullTitle}>Report item issue</Text><Text style={styles.fullSubtitle}>{selectedItems.length} item{selectedItems.length === 1 ? "" : "s"} selected</Text></View>
          <Pressable style={styles.closeButton} onPress={onClose}><MaterialCommunityIcons name="close" size={21} color={INK} /></Pressable>
        </View>
        <ScrollView style={styles.fullScroll} contentContainerStyle={[styles.fullContent, { paddingBottom: insets.bottom + 110 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={["#DDEAFF", "#F3F7FF", "#FFFFFF"]} locations={[0, 0.58, 1]} style={styles.issueSummary}>
            <View style={styles.issueSummaryIcon}><MaterialCommunityIcons name={ISSUE_TYPES.find((item) => item.key === issueType)?.icon || "alert-circle-outline"} size={23} color="#285EA8" /></View>
            <View style={styles.issueSummaryCopy}><Text style={styles.issueSummaryLabel}>ISSUE TYPE</Text><Text style={styles.issueSummaryTitle}>{ISSUE_TYPES.find((item) => item.key === issueType)?.title}</Text></View>
          </LinearGradient>

          <Text style={styles.sectionTitle}>Add photos</Text>
          <Text style={styles.sectionSubtitle}>Photos help us review damaged, wrong, or quality-related items faster.</Text>
          <View style={styles.photoRow}>
            {Array.from({ length: photoSlots }).map((_, index) => (
              <Pressable key={index} onPress={() => setPhotoSlots((value) => Math.max(0, value - 1))} style={styles.photoAdded}>
                <MaterialCommunityIcons name="image-check-outline" size={25} color={GREEN} />
                <View style={styles.photoRemove}><MaterialCommunityIcons name="close" size={12} color="#FFFFFF" /></View>
              </Pressable>
            ))}
            {photoSlots < 3 ? <Pressable onPress={addPhoto} style={styles.addPhoto}><MaterialCommunityIcons name="camera-plus-outline" size={25} color={GREEN} /><Text style={styles.addPhotoText}>Add photo</Text></Pressable> : null}
          </View>

          <Text style={styles.sectionTitle}>Choose a resolution</Text>
          <View style={styles.resolutionSection}>
            {RESOLUTIONS.map((item, index) => {
              const selected = resolution === item.key;
              return (
                <Pressable key={item.key} onPress={() => setResolution(item.key)} style={[styles.resolutionRow, index > 0 && styles.rowDivider, selected && styles.resolutionSelected]}>
                  <View style={styles.resolutionIcon}><MaterialCommunityIcons name={item.icon} size={21} color={GREEN} /></View>
                  <View style={styles.resolutionCopy}><Text style={styles.resolutionTitle}>{item.title}</Text><Text style={styles.resolutionSubtitle}>{item.subtitle}</Text></View>
                  <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Tell us more</Text>
          <TextInput value={note} onChangeText={setNote} multiline maxLength={400} placeholder="Describe what went wrong (optional)" placeholderTextColor="#98A2B3" style={styles.noteInput} textAlignVertical="top" />

          <View style={styles.reviewCard}>
            <View><Text style={styles.reviewLabel}>{resolution === "REFUND" ? "Estimated refund" : "Replacement value"}</Text><Text style={styles.reviewMeta}>{resolution === "REFUND" ? `To original ${paymentMethod}` : "Subject to product availability"}</Text></View>
            <Text style={styles.reviewAmount}>{money(refundAmount)}</Text>
          </View>
        </ScrollView>
        <View style={[styles.fullActions, { paddingBottom: Math.max(12, insets.bottom) }]}>
          <Pressable disabled={submitting} onPress={submit} style={[styles.submitButton, submitting && styles.disabled]}><Text style={styles.submitText}>{submitting ? "Submitting…" : "Submit report"}</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  const choosingType = step === "type";
  return (
    <View style={styles.sheetRoot}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(13, insets.bottom + 5) }]}>
        <View style={styles.handle} />
        <LinearGradient colors={["#DDEAFF", "#F3F7FF", "#FFFFFF"]} locations={[0, 0.58, 1]} style={styles.sheetHeader}>
          <View style={styles.sheetHeaderCopy}><Text style={styles.sheetTitle}>{choosingType ? "What went wrong?" : "Select affected items"}</Text><Text style={styles.sheetSubtitle}>{choosingType ? "Choose an issue to continue." : "Select every item affected by this issue."}</Text></View>
          <Pressable style={styles.closeButton} onPress={onClose}><MaterialCommunityIcons name="close" size={21} color={INK} /></Pressable>
        </LinearGradient>

        <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
          {choosingType ? (
            <View style={styles.optionSection}>
              {ISSUE_TYPES.map((item, index) => (
                <Pressable key={item.key} onPress={() => { setIssueType(item.key); setStep("items"); }} style={[styles.optionRow, index > 0 && styles.rowDivider]}>
                  <View style={styles.optionIcon}><MaterialCommunityIcons name={item.icon} size={22} color={GREEN} /></View>
                  <View style={styles.optionCopy}><Text style={styles.optionTitle}>{item.title}</Text><Text style={styles.optionSubtitle}>{item.subtitle}</Text></View>
                  <MaterialCommunityIcons name="chevron-right" size={23} color="#8A919C" />
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.optionSection}>
              {normalizedItems.map((item, index) => {
                const selected = selectedIds.has(item.id);
                return (
                  <Pressable key={item.id} onPress={() => toggleItem(item.id)} style={[styles.itemRow, index > 0 && styles.rowDivider]}>
                    <CheckBox selected={selected} />
                    <View style={styles.itemImageWrap}>{imageSource(item.image) ? <Image source={imageSource(item.image)} style={styles.itemImage} resizeMode="contain" /> : <MaterialCommunityIcons name="food-apple-outline" size={25} color={GREEN} />}</View>
                    <View style={styles.itemCopy}><Text numberOfLines={1} style={styles.itemName}>{item.name}</Text><Text style={styles.itemMeta}>{item.quantity} × {item.unit}</Text></View>
                    <Text style={styles.itemPrice}>{money(item.price * item.quantity)}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>

        {!choosingType ? (
          <View style={styles.sheetActions}>
            <Pressable onPress={() => setStep("type")} style={styles.secondaryButton}><Text style={styles.secondaryText}>Back</Text></Pressable>
            <Pressable disabled={!selectedItems.length} onPress={() => setStep("evidence")} style={[styles.primaryButton, !selectedItems.length && styles.disabled]}><Text style={styles.primaryText}>Continue</Text></Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.44)" },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: "80%", minHeight: 390, overflow: "hidden", paddingHorizontal: 14, paddingTop: 8 },
  handle: { alignSelf: "center", backgroundColor: "#CBD0D8", borderRadius: 2, height: 4, marginBottom: 8, width: 42 },
  sheetHeader: { alignItems: "flex-start", borderRadius: 18, flexDirection: "row", marginBottom: 8, padding: 13 },
  sheetHeaderCopy: { flex: 1 },
  sheetTitle: { color: INK, fontFamily: "Inter_600SemiBold", fontSize: 20 },
  sheetSubtitle: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 },
  closeButton: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.82)", borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  sheetScroll: { flexShrink: 1 },
  optionSection: { backgroundColor: "#FFFFFF", borderRadius: 17, overflow: "hidden" },
  optionRow: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 13, flexDirection: "row", minHeight: 65, paddingHorizontal: 9, paddingVertical: 7 },
  optionIcon: { alignItems: "center", backgroundColor: "#EAF7EE", borderRadius: 20, height: 40, justifyContent: "center", marginRight: 11, width: 40 },
  optionCopy: { flex: 1 },
  optionTitle: { color: INK, fontFamily: "Inter_500Medium", fontSize: 14 },
  optionSubtitle: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 3 },
  rowDivider: { borderTopColor: "#E0E3E8", borderTopWidth: 1, borderStyle: "dashed" },
  itemRow: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 13, flexDirection: "row", minHeight: 64, paddingHorizontal: 9, paddingVertical: 7 },
  checkbox: { alignItems: "center", borderColor: "#C5CAD1", borderRadius: 7, borderWidth: 1.5, height: 23, justifyContent: "center", marginRight: 9, width: 23 },
  checkboxSelected: { backgroundColor: GREEN, borderColor: GREEN },
  itemImageWrap: { alignItems: "center", backgroundColor: "#F5F7F6", borderRadius: 9, height: 44, justifyContent: "center", marginRight: 9, width: 44 },
  itemImage: { height: "88%", width: "88%" },
  itemCopy: { flex: 1, minWidth: 0 },
  itemName: { color: INK, fontFamily: "Inter_500Medium", fontSize: 13 },
  itemMeta: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 3 },
  itemPrice: { color: INK, fontFamily: "Inter_600SemiBold", fontSize: 13, marginLeft: 8 },
  sheetActions: { backgroundColor: "#FFFFFF", borderTopColor: DIVIDER, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 10, marginHorizontal: -14, marginTop: 8, paddingHorizontal: 14, paddingTop: 10 },
  secondaryButton: { alignItems: "center", backgroundColor: "#EEF7F0", borderRadius: 13, flex: 1, height: 48, justifyContent: "center" },
  secondaryText: { color: GREEN, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  primaryButton: { alignItems: "center", backgroundColor: GREEN, borderRadius: 13, flex: 1.35, height: 48, justifyContent: "center" },
  primaryText: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  disabled: { opacity: 0.42 },
  fullScreen: { flex: 1, backgroundColor: "#F3F1FA" },
  fullHeader: { alignItems: "center", backgroundColor: "#FFFFFF", borderBottomColor: DIVIDER, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", minHeight: 82, paddingBottom: 9, paddingHorizontal: 14 },
  backButton: { alignItems: "center", height: 40, justifyContent: "center", width: 40 },
  fullHeaderCopy: { flex: 1, marginLeft: 7 },
  fullTitle: { color: INK, fontFamily: "Inter_600SemiBold", fontSize: 19 },
  fullSubtitle: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 3 },
  fullScroll: { flex: 1 },
  fullContent: { gap: 10, padding: 14 },
  issueSummary: { alignItems: "center", borderRadius: 19, flexDirection: "row", padding: 14 },
  issueSummaryIcon: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 21, height: 42, justifyContent: "center", marginRight: 11, width: 42 },
  issueSummaryCopy: { flex: 1 },
  issueSummaryLabel: { color: "#657080", fontFamily: "Inter_500Medium", fontSize: 9, letterSpacing: 0.8 },
  issueSummaryTitle: { color: INK, fontFamily: "Inter_600SemiBold", fontSize: 15, marginTop: 3 },
  sectionTitle: { color: INK, fontFamily: "Inter_600SemiBold", fontSize: 15, marginTop: 4 },
  sectionSubtitle: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16, marginTop: -5 },
  photoRow: { flexDirection: "row", gap: 9 },
  addPhoto: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#B8DCC4", borderRadius: 14, borderStyle: "dashed", borderWidth: 1.2, height: 78, justifyContent: "center", width: 88 },
  addPhotoText: { color: GREEN, fontFamily: "Inter_500Medium", fontSize: 10, marginTop: 5 },
  photoAdded: { alignItems: "center", backgroundColor: "#EAF7EE", borderRadius: 14, height: 78, justifyContent: "center", width: 88 },
  photoRemove: { alignItems: "center", backgroundColor: "#D92D20", borderRadius: 10, height: 20, justifyContent: "center", position: "absolute", right: 5, top: 5, width: 20 },
  resolutionSection: { backgroundColor: "#FFFFFF", borderRadius: 17, overflow: "hidden" },
  resolutionRow: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 13, flexDirection: "row", minHeight: 64, paddingHorizontal: 11 },
  resolutionSelected: { backgroundColor: "#F2FAF4" },
  resolutionIcon: { alignItems: "center", backgroundColor: "#EAF7EE", borderRadius: 18, height: 36, justifyContent: "center", marginRight: 10, width: 36 },
  resolutionCopy: { flex: 1 },
  resolutionTitle: { color: INK, fontFamily: "Inter_500Medium", fontSize: 13 },
  resolutionSubtitle: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 3 },
  radio: { alignItems: "center", borderColor: "#BEC3CA", borderRadius: 10, borderWidth: 1.5, height: 20, justifyContent: "center", width: 20 },
  radioSelected: { borderColor: GREEN },
  radioDot: { backgroundColor: GREEN, borderRadius: 5, height: 10, width: 10 },
  noteInput: { backgroundColor: "#FFFFFF", borderRadius: 15, color: INK, fontFamily: "Inter_400Regular", fontSize: 13, minHeight: 82, padding: 12 },
  reviewCard: { alignItems: "center", backgroundColor: "#F2FAF4", borderRadius: 17, flexDirection: "row", justifyContent: "space-between", padding: 14 },
  reviewLabel: { color: INK, fontFamily: "Inter_500Medium", fontSize: 13 },
  reviewMeta: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 3 },
  reviewAmount: { color: GREEN, fontFamily: "Inter_600SemiBold", fontSize: 21 },
  fullActions: { backgroundColor: "#FFFFFF", borderTopColor: DIVIDER, borderTopWidth: StyleSheet.hairlineWidth, bottom: 0, left: 0, paddingHorizontal: 14, paddingTop: 10, position: "absolute", right: 0 },
  submitButton: { alignItems: "center", backgroundColor: GREEN, borderRadius: 14, height: 50, justifyContent: "center" },
  submitText: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
