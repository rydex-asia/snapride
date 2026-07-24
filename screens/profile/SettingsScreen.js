import React, { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AppIcon from "../../components/AppIcon";
import SimplePageHeader from "../../components/SimplePageHeader";

const NAVIGATION_GROUPS = [
  {
    title: "Account",
    items: [
      { key: "profile", icon: "account-outline", label: "Personal details", value: "Name and phone number" },
      { key: "addresses", icon: "map-marker-outline", label: "Saved places", value: "Home, work and frequent places" },
    ],
  },
  {
    title: "Payments",
    items: [
      { key: "payments", icon: "credit-card-outline", label: "Payment methods", value: "UPI, cards and cash" },
      { key: "transactions", icon: "receipt-text-outline", label: "Transactions", value: "Payments and refunds" },
    ],
  },
];

function NavigationRow({ item, isLast, onPress }) {
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        <View style={styles.rowIcon}>
          <AppIcon name={item.icon} size={21} color="#394150" />
        </View>
        <View style={styles.rowCopy}>
          <Text style={styles.rowLabel}>{item.label}</Text>
          <Text style={styles.rowValue} numberOfLines={1}>{item.value}</Text>
        </View>
        <AppIcon name="chevronRight" size={19} color="#92959B" />
      </Pressable>
      {!isLast ? <View style={styles.divider} /> : null}
    </View>
  );
}

function ToggleRow({ label, description, value, onValueChange, isLast }) {
  return (
    <View>
      <View style={styles.toggleRow}>
        <View style={styles.toggleCopy}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowValue}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#D8DADE", true: "#F2B317" }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#D8DADE"
        />
      </View>
      {!isLast ? <View style={styles.toggleDivider} /> : null}
    </View>
  );
}

export default function SettingsScreen({
  onBack,
  onOpenEditProfile,
  onOpenSavedPlaces,
  onOpenTransactions,
  onOpenPayments,
  onOpenLogout,
}) {
  const insets = useSafeAreaInsets();
  const [rideUpdates, setRideUpdates] = useState(true);
  const [offerUpdates, setOfferUpdates] = useState(false);

  const handleItemPress = (key) => {
    if (key === "profile") return onOpenEditProfile?.();
    if (key === "addresses") return onOpenSavedPlaces?.();
    if (key === "payments") return onOpenPayments?.();
    if (key === "transactions") return onOpenTransactions?.();
    return undefined;
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SimplePageHeader title="Settings" eyebrow="Account and app preferences" onBack={onBack} />

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(34, insets.bottom + 24) }]}
      >
        {NAVIGATION_GROUPS.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            <View style={styles.groupList}>
              {group.items.map((item, index) => (
                <NavigationRow
                  key={item.key}
                  item={item}
                  isLast={index === group.items.length - 1}
                  onPress={() => handleItemPress(item.key)}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.group}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.groupList}>
            <ToggleRow
              label="Ride and delivery updates"
              description="Status changes, arrival and receipts"
              value={rideUpdates}
              onValueChange={setRideUpdates}
            />
            <ToggleRow
              label="Offers and recommendations"
              description="Discounts and personalised suggestions"
              value={offerUpdates}
              onValueChange={setOfferUpdates}
              isLast
            />
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.groupList}>
            <View style={styles.infoRow}>
              <Text style={styles.rowLabel}>Language</Text>
              <Text style={styles.infoValue}>English</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.rowLabel}>Version</Text>
              <Text style={styles.infoValue}>0.1.0</Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onOpenLogout}
          style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
        >
          <AppIcon name="logout" size={20} color="#B42318" />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 4 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 70, backgroundColor: "#E2E4E7" },
  group: { marginTop: 20 },
  groupList: { borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFFFF" },
  infoDivider: { height: StyleSheet.hairlineWidth, marginLeft: 14, backgroundColor: "#E2E4E7" },
  infoRow: { minHeight: 58, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  infoValue: { color: "#747780", fontSize: 13, lineHeight: 17, fontWeight: "500" },
  logout: {
    marginTop: 24,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { color: "#B42318", fontSize: 14, lineHeight: 19, fontWeight: "700" },
  pressed: { opacity: 0.62 },
  row: { minHeight: 74, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
  rowCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  rowIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F0F1F3", alignItems: "center", justifyContent: "center" },
  rowLabel: { color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "600" },
  rowPressed: { backgroundColor: "#F7F8F9" },
  rowValue: { marginTop: 3, color: "#747780", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#F1F0F5" },
  sectionTitle: { marginBottom: 9, color: "#656970", fontSize: 13, lineHeight: 17, fontWeight: "600" },
  toggleCopy: { flex: 1, minWidth: 0, marginRight: 12 },
  toggleDivider: { height: StyleSheet.hairlineWidth, marginLeft: 14, backgroundColor: "#E2E4E7" },
  toggleRow: { minHeight: 76, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
});
