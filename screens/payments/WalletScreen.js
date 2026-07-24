import React from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SimplePageHeader from "../../components/SimplePageHeader";

function ActionButton({ icon, label, primary = false, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        primary && styles.actionButtonPrimary,
        pressed && styles.pressed,
      ]}
    >
      <MaterialCommunityIcons name={icon} size={20} color={primary ? "#FFFFFF" : "#202124"} />
      <Text style={[styles.actionLabel, primary && styles.actionLabelPrimary]}>{label}</Text>
    </Pressable>
  );
}

export default function WalletScreen({ onBack, onOpenPaymentMethod, onOpenAddMoney, onOpenTransactions }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SimplePageHeader title="Wallet" eyebrow="Balance and payments" onBack={onBack} />

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(32, insets.bottom + 24) }]}
      >
        <View style={styles.balanceSection}>
          <View style={styles.balanceTop}>
            <View>
              <Text style={styles.balanceLabel}>Available balance</Text>
              <Text style={styles.balanceAmount}>₹0</Text>
            </View>
            <View style={styles.walletIcon}>
              <MaterialCommunityIcons name="wallet-outline" size={25} color="#8C5900" />
            </View>
          </View>
          <Text style={styles.balanceNote}>Use your wallet for rides and parcel deliveries.</Text>
        </View>

        <View style={styles.actionRow}>
          <ActionButton
            icon="plus"
            label="Add money"
            primary
            onPress={() => onOpenAddMoney?.("₹200")}
          />
          <ActionButton
            icon="credit-card-outline"
            label="Payment methods"
            onPress={onOpenPaymentMethod}
          />
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Pressable onPress={onOpenTransactions} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onOpenTransactions}
          style={({ pressed }) => [styles.activitySection, pressed && styles.rowPressed]}
        >
          <View style={styles.activityIcon}>
            <MaterialCommunityIcons name="receipt-text-outline" size={22} color="#555960" />
          </View>
          <View style={styles.activityCopy}>
            <Text style={styles.emptyTitle}>No wallet activity yet</Text>
            <Text style={styles.emptyText}>Top-ups and wallet payments will appear here.</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={21} color="#92959B" />
        </Pressable>

        <Text style={styles.sectionTitleStandalone}>Wallet settings</Text>
        <View style={styles.settingsGroup}>
          <Pressable
            accessibilityRole="button"
            onPress={onOpenPaymentMethod}
            style={({ pressed }) => [styles.settingRow, pressed && styles.rowPressed]}
          >
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons name="credit-card-outline" size={21} color="#394150" />
            </View>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Default payment method</Text>
              <Text style={styles.settingDetail}>Cash</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={21} color="#92959B" />
          </Pressable>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons name="shield-check-outline" size={21} color="#394150" />
            </View>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Payment security</Text>
              <Text style={styles.settingDetail}>Protected and encrypted</Text>
            </View>
            <MaterialCommunityIcons name="check-circle" size={20} color="#A96700" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  actionButtonPrimary: { backgroundColor: "#202124" },
  actionLabel: { color: "#202124", fontSize: 13, lineHeight: 17, fontWeight: "700" },
  actionLabelPrimary: { color: "#FFFFFF" },
  actionRow: { marginTop: 12, flexDirection: "row", gap: 10 },
  activityCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  activityIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F0F1F3", alignItems: "center", justifyContent: "center" },
  activitySection: { minHeight: 84, borderRadius: 18, paddingHorizontal: 14, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  balanceAmount: { marginTop: 5, color: "#202124", fontSize: 34, lineHeight: 40, fontWeight: "700" },
  balanceLabel: { color: "#656970", fontSize: 13, lineHeight: 17, fontWeight: "500" },
  balanceNote: { marginTop: 15, color: "#747780", fontSize: 12, lineHeight: 17, fontWeight: "400" },
  balanceSection: { minHeight: 142, borderRadius: 20, padding: 18, backgroundColor: "#FFFFFF", justifyContent: "space-between" },
  balanceTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 70, backgroundColor: "#E2E4E7" },
  emptyText: { marginTop: 4, color: "#747780", fontSize: 12, lineHeight: 17, fontWeight: "400" },
  emptyTitle: { color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "600" },
  pressed: { opacity: 0.65, transform: [{ scale: 0.99 }] },
  rowPressed: { backgroundColor: "#F7F8F9" },
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#F1F0F5" },
  sectionHeading: { marginTop: 25, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#202124", fontSize: 17, lineHeight: 22, fontWeight: "600" },
  sectionTitleStandalone: { marginTop: 25, marginBottom: 10, color: "#202124", fontSize: 17, lineHeight: 22, fontWeight: "600" },
  settingCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  settingDetail: { marginTop: 3, color: "#747780", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  settingIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F0F1F3", alignItems: "center", justifyContent: "center" },
  settingRow: { minHeight: 74, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
  settingTitle: { color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "600" },
  settingsGroup: { borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFFFF" },
  viewAll: { color: "#8C5900", fontSize: 13, lineHeight: 17, fontWeight: "700" },
  walletIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#FFF2CC", alignItems: "center", justifyContent: "center" },
});
