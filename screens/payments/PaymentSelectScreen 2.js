import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GROCERY_TYPOGRAPHY } from "../../theme/typography";

const BLUE = "#138A36";
const GREEN = "#0F8F5F";
const PAGE_BG = "#F7F4EF";
const CARD_BG = "#FFFFFF";
const BORDER = "#ECE6DC";

const SAVED_METHODS = [
  {
    key: "wallet",
    title: "Rydex Wallet",
    subtitle: "Balance available",
    value: "₹850.20",
    icon: "wallet-outline",
    tag: "Fastest",
  },
  {
    key: "upi",
    title: "UPI",
    subtitle: "PhonePe, Paytm, Google Pay",
    value: "Popular",
    icon: "qrcode-scan",
    tag: "No extra fee",
  },
  {
    key: "card",
    title: "Visa card",
    subtitle: "•••• 5678",
    value: "Saved",
    icon: "credit-card-outline",
    tag: "Secure",
  },
];

const OTHER_METHODS = [
  {
    key: "cash",
    title: "Cash",
    subtitle: "Pay after delivery",
    value: "Available",
    icon: "cash-multiple",
    tag: "Offline",
  },
];

function PaymentRow({ item, selected, onPress }) {
  return (
    <Pressable style={({ pressed }) => [styles.paymentRow, selected && styles.paymentRowSelected, pressed && styles.pressed]} onPress={onPress}>
      <View style={[styles.methodIcon, selected && styles.methodIconSelected]}>
        <MaterialCommunityIcons name={item.icon} size={21} color={selected ? BLUE : "#4E5966"} />
      </View>

      <View style={styles.methodCopy}>
        <View style={styles.methodTitleRow}>
          <Text style={styles.methodTitle} numberOfLines={1}>{item.title}</Text>
          {item.tag ? <Text style={styles.methodTag}>{item.tag}</Text> : null}
        </View>
        <Text style={styles.methodSubtitle} numberOfLines={1}>{item.subtitle}</Text>
      </View>

      <View style={styles.methodRight}>
        <Text style={styles.methodValue}>{item.value}</Text>
        <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
          {selected ? <View style={styles.radioInner} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

function PaymentSection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionStack}>{children}</View>
    </View>
  );
}

export default function PaymentSelectScreen({ onBack, onContinue, onAddPaymentMethod }) {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState("wallet");

  const allMethods = useMemo(() => [...SAVED_METHODS, ...OTHER_METHODS], []);
  const selectedOption = useMemo(
    () => allMethods.find((item) => item.key === selectedMethod) || SAVED_METHODS[0],
    [allMethods, selectedMethod]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack} hitSlop={12}>
          <MaterialCommunityIcons name="arrow-left" size={25} color="#2E333A" />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Payment method</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>Choose how you want to pay</Text>
        </View>

        <View style={styles.securePill}>
          <MaterialCommunityIcons name="shield-check-outline" size={15} color={GREEN} />
          <Text style={styles.securePillText}>Secure</Text>
        </View>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 128 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>To pay</Text>
            <Text style={styles.summaryAmount}>₹60</Text>
            <Text style={styles.summaryMeta}>Inclusive of taxes and fees</Text>
          </View>
          <View style={styles.summaryIcon}>
            <MaterialCommunityIcons name="cart-check" size={24} color={GREEN} />
          </View>
        </View>

        <PaymentSection title="Recommended">
          {SAVED_METHODS.map((item) => (
            <PaymentRow
              key={item.key}
              item={item}
              selected={item.key === selectedMethod}
              onPress={() => setSelectedMethod(item.key)}
            />
          ))}
        </PaymentSection>

        <Pressable style={({ pressed }) => [styles.addMethodRow, pressed && styles.pressed]} onPress={onAddPaymentMethod}>
          <View style={styles.addIcon}>
            <MaterialCommunityIcons name="plus" size={20} color={BLUE} />
          </View>
          <View style={styles.methodCopy}>
            <Text style={styles.methodTitle}>Add payment method</Text>
            <Text style={styles.methodSubtitle}>Add UPI, card, or wallet</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#8A9099" />
        </Pressable>

        <PaymentSection title="Other options">
          {OTHER_METHODS.map((item) => (
            <PaymentRow
              key={item.key}
              item={item}
              selected={item.key === selectedMethod}
              onPress={() => setSelectedMethod(item.key)}
            />
          ))}
        </PaymentSection>

        <View style={styles.noteCard}>
          <MaterialCommunityIcons name="lock-outline" size={18} color={GREEN} />
          <Text style={styles.noteText}>Your payment details are encrypted and handled securely.</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.footerMeta}>
          <Text style={styles.footerLabel}>Pay using</Text>
          <Text style={styles.footerValue} numberOfLines={1}>{selectedOption.title}</Text>
        </View>

        <Pressable style={styles.continueButton} onPress={() => onContinue?.(selectedOption)}>
          <Text style={styles.continueText}>Use method</Text>
          <MaterialCommunityIcons name="arrow-right" size={19} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  addMethodRow: {
    minHeight: 66,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 13,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingTop: 12,
  },
  continueButton: {
    minWidth: 150,
    height: 54,
    borderRadius: 27,
    backgroundColor: BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
    letterSpacing: -0.18,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: CARD_BG,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerLabel: {
    color: "#777D86",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
  },
  footerMeta: {
    flex: 1,
    minWidth: 0,
  },
  footerValue: {
    marginTop: 2,
    color: "#2E333A",
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "850",
    letterSpacing: -0.28,
  },
  header: {
    minHeight: 62,
    paddingHorizontal: 14,
    paddingBottom: 8,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
  },
  headerCopy: {
    flex: 1,
    marginLeft: 4,
    marginRight: 10,
  },
  headerSubtitle: {
    marginTop: 2,
    color: "#878D96",
    ...GROCERY_TYPOGRAPHY.caption,
  },
  headerTitle: {
    color: "#151921",
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
    letterSpacing: -0.28,
  },
  methodCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  methodIconSelected: {
    backgroundColor: "#EEF5FF",
  },
  methodRight: {
    marginLeft: 8,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  methodSubtitle: {
    marginTop: 3,
    color: "#69717D",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "600",
  },
  methodTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#E9FFF4",
    color: GREEN,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
  },
  methodTitle: {
    flexShrink: 1,
    color: "#20242A",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "850",
    letterSpacing: -0.12,
  },
  methodTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  methodValue: {
    marginBottom: 7,
    color: "#69717D",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  noteCard: {
    minHeight: 52,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  noteText: {
    flex: 1,
    color: "#5D626B",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  paymentRow: {
    minHeight: 68,
    paddingHorizontal: 13,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
    flexDirection: "row",
    alignItems: "center",
  },
  paymentRowSelected: {
    borderColor: "#B9CDFD",
    backgroundColor: "#FBFDFF",
  },
  pressed: {
    opacity: 0.72,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: BLUE,
  },
  radioOuter: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
    borderWidth: 2,
    borderColor: "#D0D5DD",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: BLUE,
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  section: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  sectionStack: {
    gap: 9,
  },
  sectionTitle: {
    marginBottom: 8,
    color: "#30343A",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  securePill: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#E9FFF4",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  securePillText: {
    color: GREEN,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  summaryAmount: {
    marginTop: 4,
    color: "#151921",
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  summaryCard: {
    minHeight: 104,
    marginHorizontal: 16,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#E9FFF4",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    color: "#69717D",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
  },
  summaryMeta: {
    marginTop: 3,
    color: "#7C828C",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
  },
});
