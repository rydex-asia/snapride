import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const PRIMARY = "#4F46E5";
const LAST_PAYMENT_METHOD_KEY = "@rydex/last-payment-method";

const PAYMENT_OPTIONS = [
  { key: "phonepe", group: "upi", title: "PhonePe UPI", subtitle: "Pay securely with UPI", icon: "alpha-p-circle", value: "UPI" },
  { key: "gpay", group: "upi", title: "Google Pay", subtitle: "Pay using your linked UPI account", icon: "google", value: "UPI" },
  { key: "paytm", group: "upi", title: "Paytm UPI", subtitle: "Fast UPI payment", icon: "wallet-outline", value: "UPI" },
  { key: "amazon-upi", group: "upi", title: "Amazon Pay UPI", subtitle: "Pay from Amazon Pay", icon: "alpha-a-circle", value: "UPI" },
  { key: "card", group: "cards", title: "Credit or debit card", subtitle: "Visa, Mastercard and RuPay", icon: "credit-card-outline", value: "Card" },
  { key: "wallet", group: "wallets", title: "Rydex Wallet", subtitle: "Use your wallet balance", icon: "wallet-outline", value: "Wallet" },
  { key: "amazon-wallet", group: "wallets", title: "Amazon Pay Balance", subtitle: "Use your available balance", icon: "alpha-a-circle", value: "Wallet" },
  { key: "netbanking", group: "banking", title: "Netbanking", subtitle: "All major banks supported", icon: "bank-outline", value: "Netbanking" },
  { key: "cash", group: "later", title: "Cash", subtitle: "Pay after your trip", icon: "cash", value: "Cash" },
];

const PAYMENT_GROUPS = [
  { key: "upi", title: "UPI apps" },
  { key: "cards", title: "Cards" },
  { key: "wallets", title: "Wallets" },
  { key: "banking", title: "Netbanking" },
  { key: "later", title: "Pay after trip" },
];

const COUPONS = [
  { key: "best", code: "RYDEX8", title: "Best price for this booking", saving: "₹8 off", terms: "Eligible rides above ₹50" },
  { key: "weekend", code: "WEEKEND20", title: "Weekend saver", saving: "20% off", terms: "Maximum discount ₹60" },
  { key: "wallet", code: "WALLET50", title: "Wallet cashback", saving: "₹50 cashback", terms: "Credits within 24 hours" },
  { key: "bank", code: "BANK80", title: "Card offer", saving: "₹80 off", terms: "Minimum payment ₹399" },
];

function Radio({ selected }) {
  return (
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected ? <View style={styles.radioDot} /> : null}
    </View>
  );
}

