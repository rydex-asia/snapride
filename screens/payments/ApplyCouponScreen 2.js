import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AccountPageHeader from "../../components/AccountPageHeader";

const COUPONS = [
  {
    key: "best",
    code: "RYDEX8",
    title: "Best price for this booking",
    subtitle: "Save instantly on your current fare.",
    saving: "₹8 off",
    terms: "Applies on eligible rides above ₹50",
    recommended: true,
  },
  {
    key: "weekend",
    code: "WEEKEND20",
    title: "Weekend saver",
    subtitle: "Valid on bike, auto, cab and parcel.",
    saving: "20% off",
    terms: "Maximum discount ₹60",
  },
  {
    key: "wallet",
    code: "WALLET50",
    title: "Wallet cashback",
    subtitle: "Pay using Rydex Wallet after booking.",
    saving: "₹50 cb",
    terms: "Cashback credits within 24 hours",
  },
  {
    key: "bank",
    code: "BANK80",
    title: "Card offer",
    subtitle: "Selected bank credit and debit cards.",
    saving: "₹80 off",
    terms: "Minimum payment ₹399",
  },
];

function CouponCard({ coupon, selected, onApply }) {
  return (
    <View style={styles.couponCard}>
      <View style={styles.ticketCutLeft} />
      <View style={styles.ticketCutRight} />

      <View style={styles.couponTop}>
        <View style={styles.couponCopy}>
          <View style={styles.titleLine}>
            <Text style={styles.couponTitle} numberOfLines={1}>
              {coupon.title}
            </Text>
            {coupon.recommended ? (
              <View style={styles.bestPill}>
              </View>
            ) : null}
          </View>

          <Text style={styles.couponSubtitle} numberOfLines={2}>
            {coupon.subtitle}
          </Text>
        </View>

        <Pressable
          onPress={onApply}
          style={({ pressed }) => [
            styles.cardApplyButton,
            selected && styles.cardApplyButtonActive,
            pressed && styles.pressed,
          ]}
        >
          {selected ? <MaterialCommunityIcons name="check" size={13} color="#FFFFFF" /> : null}
          <Text style={[styles.cardApplyText, selected && styles.cardApplyTextActive]}>
            {selected ? "Applied" : "Apply"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.dashedRule}>
        {Array.from({ length: 26 }).map((_, index) => (
          <View key={index} style={styles.dash} />
        ))}
      </View>

      <View style={styles.couponBottom}>
        <View style={styles.savingBlock}>
          <Text style={styles.saving}>{coupon.saving}</Text>
          <Text style={styles.terms} numberOfLines={1}>
            {coupon.terms}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <View style={styles.codePill}>
            <Text style={styles.codeText}>{coupon.code}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ApplyCouponScreen({ onBack, onContinue, onApplyCoupon }) {
  const insets = useSafeAreaInsets();
  const [couponCode, setCouponCode] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(COUPONS[0]);

  const typedCode = couponCode.trim().toUpperCase();

  const activeCoupon = useMemo(() => {
    if (typedCode) {
      return {
        key: "manual",
        code: typedCode,
        title: `${typedCode} coupon`,
        subtitle: "Manual coupon code",
        saving: "Code added",
        terms: "We will validate this code at checkout",
      };
    }

    return selectedCoupon;
  }, [selectedCoupon, typedCode]);

  const selectCoupon = (coupon) => {
    setCouponCode("");
    setSelectedCoupon(coupon);
    onApplyCoupon?.(coupon);
  };

  const applyTypedCode = () => {
    if (!typedCode) return;
    onApplyCoupon?.(activeCoupon);
  };

  const finishSelection = () => {
    if (typedCode) {
      onApplyCoupon?.(activeCoupon);
    }
    onContinue?.(activeCoupon);
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />

      <AccountPageHeader title="Coupons" subtitle="Choose one saving for this booking" onBack={onBack} />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 126 }]}
        showsVerticalScrollIndicator={false}
      >


        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>Enter coupon code</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="Type code here"
              placeholderTextColor="#9AA1AD"
              autoCapitalize="characters"
              style={styles.input}
            />

            {couponCode ? (
              <Pressable onPress={() => setCouponCode("")} hitSlop={10} style={styles.clearButton}>
                <MaterialCommunityIcons name="close" size={17} color="#667085" />
              </Pressable>
            ) : null}

            <Pressable
              disabled={!typedCode}
              onPress={applyTypedCode}
              style={[styles.applyCodeButton, typedCode && styles.applyCodeButtonActive]}
            >
              <Text style={[styles.applyCodeText, typedCode && styles.applyCodeTextActive]}>
                Apply
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available coupons</Text>
          <Text style={styles.sectionCount}>{COUPONS.length} offers</Text>
        </View>

        <View style={styles.couponList}>
          {COUPONS.map((coupon) => (
            <CouponCard
              key={coupon.key}
              coupon={coupon}
              selected={!typedCode && selectedCoupon?.key === coupon.key}
              onApply={() => selectCoupon(coupon)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <View style={styles.footerCopy}>
          <Text style={styles.footerLabel}>Coupon</Text>
          <Text style={styles.footerValue} numberOfLines={1}>
            {activeCoupon?.code || "No coupon selected"}
          </Text>
        </View>

        <Pressable style={styles.footerButton} onPress={finishSelection}>
          <Text style={styles.footerButtonText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  applyCodeButton: {
    height: 35,
    minWidth: 68,
    borderRadius: 28,
    backgroundColor: "#EAECF0",
    alignItems: "center",
    justifyContent: "center"
  },
  applyCodeButtonActive: {
    backgroundColor: "#007e2cff"
  },
  applyCodeText: {
    color: "#98A2B3",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800"
  },
  applyCodeTextActive: {
    color: "#FFFFFF"
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  cardApplyButton: {
    minWidth: 70,
    height: 31,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#111111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  cardApplyButtonActive: {
    backgroundColor: "#007e2cff",
    borderColor: "#007e2cff"
  },
  cardApplyText: {
    color: "#111111",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900"
  },
  cardApplyTextActive: {
    color: "#FFFFFF"
  },
  clearButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  codePill: {
    height: 32,
    borderRadius: 6,
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  codeText: {
    color: "#111827",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    letterSpacing: 0.6
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16
  },
  couponBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  couponCard: {
    minHeight: 148,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECEFF3",
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 16,
    overflow: "hidden",
    shadowColor: "#101828",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0
  },
  couponCopy: {
    flex: 1,
    minWidth: 0
  },
  couponList: {
    gap: 12
  },
  couponSubtitle: {
    marginTop: 0,
    color: "#667085",
    fontSize: 11,
    lineHeight: 18,
    fontWeight: "500"
  },
  couponTitle: {
    flex: 1,
    color: "#111827",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700"
  },
  couponTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  dash: {
    width: 5,
    height: 1,
    backgroundColor: "#DADDE3"
  },
  dashedRule: {
    marginTop: 19,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(15,23,42,0.08)",
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  footerButton: {
    minWidth: 150,
    height: 45,
    borderRadius: 28,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center"
  },
  footerButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900"
  },
  footerCopy: {
    flex: 1,
    minWidth: 0
  },
  footerLabel: {
    color: "#667085",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600"
  },
  footerValue: {
    marginTop: 2,
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: "#111827",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700"
  },
  inputCard: {
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECEFF3",
    padding: 14
  },
  inputRow: {
    marginTop: 11,
    height: 50,
    borderRadius: 28,
    backgroundColor: "#F8F9FB",
    borderWidth: 1,
    borderColor: "#E7EAF0",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 7
  },
  inputTitle: {
    color: "#1F2937",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800"
  },
  pressed: {
    opacity: 0.72
  },
  safe: {
    flex: 1,
    backgroundColor: "#F7F8FA"
  },
  saving: {
    color: "#111827",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900"
  },
  savingBlock: {
    flex: 1,
    minWidth: 0
  },
  screen: {
    flex: 1,
    backgroundColor: "#f9f9f9ff"
  },
  sectionCount: {
    color: "#7A8290",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800"
  },
  summaryCard: {
    minHeight: 116,
    borderRadius: 18,
    backgroundColor: "#111111",
    padding: 18,
    justifyContent: "center"
  },
  summaryCode: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    letterSpacing: 0.8
  },
  summaryHint: {
    marginTop: 8,
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600"
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  summaryRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12
  },
  summaryValue: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800"
  },
  terms: {
    marginTop: 3,
    color: "#8A93A3",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600"
  },
  ticketCutLeft: {
    position: "absolute",
    left: -11,
    top: 74,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f2f2f2ff"
  },
  ticketCutRight: {
    position: "absolute",
    right: -11,
    top: 74,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f2f2f2ff"
  },
  titleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  }
});
