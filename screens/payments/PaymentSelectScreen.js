import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BLUE = "#138A36";
const GREEN = "#27851A";
const PAGE_BG = "#F5F5FA";
const CARD_BG = "#FFFFFF";
const LINE = "#E7E7EA";

const RECOMMENDED = [
  { key: "cred", title: "CRED UPI", icon: "shield-outline", logoText: "C", value: "Preferred" },
  { key: "paytm", title: "Paytm UPI", icon: "wallet-outline", logoText: "paytm", value: "UPI" },
  { key: "slice", title: "slice UPI", icon: "credit-card-outline", logoText: "slice", value: "UPI" },
];

const UPI_APPS = [
  { key: "phonepe", title: "PhonePe UPI", icon: "alpha-p-circle", value: "UPI" },
  { key: "jupiter", title: "Jupiter UPI", icon: "alpha-j-circle", value: "UPI" },
  { key: "amazon", title: "Amazon Pay UPI", icon: "alpha-a-circle", value: "UPI" },
  { key: "airtel", title: "Airtel UPI", icon: "alpha-a-circle-outline", value: "UPI" },
];

const WALLET_ROWS = [
  { key: "wallet", title: "Blinkit Money", subtitle: "Balance: ₹0", icon: "cash-fast", value: "Wallet" },
  { key: "amazon-pay", title: "Amazon Pay Balance", subtitle: "Link your Amazon Pay Balance wallet", icon: "alpha-a-circle", action: "ADD", value: "Wallet" },
  { key: "mobikwik", title: "Mobikwik", subtitle: "Link your Mobikwik wallet", icon: "alpha-m-circle", action: "ADD", value: "Wallet" },
];

const MORE_ROWS = [
  { key: "lazy-pay", title: "LazyPay", subtitle: "Link your LazyPay account", icon: "play-box-outline", action: "ADD", value: "Pay Later" },
  { key: "netbanking", title: "Netbanking", subtitle: "All major banks supported", icon: "bank-outline", action: "ADD", value: "Netbanking" },
  { key: "pluxee", title: "Pluxee", subtitle: "Pluxee card valid only on restaurant orders", icon: "card-account-details-outline", disabled: true, value: "Card" },
];

function LogoBox({ item }) {
  return (
    <View style={styles.logoBox}>
      {item.logoText ? (
        <Text style={[styles.logoText, item.key === "slice" && styles.sliceLogoText]}>{item.logoText}</Text>
      ) : (
        <MaterialCommunityIcons name={item.icon} size={24} color="#3D424A" />
      )}
    </View>
  );
}

function PaymentRow({ item, onPress, showDivider, chevron = true }) {
  return (
    <View>
      <Pressable
        disabled={item.disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.paymentRow,
          item.disabled && styles.paymentRowDisabled,
          pressed && !item.disabled && styles.pressed,
        ]}
      >
        <LogoBox item={item} />
        <View style={styles.rowCopy}>
          <Text style={[styles.rowTitle, item.disabled && styles.disabledText]} numberOfLines={1}>{item.title}</Text>
          {item.subtitle ? (
            <Text style={[styles.rowSubtitle, item.disabled && styles.disabledText]} numberOfLines={1}>{item.subtitle}</Text>
          ) : null}
        </View>
        {item.action ? <Text style={styles.rowAction}>{item.action}</Text> : chevron ? (
          <MaterialCommunityIcons name="chevron-right" size={25} color="#7D838C" />
        ) : null}
      </Pressable>
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}

