import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppIcon from "../../components/AppIcon";
import { withReadableGroceryTypography } from "./groceryReadableTypography";

const GREEN = "#138A36";

const LANDMARKS = [
  { id: "kacheguda", label: "Kacheguda Railway Station", address: "Kacheguda, Hyderabad, Telangana 500027", latitude: 17.3898, longitude: 78.4989 },
  { id: "abids", label: "Abids", address: "Abids Main Road, Hyderabad, Telangana 500001", latitude: 17.393, longitude: 78.473 },
  { id: "himayatnagar", label: "Himayatnagar", address: "Himayatnagar, Hyderabad, Telangana 500029", latitude: 17.4021, longitude: 78.484 },
];

function SelectionDot({ selected }) {
  return <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioInner} /> : null}</View>;
}

function AddressRow({ item, selected, icon = "location", onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.addressRow, selected && styles.addressRowSelected, pressed && styles.pressed]}>
      <View style={[styles.addressIcon, selected && styles.addressIconSelected]}>
        <AppIcon name={icon} size={19} color={selected ? GREEN : "#667085"} />
      </View>
      <View style={styles.addressCopy}>
        <View style={styles.addressTitleLine}>
          <Text numberOfLines={1} style={styles.addressTitle}>{item.label}</Text>
          {item.isDefault ? <Text style={styles.defaultBadge}>DEFAULT</Text> : null}
        </View>
        <Text numberOfLines={2} style={styles.addressText}>{item.address}</Text>
      </View>
      <SelectionDot selected={selected} />
    </Pressable>
  );
}

