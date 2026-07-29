import React from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AccountPageHeader from "../../components/AccountPageHeader";

const PAYMENT_ACTIONS = [
  { key: "wallet", icon: "wallet-outline", title: "Wallet", subtitle: "Add money and review balance", accent: "#1754E8" },
  { key: "methods", icon: "credit-card-outline", title: "Payment methods", subtitle: "Cards, UPI and cash", accent: "#0F9D58" },
  { key: "transactions", icon: "receipt-text-outline", title: "Transactions", subtitle: "All trip payments in one place", accent: "#7C3AED" },
  { key: "receipts", icon: "file-document-outline", title: "Receipts", subtitle: "Download or share invoices", accent: "#F97316" },
];

function ActionCard({ item, onPress }) {
  return (
    <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]} onPress={onPress} accessibilityRole="button">
      <View style={[styles.actionIcon, { backgroundColor: `${item.accent}14` }]}>
        <MaterialCommunityIcons name={item.icon} size={22} color={item.accent} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{item.title}</Text>
        <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={21} color="#92959B" />
    </Pressable>
  );
}

function MiniRow({ icon, label, detail }) {
  return (
    <View style={styles.miniRow}>
      <MaterialCommunityIcons name={icon} size={18} color="#1754E8" />
      <View style={styles.miniCopy}>
        <Text style={styles.miniLabel}>{label}</Text>
        <Text style={styles.miniDetail}>{detail}</Text>
      </View>
    </View>
  );
}

export default function PaymentsScreen({
  onBack,
  onOpenWallet,
  onOpenPaymentMethod,
  onOpenTransactions,
  onOpenReceipts,
}) {
  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AccountPageHeader title="Payments" subtitle="Manage how you pay and get paid back" onBack={onBack} />

      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <LinearGradient
            colors={["#EFF4FF", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.heroHeader}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons name="cash-multiple" size={26} color="#1754E8" />
            </View>
            <View style={styles.heroBalanceCopy}>
              <Text style={styles.heroBalanceLabel}>Rydex Wallet</Text>
              <Text style={styles.heroBalance}>₹250 available</Text>
            </View>
          </View>
          <Text style={styles.heroText}>
            Keep your rides, parcel drops and metro bookings moving with quick top-ups and saved payment methods.
          </Text>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Quick actions</Text>
          <View style={styles.actionGrid}>
            {PAYMENT_ACTIONS.map((item) => (
              <ActionCard
                key={item.key}
                item={item}
                onPress={() => {
                  if (item.key === "wallet") return onOpenWallet?.();
                  if (item.key === "methods") return onOpenPaymentMethod?.();
                  if (item.key === "transactions") return onOpenTransactions?.();
                  if (item.key === "receipts") return onOpenReceipts?.();
                  return undefined;
                }}
              />
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <MiniRow icon="shield-check-outline" label="Secure payments" detail="Card and UPI details are masked before checkout." />
          <MiniRow icon="timer-sand" label="Fast refunds" detail="Trip cancellations and fare corrections are tracked automatically." />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    minHeight: 76,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  actionCardPressed: {
    opacity: 0.86
  },
  actionGrid: {
    flexDirection: "column",
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  actionCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  actionSubtitle: {
    marginTop: 3,
    color: "#667085",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500"
  },
  actionTitle: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700"
  },
  content: {
    padding: 16,
    paddingBottom: 28
  },
  heroBalance: {
    color: "#111827",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800"
  },
  heroBalanceCopy: {
    flex: 1
  },
  heroBalanceLabel: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 18,
    overflow: "hidden",
    marginBottom: 16
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1754E8",
    shadowOpacity: 0,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 0
  },
  heroText: {
    marginTop: 12,
    color: "#667085",
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: "500"
  },
  infoCard: {
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    padding: 16
  },
  miniCopy: {
    flex: 1
  },
  miniDetail: {
    marginTop: 2,
    color: "#667085",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "500"
  },
  miniLabel: {
    color: "#111827",
    fontSize: 13.5,
    lineHeight: 17,
    fontWeight: "700"
  },
  miniRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  sectionBlock: {
    marginBottom: 2
  },
  sectionLabel: {
    marginBottom: 8,
    color: "#475467",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  }
});
