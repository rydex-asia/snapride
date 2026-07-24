import React, { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import AppIcon from "../../components/AppIcon";
import { withReadableGroceryTypography } from "./groceryReadableTypography";

const GREEN = "#138A36";
const DEFAULT_COORD = { latitude: 17.3898, longitude: 78.4989 };
const SEARCH_PLACES = [
  { id: "kacheguda", label: "Kacheguda Railway Station", address: "Kacheguda, Hyderabad, Telangana 500027", latitude: 17.3898, longitude: 78.4989 },
  { id: "abids", label: "Abids Main Road", address: "Abids, Hyderabad, Telangana 500001", latitude: 17.393, longitude: 78.473 },
  { id: "himayatnagar", label: "Himayatnagar", address: "Himayatnagar, Hyderabad, Telangana 500029", latitude: 17.4021, longitude: 78.484 },
];

export default function GroceryMapAddressScreen({ currentLocation, savedAddresses = [], onBack, onAddNew, onContinue }) {
  const mapRef = useRef(null);
  const start = currentLocation?.latitude && currentLocation?.longitude ? currentLocation : { ...DEFAULT_COORD, address: "Kacheguda, Hyderabad" };
  const [query, setQuery] = useState("");
  const [pin, setPin] = useState({ latitude: Number(start.latitude), longitude: Number(start.longitude) });
  const [selectedLabel, setSelectedLabel] = useState(start.address || "Selected location");
  const [selectedSource, setSelectedSource] = useState("map");

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const needle = query.trim().toLowerCase();
    return SEARCH_PLACES.filter((item) => `${item.label} ${item.address}`.toLowerCase().includes(needle));
  }, [query]);

  const moveTo = (item, source = "search") => {
    const next = { latitude: Number(item.latitude), longitude: Number(item.longitude) };
    setPin(next);
    setSelectedLabel(item.address || item.label || "Selected location");
    setSelectedSource(source);
    setQuery("");
    mapRef.current?.animateToRegion({ ...next, latitudeDelta: 0.012, longitudeDelta: 0.012 }, 450);
  };

  const normalizedSaved = savedAddresses.slice(0, 3).map((item) => ({
    id: item.id,
    label: `${String(item.label || "other").charAt(0).toUpperCase()}${String(item.label || "other").slice(1)}`,
    address: [item.house, item.addressLine, item.landmark].filter(Boolean).join(", "),
    latitude: Number(item.latitude),
    longitude: Number(item.longitude),
  }));

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.iconButton}><AppIcon name="back" size={23} color="#101828" /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.title}>Select on map</Text><Text style={styles.subtitle}>Place the pin at your delivery entrance</Text></View>
      </View>

      <View style={styles.searchLayer}>
        <View style={styles.searchBar}>
          <AppIcon name="search" size={21} color="#667085" />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search address or landmark" placeholderTextColor="#98A2B3" style={styles.searchInput} />
          {query ? <Pressable onPress={() => setQuery("")} hitSlop={8}><AppIcon name="cancel" size={19} color="#98A2B3" /></Pressable> : null}
        </View>
        {suggestions.length ? (
          <View style={styles.suggestions}>
            {suggestions.map((item) => (
              <Pressable key={item.id} onPress={() => moveTo(item)} style={styles.suggestionRow}>
                <View style={styles.smallIcon}><AppIcon name="location" size={17} color={GREEN} /></View>
                <View style={styles.headerCopy}><Text style={styles.suggestionTitle}>{item.label}</Text><Text numberOfLines={1} style={styles.suggestionText}>{item.address}</Text></View>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{ ...pin, latitudeDelta: 0.012, longitudeDelta: 0.012 }}
          onPress={(event) => {
            setPin(event.nativeEvent.coordinate);
            setSelectedLabel("Pinned location near your selected area");
            setSelectedSource("map");
          }}
        >
          <Marker coordinate={pin} draggable onDragEnd={(event) => { setPin(event.nativeEvent.coordinate); setSelectedLabel("Pinned location near your selected area"); setSelectedSource("map"); }}>
            <View style={styles.marker}><AppIcon name="location" size={28} color="#FFFFFF" /></View>
          </Marker>
        </MapView>
        <Pressable onPress={() => moveTo(start, "current")} style={styles.currentButton}>
          <AppIcon name="crosshairs-gps" size={21} color={GREEN} /><Text style={styles.currentButtonText}>Use current location</Text>
        </Pressable>
      </View>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.selectedRow}>
          <View style={styles.pinIcon}><AppIcon name="location" size={20} color={GREEN} /></View>
          <View style={styles.headerCopy}><Text style={styles.selectedTitle}>{selectedSource === "current" ? "Current location" : "Selected delivery location"}</Text><Text numberOfLines={2} style={styles.selectedAddress}>{selectedLabel}</Text></View>
          <View style={styles.accuracyBadge}><Text style={styles.accuracyText}>PIN SET</Text></View>
        </View>

        {normalizedSaved.length ? (
          <>
            <Text style={styles.savedLabel}>SAVED ADDRESSES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedScroll}>
              {normalizedSaved.map((item) => (
                <Pressable key={item.id} onPress={() => moveTo(item, "saved")} style={styles.savedChip}>
                  <AppIcon name={item.label.toLowerCase() === "home" ? "home" : "location"} size={17} color={GREEN} />
                  <View><Text style={styles.savedTitle}>{item.label}</Text><Text numberOfLines={1} style={styles.savedAddress}>{item.address}</Text></View>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}

        <Pressable onPress={onAddNew} style={styles.addRow}><AppIcon name="plus" size={20} color={GREEN} /><Text style={styles.addText}>Add new address details</Text><AppIcon name="chevronRight" size={20} color={GREEN} /></Pressable>
        <Pressable onPress={() => onContinue?.({ id: "map-pin", label: "Map pin", address: selectedLabel, ...pin })} style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
          <Text style={styles.continueText}>Continue</Text><AppIcon name="forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create(withReadableGroceryTypography({
  accuracyBadge: { backgroundColor: "#E7F5EA", borderRadius: 7, paddingHorizontal: 8, paddingVertical: 5 },
  accuracyText: { color: GREEN, fontSize: 9, fontWeight: "900" },
  addRow: { alignItems: "center", borderTopColor: "#EAECF0", borderTopWidth: 1, flexDirection: "row", gap: 8, marginTop: 13, paddingVertical: 13 },
  addText: { color: GREEN, flex: 1, fontSize: 13, fontWeight: "800" },
  continueButton: { alignItems: "center", backgroundColor: GREEN, borderRadius: 17, flexDirection: "row", gap: 8, height: 53, justifyContent: "center" },
  continueText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  currentButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 15, bottom: 16, elevation: 0, flexDirection: "row", gap: 7, paddingHorizontal: 14, paddingVertical: 11, position: "absolute", right: 16, shadowColor: "#101828", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0, shadowRadius: 12 },
  currentButtonText: { color: GREEN, fontSize: 12, fontWeight: "800" },
  handle: { alignSelf: "center", backgroundColor: "#D0D5DD", borderRadius: 3, height: 4, marginBottom: 13, width: 42 },
  header: { alignItems: "center", flexDirection: "row", paddingHorizontal: 18, paddingBottom: 12, paddingTop: 8 },
  headerCopy: { flex: 1, marginLeft: 12 },
  iconButton: { alignItems: "center", backgroundColor: "#F2F4F7", borderRadius: 14, height: 42, justifyContent: "center", width: 42 },
  mapWrap: { flex: 1, minHeight: 260 },
  marker: { alignItems: "center", backgroundColor: GREEN, borderColor: "#FFFFFF", borderRadius: 24, borderWidth: 3, height: 48, justifyContent: "center", width: 48 },
  pinIcon: { alignItems: "center", backgroundColor: "#E7F5EA", borderRadius: 13, height: 44, justifyContent: "center", width: 44 },
  pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  safe: { backgroundColor: "#FFFFFF", flex: 1 },
  savedAddress: { color: "#667085", fontSize: 10, marginTop: 2, width: 118 },
  savedChip: { alignItems: "center", backgroundColor: "#F8FBF8", borderColor: "#D6EBDC", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 8, paddingHorizontal: 11, paddingVertical: 9 },
  savedLabel: { color: "#667085", fontSize: 10, fontWeight: "900", letterSpacing: 0.7, marginTop: 15 },
  savedScroll: { gap: 8, paddingTop: 9 },
  savedTitle: { color: "#101828", fontSize: 12, fontWeight: "800" },
  searchBar: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, elevation: 0, flexDirection: "row", paddingHorizontal: 14, shadowColor: "#101828", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0, shadowRadius: 12 },
  searchInput: { color: "#101828", flex: 1, fontSize: 14, height: 50, marginLeft: 8 },
  searchLayer: { left: 18, position: "absolute", right: 18, top: 72, zIndex: 5 },
  selectedAddress: { color: "#667085", fontSize: 12, lineHeight: 17, marginTop: 3 },
  selectedRow: { alignItems: "center", flexDirection: "row" },
  selectedTitle: { color: "#101828", fontSize: 14, fontWeight: "900" },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -22, paddingHorizontal: 18, paddingBottom: 8, paddingTop: 10 },
  smallIcon: { alignItems: "center", backgroundColor: "#E7F5EA", borderRadius: 10, height: 34, justifyContent: "center", width: 34 },
  subtitle: { color: "#667085", fontSize: 12, marginTop: 2 },
  suggestionRow: { alignItems: "center", borderBottomColor: "#EAECF0", borderBottomWidth: 1, flexDirection: "row", padding: 12 },
  suggestionText: { color: "#667085", fontSize: 11, marginTop: 2 },
  suggestionTitle: { color: "#101828", fontSize: 13, fontWeight: "800" },
  suggestions: { backgroundColor: "#FFFFFF", borderRadius: 15, elevation: 0, marginTop: 6, overflow: "hidden", shadowColor: "#101828", shadowOpacity: 0, shadowRadius: 12 },
  title: { color: "#101828", fontSize: 19, fontWeight: "900" },
}));
