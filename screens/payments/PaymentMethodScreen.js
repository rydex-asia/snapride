import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppIcon from "../../components/AppIcon";

const METHODS = [
  {
    key: "phonepe",
    group: "Recommended",
    title: "PhonePe UPI",
    subtitle: "rahul@ybl",
    meta: "Instant",
    paymentMode: "upi",
    icon: "alpha-p-circle",
  },
  {
    key: "gpay",
    group: "UPI apps",
    title: "Google Pay",
    subtitle: "Pay with any linked bank",
    paymentMode: "upi",
    icon: "google",
  },
  {
    key: "paytm-upi",
    group: "UPI apps",
    title: "Paytm UPI",
    subtitle: "Pay instantly",
    paymentMode: "upi",
    icon: "qrcode-scan",
  },
  {
    key: "visa",
    group: "Cards",
    title: "Visa card",
    subtitle: "•••• 7970",
    meta: "Saved",
    paymentMode: "card",
    icon: "credit-card-outline",
  },
  {
    key: "new-card",
    group: "Cards",
    title: "Add debit or credit card",
    subtitle: "Visa, Mastercard and RuPay",
    paymentMode: "card",
    icon: "credit-card-plus-outline",
  },
  {
    key: "amazon",
    group: "Wallets & banks",
    title: "Amazon Pay Balance",
    subtitle: "Available balance ₹15.65",
    paymentMode: "wallet",
    icon: "wallet-outline",
  },
  {
    key: "paytm-wallet",
    group: "Wallets & banks",
    title: "Paytm Wallet",
    subtitle: "Linked wallet",
    paymentMode: "wallet",
    icon: "wallet-plus-outline",
  },
  {
    key: "netbanking",
    group: "Wallets & banks",
    title: "Net banking",
    subtitle: "All major banks supported",
    paymentMode: "netbanking",
    icon: "bank-outline",
  },
  {
    key: "cod",
    group: "Other",
    title: "Cash",
    subtitle: "Pay after ride completion",
    paymentMode: "delivery",
    icon: "cash-multiple",
  },
];

const GROUPS = ["Recommended", "UPI apps", "Cards", "Wallets & banks", "Other"];

function PaymentRow({ item, selected, last, onPress }) {
  return (
    <>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.paymentRow,
          selected && styles.paymentRowSelected,
          pressed && styles.rowPressed,
        ]}
      >
        <View style={[styles.methodIcon, selected && styles.methodIconSelected]}>
          <MaterialCommunityIcons
            name={item.icon}
            size={22}
            color={selected ? "#7C4C00" : "#4A4E55"}
          />
        </View>
        <View style={styles.methodCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.methodTitle}>{item.title}</Text>
            {item.meta ? (
              <View style={styles.metaPill}>
                <Text style={styles.metaText}>{item.meta}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.methodSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        </View>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected ? <View style={styles.radioDot} /> : null}
        </View>
      </Pressable>
      {!last ? <View style={styles.divider} /> : null}
    </>
  );
}

