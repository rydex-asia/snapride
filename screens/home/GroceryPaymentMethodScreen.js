import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppIcon from "../../components/AppIcon";

const GREEN = "#16A34A";
const GREEN_DARK = "#12813B";
const PAGE_BG = "#FAFBFC";
const BORDER = "#E8EAEE";

const UPI_APPS = [
  { key: "phonepe", short: "पे", title: "PhonePe", color: "#5F259F", bg: "#F7F1FC", value: "UPI" },
  { key: "paytm", short: "paytm", title: "Paytm", color: "#087DB4", bg: "#F5FAFD", value: "UPI" },
  { key: "cred", short: "C", title: "CRED UPI", color: "#111111", bg: "#F5F5F5", value: "UPI" },
  { key: "amazon", short: "pay", title: "Amazon Pay UPI", color: "#25313B", bg: "#F5F7F8", value: "UPI" },
];

const CARDS = [
  { key: "hdfc-card", title: "HDFC Bank Credit Card", subtitle: "•••• 4578", short: "H", color: "#16447E", bg: "#EEF3FA", value: "Card" },
  { key: "icici-card", title: "ICICI Bank Debit Card", subtitle: "•••• 1234", short: "i", color: "#C7212D", bg: "#FFF1F2", value: "Card" },
];

function BrandTile({ short, color, bg, compact = false }) {
  return (
    <View style={[styles.brandTile, compact && styles.brandTileCompact, { backgroundColor: bg }]}>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[styles.brandText, short.length > 2 && styles.brandTextSmall, { color }]}
      >
        {short}
      </Text>
    </View>
  );
}

function Radio({ selected }) {
  return (
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected ? <View style={styles.radioDot} /> : null}
    </View>
  );
}

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function OptionRow({ icon, item, selected, onPress, last = false, trailing = "radio" }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.optionRow, !last && styles.rowDivider, pressed && styles.pressed]}>
      {icon || <BrandTile compact short={item.short} color={item.color} bg={item.bg} />}
      <View style={styles.optionCopy}>
        <Text style={styles.optionTitle}>{item.title}</Text>
        {item.subtitle ? <Text style={styles.optionSubtitle}>{item.subtitle}</Text> : null}
      </View>
      {trailing === "radio" ? <Radio selected={selected} /> : <MaterialCommunityIcons name="chevron-right" size={24} color="#A7ADB4" />}
    </Pressable>
  );
}

function UpiApp({ item, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.upiApp, pressed && styles.pressed]}>
      <View>
        <BrandTile short={item.short} color={item.color} bg={item.bg} />
        {selected ? <View style={styles.appCheck}><MaterialCommunityIcons name="check" size={12} color="#FFFFFF" /></View> : null}
      </View>
      <Text style={styles.upiAppName} numberOfLines={2}>{item.title}</Text>
    </Pressable>
  );
}

function PaymentAction({ amount, isProcessing, onPress }) {
  return (
    <View style={styles.cardPaymentAction}>
      <Pressable disabled={isProcessing} onPress={onPress} style={({ pressed }) => [styles.cardPayButton, pressed && !isProcessing && styles.payPressed, isProcessing && styles.disabled]}>
        {isProcessing ? <ActivityIndicator color="#FFFFFF" /> : (
          <>
            <View style={styles.paySideIcon}><MaterialCommunityIcons name="lock-outline" size={18} color="#FFFFFF" /></View>
            <Text style={styles.payText}>Pay ₹{Math.round(amount)}</Text>
            <View style={styles.payArrow}><MaterialCommunityIcons name="arrow-right" size={18} color={GREEN_DARK} /></View>
          </>
        )}
      </Pressable>
    </View>
  );
}

