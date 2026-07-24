import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PRODUCT_IMAGES } from "./GroceryHomeContent";
import { withReadableGroceryTypography } from "./groceryReadableTypography";

const GREEN = "#0B7A33";

const FALLBACK_ALTERNATIVES = [
  { id: "sub-butter", brand: "AMUL", name: "Pasteurised Butter", qty: "500 g", price: 285, mrp: 300, rating: "4.8", eta: "7 mins", image: PRODUCT_IMAGES.lifestyleButter, stock: "In stock" },
  { id: "sub-rice", brand: "DAAWAT", name: "Super Basmati Rice", qty: "1 kg", price: 189, mrp: 229, rating: "4.7", eta: "9 mins", image: PRODUCT_IMAGES.lifestyleRice, stock: "In stock" },
  { id: "sub-atta", brand: "AASHIRVAAD", name: "Select Sharbati Atta", qty: "5 kg", price: 349, mrp: 399, rating: "4.7", eta: "8 mins", image: PRODUCT_IMAGES.lifestyleAtta, stock: "In stock" },
];

function money(value) {
  const amount = Number(value || 0);
  return `${amount < 0 ? "−" : ""}₹${Math.abs(amount).toFixed(amount % 1 ? 2 : 0)}`;
}

function productId(product = {}) {
  return product.backendProductId || product.id;
}

function ProductVisual({ product, unavailable = false }) {
  return (
    <View style={[styles.productVisual, unavailable && styles.productVisualUnavailable]}>
      {product?.image ? <Image source={product.image} style={styles.productImage} resizeMode="contain" /> : (
        <MaterialCommunityIcons name="package-variant" size={36} color="#98A2B3" />
      )}
    </View>
  );
}

function PriceDifference({ difference }) {
  if (!difference) return <Text style={styles.samePrice}>Same price</Text>;
  const costsMore = difference > 0;
  return (
    <Text style={[styles.priceDifference, costsMore ? styles.priceDifferenceUp : styles.priceDifferenceDown]}>
      {costsMore ? `+${money(difference)}` : `${money(difference)}`} difference
    </Text>
  );
}

function AlternativeCard({ product, selected, originalPrice, quantity, recommended, onPress }) {
  const difference = (Number(product.price || 0) - Number(originalPrice || 0)) * quantity;
  return (
    <Pressable style={[styles.alternativeCard, selected && styles.alternativeCardSelected]} onPress={onPress}>
      <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
      <ProductVisual product={product} />
      <View style={styles.alternativeCopy}>
        <View style={styles.alternativeTitleRow}>
          <Text style={styles.alternativeName} numberOfLines={2}>{product.name}</Text>
          {recommended ? <View style={styles.recommendedBadge}><Text style={styles.recommendedBadgeText}>BEST MATCH</Text></View> : null}
        </View>
        <Text style={styles.alternativeQty}>{product.qty || "1 pack"}</Text>
        <View style={styles.alternativeMeta}>
          <MaterialCommunityIcons name="star" size={12} color="#E5AD25" />
          <Text style={styles.alternativeRating}>{product.rating || "4.5"}</Text>
          <View style={styles.metaDivider} />
          <Text style={styles.alternativeEta}>{product.eta || "8 mins"}</Text>
        </View>
        <View style={styles.alternativePriceRow}>
          <Text style={styles.alternativePrice}>₹{product.price}</Text>
          {product.mrp > product.price ? <Text style={styles.alternativeMrp}>₹{product.mrp}</Text> : null}
        </View>
        <PriceDifference difference={difference} />
      </View>
    </Pressable>
  );
}