export default function PaymentMethodScreen({ amount = "₹200", onBack, onContinue }) {
  const insets = useSafeAreaInsets();
  const [selectedKey, setSelectedKey] = useState("phonepe");
  const formattedAmount = String(amount || "₹200").trim().startsWith("₹")
    ? String(amount || "₹200").trim()
    : `₹${String(amount || "200").replace(/[^0-9.]/g, "") || "200"}`;

  const selectedMethod = useMemo(
    () => METHODS.find((item) => item.key === selectedKey) || METHODS[0],
    [selectedKey]
  );

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="#FFFFFF" />
      <View style={styles.topShell}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            hitSlop={12}
            style={styles.backButton}
          >
            <AppIcon name="back" size={27} color="#25282D" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Payment Options</Text>
            <View style={styles.headerAmountRow}>
              <Text style={styles.headerAmountLabel}>To Pay:</Text>
              <Text style={styles.headerAmount}>{formattedAmount}</Text>
            </View>
          </View>
          <View style={styles.secureBadge}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color="#A96700" />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 112 }]}
      >


        {GROUPS.map((group) => {
          const groupMethods = METHODS.filter((item) => item.group === group);
          return (
            <View key={group} style={styles.section}>
              <Text style={styles.sectionTitle}>{group}</Text>
              <View style={styles.methodGroup}>
                {groupMethods.map((item, index) => (
                  <PaymentRow
                    key={item.key}
                    item={item}
                    selected={selectedKey === item.key}
                    last={index === groupMethods.length - 1}
                    onPress={() => setSelectedKey(item.key)}
                  />
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.footnote}>
          <MaterialCommunityIcons name="information-outline" size={17} color="#7B7E84" />
          <Text style={styles.footnoteText}>
            Availability may vary by ride, parcel or wallet transaction.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 10) + 6 }]}>
        <View style={styles.footerMethod}>
          <View style={styles.footerIcon}>
            <MaterialCommunityIcons name={selectedMethod.icon} size={18} color="#4C5057" />
          </View>
          <View style={styles.footerCopy}>
            <Text style={styles.footerLabel}>Selected</Text>
            <Text style={styles.footerTitle} numberOfLines={1}>{selectedMethod.title}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => onContinue?.({
            paymentMode: selectedMethod.paymentMode,
            provider: selectedMethod.key,
            title: selectedMethod.title,
          })}
          style={({ pressed }) => [styles.continueButton, pressed && styles.continuePressed]}
        >
          <Text style={styles.continueText}>Use method</Text>
          <MaterialCommunityIcons name="arrow-right" size={19} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  topShell: {
    zIndex: 2,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECEEF1",
  },
  header: {
    width: "100%",
    maxWidth: 680,
    minHeight: 96,
    paddingHorizontal: 16,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 45,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerCopy: { flex: 1, justifyContent: "center" },
  headerTitle: {
    fontFamily: "Inter_600SemiBold",
    color: "#20242A",
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.25,
  },
  headerAmountRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  headerAmountLabel: {
    fontFamily: "Inter_400Regular",
    color: "#737986",
    fontSize: 13,
    lineHeight: 17,
  },
  headerAmount: {
    fontFamily: "Inter_600SemiBold",
    color: "#A96700",
    fontSize: 15,
    lineHeight: 19,
  },
  secureBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF4D6",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingHorizontal: 16, paddingTop: 16, backgroundColor: "#F1F0F5" },
  securityCard: {
    minHeight: 72,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: "#FFF8E6",
    flexDirection: "row",
    alignItems: "center",
  },
  securityIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFF0BF",
    alignItems: "center",
    justifyContent: "center",
  },
  securityCopy: { flex: 1, minWidth: 0, marginHorizontal: 11 },
  securityTitle: { color: "#373126", fontSize: 14, lineHeight: 18, fontWeight: "700" },
  securitySubtitle: { marginTop: 3, color: "#766C57", fontSize: 11, lineHeight: 15, fontWeight: "400" },
  section: { marginTop: 21 },
  sectionTitle: { marginBottom: 9, paddingHorizontal: 2, color: "#5E6269", fontSize: 13, lineHeight: 17, fontWeight: "600" },
  methodGroup: { overflow: "hidden", borderRadius: 19, backgroundColor: "#FFFFFF" },
  paymentRow: {
    minHeight: 70,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  paymentRowSelected: { backgroundColor: "#FFFCF4" },
  rowPressed: { opacity: 0.72 },
  methodIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#F1F2F3",
    alignItems: "center",
    justifyContent: "center",
  },
  methodIconSelected: { backgroundColor: "#FFF2CC" },
  methodCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  methodTitle: { color: "#25262A", fontSize: 14, lineHeight: 18, fontWeight: "700" },
  methodSubtitle: { marginTop: 3, color: "#777A80", fontSize: 11, lineHeight: 15, fontWeight: "400" },
  metaPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, backgroundColor: "#F1F2F3" },
  metaText: { color: "#696C72", fontSize: 9, lineHeight: 11, fontWeight: "700" },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#C8CACD",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: "#D89500" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#F5A800" },
  divider: { height: 1, marginLeft: 67, backgroundColor: "#F0F1F2" },
  footnote: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  footnoteText: { flex: 1, color: "#797C82", fontSize: 11, lineHeight: 16, fontWeight: "400" },
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
  footerMethod: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center" },
  footerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F2F3",
    alignItems: "center",
    justifyContent: "center",
  },
  footerCopy: { flex: 1, minWidth: 0, marginLeft: 8 },
  footerLabel: { color: "#85888E", fontSize: 9, lineHeight: 12, fontWeight: "600" },
  footerTitle: { marginTop: 1, color: "#34363A", fontSize: 12, lineHeight: 15, fontWeight: "700" },
  continueButton: {
    minWidth: 148,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#202124",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  continuePressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  continueText: { color: "#FFFFFF", fontSize: 15, lineHeight: 19, fontWeight: "700" },
});