function CardSection({ title, subtitle, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function PaymentSelectScreen({ onBack, onContinue, onAddPaymentMethod, isProcessing = false, errorMessage = "" }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack} hitSlop={12}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#5D626B" />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>{isProcessing ? "Placing your order…" : "Choose payment method"}</Text>
        </View>
        {isProcessing ? <ActivityIndicator size="small" color={BLUE} /> : null}
      </View>

      {errorMessage ? (
        <View style={styles.paymentErrorBanner}>
          <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#B42318" />
          <View style={styles.paymentErrorCopy}>
            <Text style={styles.paymentErrorTitle}>Payment wasn’t completed</Text>
            <Text style={styles.paymentErrorText}>{errorMessage}</Text>
          </View>
        </View>
      ) : null}

      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <CardSection title="Recommended">
          {RECOMMENDED.map((item, index) => (
            <PaymentRow
              key={item.key}
              item={item}
              onPress={() => !isProcessing && onContinue?.(item)}
              showDivider={index !== RECOMMENDED.length - 1}
            />
          ))}
        </CardSection>

        <CardSection title="Cards">
          <Pressable style={({ pressed }) => [styles.paymentRow, pressed && styles.pressed]} onPress={onAddPaymentMethod}>
            <LogoBox item={{ icon: "credit-card-outline" }} />
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Add credit or debit cards</Text>
            </View>
            <Text style={styles.rowAction}>ADD</Text>
          </Pressable>
          <View style={styles.divider} />
          <PaymentRow item={MORE_ROWS[2]} />
          <View style={styles.unavailableNote}>
            <Text style={styles.unavailableText}>This payment method is not applicable on orders containing non-food items</Text>
          </View>
        </CardSection>

        <CardSection title="Pay by any UPI app">
          {UPI_APPS.map((item, index) => (
            <PaymentRow
              key={item.key}
              item={item}
              onPress={() => !isProcessing && onContinue?.(item)}
              showDivider={index !== UPI_APPS.length - 1}
            />
          ))}
        </CardSection>

        <CardSection title="Wallets">
          {WALLET_ROWS.map((item, index) => (
            <PaymentRow
              key={item.key}
              item={item}
              onPress={() => !isProcessing && onContinue?.(item)}
              showDivider={index !== WALLET_ROWS.length - 1}
              chevron={!item.action}
            />
          ))}
        </CardSection>

        <CardSection title="Pay Later">
          <PaymentRow item={MORE_ROWS[0]} onPress={() => !isProcessing && onContinue?.(MORE_ROWS[0])} chevron={false} />
        </CardSection>

        <CardSection title="Netbanking">
          <PaymentRow item={MORE_ROWS[1]} onPress={() => !isProcessing && onContinue?.(MORE_ROWS[1])} chevron={false} />
        </CardSection>

        <CardSection title="Pay On Delivery">
          <PaymentRow item={{ title: "Cash on Delivery", subtitle: "", icon: "cash" }} disabled chevron={false} />
          <View style={styles.unavailableNote}>
            <Text style={styles.unavailableText}>This payment method is not available at the moment</Text>
          </View>
        </CardSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomPayButton: {
    height: 54,
    marginHorizontal: 24,
    marginTop: 18,
    borderRadius: 15,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomPayText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  content: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  paymentErrorBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FEF3F2",
    borderWidth: 1,
    borderColor: "#FECDCA",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  paymentErrorCopy: {
    flex: 1,
    marginLeft: 9,
  },
  paymentErrorTitle: {
    color: "#912018",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  paymentErrorText: {
    marginTop: 2,
    color: "#B42318",
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "500",
  },
  deliveryCard: {
    minHeight: 142,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: CARD_BG,
    flexDirection: "row",
  },
  deliveryCopy: {
    flex: 1,
    marginLeft: 18,
    gap: 15,
  },
  deliveryEta: {
    color: "#787C83",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
  },
  deliveryEtaStrong: {
    color: "#2A2E34",
    fontWeight: "900",
  },
  deliveryLine: {
    color: "#777B83",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  deliveryStrong: {
    color: "#2A2E34",
    fontWeight: "900",
  },
  disabledText: {
    color: "#A7AAB1",
  },
  divider: {
    height: 1,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: LINE,
  },
  header: {
    minHeight: 78,
    paddingHorizontal: 24,
    paddingBottom: 14,
    backgroundColor: PAGE_BG,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEF",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  headerCopy: {
    flex: 1,
    marginLeft: 12,
  },
  headerSubtitle: {
    marginTop: 2,
    color: "#5F636B",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "500",
  },
  headerTitle: {
    color: "#20242A",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#DEE1E6",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoBoxSelected: {
    borderColor: "#DDE4F8",
  },
  logoText: {
    color: "#15191F",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  paymentRow: {
    minHeight: 66,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  paymentRowDisabled: {
    opacity: 0.55,
  },
  payButton: {
    height: 58,
    marginLeft: 132,
    marginRight: 36,
    marginBottom: 18,
    borderRadius: 13,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  preferredRow: {
    minHeight: 80,
    paddingHorizontal: 36,
    flexDirection: "row",
    alignItems: "center",
  },
  preferredTitle: {
    flex: 1,
    marginLeft: 20,
    color: "#353941",
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.72,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: BLUE,
  },
  radioOuter: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    borderWidth: 2,
    borderColor: "#D7D8DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: BLUE,
    backgroundColor: BLUE,
  },
  routeConnector: {
    width: 4,
    flex: 1,
    backgroundColor: "#6A42DE",
  },
  routeDot: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 4,
    borderColor: "#6A42DE",
    backgroundColor: "#FFFFFF",
  },
  routeLine: {
    width: 16,
    height: 74,
    alignItems: "center",
  },
  rowAction: {
    marginLeft: 12,
    color: GREEN,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  rowSubtitle: {
    marginTop: 3,
    color: "#8A8E96",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "500",
  },
  rowTitle: {
    color: "#33363D",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    letterSpacing: -0.18,
  },
  safe: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  sectionCard: {
    borderRadius: 22,
    backgroundColor: CARD_BG,
    overflow: "hidden",
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionSubtitle: {
    marginTop: 4,
    color: "#666A72",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "500",
  },
  sectionTitle: {
    color: "#30343A",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  sliceLogoText: {
    color: "#8B16D1",
  },
  unavailableNote: {
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFF0F3",
  },
  unavailableText: {
    color: "#D93755",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
  },
  viewAllIcon: {
    width: 44,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#DDE1E8",
    alignItems: "center",
    justifyContent: "center",
  },
  viewAllRow: {
    minHeight: 62,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  viewAllText: {
    color: BLUE,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
});
