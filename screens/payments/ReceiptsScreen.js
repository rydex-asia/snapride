import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SimplePageHeader from "../../components/SimplePageHeader";

const RECEIPTS = [
  { id: "r1", month: "June 2026", title: "Bike ride to Secunderabad", type: "ride", label: "Ride", date: "Today, 9:24 PM", amount: "₹60", icon: "bike" },
  { id: "r2", month: "June 2026", title: "Parcel delivery", type: "parcel", label: "Parcel", date: "12 Jun, 3:40 PM", amount: "₹89", icon: "package-variant-closed" },
  { id: "r3", month: "June 2026", title: "Metro ticket", type: "ticket", label: "Ticket", date: "10 Jun, 8:15 AM", amount: "₹37", icon: "subway-variant" },
];

const TABS = [
  { key: "all", label: "All" },
  { key: "ride", label: "Rides" },
  { key: "parcel", label: "Parcels" },
  { key: "ticket", label: "Tickets" },
];

function ReceiptItem({ item, isLast }) {
  return (
    <View>
      <Pressable style={({ pressed }) => [styles.receipt, pressed && styles.rowPressed]}>
        <View style={styles.receiptIcon}>
          <MaterialCommunityIcons name={item.icon} size={21} color="#394150" />
        </View>
        <View style={styles.receiptCopy}>
          <Text style={styles.receiptTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.receiptMeta}>{item.label} · {item.date}</Text>
        </View>
        <View style={styles.receiptRight}>
          <Text style={styles.receiptAmount}>{item.amount}</Text>
          <View style={styles.downloadAction}>
            <MaterialCommunityIcons name="download-outline" size={18} color="#555960" />
          </View>
        </View>
      </Pressable>
      {!isLast ? <View style={styles.divider} /> : null}
    </View>
  );
}

export default function ReceiptsScreen({ onBack }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("all");
  const visibleReceipts = useMemo(
    () => activeTab === "all" ? RECEIPTS : RECEIPTS.filter((item) => item.type === activeTab),
    [activeTab],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SimplePageHeader title="Receipts" eyebrow={`${RECEIPTS.length} available`} onBack={onBack} />

      <View style={styles.tabsWrap}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={styles.tab}>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              <View style={[styles.tabIndicator, active && styles.tabIndicatorActive]} />
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(30, insets.bottom + 22) }]}
      >
        <View style={styles.downloadInfo}>
          <MaterialCommunityIcons name="file-download-outline" size={21} color="#8C5900" />
          <Text style={styles.downloadInfoText}>Tap a receipt to view it, or use the download button to save a copy.</Text>
        </View>

        {visibleReceipts.length ? (
          <>
            <Text style={styles.monthTitle}>June 2026</Text>
            <View style={styles.receiptList}>
              {visibleReceipts.map((item, index) => (
                <ReceiptItem key={item.id} item={item} isLast={index === visibleReceipts.length - 1} />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="file-document-outline" size={28} color="#909399" />
            <Text style={styles.emptyTitle}>No receipts yet</Text>
            <Text style={styles.emptyText}>Completed activity will appear here.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 70, backgroundColor: "#E2E4E7" },
  downloadAction: { marginTop: 7, width: 30, height: 30, borderRadius: 10, backgroundColor: "#F0F1F3", alignItems: "center", justifyContent: "center" },
  downloadInfo: { minHeight: 62, paddingHorizontal: 14, borderRadius: 17, backgroundColor: "#FFF7E5", flexDirection: "row", alignItems: "center" },
  downloadInfoText: { flex: 1, marginLeft: 10, color: "#695A3D", fontSize: 12, lineHeight: 17, fontWeight: "500" },
  empty: { minHeight: 220, marginTop: 18, borderRadius: 18, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  emptyText: { marginTop: 4, color: "#747780", fontSize: 12, lineHeight: 17 },
  emptyTitle: { marginTop: 10, color: "#202124", fontSize: 16, lineHeight: 21, fontWeight: "600" },
  monthTitle: { marginTop: 24, marginBottom: 10, color: "#656970", fontSize: 13, lineHeight: 17, fontWeight: "600" },
  receipt: { minHeight: 82, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center" },
  receiptAmount: { color: "#202124", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  receiptCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  receiptIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F0F1F3", alignItems: "center", justifyContent: "center" },
  receiptList: { borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFFFF" },
  receiptMeta: { marginTop: 4, color: "#747780", fontSize: 11, lineHeight: 15, fontWeight: "400" },
  receiptRight: { marginLeft: 10, alignItems: "flex-end" },
  receiptTitle: { color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "600" },
  rowPressed: { backgroundColor: "#F7F8F9" },
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#F1F0F5" },
  tab: { flex: 1, minHeight: 46, alignItems: "center", justifyContent: "flex-end" },
  tabIndicator: { width: 24, height: 3, marginTop: 10, borderRadius: 2, backgroundColor: "transparent" },
  tabIndicatorActive: { backgroundColor: "#202124" },
  tabLabel: { color: "#85888E", fontSize: 13, lineHeight: 17, fontWeight: "600" },
  tabLabelActive: { color: "#202124" },
  tabsWrap: { minHeight: 50, paddingHorizontal: 10, backgroundColor: "#FFFFFF", flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E2E4E7" },
});