export default function GroceryPaymentMethodScreen({
  amount = 609,
  savings = 0,
  deliveryAddress = "Home · 13-15-4/A, Sri Krishna Nagar",
  onBack,
  onContinue,
  isProcessing = false,
  errorMessage = "",
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState(UPI_APPS[0]);
  const pagePadding = Math.max(12, Math.min(24, width * 0.04));
  const payableAmount = amount + (selected.key === "cod" ? 10 : 0);
  const formattedAddress = useMemo(() => {
    const value = String(deliveryAddress || "Current location").trim();
    return value.toLowerCase().startsWith("home") ? value : `Home · ${value}`;
  }, [deliveryAddress]);

  const choose = (item) => setSelected(item);
  const pay = () => onContinue?.(selected);

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="#FFFFFF" />

      <View style={styles.topShell}>
        <View style={[styles.header, { paddingTop: insets.top, paddingHorizontal: pagePadding }]}> 
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={12}>
            <AppIcon name="back" size={27} color="#25282D" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>{isProcessing ? "Processing payment…" : "Payment Options"}</Text>
          </View>
          <View style={styles.secureBadge}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color={GREEN_DARK} />
          </View>
        </View>

        <View style={[styles.addressRow, { paddingHorizontal: pagePadding }]}> 
          <View style={styles.pinCircle}><MaterialCommunityIcons name="map-marker" size={19} color="#F45C87" /></View>
          <Text style={styles.addressText} numberOfLines={1}>Delivering to <Text style={styles.addressStrong}>{formattedAddress}</Text></Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#A2A8AF" />
        </View>
      </View>

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <MaterialCommunityIcons name="alert-circle-outline" size={19} color="#B42318" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingHorizontal: pagePadding, paddingBottom: 28 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cashbackCard}>
          <View style={styles.cashbackCopy}>
            <Text style={styles.cashbackTitle}>Get flat ₹100 cashback on CRED.</Text>
            <Text style={styles.cashbackSubtitle}>Pay via any Card or UPI</Text>
          </View>
          <View style={styles.ticket}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={27} color={GREEN_DARK} />
            <Text style={styles.ticketText}>CASHBACK</Text>
          </View>
        </View>

        <SectionTitle>Pay by UPI</SectionTitle>
        <View style={[styles.card, selected.value === "UPI" && styles.cardSelected]}>
          <Pressable onPress={() => choose(UPI_APPS[0])} style={({ pressed }) => [styles.upiHeader, pressed && styles.pressed]}>
            <View style={styles.upiLogo}><Text style={styles.upiLogoText}>UPI</Text></View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>Pay by any UPI app</Text>
              <Text style={styles.optionSubtitle}>Use any UPI app on your phone to pay</Text>
            </View>
            <Radio selected={selected.value === "UPI"} />
          </Pressable>
          <View style={styles.innerDivider} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.upiAppsRow}>
            {UPI_APPS.map((item) => <UpiApp key={item.key} item={item} selected={selected.key === item.key} onPress={() => choose(item)} />)}
          </ScrollView>
          {selected.value === "UPI" && selected.key !== "new-upi" ? <PaymentAction amount={payableAmount} isProcessing={isProcessing} onPress={pay} /> : null}
          <View style={styles.innerDivider} />
          <OptionRow
            item={{ title: "Add new UPI ID" }}
            icon={<View style={styles.addIcon}><MaterialCommunityIcons name="plus" size={27} color="#8B1AC7" /></View>}
            onPress={() => choose({ key: "new-upi", title: "New UPI ID", value: "UPI" })}
            trailing="chevron"
            last
          />
          {selected.key === "new-upi" ? <PaymentAction amount={payableAmount} isProcessing={isProcessing} onPress={pay} /> : null}
        </View>

        <SectionTitle>Pluxee</SectionTitle>
        <View style={[styles.card, selected.key === "pluxee" && styles.cardSelected]}>
          <OptionRow
            item={{ key: "pluxee", title: "Pluxee", short: "pluxee", color: "#20245D", bg: "#F8F8FC", value: "Wallet" }}
            selected={selected.key === "pluxee"}
            onPress={() => choose({ key: "pluxee", title: "Pluxee", value: "Wallet" })}
            trailing="chevron"
            last
          />
          {selected.key === "pluxee" ? <PaymentAction amount={payableAmount} isProcessing={isProcessing} onPress={pay} /> : null}
        </View>

        <SectionTitle>Cards</SectionTitle>
        <View style={[styles.card, selected.value === "Card" && styles.cardSelected]}>
          {CARDS.map((item) => (
            <OptionRow key={item.key} item={item} selected={selected.key === item.key} onPress={() => choose(item)} last={false} />
          ))}
          <OptionRow
            item={{ title: "Add credit or debit card" }}
            icon={<View style={styles.addIcon}><MaterialCommunityIcons name="credit-card-plus-outline" size={24} color={GREEN_DARK} /></View>}
            onPress={() => choose({ key: "new-card", title: "New card", value: "Card" })}
            trailing="chevron"
            last
          />
          {selected.value === "Card" ? <PaymentAction amount={payableAmount} isProcessing={isProcessing} onPress={pay} /> : null}
        </View>

        <SectionTitle>Wallets & Pay Later</SectionTitle>
        <View style={[styles.card, ["wallet", "cod"].includes(selected.key) && styles.cardSelected]}>
          <OptionRow
            item={{ key: "wallet", title: "Frezo Wallet", subtitle: "Balance ₹75", short: "F", color: "#FFFFFF", bg: "#6E22B3", value: "Wallet" }}
            selected={selected.key === "wallet"}
            onPress={() => choose({ key: "wallet", title: "Frezo Wallet", value: "Wallet" })}
          />
          <OptionRow
            item={{ key: "cod", title: "Cash on Delivery", subtitle: "₹10 handling fee applicable", short: "₹", color: GREEN_DARK, bg: "#E9F8F1", value: "Cash" }}
            selected={selected.key === "cod"}
            onPress={() => choose({ key: "cod", title: "Cash on Delivery", value: "Cash" })}
            last
          />
          {["wallet", "cod"].includes(selected.key) ? <PaymentAction amount={payableAmount} isProcessing={isProcessing} onPress={pay} /> : null}
        </View>

        {savings > 0 ? <Text style={styles.savingsNote}>You’re saving ₹{Math.round(savings)} on this order</Text> : null}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAGE_BG },
  topShell: { backgroundColor: "#FFFFFF", borderBottomLeftRadius: 20, borderBottomRightRadius: 20, zIndex: 2, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#ECEEF1" },
  header: { width: "100%", maxWidth: 680, alignSelf: "center", minHeight: 76, flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF" },
  backButton: { width: 45, height: 44, alignItems: "flex-start", justifyContent: "center" },
  headerCopy: { flex: 1 },
  headerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 20, lineHeight: 25, color: "#20242A", letterSpacing: -0.25 },
  secureBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#EFFAF2", alignItems: "center", justifyContent: "center" },
  addressRow: { width: "100%", maxWidth: 680, minHeight: 52, alignSelf: "center", flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#F0F1F3", marginBottom: 0 },
  pinCircle: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF0F5", marginRight: 8 },
  addressText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18, color: "#737986" },
  addressStrong: { fontFamily: "Inter_500Medium", color: "#343940" },
  scroll: { flex: 1, backgroundColor: PAGE_BG },
  content: { width: "100%", maxWidth: 680, alignSelf: "center", paddingTop: 13 },
  errorBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEF3F2", paddingHorizontal: 16, paddingVertical: 10 },
  errorText: { flex: 1, fontFamily: "Inter_400Regular", color: "#B42318", fontSize: 13, lineHeight: 18 },
  cashbackCard: { minHeight: 86, flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 15, borderWidth: 1, borderColor: "#ECEEF1", paddingHorizontal: 15, marginBottom: 18, shadowColor: "#475569", shadowOpacity: 0, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 0 },
  cashbackCopy: { flex: 1, paddingRight: 12 },
  cashbackTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, lineHeight: 20, color: "#22262B" },
  cashbackSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17, color: "#717884", marginTop: 5 },
  ticket: { width: 78, height: 48, borderRadius: 7, backgroundColor: "#D9F5E6", borderWidth: 1, borderStyle: "dashed", borderColor: "#83CAA6", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-10deg" }] },
  ticketText: { fontFamily: "Inter_600SemiBold", fontSize: 9, color: GREEN_DARK, marginTop: 1 },
  sectionTitle: { fontFamily: "Inter_500Medium", fontSize: 17, lineHeight: 22, color: "#292D33", marginLeft: 2, marginBottom: 8, marginTop: 0 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 15, borderWidth: 1, borderColor: BORDER, marginBottom: 18, shadowColor: "#475569", shadowOpacity: 0, shadowRadius: 7, shadowOffset: { width: 0, height: 2 }, elevation: 0 },
  cardSelected: { borderColor: "#B9E2C6", shadowColor: "#166534", shadowOpacity: 0, elevation: 0 },
  upiHeader: { minHeight: 72, flexDirection: "row", alignItems: "center", paddingHorizontal: 14 },
  upiLogo: { width: 43, height: 43, borderRadius: 9, borderWidth: 1, borderColor: "#E4E7EA", alignItems: "center", justifyContent: "center", marginRight: 12 },
  upiLogoText: { fontFamily: "Inter_600SemiBold", fontStyle: "italic", fontSize: 13, color: "#646A70" },
  optionRow: { minHeight: 62, flexDirection: "row", alignItems: "center", paddingHorizontal: 14 },
  optionCopy: { flex: 1, paddingRight: 10 },
  optionTitle: { fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 19, color: "#25292F" },
  optionSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 16, color: "#767D88", marginTop: 2 },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E8EAED" },
  innerDivider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E7E9EC", marginHorizontal: 12 },
  brandTile: { width: 58, height: 58, borderRadius: 12, borderWidth: 1, borderColor: "#E4E7EA", alignItems: "center", justifyContent: "center" },
  brandTileCompact: { width: 40, height: 40, borderRadius: 9, marginRight: 12 },
  brandText: { fontFamily: "Inter_600SemiBold", fontSize: 20 },
  brandTextSmall: { fontSize: 11 },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: "#C7CBD0", alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: GREEN, borderWidth: 2 },
  radioDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: GREEN },
  upiAppsRow: { paddingHorizontal: 14, paddingVertical: 14, gap: 14 },
  upiApp: { width: 71, alignItems: "center" },
  upiAppName: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18, color: "#33383E", textAlign: "center", marginTop: 8 },
  appCheck: { position: "absolute", right: -4, top: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: GREEN, borderWidth: 2, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  addIcon: { width: 40, height: 40, borderRadius: 9, borderWidth: 1, borderColor: "#E2D9E8", backgroundColor: "#FCF8FE", alignItems: "center", justifyContent: "center", marginRight: 12 },
  pressed: { opacity: 0.67 },
  savingsNote: { fontFamily: "Inter_500Medium", color: GREEN_DARK, fontSize: 13, textAlign: "center", marginTop: -8 },
  cardPaymentAction: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#ECEEF1", backgroundColor: "#FFFFFF", borderBottomLeftRadius: 15, borderBottomRightRadius: 15 },
  cardPayButton: { width: "100%", height: 50, borderRadius: 14, paddingHorizontal: 11, backgroundColor: GREEN, flexDirection: "row", alignItems: "center" },
  paySideIcon: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  payText: { flex: 1, textAlign: "center", fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFFFFF" },
  payArrow: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  payPressed: { backgroundColor: GREEN_DARK, transform: [{ scale: 0.995 }] },
  disabled: { opacity: 0.6 },
});
