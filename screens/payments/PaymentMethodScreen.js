import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppIcon from "../../components/AppIcon";

const METHODS = [
  { key: "phonepe", group: "Recommended", title: "PhonePe UPI", subtitle: "rahul@ybl", meta: "Instant", paymentMode: "upi", icon: "alpha-p-circle" },
  { key: "gpay", group: "UPI apps", title: "Google Pay", subtitle: "Pay with any linked bank", paymentMode: "upi", icon: "google" },
  { key: "paytm-upi", group: "UPI apps", title: "Paytm UPI", subtitle: "Pay instantly", paymentMode: "upi", icon: "qrcode-scan" },
  { key: "visa", group: "Cards", title: "Visa card", subtitle: "•••• 7970", meta: "Saved", paymentMode: "card", icon: "credit-card-outline" },
  { key: "new-card", group: "Cards", title: "Add debit or credit card", subtitle: "Visa, Mastercard and RuPay", paymentMode: "card", icon: "credit-card-plus-outline" },
  { key: "amazon", group: "Wallets & banks", title: "Amazon Pay Balance", subtitle: "Available balance ₹15.65", paymentMode: "wallet", icon: "wallet-outline" },
  { key: "paytm-wallet", group: "Wallets & banks", title: "Paytm Wallet", subtitle: "Linked wallet", paymentMode: "wallet", icon: "wallet-plus-outline" },
  { key: "netbanking", group: "Wallets & banks", title: "Net banking", subtitle: "All major banks supported", paymentMode: "netbanking", icon: "bank-outline" },
  { key: "cod", group: "Other", title: "Cash", subtitle: "Pay after ride completion", paymentMode: "delivery", icon: "cash-multiple" },
];

const GROUPS = ["Recommended", "UPI apps", "Cards", "Wallets & banks", "Other"];

function PaymentRow({ item, selected, last, amount, onPress, onPay }) {
  const selectionAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(selectionAnim, {
      toValue: selected ? 1 : 0,
      duration: selected ? 280 : 210,
      easing: selected ? Easing.out(Easing.cubic) : Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [selected, selectionAnim]);

  return (
    <>
      <View style={selected && styles.selectedMethodWrap}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ selected }}
          onPress={onPress}
          style={({ pressed }) => [styles.paymentRow, selected && styles.paymentRowSelected, pressed && styles.rowPressed]}
        >
          <Animated.View
            style={[
              styles.methodIcon,
              selected && styles.methodIconSelected,
              {
                transform: [{
                  scale: selectionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.06],
                  }),
                }],
              },
            ]}
          >
            <MaterialCommunityIcons name={item.icon} size={22} color={selected ? "#795100" : "#4A5059"} />
          </Animated.View>
          <View style={styles.methodCopy}>
            <View style={styles.titleRow}>
              <Text style={styles.methodTitle}>{item.title}</Text>
              {item.meta ? <Text style={styles.metaText}>{item.meta}</Text> : null}
            </View>
            <Text style={styles.methodSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          </View>
          <View style={[styles.radio, selected && styles.radioSelected]}>
            {selected ? <View style={styles.radioDot} /> : null}
          </View>
        </Pressable>
        <Animated.View
          pointerEvents={selected ? "auto" : "none"}
          style={{
            height: selectionAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }),
            opacity: selectionAnim,
            overflow: "hidden",
            transform: [{
              translateY: selectionAnim.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }),
            }],
          }}
        >
          <Pressable
            accessibilityRole="button"
            onPress={onPay}
            style={({ pressed }) => [styles.inlinePayButton, pressed && styles.continuePressed]}
          >
            <Text style={styles.inlinePayText}>Pay {amount}</Text>
            <MaterialCommunityIcons name="arrow-right" size={19} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      </View>
      {!last ? <View style={styles.divider} /> : null}
    </>
  );
}

