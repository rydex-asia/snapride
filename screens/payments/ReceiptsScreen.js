import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import UnifiedPageHeader from "../../components/UnifiedPageHeader";

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

function ReceiptCard({ item }) {
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.receiptCard, pressed && styles.rowPressed]}>
      <View style={styles.receiptTop}>
        <View style={styles.receiptIcon}><MaterialCommunityIcons name={item.icon} size={22} color="#3E4652" /></View>
        <View style={styles.receiptCopy}>
          <Text style={styles.receiptTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.receiptMeta}>{item.label} · {item.date}</Text>
        </View>
        <Text style={styles.receiptAmount}>{item.amount}</Text>
      </View>
      <View style={styles.receiptFooter}>
        <View style={styles.paidBadge}>
          <MaterialCommunityIcons name="check-circle" size={15} color="#312E81" />
          <Text style={styles.paidText}>Payment complete</Text>
        </View>
        <View style={styles.downloadButton}>
          <MaterialCommunityIcons name="download-outline" size={17} color="#202124" />
          <Text style={styles.downloadText}>Download</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ReceiptsScreen({ onBack }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("all");
  const [headerElevated, setHeaderElevated] = useState(false);
  const visibleReceipts = useMemo(
    () => activeTab === "all" ? RECEIPTS : RECEIPTS.filter((item) => item.type === activeTab),
    [activeTab],
  );

  return (
    <View style={styles.safe}>
      <UnifiedPageHeader
        title="Receipts"
        onBack={onBack}
        elevated={headerElevated}
        backgroundColor="#FFFFFF"
        largeTitle
      />

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => setHeaderElevated(event.nativeEvent.contentOffset.y > 4)}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(30, insets.bottom + 22) }]}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}><MaterialCommunityIcons name="file-document-check-outline" size={25} color="#3730A3" /></View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>{RECEIPTS.length} receipts available</Text>
            <Text style={styles.summaryText}>Download invoices for completed rides, parcels and tickets.</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tab, active && styles.tabActive]}>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {visibleReceipts.length ? (
          <>
            <View style={styles.monthHeading}>
              <Text style={styles.monthTitle}>June 2026</Text>
              <Text style={styles.monthCount}>{visibleReceipts.length} records</Text>
            </View>
            <View style={styles.receiptList}>
              {visibleReceipts.map((item) => <ReceiptCard key={item.id} item={item} />)}
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><MaterialCommunityIcons name="file-document-outline" size={28} color="#3730A3" /></View>
            <Text style={styles.emptyTitle}>No receipts here</Text>
            <Text style={styles.emptyText}>Completed activity in this category will appear here.</Text>
          </View>
        )}

        <View style={styles.infoStrip}>
          <MaterialCommunityIcons name="information-outline" size={18} color="#777B82" />
          <Text style={styles.infoText}>Receipts are generated after the payment for an activity is completed.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 10 },
  downloadButton: { height: 32, paddingHorizontal: 10, borderRadius: 11, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", gap: 5 },
  downloadText: { color: "#202124", fontSize: 11, lineHeight: 15, fontWeight: "700" },
  empty: { minHeight: 260, marginTop: 18, borderRadius: 21, backgroundColor: "#F7F7F8", alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  emptyIcon: { width: 50, height: 50, borderRadius: 17, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  emptyText: { marginTop: 5, maxWidth: 270, color: "#747780", fontSize: 12, lineHeight: 17, textAlign: "center" },
  emptyTitle: { marginTop: 12, color: "#202124", fontSize: 16, lineHeight: 21, fontWeight: "700" },
  infoStrip: { marginTop: 18, padding: 12, borderRadius: 15, backgroundColor: "#FAFAFA", flexDirection: "row", alignItems: "flex-start", gap: 8 },
  infoText: { flex: 1, color: "#74787F", fontSize: 11, lineHeight: 16 },
  monthCount: { color: "#858990", fontSize: 11, lineHeight: 15, fontWeight: "600" },
  monthHeading: { marginTop: 23, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  monthTitle: { color: "#202124", fontSize: 17, lineHeight: 22, fontWeight: "700" },
  paidBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  paidText: { color: "#312E81", fontSize: 10, lineHeight: 14, fontWeight: "700" },
  receiptAmount: { marginLeft: 10, color: "#202124", fontSize: 16, lineHeight: 21, fontWeight: "800" },
  receiptCard: { padding: 14, borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 19, backgroundColor: "#FFFFFF" },
  receiptCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
  receiptFooter: { marginTop: 13, marginLeft: 53, paddingTop: 11, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E2E4E7", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  receiptIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  receiptList: { gap: 10 },
  receiptMeta: { marginTop: 4, color: "#747780", fontSize: 11, lineHeight: 15 },
  receiptTitle: { color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "700" },
  receiptTop: { flexDirection: "row", alignItems: "center" },
  rowPressed: { opacity: 0.72, transform: [{ scale: 0.995 }] },
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  summaryCard: { minHeight: 92, padding: 14, borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 20, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  summaryCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  summaryIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  summaryText: { marginTop: 4, color: "#716958", fontSize: 11, lineHeight: 16 },
  summaryTitle: { color: "#202124", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  tab: { minWidth: 66, height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: "#F3F4F5", alignItems: "center", justifyContent: "center" },
  tabActive: { backgroundColor: "#202124" },
  tabLabel: { color: "#696E76", fontSize: 12, lineHeight: 16, fontWeight: "700" },
  tabLabelActive: { color: "#FFFFFF" },
  tabs: { paddingTop: 18, paddingBottom: 1, gap: 8 },
});
