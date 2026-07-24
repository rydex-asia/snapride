import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AppIcon from "../../components/AppIcon";
import SimplePageHeader from "../../components/SimplePageHeader";

const LABELS = [
  { key: "home", label: "Home", icon: "home" },
  { key: "work", label: "Work", icon: "briefcase-outline" },
  { key: "other", label: "Other", icon: "location" },
];

function Field({ label, required, value, onChangeText, placeholder, multiline = false, keyboardType }) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeading}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={required ? styles.required : styles.optional}>{required ? "Required" : "Optional"}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9A9DA3"
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? "top" : "center"}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

function AddressLabel({ item, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.labelOption, selected && styles.labelOptionSelected, pressed && styles.pressed]}
    >
      <AppIcon name={item.icon} size={18} color={selected ? "#8C5900" : "#656970"} />
      <Text style={[styles.labelText, selected && styles.labelTextSelected]}>{item.label}</Text>
      {selected ? <AppIcon name="verified" active size={17} color="#A96700" /> : null}
    </Pressable>
  );
}

export default function AddNewAddressScreen({
  onBack,
  onSave,
  onSaved,
  onLocateMe,
  onSelectOnMap,
  mapLocation = "",
  initialAddress,
  defaultRecipientName = "Customer",
  defaultPhone = "9999999999",
}) {
  const insets = useSafeAreaInsets();
  const [address, setAddress] = useState(initialAddress?.addressLine || mapLocation);
  const [house, setHouse] = useState(initialAddress?.house || "");
  const [landmark, setLandmark] = useState(initialAddress?.landmark || "");
  const [addressType, setAddressType] = useState(initialAddress?.label || "");
  const [instructions, setInstructions] = useState(initialAddress?.deliveryInstructions || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const successScale = useRef(new Animated.Value(0.88)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (mapLocation) setAddress(mapLocation);
  }, [mapLocation]);

  const canSave = Boolean(address.trim() && house.trim() && addressType && !saving);

  const locateMe = () => {
    onLocateMe?.();
    if (!address) setAddress("Current location");
  };

  const showSavedConfirmation = () => {
    setSaved(true);
    Animated.parallel([
      Animated.timing(successOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(successScale, { toValue: 1, friction: 7, tension: 95, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => onSaved?.(), 700);
    });
  };

  const saveAddress = async () => {
    if (!canSave) return;
    setSaveError("");
    setSaving(true);
    try {
      await onSave?.({
        address: address.trim(),
        house: house.trim(),
        landmark: landmark.trim(),
        addressType,
        instructions: instructions.trim(),
        name: initialAddress?.recipientName || defaultRecipientName,
        phone: initialAddress?.phone || defaultPhone,
        defaultAddress: Boolean(initialAddress?.isDefault),
      });
      showSavedConfirmation();
    } catch (error) {
      setSaveError(error?.message || "Could not save this address. Please try again.");
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SimplePageHeader
        title={initialAddress ? "Edit address" : "Add address"}
        eyebrow="Delivery details"
        onBack={onBack}
      />

      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={styles.screen}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(126, insets.bottom + 110) }]}
        >
          <Text style={styles.sectionTitle}>Delivery location</Text>
          <View style={styles.locationSection}>
            <View style={styles.locationTop}>
              <View style={styles.locationIcon}>
                <AppIcon name="location" active size={22} color="#A96700" />
              </View>
              <View style={styles.locationCopy}>
                <Text style={styles.locationLabel}>{address ? "Selected address" : "No location selected"}</Text>
                <Text style={styles.locationAddress} numberOfLines={3}>
                  {address || "Choose the exact delivery location on the map"}
                </Text>
              </View>
            </View>

            <View style={styles.locationActions}>
              <Pressable onPress={locateMe} style={({ pressed }) => [styles.locationAction, pressed && styles.pressed]}>
                <AppIcon name="navigation" size={18} color="#202124" />
                <Text style={styles.locationActionText}>Use current</Text>
              </Pressable>
              <Pressable onPress={onSelectOnMap} style={({ pressed }) => [styles.locationAction, pressed && styles.pressed]}>
                <AppIcon name="map-marker-radius-outline" size={19} color="#202124" />
                <Text style={styles.locationActionText}>{address ? "Change on map" : "Select on map"}</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Address details</Text>
          <View style={styles.formSection}>
            <Field
              label="Flat, house or floor"
              required
              value={house}
              onChangeText={setHouse}
              placeholder="Flat 304, Block B"
            />
            <View style={styles.formDivider} />
            <Field
              label="Nearby landmark"
              value={landmark}
              onChangeText={setLandmark}
              placeholder="Opposite Apollo Pharmacy"
            />
          </View>

          <Text style={styles.sectionTitle}>Save as</Text>
          <View style={styles.labelRow}>
            {LABELS.map((item) => (
              <AddressLabel
                key={item.key}
                item={item}
                selected={addressType === item.key}
                onPress={() => setAddressType(item.key)}
              />
            ))}
          </View>
          {!addressType ? <Text style={styles.labelHint}>Choose one label to save this address.</Text> : null}

          <Text style={styles.sectionTitle}>Delivery instructions</Text>
          <View style={styles.formSection}>
            <Field
              label="Notes for your delivery partner"
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Gate code, floor, or where to leave the order"
              multiline
            />
          </View>

          <View style={styles.privacyNote}>
            <AppIcon name="shield" size={18} color="#656970" />
            <Text style={styles.privacyText}>Your address is used only for rides and deliveries you request.</Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(12, insets.bottom + 6) }]}>
          {saveError ? <Text style={styles.error}>{saveError}</Text> : null}
          <Pressable
            disabled={!canSave}
            onPress={saveAddress}
            style={({ pressed }) => [
              styles.saveButton,
              !canSave && styles.saveButtonDisabled,
              pressed && canSave && styles.saveButtonPressed,
            ]}
          >
            <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
              {saving ? "Saving…" : initialAddress ? "Update address" : "Save address"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {saved ? (
        <Animated.View style={[styles.successBackdrop, { opacity: successOpacity }]}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
            <View style={styles.successIcon}>
              <AppIcon name="verified" active size={34} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>Address saved</Text>
            <Text style={styles.successText}>Your delivery location is ready to use.</Text>
          </Animated.View>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 4 },
  error: { marginBottom: 7, color: "#B42318", fontSize: 12, lineHeight: 16, textAlign: "center" },
  field: { padding: 14 },
  fieldHeading: { marginBottom: 9, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fieldLabel: { color: "#303238", fontSize: 13, lineHeight: 17, fontWeight: "600" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, backgroundColor: "#FFFFFF" },
  formDivider: { height: StyleSheet.hairlineWidth, marginLeft: 14, backgroundColor: "#E2E4E7" },
  formSection: { borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFFFF" },
  input: {
    height: 48,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 0,
    backgroundColor: "#F1F2F4",
    color: "#202124",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "400",
  },
  keyboardView: { flex: 1 },
  labelHint: { marginTop: 7, paddingHorizontal: 3, color: "#8A8D93", fontSize: 11, lineHeight: 15 },
  labelOption: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  labelOptionSelected: { backgroundColor: "#FFF2CC" },
  labelRow: { flexDirection: "row", gap: 8 },
  labelText: { color: "#656970", fontSize: 12, lineHeight: 16, fontWeight: "600" },
  labelTextSelected: { color: "#8C5900" },
  locationAction: { flex: 1, height: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  locationActionText: { color: "#303238", fontSize: 12, lineHeight: 16, fontWeight: "600" },
  locationActions: { marginTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E2E4E7", flexDirection: "row" },
  locationAddress: { marginTop: 4, color: "#303238", fontSize: 13, lineHeight: 18, fontWeight: "500" },
  locationCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  locationIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: "#FFF2CC", alignItems: "center", justifyContent: "center" },
  locationLabel: { color: "#8A8D93", fontSize: 11, lineHeight: 15, fontWeight: "500" },
  locationSection: { borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFFFF" },
  locationTop: { minHeight: 88, padding: 14, flexDirection: "row", alignItems: "center" },
  multilineInput: { minHeight: 90, paddingTop: 13, paddingBottom: 13 },
  optional: { color: "#9A9DA3", fontSize: 10, lineHeight: 14, fontWeight: "500" },
  pressed: { opacity: 0.58 },
  privacyNote: { marginTop: 14, paddingHorizontal: 4, flexDirection: "row", alignItems: "flex-start" },
  privacyText: { flex: 1, marginLeft: 8, color: "#747780", fontSize: 11, lineHeight: 16 },
  required: { color: "#8C5900", fontSize: 10, lineHeight: 14, fontWeight: "600" },
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  saveButton: { height: 50, borderRadius: 14, backgroundColor: "#202124", alignItems: "center", justifyContent: "center" },
  saveButtonDisabled: { backgroundColor: "#E1E3E6" },
  saveButtonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  saveText: { color: "#FFFFFF", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  saveTextDisabled: { color: "#92959B" },
  screen: { flex: 1, backgroundColor: "#F1F0F5" },
  sectionTitle: { marginTop: 22, marginBottom: 9, color: "#202124", fontSize: 16, lineHeight: 21, fontWeight: "600" },
  successBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    padding: 28,
    backgroundColor: "rgba(32,33,36,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  successCard: { width: "100%", borderRadius: 22, paddingHorizontal: 26, paddingVertical: 28, backgroundColor: "#FFFFFF", alignItems: "center" },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#202124", alignItems: "center", justifyContent: "center" },
  successText: { marginTop: 5, color: "#747780", fontSize: 13, lineHeight: 18, textAlign: "center" },
  successTitle: { marginTop: 15, color: "#202124", fontSize: 18, lineHeight: 23, fontWeight: "700" },
});