export default function GroceryAddressSelectionScreen({
  currentLocation,
  savedAddresses = [],
  initialSelection,
  deliveryEta = "6 mins",
  onBack,
  onSelectMap,
  onAddNew,
  onContinue,
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(initialSelection || currentLocation || null);

  const normalizedSaved = useMemo(() => savedAddresses.map((item) => ({
    id: item.id,
    label: `${String(item.label || "other").charAt(0).toUpperCase()}${String(item.label || "other").slice(1)}`,
    address: [item.house, item.addressLine, item.landmark].filter(Boolean).join(", "),
    latitude: Number(item.latitude),
    longitude: Number(item.longitude),
    isDefault: Boolean(item.isDefault),
    raw: item,
  })), [savedAddresses]);

  const matches = (item) => !query.trim() || `${item.label} ${item.address}`.toLowerCase().includes(query.trim().toLowerCase());
  const saved = normalizedSaved.filter(matches);
  const landmarks = LANDMARKS.filter(matches);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.iconButton}><AppIcon name="back" size={23} color="#101828" /></Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Choose delivery address</Text>
          <Text style={styles.headerSubtitle}>Fresh groceries, right to your doorstep</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <AppIcon name="search" size={21} color="#667085" />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search area, street or landmark" placeholderTextColor="#98A2B3" style={styles.searchInput} />
        {query ? <Pressable onPress={() => setQuery("")} hitSlop={8}><AppIcon name="cancel" size={19} color="#98A2B3" /></Pressable> : null}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {currentLocation && matches(currentLocation) ? (
          <>
            <Text style={styles.sectionLabel}>CURRENT LOCATION</Text>
            <Pressable onPress={() => setSelected(currentLocation)} style={({ pressed }) => [styles.currentCard, pressed && styles.pressed]}>
              <View style={styles.currentIcon}><AppIcon name="navigation" size={22} color="#FFFFFF" /></View>
              <View style={styles.addressCopy}>
                <Text style={styles.currentTitle}>Use current location</Text>
                <Text numberOfLines={2} style={styles.addressText}>{currentLocation.address}</Text>
                <Text style={styles.accuracyText}>Accurate to your current delivery pin</Text>
              </View>
              <SelectionDot selected={selected?.id === currentLocation.id} />
            </Pressable>
            <Pressable onPress={onSelectMap} style={styles.mapButton}>
              <AppIcon name="map-marker-radius-outline" size={20} color={GREEN} />
              <Text style={styles.mapButtonText}>Select exact location on map</Text>
              <AppIcon name="chevronRight" size={20} color={GREEN} />
            </Pressable>
          </>
        ) : null}

        <View style={styles.sectionHeader}><Text style={styles.sectionLabel}>SAVED ADDRESSES</Text><Text style={styles.sectionCount}>{normalizedSaved.length} saved</Text></View>
        {saved.length ? saved.map((item) => (
          <AddressRow key={item.id} item={item} selected={selected?.id === item.id} icon={item.raw?.label === "home" ? "home" : item.raw?.label === "work" ? "briefcase-outline" : "location"} onPress={() => setSelected(item)} />
        )) : <Text style={styles.emptyText}>No saved addresses match your search.</Text>}

        <Pressable onPress={onAddNew} style={styles.addAddressButton}>
          <View style={styles.addIcon}><AppIcon name="plus" size={20} color={GREEN} /></View>
          <View style={styles.addressCopy}><Text style={styles.addTitle}>Add new address</Text><Text style={styles.addSubtitle}>Save house details and delivery instructions</Text></View>
          <AppIcon name="chevronRight" size={20} color="#667085" />
        </Pressable>

        <View style={styles.sectionHeader}><Text style={styles.sectionLabel}>NEARBY LANDMARKS</Text></View>
        {landmarks.map((item) => <AddressRow key={item.id} item={item} selected={selected?.id === item.id} onPress={() => setSelected(item)} />)}

        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryInfoIcon}><AppIcon name="clock" size={20} color={GREEN} /></View>
          <View style={styles.addressCopy}><Text style={styles.deliveryInfoTitle}>Delivery in {deliveryEta}</Text><Text style={styles.deliveryInfoText}>Final availability and ETA are checked for the selected pin.</Text></View>
          <AppIcon name="shield" size={20} color={GREEN} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable disabled={!selected} onPress={() => onContinue?.(selected)} style={({ pressed }) => [styles.continueButton, !selected && styles.continueDisabled, pressed && styles.continuePressed]}>
          <Text style={styles.continueText}>Continue with this address</Text><AppIcon name="forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create(withReadableGroceryTypography({
  accuracyText: { color: GREEN, fontSize: 11, fontWeight: "700", marginTop: 5 },
  addAddressButton: { alignItems: "center", backgroundColor: "#F8FBF8", borderColor: "#CFE8D5", borderRadius: 18, borderStyle: "dashed", borderWidth: 1.2, flexDirection: "row", marginTop: 10, padding: 14 },
  addIcon: { alignItems: "center", backgroundColor: "#E7F5EA", borderRadius: 12, height: 42, justifyContent: "center", marginRight: 12, width: 42 },
  addSubtitle: { color: "#667085", fontSize: 12, marginTop: 3 },
  addTitle: { color: GREEN, fontSize: 14, fontWeight: "800" },
  addressCopy: { flex: 1 },
  addressIcon: { alignItems: "center", backgroundColor: "#F2F4F7", borderRadius: 12, height: 42, justifyContent: "center", marginRight: 12, width: 42 },
  addressIconSelected: { backgroundColor: "#E7F5EA" },
  addressRow: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#EAECF0", borderRadius: 18, borderWidth: 1, flexDirection: "row", marginBottom: 10, padding: 13 },
  addressRowSelected: { backgroundColor: "#F8FCF9", borderColor: GREEN },
  addressText: { color: "#667085", fontSize: 12, lineHeight: 17, marginTop: 4 },
  addressTitle: { color: "#101828", flexShrink: 1, fontSize: 14, fontWeight: "800" },
  addressTitleLine: { alignItems: "center", flexDirection: "row", gap: 8 },
  content: { paddingBottom: 24, paddingHorizontal: 18 },
  continueButton: { alignItems: "center", backgroundColor: GREEN, borderRadius: 17, flexDirection: "row", height: 54, justifyContent: "center", gap: 9 },
  continueDisabled: { backgroundColor: "#A7CDB0" },
  continuePressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  continueText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  currentCard: { alignItems: "center", backgroundColor: "#F7FCF8", borderColor: "#B7DFC1", borderRadius: 20, borderWidth: 1, flexDirection: "row", padding: 15 },
  currentIcon: { alignItems: "center", backgroundColor: GREEN, borderRadius: 14, height: 46, justifyContent: "center", marginRight: 12, width: 46 },
  currentTitle: { color: "#101828", fontSize: 15, fontWeight: "800" },
  defaultBadge: { backgroundColor: "#E7F5EA", borderRadius: 6, color: GREEN, fontSize: 9, fontWeight: "900", overflow: "hidden", paddingHorizontal: 7, paddingVertical: 3 },
  deliveryInfo: { alignItems: "center", backgroundColor: "#F0F9F2", borderRadius: 18, flexDirection: "row", marginTop: 10, padding: 14 },
  deliveryInfoIcon: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, height: 40, justifyContent: "center", marginRight: 11, width: 40 },
  deliveryInfoText: { color: "#667085", fontSize: 11, lineHeight: 16, marginTop: 3 },
  deliveryInfoTitle: { color: "#101828", fontSize: 13, fontWeight: "800" },
  emptyText: { color: "#98A2B3", fontSize: 12, marginBottom: 12 },
  footer: { backgroundColor: "#FFFFFF", borderTopColor: "#EAECF0", borderTopWidth: 1, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 10 },
  header: { alignItems: "center", flexDirection: "row", paddingHorizontal: 18, paddingBottom: 14, paddingTop: 8 },
  headerCopy: { flex: 1, marginLeft: 12 },
  headerSubtitle: { color: "#667085", fontSize: 12, marginTop: 2 },
  headerTitle: { color: "#101828", fontSize: 19, fontWeight: "900" },
  iconButton: { alignItems: "center", backgroundColor: "#F2F4F7", borderRadius: 14, height: 42, justifyContent: "center", width: 42 },
  mapButton: { alignItems: "center", borderBottomColor: "#EAECF0", borderBottomWidth: 1, flexDirection: "row", gap: 8, marginBottom: 5, paddingHorizontal: 6, paddingVertical: 14 },
  mapButtonText: { color: GREEN, flex: 1, fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.78 },
  radio: { alignItems: "center", borderColor: "#D0D5DD", borderRadius: 11, borderWidth: 1.5, height: 22, justifyContent: "center", marginLeft: 10, width: 22 },
  radioInner: { backgroundColor: "#FFFFFF", borderRadius: 4, height: 8, width: 8 },
  radioSelected: { backgroundColor: GREEN, borderColor: GREEN },
  safe: { backgroundColor: "#FFFFFF", flex: 1 },
  searchBar: { alignItems: "center", backgroundColor: "#F4F6F8", borderRadius: 16, flexDirection: "row", marginBottom: 14, marginHorizontal: 18, paddingHorizontal: 14 },
  searchInput: { color: "#101828", flex: 1, fontSize: 14, height: 50, marginLeft: 8 },
  sectionCount: { color: "#98A2B3", fontSize: 11, fontWeight: "700" },
  sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  sectionLabel: { color: "#667085", fontSize: 11, fontWeight: "900", letterSpacing: 0.8, marginBottom: 10, marginTop: 18 },
}));
