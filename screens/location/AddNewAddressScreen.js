import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppIcon from "../../components/AppIcon";
import UnifiedPageHeader from "../../components/UnifiedPageHeader";

const LABELS = [
  { key: "home", label: "Home", icon: "home" },
  { key: "work", label: "Work", icon: "briefcase-outline" },
  { key: "other", label: "Other", icon: "location" },
];

function AddressField({ label, required, value, onChangeText, placeholder, multiline, last }) {
  return (
    <View style={[styles.field, !last && styles.fieldDivider]}>
      <View style={styles.fieldTop}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={required ? styles.required : styles.optional}>{required ? "Required" : "Optional"}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0A4AA"
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
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
  const [headerBorder, setHeaderBorder] = useState(false);
  const entrance = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.9)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (mapLocation) setAddress(mapLocation);
  }, [mapLocation]);

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 370,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const canSave = Boolean(address.trim() && house.trim() && addressType && !saving);

  const locateMe = () => {
    onLocateMe?.();
    if (!address) setAddress("Current location");
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
      setSaved(true);
      Animated.parallel([
        Animated.timing(successOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(successScale, { toValue: 1, friction: 7, tension: 95, useNativeDriver: true }),
      ]).start(() => setTimeout(() => onSaved?.(), 700));
    } catch (error) {
      setSaveError(error?.message || "Could not save this address. Please try again.");
      setSaving(false);
    }
  };

  return (
    <View style={styles.safe}>
      <UnifiedPageHeader
        title={initialAddress ? "Edit address" : "Add address"}
        onBack={onBack}
        elevated={headerBorder}
        backgroundColor="#FFFFFF"
        largeTitle
      />

      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Animated.ScrollView
          style={styles.screen}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={(event) => setHeaderBorder(event.nativeEvent.contentOffset.y > 4)}
          scrollEventThrottle={16}
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(130, insets.bottom + 114) }]}
        >
          <Animated.View
            style={{
              opacity: entrance,
              transform: [{
                translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
              }],
            }}
          >
            <Text style={styles.introTitle}>Confirm your location</Text>
            <Text style={styles.introText}>A precise address helps your captain or delivery partner find you quickly.</Text>

            <View style={styles.locationSection}>
              <View style={styles.locationMain}>
                <View style={styles.locationIcon}>
                  <AppIcon name="location" active size={22} color="#3730A3" />
                </View>
                <View style={styles.locationCopy}>
                  <Text style={styles.locationLabel}>{address ? "Selected location" : "Location needed"}</Text>
                  <Text style={styles.locationAddress} numberOfLines={3}>
                    {address || "Choose the exact location on the map"}
                  </Text>
                </View>
              </View>
              <View style={styles.locationActions}>
                <Pressable onPress={locateMe} style={({ pressed }) => [styles.locationAction, pressed && styles.pressed]}>
                  <AppIcon name="navigation" size={18} color="#202124" />
                  <Text style={styles.locationActionText}>Use current</Text>
                </Pressable>
                <View style={styles.actionDivider} />
                <Pressable onPress={onSelectOnMap} style={({ pressed }) => [styles.locationAction, pressed && styles.pressed]}>
                  <AppIcon name="map-marker-radius-outline" size={19} color="#202124" />
                  <Text style={styles.locationActionText}>{address ? "Change pin" : "Choose on map"}</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.sectionTitle}>ADDRESS DETAILS</Text>
            <View style={styles.formSection}>
              <AddressField label="Flat, house or floor" required value={house} onChangeText={setHouse} placeholder="Flat 304, Block B" />
              <AddressField label="Nearby landmark" value={landmark} onChangeText={setLandmark} placeholder="Opposite Apollo Pharmacy" />
              <AddressField
                label="Delivery instructions"
                value={instructions}
                onChangeText={setInstructions}
                placeholder="Gate code, floor, or where to leave the order"
                multiline
                last
              />
            </View>

            <Text style={styles.sectionTitle}>SAVE ADDRESS AS</Text>
            <View style={styles.labels}>
              {LABELS.map((item) => {
                const selected = addressType === item.key;
                return (
                  <Pressable
                    key={item.key}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setAddressType(item.key)}
                    style={({ pressed }) => [
                      styles.label,
                      selected && styles.labelSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppIcon name={item.icon} size={18} color={selected ? "#3730A3" : "#656A72"} />
                    <Text style={[styles.labelText, selected && styles.labelTextSelected]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            {!addressType ? <Text style={styles.labelHint}>Select one label to enable saving.</Text> : null}

            <View style={styles.privacy}>
              <AppIcon name="shield" size={18} color="#656A72" />
              <Text style={styles.privacyText}>This address is used only for rides and deliveries you request.</Text>
            </View>
          </Animated.View>
        </Animated.ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(12, insets.bottom + 6) }]}>
          {saveError ? <Text style={styles.error}>{saveError}</Text> : null}
          <Pressable
            disabled={!canSave}
            onPress={saveAddress}
            style={({ pressed }) => [
              styles.saveButton,
              !canSave && styles.saveDisabled,
              pressed && canSave && styles.savePressed,
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
          <Animated.View style={[styles.successPanel, { transform: [{ scale: successScale }] }]}>
            <View style={styles.successIcon}><AppIcon name="verified" active size={32} color="#FFFFFF" /></View>
            <Text style={styles.successTitle}>Address saved</Text>
            <Text style={styles.successText}>Your location is ready to use.</Text>
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  keyboard: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 18, paddingTop: 16 },
  introTitle: { color: "#16191D", fontSize: 20, lineHeight: 26, fontWeight: "700" },
  introText: { marginTop: 6, maxWidth: 345, color: "#66717F", fontSize: 12.5, lineHeight: 17 },
  locationSection: { marginTop: 21, overflow: "hidden", borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 22, backgroundColor: "#FFFFFF" },
  locationMain: { minHeight: 84, padding: 14, flexDirection: "row", alignItems: "center" },
  locationIcon: { width: 44, height: 44, borderWidth: 1, borderColor: "#DCE2E7", borderRadius: 15, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  locationCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  locationLabel: { color: "#878B92", fontSize: 10.5, lineHeight: 14, fontWeight: "600" },
  locationAddress: { marginTop: 4, color: "#20242A", fontSize: 13, lineHeight: 18, fontWeight: "600" },
  locationActions: { height: 47, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E0E2E5", flexDirection: "row", alignItems: "center" },
  locationAction: { flex: 1, height: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  locationActionText: { color: "#30343A", fontSize: 12, lineHeight: 16, fontWeight: "600" },
  actionDivider: { width: StyleSheet.hairlineWidth, height: 23, backgroundColor: "#E0E2E5" },
  sectionTitle: { marginTop: 26, marginBottom: 11, marginLeft: 7, color: "#3730A3", fontSize: 12, lineHeight: 16, fontWeight: "800", letterSpacing: 0.55 },
  formSection: { overflow: "hidden", borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 22, backgroundColor: "#FFFFFF" },
  field: { padding: 16 },
  fieldDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#DEE3E8" },
  fieldTop: { marginBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fieldLabel: { color: "#566270", fontSize: 11, lineHeight: 15, fontWeight: "700" },
  required: { color: "#3730A3", fontSize: 10, lineHeight: 14, fontWeight: "600" },
  optional: { color: "#999DA4", fontSize: 10, lineHeight: 14, fontWeight: "500" },
  input: { height: 47, paddingHorizontal: 13, paddingVertical: 0, borderWidth: 1, borderColor: "#D7DDE3", borderRadius: 14, backgroundColor: "#FFFFFF", color: "#16191D", fontSize: 14, lineHeight: 19, fontWeight: "500" },
  multiline: { minHeight: 78, paddingTop: 12, paddingBottom: 12 },
  labels: { flexDirection: "row", gap: 9 },
  label: { flex: 1, height: 50, borderWidth: 1, borderColor: "#D7DDE3", borderRadius: 15, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  labelSelected: { borderColor: "#3730A3", borderWidth: 1.5 },
  labelText: { color: "#656A72", fontSize: 12, lineHeight: 16, fontWeight: "600" },
  labelTextSelected: { color: "#3730A3" },
  labelHint: { marginTop: 7, color: "#8A8E95", fontSize: 10.5, lineHeight: 15 },
  privacy: { marginTop: 19, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E0E2E5", flexDirection: "row", alignItems: "flex-start" },
  privacyText: { flex: 1, marginLeft: 8, color: "#757A82", fontSize: 11, lineHeight: 16 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E0E2E5", backgroundColor: "#FFFFFF" },
  error: { marginBottom: 7, color: "#B42318", fontSize: 12, lineHeight: 16, textAlign: "center" },
  saveButton: { height: 51, borderRadius: 15, backgroundColor: "#202124", alignItems: "center", justifyContent: "center" },
  saveDisabled: { borderWidth: 1, borderColor: "#D8DBDF", backgroundColor: "#FFFFFF" },
  saveText: { color: "#FFFFFF", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  saveTextDisabled: { color: "#92959B" },
  savePressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  pressed: { opacity: 0.58 },
  successBackdrop: { ...StyleSheet.absoluteFillObject, padding: 28, backgroundColor: "rgba(32,33,36,0.28)", alignItems: "center", justifyContent: "center" },
  successPanel: { width: "100%", paddingHorizontal: 26, paddingVertical: 28, borderRadius: 22, backgroundColor: "#FFFFFF", alignItems: "center" },
  successIcon: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#202124", alignItems: "center", justifyContent: "center" },
  successTitle: { marginTop: 14, color: "#202124", fontSize: 18, lineHeight: 23, fontWeight: "700" },
  successText: { marginTop: 5, color: "#747982", fontSize: 13, lineHeight: 18 },
});
