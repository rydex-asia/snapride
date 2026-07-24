import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AppIcon from "../../components/AppIcon";
import SimplePageHeader from "../../components/SimplePageHeader";

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
    icon: "briefcase-outline",
    title: "Work",
    address: "H.no 12, Sita Nagar, Maruti Nagar Colony, Gachibowli, Hyderabad, Telangana 500070",
    phone: "9787576765",
  },
];

function PlaceItem({ item, isLast, onEdit, onDelete, onSelect }) {
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        onPress={() => onSelect?.(item)}
        style={({ pressed }) => [styles.placeItem, pressed && styles.itemPressed]}
      >
        <View style={styles.placeIcon}>
          <AppIcon name={item.icon} size={22} color="#202124" />
        </View>

        <View style={styles.placeContent}>
          <View style={styles.titleLine}>
            <Text style={styles.placeTitle}>{item.title}</Text>
            {item.tag ? <Text style={styles.defaultLabel}>{item.tag}</Text> : null}
          </View>
          <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
          <Text style={styles.phone}>+91 {item.phone}</Text>

          <View style={styles.itemActions}>
            <Pressable onPress={() => onEdit(item)} hitSlop={6} style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}>
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
            <Pressable onPress={() => onDelete(item)} hitSlop={6} style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
      {!isLast ? <View style={styles.divider} /> : null}
    </View>
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
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SimplePageHeader title="Saved places" eyebrow={`${places.length} saved`} onBack={onBack} actionLabel="Add" onAction={onAddNewAddress} />

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(28, insets.bottom + 20) }]}
      >
        <Text style={styles.intro}>Choose a saved place to fill pickup or delivery details instantly.</Text>

        <Text style={styles.sectionTitle}>Your places</Text>
        {places.length ? (
          <View style={styles.placeGroup}>
            {places.map((item, index) => (
              <PlaceItem
                key={item.key}
                item={item}
                isLast={index === places.length - 1}
                onEdit={editPlace}
                onDelete={deletePlace}
                onSelect={onSelectPlace}
              />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <AppIcon name="location" size={25} color="#A96700" />
            </View>
            <Text style={styles.emptyTitle}>No saved places</Text>
            <Text style={styles.emptyText}>Add home, work, or another frequent location.</Text>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={onAddNewAddress}
          style={({ pressed }) => [styles.addRow, pressed && styles.itemPressed]}
        >
          <View style={styles.addIcon}>
            <AppIcon name="plus" size={21} color="#8C5900" />
          </View>
          <View style={styles.addCopy}>
            <Text style={styles.addTitle}>Add another place</Text>
            <Text style={styles.addSubtitle}>Save a new address for later</Text>
          </View>
          <AppIcon name="chevronRight" size={20} color="#92959B" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addCopy: { flex: 1, marginLeft: 12 },
  addIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#FFF2CC", alignItems: "center", justifyContent: "center" },
  addRow: {
    marginTop: 14,
    minHeight: 72,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  addSubtitle: { marginTop: 3, color: "#747780", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  addTitle: { color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "600" },
  address: { marginTop: 6, color: "#5F6368", fontSize: 13, lineHeight: 18, fontWeight: "400" },
  content: { paddingHorizontal: 16, paddingTop: 18 },
  defaultLabel: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#FFF2CC",
    color: "#8C5900",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
  },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 72, backgroundColor: "#E2E4E7" },
  editText: { color: "#8C5900", fontSize: 12, lineHeight: 16, fontWeight: "700" },
  empty: { minHeight: 190, borderRadius: 18, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#FFF7E5", alignItems: "center", justifyContent: "center" },
  emptyText: { marginTop: 5, color: "#747780", fontSize: 13, lineHeight: 18, textAlign: "center" },
  emptyTitle: { marginTop: 12, color: "#202124", fontSize: 16, lineHeight: 21, fontWeight: "600" },
  intro: { maxWidth: 330, color: "#656970", fontSize: 14, lineHeight: 20, fontWeight: "400" },
  itemActions: { marginTop: 11, flexDirection: "row", gap: 20 },
  itemPressed: { backgroundColor: "#F7F8F9" },
  phone: { marginTop: 4, color: "#8A8D93", fontSize: 11, lineHeight: 15, fontWeight: "500" },
  placeContent: { flex: 1, minWidth: 0, marginLeft: 12 },
  placeGroup: { borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFFFF" },
  placeIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: "#F0F1F3", alignItems: "center", justifyContent: "center" },
  placeItem: { minHeight: 126, padding: 14, flexDirection: "row", alignItems: "flex-start" },
  placeTitle: { color: "#202124", fontSize: 16, lineHeight: 21, fontWeight: "600" },
  pressed: { opacity: 0.58 },
  removeText: { color: "#B42318", fontSize: 12, lineHeight: 16, fontWeight: "600" },
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#F1F0F5" },
  sectionTitle: { marginTop: 26, marginBottom: 10, color: "#202124", fontSize: 17, lineHeight: 22, fontWeight: "600" },
  textAction: { minHeight: 24, justifyContent: "center" },
  titleLine: { flexDirection: "row", alignItems: "center", gap: 8 },
});
