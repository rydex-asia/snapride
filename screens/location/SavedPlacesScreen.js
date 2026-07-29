import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppIcon from "../../components/AppIcon";
import UnifiedPageHeader from "../../components/UnifiedPageHeader";

const DEFAULT_PLACES = [
  {
    key: "home",
    icon: "home",
    title: "Home",
    tag: "Default",
    address: "H.no 12, Ram Nagar, Madhura Nagar Colony, Gachibowli, Hyderabad, Telangana 500050",
    phone: "987383738",
  },
  {
    key: "work",
    icon: "travel",
    title: "Work",
    address: "H.no 12, Sita Nagar, Maruti Nagar Colony, Gachibowli, Hyderabad, Telangana 500070",
    phone: "9787576765",
  },
];

function PlaceCard({ item, onEdit, onDelete, onSelect }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onSelect?.(item)}
      style={({ pressed }) => [styles.placeCard, pressed && styles.cardPressed]}
    >
      <View style={styles.placeTopRow}>
        <View style={styles.placeIcon}>
          <AppIcon name={item.icon} variant="filled" size={21} color="#2D333B" />
        </View>
        <View style={styles.placeHeading}>
          <View style={styles.titleLine}>
            <Text style={styles.placeTitle}>{item.title}</Text>
            {item.tag ? <Text style={styles.defaultLabel}>{item.tag}</Text> : null}
          </View>
          <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
        </View>
        <AppIcon name="chevronRight" size={19} color="#A0A4AA" />
      </View>

      <View style={styles.placeFooter}>
        <Text style={styles.phone}>+91 {item.phone}</Text>
        <View style={styles.itemActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onEdit(item)}
            hitSlop={7}
            style={({ pressed }) => [styles.actionChip, pressed && styles.pressed]}
          >
            <AppIcon name="settings" size={14} color="#565C65" />
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onDelete(item)}
            hitSlop={7}
            style={({ pressed }) => [styles.actionChip, pressed && styles.pressed]}
          >
            <AppIcon name="cancel" size={14} color="#A63D35" />
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function SavedPlacesScreen({
  onBack,
  onAddNewAddress,
  onEditPlace,
  onDeletePlace,
  onSelectPlace,
  places: providedPlaces,
}) {
  const insets = useSafeAreaInsets();
  const [places, setPlaces] = useState(providedPlaces ?? DEFAULT_PLACES);
  const [headerElevated, setHeaderElevated] = useState(false);

  useEffect(() => {
    if (providedPlaces) setPlaces(providedPlaces);
  }, [providedPlaces]);

  const editPlace = (item) => {
    if (onEditPlace) onEditPlace(item);
    else onAddNewAddress?.(item);
  };

  const deletePlace = (item) => {
    setPlaces((current) => current.filter((place) => place.key !== item.key));
    onDeletePlace?.(item);
  };

  return (
    <View style={styles.safe}>
      <UnifiedPageHeader
        title="Saved places"
        onBack={onBack}
        actionLabel="Add"
        onAction={onAddNewAddress}
        elevated={headerElevated}
        backgroundColor="#FFFFFF"
        largeTitle
      />

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => setHeaderElevated(event.nativeEvent.contentOffset.y > 4)}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(28, insets.bottom + 20) }]}
      >
        <View style={styles.introRow}>
          <View style={styles.introIcon}>
            <AppIcon name="location" variant="filled" size={20} color="#3730A3" />
          </View>
          <View style={styles.introCopy}>
            <Text style={styles.introTitle}>Your frequent places</Text>
            <Text style={styles.introText}>Select one to fill your pickup or delivery address instantly.</Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Saved addresses</Text>
          <Text style={styles.sectionCount}>{places.length}</Text>
        </View>

        {places.length ? (
          <View style={styles.placeList}>
            {places.map((item) => (
              <PlaceCard
                key={item.key}
                item={item}
                onEdit={editPlace}
                onDelete={deletePlace}
                onSelect={onSelectPlace}
              />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <AppIcon name="location" size={25} color="#3730A3" />
            </View>
            <Text style={styles.emptyTitle}>No saved places yet</Text>
            <Text style={styles.emptyText}>Save home, work, or another address you visit often.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onAddNewAddress}
              style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
            >
              <Text style={styles.emptyButtonText}>Add a place</Text>
            </Pressable>
          </View>
        )}

        {places.length ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAddNewAddress}
            style={({ pressed }) => [styles.addRow, pressed && styles.cardPressed]}
          >
            <View style={styles.addIcon}>
              <AppIcon name="plus" size={21} color="#3730A3" />
            </View>
            <View style={styles.addCopy}>
              <Text style={styles.addTitle}>Add another place</Text>
              <Text style={styles.addSubtitle}>Save a new address for future trips</Text>
            </View>
            <AppIcon name="chevronRight" size={20} color="#92959B" />
          </Pressable>
        ) : null}

        <Text style={styles.privacyNote}>
          Saved places are private and only used to make bookings faster.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionChip: { minHeight: 30, paddingHorizontal: 9, borderRadius: 10, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", gap: 5 },
  addCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  addIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  addRow: { marginTop: 16, minHeight: 70, paddingHorizontal: 0, backgroundColor: "transparent", flexDirection: "row", alignItems: "center" },
  addSubtitle: { marginTop: 3, color: "#73777E", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  addTitle: { color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "700" },
  address: { marginTop: 5, color: "#62676F", fontSize: 13, lineHeight: 18, fontWeight: "400" },
  cardPressed: { opacity: 0.75, transform: [{ scale: 0.995 }] },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  defaultLabel: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, overflow: "hidden", backgroundColor: "#EEF2FF", color: "#3730A3", fontSize: 10, lineHeight: 14, fontWeight: "700" },
  editText: { color: "#50565F", fontSize: 11, lineHeight: 15, fontWeight: "700" },
  empty: { minHeight: 260, borderRadius: 22, backgroundColor: "#F7F7F8", alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  emptyButton: { marginTop: 18, minHeight: 42, paddingHorizontal: 18, borderRadius: 14, backgroundColor: "#202124", alignItems: "center", justifyContent: "center" },
  emptyButtonText: { color: "#FFFFFF", fontSize: 13, lineHeight: 17, fontWeight: "700" },
  emptyIcon: { width: 50, height: 50, borderRadius: 17, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  emptyText: { marginTop: 6, maxWidth: 270, color: "#73777E", fontSize: 13, lineHeight: 18, textAlign: "center" },
  emptyTitle: { marginTop: 13, color: "#202124", fontSize: 17, lineHeight: 22, fontWeight: "700" },
  introCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  introIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F5F3FF", alignItems: "center", justifyContent: "center" },
  introRow: { padding: 14, borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 20, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  introText: { marginTop: 3, color: "#73777E", fontSize: 12, lineHeight: 17 },
  introTitle: { color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "700" },
  itemActions: { flexDirection: "row", gap: 7 },
  phone: { flex: 1, color: "#858990", fontSize: 11, lineHeight: 15, fontWeight: "500" },
  placeCard: { paddingVertical: 8, backgroundColor: "transparent" },
  placeFooter: { marginTop: 10, marginLeft: 55, flexDirection: "row", alignItems: "center" },
  placeHeading: { flex: 1, minWidth: 0, marginHorizontal: 11 },
  placeIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  placeList: { gap: 14 },
  placeTitle: { color: "#202124", fontSize: 16, lineHeight: 21, fontWeight: "700" },
  placeTopRow: { flexDirection: "row", alignItems: "flex-start" },
  pressed: { opacity: 0.58 },
  privacyNote: { marginTop: 18, paddingHorizontal: 8, color: "#8A8E94", fontSize: 11, lineHeight: 16, textAlign: "center" },
  removeText: { color: "#A63D35", fontSize: 11, lineHeight: 15, fontWeight: "700" },
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  sectionCount: { minWidth: 26, height: 26, borderRadius: 13, backgroundColor: "#F1F2F4", color: "#5E636B", fontSize: 12, lineHeight: 26, fontWeight: "700", textAlign: "center", overflow: "hidden" },
  sectionHeading: { marginTop: 24, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#202124", fontSize: 17, lineHeight: 22, fontWeight: "700" },
  titleLine: { flexDirection: "row", alignItems: "center", gap: 8 },
});
