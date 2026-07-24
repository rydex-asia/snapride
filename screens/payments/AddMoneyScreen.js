import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SimplePageHeader from "../../components/SimplePageHeader";

const QUICK_AMOUNTS = [100, 200, 500, 1000];

const RECENT_TRANSACTIONS = [
  {
    key: "topup",
    title: "Wallet top-up",
    subtitle: "Yesterday · UPI",
    amount: "+₹500",
    positive: true,
    icon: "wallet-plus-outline",
  },
  {
    key: "ride",
    title: "Bike ride",
    subtitle: "21 Jul · Wallet",
    amount: "−₹60",
    icon: "bike",
  },
  {
    key: "parcel",
    title: "Parcel delivery",
    subtitle: "19 Jul · Wallet",
    amount: "−₹89",
    icon: "package-variant-closed",
  },
];

function TransactionRow({ item, last }) {
  return (
    <>
      <View style={styles.transactionRow}>
        <View style={[styles.transactionIcon, item.positive && styles.transactionIconPositive]}>
          <MaterialCommunityIcons name={item.icon} size={20} color={item.positive ? "#157457" : "#4D5158"} />
        </View>
        <View style={styles.transactionCopy}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionSubtitle}>{item.subtitle}</Text>
        </View>
        <Text style={[styles.transactionAmount, item.positive && styles.transactionAmountPositive]}>
          {item.amount}
        </Text>
      </View>
      {!last ? <View style={styles.softDivider} /> : null}
    </>
  );
}