export default function GrocerySubstitutionScreen({
  issues = [],
  cartItems = [],
  catalogProducts = [],
  onClose,
  onApply,
}) {
  const issue = issues[0] || {};
  const issueId = issue.productId || issue.product?.id || issue.product?.productId;
  const unavailableItem = cartItems.find((item) => {
    const id = productId(item.product);
    return issueId ? String(id) === String(issueId) : false;
  }) || cartItems[0] || { product: issue.product || {}, quantity: 1 };
  const unavailableProduct = unavailableItem.product || issue.product || {};
  const quantity = Math.max(1, Number(unavailableItem.quantity) || 1);

  const alternatives = useMemo(() => {
    const issueSuggestions = issue.alternatives || issue.suggestions || issue.substitutes || [];
    const candidates = issueSuggestions.length ? issueSuggestions : catalogProducts;
    const filtered = candidates
      .map((candidate) => candidate.product || candidate)
      .filter((candidate) => candidate?.id && String(productId(candidate)) !== String(productId(unavailableProduct)))
      .filter((candidate) => String(candidate.stock || "").toLowerCase() !== "out of stock")
      .slice(0, 4);
    return filtered.length ? filtered : FALLBACK_ALTERNATIVES;
  }, [catalogProducts, issue, unavailableProduct]);

  const [selectedId, setSelectedId] = useState(() => productId(alternatives[0]));
  const selectedProduct = alternatives.find((product) => String(productId(product)) === String(selectedId)) || alternatives[0];
  const currentItemsTotal = cartItems.reduce((sum, item) => sum + Number(item.unit?.price || item.product?.price || 0) * Math.max(1, Number(item.quantity) || 1), 0);
  const originalLineTotal = Number(unavailableItem.unit?.price || unavailableProduct.price || 0) * quantity;
  const replacementLineTotal = Number(selectedProduct?.price || 0) * quantity;
  const difference = replacementLineTotal - originalLineTotal;
  const updatedTotal = currentItemsTotal + difference;

  const buildUpdatedItems = (remove = false) => cartItems
    .filter((item) => !remove || String(productId(item.product)) !== String(productId(unavailableProduct)))
    .map((item) => {
      if (remove || String(productId(item.product)) !== String(productId(unavailableProduct))) return item;
      return { ...item, product: selectedProduct, unit: null, quantity };
    });

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onClose} hitSlop={10}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#344054" />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Choose a substitute</Text>
          <Text style={styles.headerSubtitle}>Review unavailable items before payment</Text>
        </View>
        <View style={styles.issueCounter}><Text style={styles.issueCounterText}>1/{Math.max(1, issues.length)}</Text></View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.noticeCard}>
          <View style={styles.noticeIcon}><MaterialCommunityIcons name="alert-circle-outline" size={21} color="#B42318" /></View>
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>This product is unavailable</Text>
            <Text style={styles.noticeText}>{issue.message || "The store has just run out of this item. Select a substitute or remove it from your cart."}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>UNAVAILABLE PRODUCT</Text>
          <View style={styles.unavailableCard}>
            <ProductVisual product={unavailableProduct} unavailable />
            <View style={styles.unavailableCopy}>
              <Text style={styles.unavailableName} numberOfLines={2}>{unavailableProduct.name || "Unavailable grocery item"}</Text>
              <Text style={styles.unavailableQty}>{unavailableItem.unit?.qty || unavailableProduct.qty || "1 pack"} · Qty {quantity}</Text>
              <View style={styles.unavailablePriceRow}>
                <Text style={styles.unavailablePrice}>₹{unavailableItem.unit?.price || unavailableProduct.price || 0}</Text>
                <View style={styles.outBadge}><Text style={styles.outBadgeText}>OUT OF STOCK</Text></View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>RECOMMENDED SUBSTITUTE</Text>
          {alternatives[0] ? (
            <AlternativeCard
              product={alternatives[0]}
              selected={String(productId(alternatives[0])) === String(selectedId)}
              originalPrice={unavailableItem.unit?.price || unavailableProduct.price}
              quantity={quantity}
              recommended
              onPress={() => setSelectedId(productId(alternatives[0]))}
            />
          ) : null}
        </View>

        {alternatives.length > 1 ? (
          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>ALTERNATIVE OPTIONS</Text>
            <View style={styles.alternativeList}>
              {alternatives.slice(1).map((product) => (
                <AlternativeCard
                  key={productId(product)}
                  product={product}
                  selected={String(productId(product)) === String(selectedId)}
                  originalPrice={unavailableItem.unit?.price || unavailableProduct.price}
                  quantity={quantity}
                  onPress={() => setSelectedId(productId(product))}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.decisionSection}>
          <Text style={styles.sectionEyebrow}>YOUR DECISION</Text>
          <Pressable
            style={styles.replaceButton}
            onPress={() => onApply?.({ updatedItems: buildUpdatedItems(false), removed: false, unavailableProduct, substitute: selectedProduct, quantity })}
          >
            <MaterialCommunityIcons name="swap-horizontal" size={20} color="#FFFFFF" />
            <Text style={styles.replaceButtonText}>Replace with selected item</Text>
          </Pressable>
          <Pressable
            style={styles.removeButton}
            onPress={() => onApply?.({ updatedItems: buildUpdatedItems(true), removed: true, unavailableProduct, substitute: null, quantity })}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={19} color="#B42318" />
            <Text style={styles.removeButtonText}>Remove unavailable item</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <View style={styles.summary}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={styles.summaryLabel}>Updated cart summary</Text>
            <Text style={styles.summaryItems}>{cartItems.length} items · including selected substitute</Text>
          </View>
          <PriceDifference difference={difference} />
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryTotalRow}>
          <Text style={styles.summaryTotalLabel}>Updated total</Text>
          <View style={styles.summaryAmountRow}>
            {difference ? <Text style={styles.summaryOldTotal}>₹{currentItemsTotal}</Text> : null}
            <Text style={styles.summaryTotal}>₹{updatedTotal}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create(withReadableGroceryTypography({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { flex: 1, backgroundColor: "#F6F7F8" },
  content: { paddingBottom: 8 },
  header: { minHeight: 72, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E4E7EC" },
  backButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#F7F8FA", alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1, marginHorizontal: 11 },
  headerTitle: { color: "#101828", fontSize: 18, lineHeight: 23, fontFamily: "PlusJakartaSans_800ExtraBold" },
  headerSubtitle: { marginTop: 2, color: "#667085", fontSize: 10, lineHeight: 14, fontFamily: "PlusJakartaSans_500Medium" },
  issueCounter: { minWidth: 36, height: 28, paddingHorizontal: 8, borderRadius: 14, backgroundColor: "#EFF8F0", alignItems: "center", justifyContent: "center" },
  issueCounterText: { color: GREEN, fontSize: 10, lineHeight: 13, fontFamily: "PlusJakartaSans_700Bold" },
  noticeCard: { margin: 12, marginBottom: 3, padding: 12, borderRadius: 12, backgroundColor: "#FEF3F2", flexDirection: "row", alignItems: "flex-start" },
  noticeIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FEE4E2", alignItems: "center", justifyContent: "center" },
  noticeCopy: { flex: 1, marginLeft: 10 },
  noticeTitle: { color: "#912018", fontSize: 13, lineHeight: 17, fontFamily: "PlusJakartaSans_700Bold" },
  noticeText: { marginTop: 3, color: "#B42318", fontSize: 10, lineHeight: 15, fontFamily: "PlusJakartaSans_500Medium" },
  section: { marginTop: 9, padding: 13, backgroundColor: "#FFFFFF" },
  sectionEyebrow: { marginBottom: 9, color: "#667085", fontSize: 10, lineHeight: 14, fontFamily: "PlusJakartaSans_800ExtraBold", letterSpacing: 0.75 },
  unavailableCard: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "#FECDCA", backgroundColor: "#FFFBFA", flexDirection: "row", alignItems: "center" },
  productVisual: { width: 82, height: 82, borderRadius: 10, backgroundColor: "#F7F8FA", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  productVisualUnavailable: { opacity: 0.64, backgroundColor: "#F2F4F7" },
  productImage: { width: "92%", height: "92%" },
  unavailableCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
  unavailableName: { color: "#344054", fontSize: 13, lineHeight: 17, fontFamily: "PlusJakartaSans_700Bold" },
  unavailableQty: { marginTop: 4, color: "#667085", fontSize: 10, lineHeight: 14, fontFamily: "PlusJakartaSans_500Medium" },
  unavailablePriceRow: { marginTop: 7, flexDirection: "row", alignItems: "center", gap: 8 },
  unavailablePrice: { color: "#344054", fontSize: 15, lineHeight: 19, fontFamily: "PlusJakartaSans_800ExtraBold" },
  outBadge: { minHeight: 20, paddingHorizontal: 6, borderRadius: 5, backgroundColor: "#FEE4E2", alignItems: "center", justifyContent: "center" },
  outBadgeText: { color: "#B42318", fontSize: 8, lineHeight: 11, fontFamily: "PlusJakartaSans_800ExtraBold" },
  alternativeList: { gap: 9 },
  alternativeCard: { padding: 9, borderRadius: 12, borderWidth: 1, borderColor: "#E4E7EC", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "flex-start" },
  alternativeCardSelected: { borderWidth: 1.5, borderColor: "#6FC083", backgroundColor: "#F8FCF9" },
  radio: { width: 20, height: 20, marginTop: 30, marginRight: 8, borderRadius: 10, borderWidth: 1.5, borderColor: "#B8C0CC", alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: GREEN },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: GREEN },
  alternativeCopy: { flex: 1, minWidth: 0, marginLeft: 10 },
  alternativeTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  alternativeName: { flex: 1, color: "#101828", fontSize: 12, lineHeight: 16, fontFamily: "PlusJakartaSans_700Bold" },
  recommendedBadge: { minHeight: 19, paddingHorizontal: 5, borderRadius: 5, backgroundColor: "#EAF6ED", alignItems: "center", justifyContent: "center" },
  recommendedBadgeText: { color: GREEN, fontSize: 7, lineHeight: 10, fontFamily: "PlusJakartaSans_800ExtraBold" },
  alternativeQty: { marginTop: 3, color: "#0759F6", fontSize: 9, lineHeight: 12, fontFamily: "PlusJakartaSans_600SemiBold" },
  alternativeMeta: { marginTop: 5, flexDirection: "row", alignItems: "center", gap: 4 },
  alternativeRating: { color: "#9A7417", fontSize: 9, lineHeight: 12, fontFamily: "PlusJakartaSans_600SemiBold" },
  metaDivider: { width: 1, height: 8, marginHorizontal: 2, backgroundColor: "#D0D5DD" },
  alternativeEta: { color: "#667085", fontSize: 9, lineHeight: 12, fontFamily: "PlusJakartaSans_600SemiBold", textTransform: "uppercase" },
  alternativePriceRow: { marginTop: 5, flexDirection: "row", alignItems: "baseline", gap: 6 },
  alternativePrice: { color: "#101828", fontSize: 15, lineHeight: 19, fontFamily: "PlusJakartaSans_800ExtraBold" },
  alternativeMrp: { color: "#98A2B3", fontSize: 10, lineHeight: 13, fontFamily: "PlusJakartaSans_500Medium", textDecorationLine: "line-through" },
  samePrice: { marginTop: 4, color: "#667085", fontSize: 9, lineHeight: 12, fontFamily: "PlusJakartaSans_600SemiBold" },
  priceDifference: { marginTop: 4, fontSize: 9, lineHeight: 12, fontFamily: "PlusJakartaSans_700Bold" },
  priceDifferenceUp: { color: "#B54708" },
  priceDifferenceDown: { color: "#079455" },
  decisionSection: { marginTop: 9, padding: 13, backgroundColor: "#FFFFFF" },
  replaceButton: { height: 46, borderRadius: 10, backgroundColor: GREEN, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  replaceButtonText: { color: "#FFFFFF", fontSize: 12, lineHeight: 16, fontFamily: "PlusJakartaSans_700Bold" },
  removeButton: { height: 43, marginTop: 8, borderRadius: 10, borderWidth: 1, borderColor: "#FECDCA", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  removeButtonText: { color: "#B42318", fontSize: 11, lineHeight: 15, fontFamily: "PlusJakartaSans_700Bold" },
  bottomSpace: { height: 12 },
  summary: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 13, borderTopWidth: 1, borderTopColor: "#E4E7EC", backgroundColor: "#FFFFFF", shadowColor: "#101828", shadowOpacity: 0, shadowRadius: 10, shadowOffset: { width: 0, height: -3 }, elevation: 0 },
  summaryTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryLabel: { color: "#101828", fontSize: 12, lineHeight: 16, fontFamily: "PlusJakartaSans_700Bold" },
  summaryItems: { marginTop: 2, color: "#667085", fontSize: 9, lineHeight: 12, fontFamily: "PlusJakartaSans_500Medium" },
  summaryDivider: { marginVertical: 9, borderBottomWidth: 1, borderStyle: "dashed", borderBottomColor: "#D0D5DD" },
  summaryTotalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryTotalLabel: { color: "#344054", fontSize: 12, lineHeight: 16, fontFamily: "PlusJakartaSans_700Bold" },
  summaryAmountRow: { flexDirection: "row", alignItems: "baseline", gap: 7 },
  summaryOldTotal: { color: "#98A2B3", fontSize: 11, lineHeight: 14, fontFamily: "PlusJakartaSans_500Medium", textDecorationLine: "line-through" },
  summaryTotal: { color: "#101828", fontSize: 18, lineHeight: 23, fontFamily: "PlusJakartaSans_800ExtraBold" },
}));
