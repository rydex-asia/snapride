import React from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AccountPageHeader from "../../components/AccountPageHeader";

const FARE_ROWS = [
  { label: "Base fare", value: "₹42" },
  { label: "Distance charge", value: "₹18" },
  { label: "Platform fee", value: "₹4" },
  { label: "Coupon discount", value: "-₹8", discount: true },
  { label: "Taxes", value: "₹4" },
];

export default function FareScreen({ onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8FC" />
      <AccountPageHeader title="Fare breakdown" subtitle="Transparent pricing for your trip" onBack={onBack} />
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.totalCard}>
          <View style={styles.totalIcon}>
            <MaterialCommunityIcons name="cash-fast" size={24} color="#1754E8" />
          </View>
          <View>
            <Text style={styles.totalLabel}>Estimated total</Text>
            <Text style={styles.totalAmount}>₹60</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ride fare</Text>
          {FARE_ROWS.map((row, index) => (
            <View key={row.label}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={[styles.rowValue, row.discount && styles.discount]}>{row.value}</Text>
              </View>
              {index !== FARE_ROWS.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalRowLabel}>Amount payable</Text>
            <Text style={styles.totalRowValue}>₹60</Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <MaterialCommunityIcons name="information-outline" size={20} color="#1754E8" />
          <Text style={styles.noteText}>Final fare may change if route, waiting time, tolls, or stops are updated.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 14, borderRadius: 24, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8EDF5", padding: 16 },
  content: { padding: 16 },
  discount: { color: "#0F9F6E" },
  divider: { height: 1, backgroundColor: "#EEF2F7" },
  noteCard: { marginTop: 14, borderRadius: 20, backgroundColor: "#EEF4FF", padding: 14, flexDirection: "row", gap: 10 },
  noteText: { flex: 1, color: "#344054", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  row: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLabel: { color: "#667085", fontSize: 13, fontWeight: "700" },
  rowValue: { color: "#111827", fontSize: 13, fontWeight: "900" },
  safe: { flex: 1, backgroundColor: "#F6F8FC" },
  screen: { flex: 1, backgroundColor: "#F6F8FC" },
  sectionTitle: { marginBottom: 8, color: "#111827", fontSize: 16, fontWeight: "900" },
  totalAmount: { marginTop: 4, color: "#111827", fontSize: 34, lineHeight: 40, fontWeight: "900" },
  totalCard: { minHeight: 132, borderRadius: 26, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8EDF5", padding: 18, flexDirection: "row", alignItems: "center", gap: 14 },
  totalIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: "#EEF4FF", alignItems: "center", justifyContent: "center" },
  totalLabel: { color: "#667085", fontSize: 13, fontWeight: "700" },
  totalRow: { marginTop: 12, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#111827", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  totalRowLabel: { color: "#111827", fontSize: 15, fontWeight: "900" },
  totalRowValue: { color: "#111827", fontSize: 19, fontWeight: "900" },
});
