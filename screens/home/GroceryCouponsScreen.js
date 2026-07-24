import React, { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppIcon from "../../components/AppIcon";
import { withReadableGroceryTypography } from "./groceryReadableTypography";

const GREEN = "#0A8F23";
const BORDER = "#E7E9EE";
const TEXT = "#111111";
const PAGE_BG = "#F5F6F8";

const COUPONS = [
  { id: "party150", code: "PARTY150", title: "₹150 OFF", detail: "on orders above ₹999", expiry: "Expires in 05:21:36", discountType: "flat", discountValue: 150, maxDiscount: 150, minOrder: 999, color: "#D81961", bg: "#FDE9F0", best: true },
  { id: "save100", code: "SAVE100", title: "₹100 OFF", detail: "on orders above ₹699", expiry: "Expires in 04:59:59", discountType: "flat", discountValue: 100, maxDiscount: 100, minOrder: 699, color: GREEN, bg: "#E8FAED" },
  { id: "first50", code: "FIRST50", title: "₹50 OFF", detail: "on orders above ₹299", expiry: "Expires today", discountType: "flat", discountValue: 50, maxDiscount: 50, minOrder: 299, color: GREEN, bg: "#E8FAED" },
  { id: "daily40", code: "DAILY40", title: "₹40 OFF", detail: "on daily essentials above ₹249", expiry: "Expires tomorrow", discountType: "flat", discountValue: 40, maxDiscount: 40, minOrder: 249, color: GREEN, bg: "#EFF8E8" },
  { id: "fresh25", code: "FRESH25", title: "25% OFF", detail: "on fresh fruits and vegetables", expiry: "Valid this week", discountType: "percent", discountValue: 25, maxDiscount: 80, minOrder: 199, color: GREEN, bg: "#E8FAED" },
];

const BANKS = [
  { id: "hdfc", name: "HDFC Bank", offer: "10% Instant Discount", detail: "on Credit Cards", right: "Up to ₹200", logo: "H", color: "#1A4A8A" },
  { id: "icici", name: "ICICI Bank", offer: "₹150 Instant Discount", detail: "on Credit & Debit Cards", right: "Above ₹999", logo: "i", color: "#C62B28" },
  { id: "axis", name: "Axis Bank", offer: "15% Instant Discount", detail: "on Credit Cards", right: "Up to ₹125", logo: "A", color: "#8C1641" },
];

const PAYMENTS = [
  { id: "phonepe", name: "PhonePe UPI", offer: "Flat ₹50 Cashback", detail: "On orders above ₹399", logo: "₹", color: "#5F159C" },
  { id: "paytm", name: "Paytm Wallet", offer: "Flat ₹30 Cashback", detail: "On orders above ₹299", logo: "paytm", color: "#0B7EB5" },
  { id: "amazon", name: "Amazon Pay", offer: "Up to ₹40 Cashback", detail: "On eligible grocery orders", logo: "a", color: "#202A35" },
];

const CATEGORY_OFFERS = [
  { id: "fresh", icon: "food-apple-outline", title: "Fruits & Vegetables", offer: "Extra 10% OFF" },
  { id: "snacks", icon: "food-outline", title: "Snacks & Beverages", offer: "Buy 2 Get 1 FREE" },
];

function AutoOffer({ icon, iconColor, title, subtitle }) {
  return (
    <View style={styles.couponCard}>
      <View style={styles.couponTopRow}>
        <View style={[styles.couponBrandMark, { backgroundColor: iconColor }]}><MaterialCommunityIcons name={icon} size={20} color="#FFFFFF" /></View>
        <View style={styles.couponCodeWrap}><Text style={styles.codeText}>{title}</Text><Text style={styles.couponTitle}>Automatic offer</Text></View>
        <View style={styles.autoAppliedPill}><MaterialCommunityIcons name="check" size={14} color={GREEN} /><Text style={styles.appliedText}>Applied</Text></View>
      </View>
      <View style={styles.couponDivider} />
      <Text style={styles.couponDescription}>{subtitle}</Text>
      <View style={styles.couponBottomRow}><Text style={styles.moreText}>+ MORE</Text><Text style={styles.eligibleText}>Added automatically</Text></View>
    </View>
  );
}

function CouponRow({ item, selected, onApply }) {
  return (
    <View style={[styles.couponCard, selected && styles.couponCardSelected]}>
      <View style={styles.couponTopRow}>
        <View style={[styles.couponBrandMark, { backgroundColor: item.bg }]}>
          <MaterialCommunityIcons name={item.id === "fresh25" ? "food-apple" : "ticket-percent-outline"} size={19} color={item.color} />
        </View>
        <View style={styles.couponCodeWrap}>
          <View style={styles.codeLine}>
            <Text style={styles.codeText}>{item.code}</Text>
            {item.best ? <Text style={styles.bestBadge}>BEST OFFER</Text> : null}
          </View>
          <Text style={styles.couponTitle}>{item.title}</Text>
        </View>
        <Pressable onPress={onApply} hitSlop={8} style={[styles.applyButton, selected && styles.appliedButton]}>
          {selected ? <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" /> : null}
          <Text style={[styles.applyButtonText, selected && styles.appliedButtonText]}>{selected ? "Applied" : "Apply"}</Text>
        </Pressable>
      </View>
      <View style={styles.couponDivider} />
      <Text style={styles.couponDescription}>Get {item.title} {item.detail}</Text>
      <Text style={styles.couponLimit}>Maximum discount ₹{item.maxDiscount} on orders above ₹{item.minOrder}</Text>
      <View style={styles.couponBottomRow}>
        <Text style={styles.moreText}>+ MORE</Text>
        <Text style={styles.expiry}>{item.expiry}</Text>
      </View>
    </View>
  );
}

function BankRow({ item }) {
  return (
    <Pressable style={styles.couponCard}>
      <View style={styles.couponTopRow}>
        <View style={[styles.couponBrandMark, { backgroundColor: item.color }]}><Text style={[styles.brandLogoText, item.logo === "paytm" && styles.paytmText]}>{item.logo}</Text></View>
        <View style={styles.couponCodeWrap}><Text style={styles.codeText}>{item.name}</Text><Text style={styles.couponTitle}>{item.right || "Payment offer"}</Text></View>
        <View style={styles.viewAction}><Text style={styles.viewActionText}>View</Text><MaterialCommunityIcons name="chevron-right" size={18} color={GREEN} /></View>
      </View>
      <View style={styles.couponDivider} />
      <Text style={styles.couponDescription}>{item.offer}</Text>
      <Text style={styles.couponLimit}>{item.detail}</Text>
      <View style={styles.couponBottomRow}><Text style={styles.moreText}>+ MORE</Text><Text style={styles.eligibleText}>Check eligibility</Text></View>
    </Pressable>
  );
}

function CategoryOfferCard({ item }) {
  return (
    <Pressable style={styles.couponCard}>
      <View style={styles.couponTopRow}>
        <View style={styles.categoryIcon}><MaterialCommunityIcons name={item.icon} size={21} color={GREEN} /></View>
        <View style={styles.couponCodeWrap}><Text style={styles.codeText}>{item.title}</Text><Text style={styles.couponTitle}>Category offer</Text></View>
        <View style={styles.viewAction}><Text style={styles.viewActionText}>Shop</Text><MaterialCommunityIcons name="chevron-right" size={18} color={GREEN} /></View>
      </View>
      <View style={styles.couponDivider} />
      <Text style={styles.couponDescription}>{item.offer}</Text>
      <View style={styles.couponBottomRow}><Text style={styles.moreText}>+ MORE</Text><Text style={styles.eligibleText}>On eligible products</Text></View>
    </Pressable>
  );
}

function GroupFooter({ text, expanded, onPress }) {
  return <Pressable onPress={onPress} style={styles.groupFooter}><Text style={styles.groupFooterText}>{text}</Text><MaterialCommunityIcons name={expanded ? "chevron-up" : "chevron-down"} size={22} color={GREEN} /></Pressable>;
}

export default function GroceryCouponsScreen({ initialCoupon, onBack, onApply }) {
  const insets = useSafeAreaInsets();
  const [couponCode, setCouponCode] = useState("");
  const [selected, setSelected] = useState(initialCoupon || null);
  const [allCoupons, setAllCoupons] = useState(false);
  const [allBanks, setAllBanks] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [invalidCode, setInvalidCode] = useState("");

  const applyCoupon = (coupon) => {
    const next = selected?.id === coupon.id ? null : coupon;
    setSelected(next);
    setCouponCode("");
    setInvalidCode("");
    onApply?.(next);
  };

  const applyTyped = () => {
    const code = couponCode.trim().toUpperCase();
    const coupon = COUPONS.find((item) => item.code === code);
    if (!coupon) return setInvalidCode("Coupon code is invalid or has expired");
    applyCoupon(coupon);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.back}><AppIcon name="back" size={28} color="#111111" /></Pressable>
        <Text style={styles.headerTitle}>Coupons & Offers</Text>
        <Pressable onPress={() => setHowOpen((value) => !value)}><Text style={styles.howText}>How it works</Text></Pressable>
      </View>

      <View style={styles.stickyArea}>
        <View style={styles.codeCard}>
          <View style={styles.codeHeadingRow}>
            <View style={styles.codeHeadingIcon}><MaterialCommunityIcons name="ticket-percent-outline" size={18} color={GREEN} /></View>
            <Text style={styles.codeLabel}>Have a coupon code?</Text>
          </View>
          <View style={[styles.codeInputRow, invalidCode && styles.codeInputError]}>
            <TextInput value={couponCode} onChangeText={(value) => { setCouponCode(value.toUpperCase()); setInvalidCode(""); }} placeholder="Enter code here" placeholderTextColor="#9AA0A6" autoCapitalize="characters" style={styles.codeInput} />
            <Pressable disabled={!couponCode.trim()} onPress={applyTyped} style={styles.inputApply}><Text style={[styles.inputApplyText, !couponCode.trim() && styles.inputApplyDisabled]}>Apply</Text></Pressable>
          </View>
          {invalidCode ? <Text style={styles.invalidText}>{invalidCode}</Text> : null}
        </View>
        {howOpen ? <View style={styles.howCard}><MaterialCommunityIcons name="information-outline" size={19} color={GREEN} /><Text style={styles.howCopy}>Choose one coupon for your order. Automatic, bank and payment offers are added separately when eligible.</Text></View> : null}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: Math.max(28, insets.bottom + 18) }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={[styles.sectionTitle, styles.firstSectionTitle]}>Available coupons</Text>
        <View style={styles.couponList}>
          {(allCoupons ? COUPONS : COUPONS.slice(0, 3)).map((item) => (
            <CouponRow key={item.id} item={item} selected={selected?.id === item.id} onApply={() => applyCoupon(item)} />
          ))}
          <GroupFooter text={allCoupons ? "Show fewer coupons" : "View all coupons (12)"} expanded={allCoupons} onPress={() => setAllCoupons((value) => !value)} />
        </View>

        <Text style={styles.sectionTitle}>Automatically applied</Text>
        <View style={styles.couponList}>
          <AutoOffer icon="seal-variant" iconColor="#F2A500" title="Buy 2 Get 1 FREE" subtitle="on Select Snacks" />
          <AutoOffer icon="food-apple" iconColor="#F08C20" title="Extra 10% OFF" subtitle="on Fruits & Vegetables" />
        </View>

        <Text style={styles.sectionTitle}>Bank offers</Text>
        <View style={styles.couponList}>
          {(allBanks ? BANKS : BANKS.slice(0, 2)).map((item) => <BankRow key={item.id} item={item} />)}
          <GroupFooter text={allBanks ? "Show fewer bank offers" : "View all bank offers (12)"} expanded={allBanks} onPress={() => setAllBanks((value) => !value)} />
        </View>

        <Text style={styles.sectionTitle}>Payment offers</Text>
        <View style={styles.couponList}>{PAYMENTS.map((item) => <BankRow key={item.id} item={item} />)}</View>

        <Text style={styles.sectionTitle}>Category offers</Text>
        <View style={styles.couponList}>{CATEGORY_OFFERS.map((item) => <CategoryOfferCard key={item.id} item={item} />)}</View>

        <Pressable style={[styles.couponCard, styles.termsBox]}>
          <View style={styles.couponTopRow}>
            <View style={styles.categoryIcon}><MaterialCommunityIcons name="file-document-outline" size={21} color={GREEN} /></View>
            <View style={styles.couponCodeWrap}><Text style={styles.codeText}>Terms and Conditions</Text><Text style={styles.couponTitle}>Offer usage information</Text></View>
            <MaterialCommunityIcons name="chevron-right" size={21} color={GREEN} />
          </View>
          <View style={styles.couponDivider} />
          <Text style={styles.termsText}>Offers are subject to eligibility, minimum basket value and payment-method conditions.</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create(withReadableGroceryTypography({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  flex: { flex: 1 },
  header: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: BORDER,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 60,
    paddingHorizontal: 14,
  },
  back: { alignItems: "flex-start", justifyContent: "center", width: 42 },
  headerTitle: { color: TEXT, flex: 1, fontSize: 19, fontWeight: "900" },
  howText: { color: GREEN, fontSize: 12, fontWeight: "800" },
  stickyArea: {
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E4E7E5",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 5,
  },
  codeCard: { backgroundColor: "#FFFFFF" },
  codeHeadingRow: { alignItems: "center", flexDirection: "row", gap: 8 },
  codeHeadingIcon: {
    alignItems: "center",
    backgroundColor: "#EAF8ED",
    borderRadius: 8,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  codeLabel: { color: TEXT, fontSize: 14, fontWeight: "800" },
  codeInputRow: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CFD4D0",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    height: 50,
    marginTop: 9,
    overflow: "hidden",
  },
  codeInputError: { borderColor: "#E5484D" },
  codeInput: { color: TEXT, flex: 1, fontSize: 14, fontWeight: "700", paddingHorizontal: 14 },
  inputApply: {
    alignItems: "center",
    backgroundColor: "#F7FAF7",
    borderLeftColor: "#E2E6E2",
    borderLeftWidth: 1,
    justifyContent: "center",
    width: 84,
  },
  inputApplyText: { color: GREEN, fontSize: 14, fontWeight: "900" },
  inputApplyDisabled: { color: "#A7ACA8" },
  invalidText: { color: "#D92D20", fontSize: 11, marginTop: 6 },
  howCard: {
    alignItems: "flex-start",
    backgroundColor: "#F0FAF2",
    borderColor: "#D9ECDD",
    borderRadius: 10,
    borderWidth: 0.5,
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    padding: 10,
  },
  howCopy: { color: "#3F4942", flex: 1, fontSize: 11, lineHeight: 16 },
  scroll: { flex: 1, backgroundColor: PAGE_BG },
  content: { paddingHorizontal: 14, paddingTop: 2 },
  sectionTitle: { color: "#30343A", fontSize: 16, fontWeight: "900", marginBottom: 10, marginTop: 20 },
  firstSectionTitle: { marginTop: 14 },
  couponList: { gap: 10 },
  couponCard: {
    backgroundColor: "#FFFFFF",
    borderColor: BORDER,
    borderRadius: 14,
    borderWidth: 0.5,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  couponCardSelected: { borderColor: "#91D4A0", borderWidth: 1 },
  couponTopRow: { alignItems: "center", flexDirection: "row" },
  couponBrandMark: { alignItems: "center", borderRadius: 8, height: 38, justifyContent: "center", marginRight: 10, width: 38 },
  couponCodeWrap: { flex: 1, minWidth: 0 },
  codeLine: { alignItems: "center", flexDirection: "row", gap: 7 },
  codeText: { color: TEXT, fontSize: 15, fontWeight: "900" },
  bestBadge: {
    backgroundColor: "#FFF1D4",
    borderRadius: 6,
    color: "#A84B15",
    fontSize: 8,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  couponTitle: { color: "#4C524D", fontSize: 11, fontWeight: "700", marginTop: 3 },
  applyButton: {
    alignItems: "center",
    borderColor: GREEN,
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    height: 35,
    justifyContent: "center",
    marginLeft: 8,
    minWidth: 70,
    paddingHorizontal: 10,
  },
  appliedButton: { backgroundColor: GREEN, borderColor: GREEN },
  applyButtonText: { color: GREEN, fontSize: 12, fontWeight: "900" },
  appliedButtonText: { color: "#FFFFFF" },
  couponDivider: { borderTopColor: "#DDE1DD", borderTopWidth: StyleSheet.hairlineWidth, marginBottom: 12, marginTop: 12 },
  couponDescription: { color: "#3D433E", fontSize: 13, lineHeight: 18 },
  couponLimit: { color: "#737A74", fontSize: 12, lineHeight: 17, marginTop: 7 },
  couponBottomRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  moreText: { color: "#363B37", fontSize: 11, fontWeight: "900" },
  expiry: { color: "#D92D20", fontSize: 10, fontWeight: "700" },
  groupCard: { backgroundColor: "#FFFFFF", borderColor: BORDER, borderRadius: 14, borderWidth: 0.5, overflow: "hidden" },
  groupFooter: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 0.5,
    flexDirection: "row",
    gap: 7,
    height: 48,
    justifyContent: "center",
  },
  groupFooterText: { color: GREEN, fontSize: 13, fontWeight: "800" },
  divider: { backgroundColor: BORDER, height: StyleSheet.hairlineWidth },
  autoAppliedPill: { alignItems: "center", backgroundColor: "#EAF8ED", borderRadius: 9, flexDirection: "row", gap: 3, paddingHorizontal: 9, paddingVertical: 7 },
  appliedText: { color: GREEN, fontSize: 11, fontWeight: "900" },
  eligibleText: { color: "#737A74", fontSize: 10, fontWeight: "700" },
  viewAction: { alignItems: "center", flexDirection: "row", marginLeft: 8 },
  viewActionText: { color: GREEN, fontSize: 12, fontWeight: "900" },
  offerRow: { alignItems: "center", flexDirection: "row", minHeight: 82, paddingHorizontal: 14, paddingVertical: 11 },
  brandLogo: { alignItems: "center", borderRadius: 8, height: 40, justifyContent: "center", marginRight: 13, width: 40 },
  brandLogoText: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  paytmText: { fontSize: 10 },
  offerName: { color: TEXT, fontSize: 13, fontWeight: "800" },
  offerValue: { color: TEXT, fontSize: 12, fontWeight: "700", marginTop: 3 },
  offerDetail: { color: "#606761", fontSize: 11, marginTop: 3 },
  offerRight: { color: GREEN, fontSize: 11, fontWeight: "800", marginHorizontal: 7 },
  categoryIcon: { alignItems: "center", backgroundColor: "#EAF8ED", borderRadius: 20, height: 40, justifyContent: "center", marginRight: 13, width: 40 },
  termsBox: { marginBottom: 12, marginTop: 20 },
  termsText: { color: "#68706A", fontSize: 10, lineHeight: 15, marginTop: 3 },
}));