export default function PaymentMethodScreen({ amount = "₹200", onBack, onContinue }) {
  const insets = useSafeAreaInsets();
  const [selectedKey, setSelectedKey] = useState("phonepe");
  const [headerElevated, setHeaderElevated] = useState(false);
  const pageAnim = useRef(new Animated.Value(0)).current;
  const formattedAmount = String(amount || "₹200").trim().startsWith("₹")
    ? String(amount || "₹200").trim()
    : `₹${String(amount || "200").replace(/[^0-9.]/g, "") || "200"}`;

  useEffect(() => {
    pageAnim.setValue(0);
    Animated.timing(pageAnim, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [pageAnim]);
  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <Animated.View
        style={[
          styles.header,
          headerElevated && styles.headerElevated,
          { paddingTop: insets.top },
          {
            opacity: pageAnim,
            transform: [{
              translateY: pageAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }),
            }],
          },
        ]}
      >
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} hitSlop={12} style={styles.backButton}>
          <AppIcon name="back" size={24} color="#202124" />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Payment options</Text>
          <View style={styles.headerAmountRow}>
            <Text style={styles.headerSubtitle}>Amount to pay</Text>
            <Text style={styles.headerAmount}>{formattedAmount}</Text>
          </View>
        </View>
        <View style={styles.secureBadge}>
          <MaterialCommunityIcons name="shield-check-outline" size={17} color="#312E81" />
          <Text style={styles.secureText}>Secure</Text>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={[
          styles.screen,
          {
            opacity: pageAnim,
            transform: [{
              translateY: pageAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
            }],
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => setHeaderElevated(event.nativeEvent.contentOffset.y > 4)}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 24, 34) }]}
        contentInsetAdjustmentBehavior="never"
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
                    amount={formattedAmount}
                    onPress={() => setSelectedKey(item.key)}
                    onPay={() => {
                      setSelectedKey(item.key);
                      onContinue?.({
                        paymentMode: item.paymentMode,
                        provider: item.key,
                        title: item.title,
                      });
                    }}
                  />
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.footnote}>
          <MaterialCommunityIcons name="information-outline" size={18} color="#777B82" />
          <Text style={styles.footnoteText}>Available options can vary by ride, parcel, or wallet transaction.</Text>
        </View>
      </Animated.ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#F3F4F5", alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  continuePressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 68, marginRight: 13, backgroundColor: "#E3E5E7" },
  footnote: { marginTop: 20, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 15, backgroundColor: "#F8F8F9", flexDirection: "row", alignItems: "flex-start", gap: 8 },
  footnoteText: { flex: 1, color: "#74787F", fontSize: 11, lineHeight: 16 },
  header: { minHeight: 90, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", zIndex: 30 },
  headerElevated: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#DCE1E7", shadowColor: "#17202B", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.11, shadowRadius: 11, elevation: 7 },
  headerAmount: { color: "#3730A3", fontSize: 14, lineHeight: 18, fontWeight: "800" },
  headerAmountRow: { marginTop: 3, flexDirection: "row", alignItems: "center", gap: 6 },
  headerCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  headerSubtitle: { color: "#777B82", fontSize: 11, lineHeight: 15 },
  headerTitle: { color: "#202124", fontSize: 20, lineHeight: 25, fontWeight: "700", letterSpacing: -0.3 },
  inlinePayButton: { height: 48, marginHorizontal: 12, marginBottom: 12, borderRadius: 15, backgroundColor: "#202124", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  inlinePayText: { color: "#FFFFFF", fontSize: 14, lineHeight: 18, fontWeight: "800" },
  metaText: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7, overflow: "hidden", backgroundColor: "#ECEEF0", color: "#656A72", fontSize: 9, lineHeight: 13, fontWeight: "700" },
  methodCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
  methodGroup: { overflow: "hidden", borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 19, backgroundColor: "#FFFFFF" },
  methodIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  methodIconSelected: { backgroundColor: "#E0E7FF" },
  methodSubtitle: { marginTop: 3, color: "#777B82", fontSize: 11, lineHeight: 15 },
  methodTitle: { color: "#25272B", fontSize: 14, lineHeight: 18, fontWeight: "700" },
  paymentRow: { minHeight: 70, paddingHorizontal: 13, paddingVertical: 10, flexDirection: "row", alignItems: "center" },
  paymentRowSelected: { backgroundColor: "#F5F3FF" },
  radio: { width: 21, height: 21, borderRadius: 11, borderWidth: 1.5, borderColor: "#C6C9CE", alignItems: "center", justifyContent: "center" },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#202124" },
  radioSelected: { borderColor: "#202124" },
  rowPressed: { opacity: 0.72 },
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  selectedMethodWrap: { backgroundColor: "#F5F3FF" },
  section: { marginTop: 22 },
  sectionTitle: { marginBottom: 9, paddingHorizontal: 2, color: "#3F4349", fontSize: 14, lineHeight: 18, fontWeight: "700" },
  secureBadge: { height: 34, paddingHorizontal: 10, borderRadius: 17, backgroundColor: "#EEF2FF", flexDirection: "row", alignItems: "center", gap: 5 },
  secureText: { color: "#312E81", fontSize: 10, lineHeight: 14, fontWeight: "700" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
});