export default function BookingOptionBottomSheet({
  visible,
  type = "payment",
  amount = "",
  selectedPaymentLabel = "",
  selectedCouponCode = "",
  onClose,
  onSelectPayment,
  onApplyCoupon,
}) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const paymentTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const paymentOpacity = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [payment, setPayment] = useState(PAYMENT_OPTIONS[0]);
  const [coupon, setCoupon] = useState(COUPONS[0]);
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    const explicitPayment = PAYMENT_OPTIONS.find((item) =>
      selectedPaymentLabel.toLowerCase().includes(item.title.toLowerCase().split(" ")[0])
    );
    if (explicitPayment) return undefined;

    let active = true;
    AsyncStorage.getItem(LAST_PAYMENT_METHOD_KEY)
      .then((storedKey) => {
        if (!active || !storedKey) return;
        const storedPayment = PAYMENT_OPTIONS.find((item) => item.key === storedKey);
        if (storedPayment) setPayment(storedPayment);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [selectedPaymentLabel]);

  useEffect(() => {
    if (!visible) return;
    const normalizedPayment = PAYMENT_OPTIONS.find((item) =>
      selectedPaymentLabel.toLowerCase().includes(item.title.toLowerCase().split(" ")[0])
    );
    const normalizedCoupon = COUPONS.find((item) => item.code === selectedCouponCode);
    if (normalizedPayment) setPayment(normalizedPayment);
    if (normalizedCoupon) setCoupon(normalizedCoupon);
    if (type === "payment") {
      translateY.setValue(0);
      backdropOpacity.setValue(0);
      paymentTranslateY.setValue(SCREEN_HEIGHT);
      paymentOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(paymentOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(paymentTranslateY, {
          toValue: 0,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return undefined;
    }
    translateY.setValue(SCREEN_HEIGHT);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, paymentOpacity, paymentTranslateY, selectedCouponCode, selectedPaymentLabel, translateY, type, visible]);

  const typedCoupon = couponCode.trim().toUpperCase();
  const activeCoupon = useMemo(() => typedCoupon
    ? { key: "manual", code: typedCoupon, title: "Coupon code", saving: "Code added", terms: "Validated before booking" }
    : coupon, [coupon, typedCoupon]);

  const dismiss = () => {
    translateY.stopAnimation();
    paymentTranslateY.stopAnimation();
    paymentOpacity.stopAnimation();
    backdropOpacity.stopAnimation();
    onClose?.();
  };

  const confirm = () => {
    if (type === "payment") onSelectPayment?.(payment);
    else onApplyCoupon?.(activeCoupon);
    dismiss();
  };

  const selectPaymentAndClose = (option) => {
    setPayment(option);
    AsyncStorage.setItem(LAST_PAYMENT_METHOD_KEY, option.key).catch(() => {});
    paymentTranslateY.stopAnimation();
    paymentOpacity.stopAnimation();
    onSelectPayment?.(option);
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent={type !== "payment"} animationType="none" statusBarTranslucent onRequestClose={dismiss}>
      <KeyboardAvoidingView style={[styles.modalRoot, type === "payment" && styles.paymentModalRoot]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {type !== "payment" ? (
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
          </Animated.View>
        ) : null}

        <Animated.View
          style={[
            styles.sheet,
            type === "payment" && styles.paymentSheet,
            type === "payment" ? {
              paddingTop: type === "payment" ? Math.max(insets.top, 10) : 0,
              paddingBottom: Math.max(insets.bottom, 12),
              opacity: paymentOpacity,
              transform: [{ translateY: paymentTranslateY }],
            } : {
              paddingTop: 0,
              paddingBottom: Math.max(insets.bottom, 12),
              transform: [{ translateY }],
            },
          ]}
        >
          {type !== "payment" ? <View style={styles.handle} /> : null}
          <View style={[styles.header, type === "payment" && styles.paymentHeader]}>
            {type === "payment" ? (
              <Pressable style={styles.backButton} onPress={dismiss} hitSlop={8}>
                <MaterialCommunityIcons name="arrow-left" size={25} color="#1B2027" />
              </Pressable>
            ) : null}
            <View style={styles.headerCopy}>
              <Text style={styles.title}>{type === "payment" ? "Choose payment method" : "Apply a coupon"}</Text>
              <Text style={styles.subtitle}>
                {type === "payment" ? `Select how you want to pay${amount ? ` ${amount}` : ""}` : "Choose the best saving for this booking"}
              </Text>
            </View>
            {type !== "payment" ? (
              <Pressable style={styles.closeButton} onPress={dismiss} hitSlop={8}>
                <MaterialCommunityIcons name="close" size={21} color="#22262D" />
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            style={type === "payment" ? styles.paymentScroll : styles.couponScroll}
            contentContainerStyle={[styles.content, type === "payment" && styles.paymentContent]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {type === "payment" ? (
              <View style={styles.paymentGroups}>
                {PAYMENT_GROUPS.map((group) => {
                  const options = PAYMENT_OPTIONS.filter((item) => item.group === group.key);
                  return (
                    <View key={group.key} style={styles.paymentGroup}>
                      <View style={styles.paymentGroupHeader}>
                        <Text style={styles.paymentGroupTitle}>{group.title}</Text>
                      </View>
                      <View style={styles.sectionCard}>
                        {options.map((item, index) => {
                          const selected = payment.key === item.key;
                          return (
                            <React.Fragment key={item.key}>
                              <Pressable style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]} onPress={() => selectPaymentAndClose(item)}>
                                <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
                                  <MaterialCommunityIcons name={item.icon} size={23} color={selected ? PRIMARY : "#3E4651"} />
                                </View>
                                <View style={styles.optionCopy}>
                                  <Text style={styles.optionTitle}>{item.title}</Text>
                                  <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                                </View>
                                <Radio selected={selected} />
                              </Pressable>
                              {index < options.length - 1 ? <View style={styles.softDivider} /> : null}
                            </React.Fragment>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <>
                <View style={styles.codeCard}>
                  <TextInput
                    value={couponCode}
                    onChangeText={setCouponCode}
                    placeholder="Enter coupon code"
                    placeholderTextColor="#949AA4"
                    autoCapitalize="characters"
                    style={styles.codeInput}
                  />
                  {couponCode ? (
                    <Pressable onPress={() => setCouponCode("")} hitSlop={8}>
                      <MaterialCommunityIcons name="close-circle" size={19} color="#9298A1" />
                    </Pressable>
                  ) : null}
                  <Text style={[styles.codeApply, !typedCoupon && styles.codeApplyDisabled]}>Apply</Text>
                </View>

                <Text style={styles.sectionLabel}>Available coupons</Text>
                <View style={styles.couponList}>
                  {COUPONS.map((item) => {
                    const selected = !typedCoupon && coupon.key === item.key;
                    return (
                      <Pressable
                        key={item.key}
                        style={({ pressed }) => [styles.couponCard, selected && styles.couponCardSelected, pressed && styles.pressed]}
                        onPress={() => { setCouponCode(""); setCoupon(item); }}
                      >
                        <View style={styles.couponTopRow}>
                          <View style={styles.codePill}><Text style={styles.codeText}>{item.code}</Text></View>
                          <View style={[styles.applyButton, selected && styles.applyButtonActive]}>
                            {selected ? <MaterialCommunityIcons name="check" size={13} color="#FFFFFF" /> : null}
                            <Text style={[styles.applyButtonText, selected && styles.applyButtonTextActive]}>{selected ? "Applied" : "Apply"}</Text>
                          </View>
                        </View>
                        <Text style={styles.couponTitle}>{item.title}</Text>
                        <View style={styles.couponDivider} />
                        <View style={styles.couponMetaRow}>
                          <Text style={styles.couponSaving}>{item.saving}</Text>
                          <Text style={styles.couponTerms}>{item.terms}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>

          {type !== "payment" ? (
            <View style={styles.footer}>
              <Pressable style={({ pressed }) => [styles.confirmButton, pressed && styles.confirmPressed]} onPress={confirm}>
                <Text style={styles.confirmText}>{`Apply coupon  •  ${activeCoupon.code}`}</Text>
              </Pressable>
            </View>
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  paymentModalRoot: { backgroundColor: "#FFFFFF" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(13,18,24,0.46)" },
  sheet: { maxHeight: "82%", minHeight: 410, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: "#FFFFFF", overflow: "hidden" },
  paymentSheet: { width: "100%", height: "100%", maxHeight: "100%", borderTopLeftRadius: 0, borderTopRightRadius: 0, backgroundColor: "#FFFFFF" },
  handle: { width: 42, height: 4, marginTop: 9, marginBottom: 5, borderRadius: 999, backgroundColor: "#C9CED6", alignSelf: "center" },
  header: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 14, flexDirection: "row", alignItems: "flex-start" },
  paymentHeader: { paddingTop: 14, alignItems: "center" },
  backButton: { width: 38, height: 38, marginRight: 10, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { color: "#101318", fontSize: 21, lineHeight: 27, fontWeight: "800", letterSpacing: -0.35 },
  subtitle: { marginTop: 3, color: "#68707C", fontSize: 13, lineHeight: 18, fontWeight: "500" },
  closeButton: { width: 34, height: 34, marginLeft: 12, borderRadius: 17, backgroundColor: "#EAEDF1", alignItems: "center", justifyContent: "center" },
  couponScroll: { flexGrow: 0, backgroundColor: "#FFFFFF" },
  paymentScroll: { flex: 1, minHeight: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 18, paddingBottom: 20 },
  paymentContent: { flexGrow: 0, paddingTop: 6, paddingBottom: 32, backgroundColor: "#FFFFFF" },
  sectionCard: { borderRadius: 18, backgroundColor: "#FFFFFF", overflow: "hidden" },
  paymentGroups: { gap: 20 },
  paymentGroup: { gap: 10 },
  paymentGroupHeader: { paddingHorizontal: 3 },
  paymentGroupTitle: { color: "#20242B", fontSize: 15, lineHeight: 20, fontWeight: "800" },
  optionRow: { minHeight: 70, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center" },
  iconBox: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#F0F2F5", alignItems: "center", justifyContent: "center" },
  iconBoxSelected: { backgroundColor: "#EAF7EE" },
  optionCopy: { flex: 1, minWidth: 0, marginHorizontal: 12 },
  optionTitle: { color: "#15191F", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  optionSubtitle: { marginTop: 2, color: "#737B87", fontSize: 12.5, lineHeight: 17, fontWeight: "500" },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: "#BCC2CB", alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: PRIMARY },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: PRIMARY },
  softDivider: { height: 0, marginLeft: 68, marginRight: 14, borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#DCE3EC" },
  codeCard: { height: 54, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  codeInput: { flex: 1, color: "#15191F", fontSize: 15, lineHeight: 20, fontWeight: "600" },
  codeApply: { marginLeft: 12, color: PRIMARY, fontSize: 14, lineHeight: 18, fontWeight: "800" },
  codeApplyDisabled: { color: "#B3B7BE" },
  sectionLabel: { marginTop: 18, marginBottom: 10, marginLeft: 3, color: "#20242B", fontSize: 16, lineHeight: 21, fontWeight: "800" },
  couponList: { gap: 10 },
  couponCard: { padding: 14, borderRadius: 17, backgroundColor: "#FFFFFF" },
  couponCardSelected: { backgroundColor: "#F0FAF3" },
  couponTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  applyButton: { minWidth: 65, height: 31, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#EAF2EC", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  applyButtonActive: { backgroundColor: PRIMARY },
  applyButtonText: { color: PRIMARY, fontSize: 11.5, lineHeight: 15, fontWeight: "800" },
  applyButtonTextActive: { color: "#FFFFFF" },
  codePill: { paddingHorizontal: 10, height: 28, borderRadius: 8, backgroundColor: "#EEF1F4", alignItems: "center", justifyContent: "center" },
  codeText: { color: "#1B2129", fontSize: 12, lineHeight: 16, fontWeight: "900", letterSpacing: 0.4 },
  couponTitle: { marginTop: 10, color: "#161A20", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  couponDivider: { height: 0, marginTop: 10, borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#DCE3EC" },
  couponMetaRow: { marginTop: 5, flexDirection: "row", alignItems: "center", gap: 8 },
  couponSaving: { color: PRIMARY, fontSize: 13, lineHeight: 18, fontWeight: "800" },
  couponTerms: { flex: 1, color: "#7A818C", fontSize: 12, lineHeight: 16, fontWeight: "500" },
  footer: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 8, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#ECEFF2" },
  confirmButton: { minHeight: 52, paddingHorizontal: 18, borderRadius: 14, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center" },
  confirmPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  confirmText: { color: "#FFFFFF", fontSize: 15, lineHeight: 20, fontWeight: "800", textAlign: "center" },
  pressed: { opacity: 0.72 },
});