export default function AddMoneyScreen({ amount, onBack, onPay }) {
  const insets = useSafeAreaInsets();
  const initialAmount = Number(String(amount || "200").replace(/[^0-9]/g, "")) || 200;
  const [selectedAmount, setSelectedAmount] = useState(initialAmount);
  const [customAmount, setCustomAmount] = useState("");

  const payAmount = useMemo(() => {
    const custom = Number(customAmount.replace(/[^0-9]/g, ""));
    return custom > 0 ? custom : selectedAmount;
  }, [customAmount, selectedAmount]);

  const handleCustomAmount = (value) => {
    setCustomAmount(value.replace(/[^0-9]/g, "").slice(0, 5));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SimplePageHeader title="Add money" eyebrow="Rydex Wallet" onBack={onBack} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 116 }]}
        >
          <View style={styles.amountCard}>
            <View style={styles.amountTopRow}>
              <View>
                <Text style={styles.amountEyebrow}>WALLET TOP-UP</Text>
                <Text style={styles.amountHint}>Enter an amount to add</Text>
              </View>
              <View style={styles.walletIcon}>
                <MaterialCommunityIcons name="wallet-plus-outline" size={24} color="#7C4C00" />
              </View>
            </View>

            <View style={styles.amountInputRow}>
              <Text style={styles.rupee}>₹</Text>
              <TextInput
                value={customAmount || String(selectedAmount)}
                onFocus={() => setCustomAmount(String(payAmount))}
                onChangeText={handleCustomAmount}
                keyboardType="number-pad"
                maxLength={5}
                selectionColor="#F5A800"
                style={styles.amountInput}
                accessibilityLabel="Top-up amount"
              />
            </View>

            <View style={styles.amountChips}>
              {QUICK_AMOUNTS.map((value) => {
                const selected = payAmount === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => {
                      setCustomAmount("");
                      setSelectedAmount(value);
                    }}
                    style={({ pressed }) => [
                      styles.amountChip,
                      selected && styles.amountChipSelected,
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text style={[styles.amountChipText, selected && styles.amountChipTextSelected]}>
                      ₹{value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recent transactions</Text>
              <Text style={styles.sectionSubtitle}>Latest activity in your wallet</Text>
            </View>
            <View style={styles.historyPill}>
              <Text style={styles.historyText}>History</Text>
              <MaterialCommunityIcons name="chevron-right" size={15} color="#62666D" />
            </View>
          </View>

          <View style={styles.transactionGroup}>
            {RECENT_TRANSACTIONS.map((item, index) => (
              <TransactionRow
                key={item.key}
                item={item}
                last={index === RECENT_TRANSACTIONS.length - 1}
              />
            ))}
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="shield-check-outline" size={19} color="#A96700" />
            <Text style={styles.infoText}>
              Money is added after your payment is verified. Wallet balance does not expire.
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 10) + 6 }]}>
          <View style={styles.footerAmount}>
            <Text style={styles.footerLabel}>Adding to wallet</Text>
            <Text style={styles.footerAmountText}>₹{payAmount}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={!payAmount}
            onPress={() => onPay?.({ amount: payAmount })}
            style={({ pressed }) => [styles.payButton, pressed && styles.payButtonPressed]}
          >
            <Text style={styles.payButtonText}>Continue</Text>
            <MaterialCommunityIcons name="arrow-right" size={19} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  keyboardView: { flex: 1, backgroundColor: "#F1F0F5" },
  content: { padding: 16 },
  amountCard: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  amountTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  amountEyebrow: { color: "#A96700", fontSize: 10, lineHeight: 13, fontWeight: "800", letterSpacing: 0.7 },
  amountHint: { marginTop: 3, color: "#72757B", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  walletIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF2CC",
    alignItems: "center",
    justifyContent: "center",
  },
  amountInputRow: { marginTop: 13, flexDirection: "row", alignItems: "center" },
  rupee: { color: "#202124", fontSize: 31, lineHeight: 38, fontWeight: "700" },
  amountInput: {
    flex: 1,
    minHeight: 54,
    marginLeft: 6,
    padding: 0,
    color: "#202124",
    fontSize: 42,
    lineHeight: 50,
    fontWeight: "700",
    letterSpacing: -1.3,
  },
  amountChips: { marginTop: 14, flexDirection: "row", gap: 7 },
  amountChip: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F2F3F4",
    alignItems: "center",
    justifyContent: "center",
  },
  amountChipSelected: { backgroundColor: "#FFF2CC" },
  amountChipText: { color: "#555960", fontSize: 12, lineHeight: 16, fontWeight: "700" },
  amountChipTextSelected: { color: "#7C4C00" },
  chipPressed: { opacity: 0.68, transform: [{ scale: 0.97 }] },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionTitle: { color: "#202124", fontSize: 19, lineHeight: 24, fontWeight: "700" },
  sectionSubtitle: { marginTop: 2, color: "#74777D", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  historyPill: {
    height: 28,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: "#ECEDEF",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  historyText: { color: "#62666D", fontSize: 10, lineHeight: 13, fontWeight: "700" },
  transactionGroup: { overflow: "hidden", borderRadius: 19, backgroundColor: "#FFFFFF" },
  transactionRow: {
    minHeight: 70,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#F1F2F3",
    alignItems: "center",
    justifyContent: "center",
  },
  transactionIconPositive: { backgroundColor: "#E7F5EF" },
  transactionCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
  transactionTitle: { color: "#25262A", fontSize: 14, lineHeight: 18, fontWeight: "700" },
  transactionSubtitle: { marginTop: 3, color: "#777A80", fontSize: 11, lineHeight: 15, fontWeight: "400" },
  transactionAmount: { marginLeft: 10, color: "#313338", fontSize: 14, lineHeight: 18, fontWeight: "700" },
  transactionAmountPositive: { color: "#157457" },
  softDivider: { height: 1, marginLeft: 67, backgroundColor: "#F0F1F2" },
  infoRow: {
    marginTop: 13,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: "#FFF9EA",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  infoText: { flex: 1, color: "#6C5A2D", fontSize: 11, lineHeight: 16, fontWeight: "500" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  footerAmount: { flex: 1, minWidth: 0 },
  footerLabel: { color: "#85888E", fontSize: 9, lineHeight: 12, fontWeight: "600" },
  footerAmountText: { marginTop: 2, color: "#202124", fontSize: 18, lineHeight: 22, fontWeight: "700" },
  payButton: {
    minWidth: 166,
    height: 52,
    paddingHorizontal: 17,
    borderRadius: 16,
    backgroundColor: "#202124",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  payButtonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  payButtonText: { color: "#FFFFFF", fontSize: 15, lineHeight: 19, fontWeight: "700" },
});
