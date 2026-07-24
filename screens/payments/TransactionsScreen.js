import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SimplePageHeader from "../../components/SimplePageHeader";

const TRANSACTIONS = [
  { id: "t1", group: "Today", title: "Bike ride", detail: "Ride payment", time: "9:24 PM", amount: -60, state: "Paid", icon: "bike", kind: "payment" },
  { id: "t2", group: "Yesterday", title: "Wallet top-up", detail: "Rydex wallet", time: "6:12 PM", amount: 500, state: "Successful", icon: "wallet-plus-outline", kind: "credit" },
  { id: "t3", group: "Earlier", title: "Parcel delivery", detail: "12 Jun · Delivery payment", time: "3:40 PM", amount: -89, state: "Paid", icon: "package-variant-closed", kind: "payment" },
  { id: "t4", group: "Earlier", title: "Refund processed", detail: "10 Jun · Original payment method", time: "1:10 PM", amount: 42, state: "Refunded", icon: "cash-refund", kind: "refund" },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "payment", label: "Payments" },
  { key: "credit", label: "Money added" },
  { key: "refund", label: "Refunds" },
];

function TransactionItem({ item, isLast }) {
  const positive = item.amount > 0;
  return (
    <View>
      <Pressable style={({ pressed }) => [styles.transaction, pressed && styles.rowPressed]}>
        <View style={[styles.transactionIcon, positive && styles.positiveIcon]}>
          <MaterialCommunityIcons name={item.icon} size={21} color={positive ? "#157457" : "#394150"} />
        </View>
        <View style={styles.transactionCopy}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionDetail} numberOfLines={1}>{item.detail}</Text>
          <Text style={styles.transactionState}>{item.time} · {item.state}</Text>
        </View>
        <Text style={[styles.amount, positive && styles.amountPositive]}>
          {positive ? "+" : "−"}₹{Math.abs(item.amount)}
        </Text>
      </Pressable>
      {!isLast ? <View style={styles.divider} /> : null}
    </View>
  );
}

export default function TransactionsScreen({ onBack }) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("all");

  const groups = useMemo(() => {
    const filtered = filter === "all" ? TRANSACTIONS : TRANSACTIONS.filter((item) => item.kind === filter);
    return filtered.reduce((result, item) => {
      const group = result.find((entry) => entry.title === item.group);
      if (group) group.data.push(item);
      else result.push({ title: item.group, data: [item] });
      return result;
    }, []);
  }, [filter]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SimplePageHeader title="Transactions" eyebrow="June 2026" onBack={onBack} />

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(30, insets.bottom + 22) }]}
      >
        <View style={styles.monthSummary}>
          <View>
            <Text style={styles.summaryLabel}>Spent this month</Text>
            <Text style={styles.summaryAmount}>₹149</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.moneyIn}>+₹542</Text>
            <Text style={styles.summaryCaption}>money received</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((item) => {
            const active = filter === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={({ pressed }) => [styles.filter, active && styles.filterActive, pressed && styles.pressed]}
              >
                <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {groups.length ? groups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupList}>
              {group.data.map((item, index) => (
                <TransactionItem key={item.id} item={item} isLast={index === group.data.length - 1} />
              ))}
            </View>
          </View>
        )) : (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="receipt-text-outline" size={28} color="#909399" />
            <Text style={styles.emptyTitle}>No transactions</Text>
            <Text style={styles.emptyText}>There are no records in this category.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  amount: { marginLeft: 10, color: "#202124", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  amountPositive: { color: "#157457" },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 70, backgroundColor: "#E2E4E7" },
  empty: { minHeight: 210, marginTop: 26, borderRadius: 18, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  emptyText: { marginTop: 4, color: "#747780", fontSize: 12, lineHeight: 17 },
  emptyTitle: { marginTop: 10, color: "#202124", fontSize: 16, lineHeight: 21, fontWeight: "600" },
  filter: { height: 38, paddingHorizontal: 16, borderRadius: 19, backgroundColor: "#E8E9EB", alignItems: "center", justifyContent: "center" },
  filterActive: { backgroundColor: "#202124" },
  filterLabel: { color: "#60636A", fontSize: 13, lineHeight: 17, fontWeight: "600" },
  filterLabelActive: { color: "#FFFFFF" },
  filters: { paddingVertical: 16, gap: 8 },
  group: { marginTop: 10 },
  groupList: { borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFFFF" },
  groupTitle: { marginBottom: 9, color: "#656970", fontSize: 13, lineHeight: 17, fontWeight: "600" },
  moneyIn: { color: "#157457", fontSize: 16, lineHeight: 21, fontWeight: "700" },
  monthSummary: {
    minHeight: 104,
    paddingHorizontal: 18,
    paddingVertical: 17,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  positiveIcon: { backgroundColor: "#E7F5EF" },
  pressed: { opacity: 0.62 },
  rowPressed: { backgroundColor: "#F7F8F9" },
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#F1F0F5" },
  summaryAmount: { marginTop: 5, color: "#202124", fontSize: 30, lineHeight: 35, fontWeight: "700" },
  summaryCaption: { marginTop: 2, color: "#747780", fontSize: 11, lineHeight: 15 },
  summaryLabel: { color: "#656970", fontSize: 13, lineHeight: 17, fontWeight: "500" },
  summaryRight: { alignItems: "flex-end" },
  transaction: { minHeight: 86, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center" },
  transactionCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  transactionDetail: { marginTop: 3, color: "#656970", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  transactionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F0F1F3", alignItems: "center", justifyContent: "center" },
  transactionState: { marginTop: 4, color: "#8A8D93", fontSize: 11, lineHeight: 15, fontWeight: "400" },
  transactionTitle: { color: "#202124", fontSize: 15, lineHeight: 20, fontWeight: "600" },
});
