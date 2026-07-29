import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PRODUCT_IMAGES } from "./GroceryHomeContent";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GREEN = "#0B7A33";
const PAGE_PADDING = 14;
const RESULT_GAP = 10;
const RESULT_CARD_WIDTH = Math.floor((SCREEN_WIDTH - PAGE_PADDING * 2 - RESULT_GAP) / 2);

const SEARCH_PRODUCTS = [
  { id: "search-atta", brand: "AASHIRVAAD", name: "Select Sharbati Atta", qty: "5 kg", price: 349, mrp: 399, rating: "4.7", eta: "8 mins", category: "Flour & Atta", image: PRODUCT_IMAGES.lifestyleAtta },
  { id: "search-butter", brand: "AMUL", name: "Pasteurised Butter", qty: "500 g", price: 285, mrp: 300, rating: "4.8", eta: "7 mins", category: "Dairy", image: PRODUCT_IMAGES.lifestyleButter },
  { id: "search-apples", brand: "FRESH", name: "Royal Gala Apples", qty: "4 pcs", price: 149, mrp: 180, rating: "4.6", eta: "9 mins", category: "Fruits", image: PRODUCT_IMAGES.lifestyleApples },
  { id: "search-rice", brand: "DAAWAT", name: "Super Basmati Rice", qty: "1 kg", price: 189, mrp: 229, rating: "4.7", eta: "9 mins", category: "Rice & Grains", image: PRODUCT_IMAGES.lifestyleRice },
  { id: "search-lays", brand: "LAY'S", name: "Chile Limón Potato Chips", qty: "48 g", price: 20, mrp: 25, rating: "4.5", eta: "8 mins", category: "Snacks", image: PRODUCT_IMAGES.lifestyleLays },
  { id: "search-coffee", brand: "NESCAFÉ", name: "Classic Instant Coffee", qty: "100 g", price: 299, mrp: 340, rating: "4.7", eta: "8 mins", category: "Tea & Coffee", image: PRODUCT_IMAGES.lifestyleCoffee },
  { id: "search-bananas", brand: "FRESH", name: "Robusta Bananas", qty: "6 pcs", price: 55, mrp: 65, rating: "4.6", eta: "9 mins", category: "Fruits", image: PRODUCT_IMAGES.lifestyleBananas },
  { id: "search-icecream", brand: "KWALITY WALL'S", name: "Chocolate Brownie Fudge", qty: "700 ml", price: 225, mrp: 275, rating: "4.6", eta: "10 mins", category: "Ice Cream", image: PRODUCT_IMAGES.lifestyleIceCream },
  { id: "search-maggi", brand: "MAGGI", name: "2-Minute Noodles", qty: "280 g", price: 55, mrp: 60, rating: "4.7", eta: "8 mins", category: "Instant Food", image: PRODUCT_IMAGES.lifestyleMaggi },
  { id: "search-dettol", brand: "DETTOL", name: "Original Germ Protection Soap", qty: "125 g", price: 52, mrp: 65, rating: "4.6", eta: "8 mins", category: "Personal Care", image: PRODUCT_IMAGES.lifestyleDettolSoap },
  { id: "search-bisleri", brand: "BISLERI", name: "Mineral Water", qty: "1 L", price: 20, mrp: 20, rating: "4.8", eta: "6 mins", category: "Cold Drinks & Water", image: PRODUCT_IMAGES.lifestyleBisleri },
];

const SEARCH_TERMS = [
  "atta", "aashirvaad atta", "amul butter", "butter", "fresh apples", "fruits",
  "basmati rice", "daawat rice", "lays chips", "snacks", "nescafe coffee", "coffee",
  "bananas", "ice cream", "maggi noodles", "dettol soap", "bisleri water",
];

const TRENDING_SEARCHES = ["Fresh fruits", "Atta & flour", "Cold drinks", "Maggi", "Ice cream", "Cleaning essentials"];
const INITIAL_RECENTS = ["Basmati rice", "Coffee", "Dettol soap"];
const POPULAR_CATEGORIES = [
  { id: "cat-fruits", label: "Fresh Fruits", image: PRODUCT_IMAGES.lifestyleApples, tint: "#FFF0EE" },
  { id: "cat-staples", label: "Atta & Rice", image: PRODUCT_IMAGES.lifestyleAtta, tint: "#FFF5E8" },
  { id: "cat-dairy", label: "Dairy", image: PRODUCT_IMAGES.lifestyleButter, tint: "#FFF8DE" },
  { id: "cat-snacks", label: "Snacks", image: PRODUCT_IMAGES.lifestyleLays, tint: "#EFF7E7" },
  { id: "cat-drinks", label: "Beverages", image: PRODUCT_IMAGES.lifestyleCoffee, tint: "#F8EEE8" },
  { id: "cat-instant", label: "Instant Food", image: PRODUCT_IMAGES.lifestyleMaggi, tint: "#FFF7D8" },
  { id: "cat-care", label: "Personal Care", image: PRODUCT_IMAGES.lifestyleDettolSoap, tint: "#ECF7EE" },
  { id: "cat-frozen", label: "Frozen Food", image: PRODUCT_IMAGES.lifestyleIceCream, tint: "#F6ECFA" },
];

function SectionHeader({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function SearchProductCard({ product, compact = false, quantity, onChangeQuantity, onPress }) {
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <Pressable style={[styles.productCard, compact && styles.productCardCompact]} onPress={() => onPress?.(product)}>
      <View style={[styles.productImageCard, compact && styles.productImageCardCompact]}>
        {discount > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{discount}% OFF</Text>
          </View>
        ) : null}
        <Image source={product.image} style={styles.productImage} resizeMode="contain" />
        <View style={styles.vegMark}><View style={styles.vegDot} /></View>
        {quantity > 0 ? (
          <View style={styles.stepper}>
            <Pressable style={styles.stepperButton} onPress={(event) => { event.stopPropagation?.(); onChangeQuantity(product.id, quantity - 1); }}>
              <Text style={styles.stepperSymbol}>−</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{quantity}</Text>
            <Pressable style={styles.stepperButton} onPress={(event) => { event.stopPropagation?.(); onChangeQuantity(product.id, quantity + 1); }}>
              <Text style={styles.stepperSymbol}>+</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.addButton} onPress={(event) => { event.stopPropagation?.(); onChangeQuantity(product.id, 1); }} hitSlop={8}>
            <MaterialCommunityIcons name="plus" size={21} color={GREEN} />
          </Pressable>
        )}
      </View>
      <View style={styles.productMeta}>
        <View style={styles.ratingRow}>
          <MaterialCommunityIcons name="star" size={11} color="#E4AD24" />
          <Text style={styles.ratingText}>{product.rating}</Text>
          <View style={styles.metaDivider} />
          <Text style={styles.etaText}>{product.eta}</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productQty}>{product.qty}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price}</Text>
          {product.mrp > product.price ? <Text style={styles.mrp}>₹{product.mrp}</Text> : null}
        </View>
        {discount > 0 ? <Text style={styles.offerText}>{discount}% OFF · Save ₹{product.mrp - product.price}</Text> : null}
      </View>
    </Pressable>
  );
}

function SuggestionRow({ label, query, onPress }) {
  const normalized = query.trim().toLowerCase();
  const index = label.toLowerCase().indexOf(normalized);

  return (
    <Pressable style={({ pressed }) => [styles.suggestionRow, pressed && styles.pressed]} onPress={() => onPress(label)}>
      <View style={styles.suggestionIcon}>
        <MaterialCommunityIcons name="magnify" size={18} color="#667085" />
      </View>
      <Text style={styles.suggestionText} numberOfLines={1}>
        {index >= 0 ? (
          <>
            {label.slice(0, index)}
            <Text style={styles.suggestionMatch}>{label.slice(index, index + normalized.length)}</Text>
            {label.slice(index + normalized.length)}
          </>
        ) : label}
      </Text>
      <MaterialCommunityIcons name="arrow-top-left" size={18} color="#98A2B3" />
    </Pressable>
  );
}

export default function GrocerySearchScreen({ query = "", onChangeQuery, onClose, onOpenProduct }) {
  const [recents, setRecents] = useState(INITIAL_RECENTS);
  const [quantities, setQuantities] = useState({});
  const entrance = useRef(new Animated.Value(0)).current;
  const typingEntrance = useRef(new Animated.Value(0)).current;
  const normalized = query.trim().toLowerCase();
  const isTyping = normalized.length > 0;

  const suggestions = useMemo(() => {
    if (!normalized) return [];
    return SEARCH_TERMS
      .filter((term) => term.includes(normalized) || normalized.includes(term))
      .slice(0, 6);
  }, [normalized]);

  const results = useMemo(() => {
    if (!normalized) return [];
    const queryTokens = normalized.split(/\s+/).filter(Boolean);
    return SEARCH_PRODUCTS.filter((product) => {
      const searchable = `${product.brand} ${product.name} ${product.category}`.toLowerCase();
      return searchable.includes(normalized) || queryTokens.every((token) => searchable.includes(token));
    });
  }, [normalized]);

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  useEffect(() => {
    typingEntrance.setValue(0);
    Animated.timing(typingEntrance, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [normalized, typingEntrance]);

  const changeQuantity = (id, value) => {
    setQuantities((current) => ({ ...current, [id]: Math.max(0, value) }));
  };

  const commitSearch = (value) => {
    const next = String(value || query).trim();
    if (!next) return;
    onChangeQuery?.(next);
    setRecents((current) => [next, ...current.filter((item) => item.toLowerCase() !== next.toLowerCase())].slice(0, 6));
    Keyboard.dismiss();
  };

  const openProduct = (product) => {
    setRecents((current) => [product.name, ...current.filter((item) => item !== product.name)].slice(0, 6));
    onOpenProduct?.(product);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Animated.View style={[styles.screen, { opacity: entrance }]}>
        <View style={styles.searchHeader}>
          <View style={styles.searchBar}>
            <Pressable style={styles.backButton} onPress={onClose} hitSlop={8}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#20242A" />
            </Pressable>
            <TextInput
              autoFocus
              value={query}
              onChangeText={onChangeQuery}
              onSubmitEditing={({ nativeEvent }) => commitSearch(nativeEvent.text)}
              placeholder="Search for atta, fruits, snacks..."
              placeholderTextColor="#98A2B3"
              style={styles.searchInput}
              returnKeyType="search"
              selectionColor={GREEN}
            />
            {query ? (
              <Pressable style={styles.headerIconButton} onPress={() => onChangeQuery?.("")} hitSlop={6}>
                <MaterialCommunityIcons name="close-circle" size={21} color="#98A2B3" />
              </Pressable>
            ) : (
              <Pressable style={styles.headerIconButton} hitSlop={6}>
                <MaterialCommunityIcons name="microphone-outline" size={22} color="#475467" />
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {!isTyping ? (
            <>
              {recents.length ? (
                <View style={styles.section}>
                  <SectionHeader title="Recent Searches" action="Clear" onAction={() => setRecents([])} />
                  <View style={styles.recentWrap}>
                    {recents.map((item) => (
                      <Pressable key={item} style={styles.recentChip} onPress={() => commitSearch(item)}>
                        <MaterialCommunityIcons name="history" size={16} color="#667085" />
                        <Text style={styles.recentChipText} numberOfLines={1}>{item}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <View style={styles.section}>
                <SectionHeader title="Buy Again" action="See all" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalProducts}>
                  {SEARCH_PRODUCTS.slice(0, 5).map((product) => (
                    <SearchProductCard
                      key={product.id}
                      product={product}
                      compact
                      quantity={quantities[product.id] || 0}
                      onChangeQuantity={changeQuantity}
                      onPress={openProduct}
                    />
                  ))}
                </ScrollView>
              </View>

              <View style={styles.section}>
                <SectionHeader title="Trending Searches" />
                <View style={styles.trendingGrid}>
                  {TRENDING_SEARCHES.map((item, index) => (
                    <Pressable key={item} style={styles.trendingItem} onPress={() => commitSearch(item)}>
                      <View style={styles.trendingIcon}>
                        <MaterialCommunityIcons name="trending-up" size={17} color={GREEN} />
                      </View>
                      <Text style={styles.trendingText}>{item}</Text>
                      <Text style={styles.trendingRank}>#{index + 1}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={[styles.section, styles.lastSection]}>
                <SectionHeader title="Popular Categories" action="View all" />
                <View style={styles.categoryGrid}>
                  {POPULAR_CATEGORIES.map((category) => (
                    <Pressable key={category.id} style={styles.categoryItem} onPress={() => commitSearch(category.label)}>
                      <View style={[styles.categoryImageWrap, { backgroundColor: category.tint }]}>
                        <Image source={category.image} style={styles.categoryImage} resizeMode="contain" />
                      </View>
                      <Text style={styles.categoryLabel} numberOfLines={2}>{category.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <Animated.View
              style={{
                opacity: typingEntrance,
                transform: [{ translateY: typingEntrance.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
              }}
            >
              {suggestions.length ? (
                <View style={styles.suggestionSection}>
                  <Text style={styles.typingEyebrow}>Suggestions</Text>
                  {suggestions.map((item) => <SuggestionRow key={item} label={item} query={query} onPress={commitSearch} />)}
                </View>
              ) : null}

              {results.length ? (
                <View style={styles.resultsSection}>
                  <View style={styles.resultsHeader}>
                    <Text style={styles.resultsTitle}>Results for “{query.trim()}”</Text>
                    <Text style={styles.resultsCount}>{results.length} products</Text>
                  </View>
                  <View style={styles.resultGrid}>
                    {results.map((product) => (
                      <SearchProductCard
                        key={product.id}
                        product={product}
                        quantity={quantities[product.id] || 0}
                        onChangeQuantity={changeQuantity}
                        onPress={openProduct}
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.noResultsSection}>
                  <View style={styles.noResultsIcon}>
                    <MaterialCommunityIcons name="magnify-close" size={34} color="#667085" />
                  </View>
                  <Text style={styles.noResultsTitle}>No results for “{query.trim()}”</Text>
                  <Text style={styles.noResultsSubtitle}>Try a different spelling or browse these popular picks.</Text>
                  <View style={styles.noResultTerms}>
                    {TRENDING_SEARCHES.slice(0, 4).map((item) => (
                      <Pressable key={item} style={styles.noResultChip} onPress={() => commitSearch(item)}>
                        <Text style={styles.noResultChipText}>{item}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <SectionHeader title="Recommended for you" />
                  <View style={styles.resultGrid}>
                    {SEARCH_PRODUCTS.slice(0, 4).map((product) => (
                      <SearchProductCard
                        key={product.id}
                        product={product}
                        quantity={quantities[product.id] || 0}
                        onChangeQuantity={changeQuantity}
                        onPress={openProduct}
                      />
                    ))}
                  </View>
                </View>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#F6F7F8" },
  searchHeader: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10, backgroundColor: "#FFFFFF", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E4E7EC" },
  searchBar: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: "#D7DBE0", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  backButton: { width: 44, height: 50, alignItems: "center", justifyContent: "center" },
  searchInput: { flex: 1, height: 50, paddingHorizontal: 0, color: "#101828", fontSize: 15, lineHeight: 20, fontFamily: "PlusJakartaSans_600SemiBold" },
  headerIconButton: { width: 43, height: 50, alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 34 },
  section: { marginTop: 9, paddingHorizontal: PAGE_PADDING, paddingTop: 14, paddingBottom: 16, backgroundColor: "#FFFFFF" },
  lastSection: { paddingBottom: 28 },
  sectionHeader: { minHeight: 28, marginBottom: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#101828", fontSize: 18, lineHeight: 23, fontFamily: "PlusJakartaSans_800ExtraBold", fontWeight: "800", letterSpacing: -0.3 },
  sectionAction: { color: GREEN, fontSize: 12, lineHeight: 16, fontFamily: "PlusJakartaSans_700Bold" },
  recentWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  recentChip: { maxWidth: "100%", height: 36, paddingHorizontal: 11, borderRadius: 9, borderWidth: 1, borderColor: "#E0E3E7", backgroundColor: "#FAFBFC", flexDirection: "row", alignItems: "center", gap: 6 },
  recentChipText: { maxWidth: 150, color: "#344054", fontSize: 12, lineHeight: 16, fontFamily: "PlusJakartaSans_600SemiBold" },
  horizontalProducts: { gap: 10, paddingRight: 8 },
  productCard: { width: RESULT_CARD_WIDTH, borderRadius: 0, borderWidth: 0, borderColor: "transparent", backgroundColor: "transparent", overflow: "visible" },
  productCardCompact: { width: 148 },
  productImageCard: { width: "100%", height: Math.round(RESULT_CARD_WIDTH * 0.93), borderRadius: 12, backgroundColor: "#F7F8FA", overflow: "hidden", position: "relative", alignItems: "center", justifyContent: "center" },
  productImageCardCompact: { height: 132 },
  productImage: { width: "100%", height: "100%" },
  discountBadge: { position: "absolute", left: 5, top: 5, zIndex: 4, minHeight: 23, paddingHorizontal: 6, borderRadius: 5, backgroundColor: "#5C1697", alignItems: "center", justifyContent: "center" },
  discountBadgeText: { color: "#FFFFFF", fontSize: 8, lineHeight: 11, fontFamily: "PlusJakartaSans_800ExtraBold" },
  vegMark: { position: "absolute", left: 6, bottom: 6, width: 18, height: 18, borderWidth: 1.4, borderColor: GREEN, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  vegDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN },
  addButton: { position: "absolute", right: 5, bottom: 5, width: 34, height: 34, borderRadius: 8, borderWidth: 1.3, borderColor: GREEN, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", zIndex: 5 },
  stepper: { position: "absolute", right: 5, bottom: 5, width: 86, height: 34, borderRadius: 8, borderWidth: 1.2, borderColor: GREEN, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 5 },
  stepperButton: { width: 28, height: "100%", alignItems: "center", justifyContent: "center" },
  stepperSymbol: { color: GREEN, fontSize: 20, lineHeight: 23, fontFamily: "PlusJakartaSans_700Bold" },
  stepperValue: { color: "#101828", fontSize: 13, lineHeight: 17, fontFamily: "PlusJakartaSans_800ExtraBold" },
  productMeta: { minHeight: 124, paddingHorizontal: 3, paddingTop: 8, paddingBottom: 9 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { color: "#9A7417", fontSize: 10, lineHeight: 13, fontFamily: "PlusJakartaSans_600SemiBold" },
  metaDivider: { width: 1, height: 8, marginHorizontal: 2, backgroundColor: "#D0D5DD" },
  etaText: { color: "#667085", fontSize: 9, lineHeight: 12, fontFamily: "PlusJakartaSans_600SemiBold", textTransform: "uppercase" },
  productName: { minHeight: 36, marginTop: 5, color: "#101828", fontSize: 13, lineHeight: 17, fontFamily: "PlusJakartaSans_700Bold" },
  productQty: { marginTop: 2, color: "#0759F6", fontSize: 10, lineHeight: 13, fontFamily: "PlusJakartaSans_700Bold" },
  priceRow: { marginTop: 5, flexDirection: "row", alignItems: "baseline", gap: 6 },
  price: { color: "#101828", fontSize: 16, lineHeight: 20, fontFamily: "PlusJakartaSans_800ExtraBold" },
  mrp: { color: "#98A2B3", fontSize: 11, lineHeight: 14, fontFamily: "PlusJakartaSans_500Medium", textDecorationLine: "line-through" },
  offerText: { marginTop: 2, color: "#079455", fontSize: 9, lineHeight: 12, fontFamily: "PlusJakartaSans_700Bold" },
  trendingGrid: { gap: 8 },
  trendingItem: { minHeight: 44, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#F8FAF8", flexDirection: "row", alignItems: "center" },
  trendingIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: "#EAF6ED", alignItems: "center", justifyContent: "center" },
  trendingText: { flex: 1, marginLeft: 10, color: "#344054", fontSize: 13, lineHeight: 17, fontFamily: "PlusJakartaSans_600SemiBold" },
  trendingRank: { color: "#98A2B3", fontSize: 10, lineHeight: 13, fontFamily: "PlusJakartaSans_600SemiBold" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", columnGap: 8, rowGap: 14 },
  categoryItem: { width: Math.floor((SCREEN_WIDTH - PAGE_PADDING * 2 - 24) / 4), alignItems: "center" },
  categoryImageWrap: { width: "100%", aspectRatio: 1, borderRadius: 13, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  categoryImage: { width: "92%", height: "92%" },
  categoryLabel: { minHeight: 31, marginTop: 6, color: "#344054", fontSize: 10, lineHeight: 14, fontFamily: "PlusJakartaSans_600SemiBold", textAlign: "center" },
  suggestionSection: { paddingHorizontal: PAGE_PADDING, paddingTop: 10, paddingBottom: 8, backgroundColor: "#FFFFFF" },
  typingEyebrow: { marginBottom: 4, color: "#667085", fontSize: 11, lineHeight: 15, fontFamily: "PlusJakartaSans_700Bold", textTransform: "uppercase", letterSpacing: 0.8 },
  suggestionRow: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#EAECF0" },
  suggestionIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: "#F2F4F7", alignItems: "center", justifyContent: "center" },
  suggestionText: { flex: 1, color: "#344054", fontSize: 14, lineHeight: 19, fontFamily: "PlusJakartaSans_500Medium" },
  suggestionMatch: { color: "#101828", fontFamily: "PlusJakartaSans_800ExtraBold" },
  pressed: { opacity: 0.58 },
  resultsSection: { marginTop: 8, paddingHorizontal: PAGE_PADDING, paddingTop: 15, paddingBottom: 28, backgroundColor: "#FFFFFF" },
  resultsHeader: { marginBottom: 12, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 8 },
  resultsTitle: { flex: 1, color: "#101828", fontSize: 18, lineHeight: 23, fontFamily: "PlusJakartaSans_800ExtraBold" },
  resultsCount: { color: "#667085", fontSize: 10, lineHeight: 14, fontFamily: "PlusJakartaSans_600SemiBold" },
  resultGrid: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", columnGap: RESULT_GAP, rowGap: 12 },
  noResultsSection: { marginTop: 8, paddingHorizontal: PAGE_PADDING, paddingTop: 24, paddingBottom: 34, backgroundColor: "#FFFFFF", alignItems: "center" },
  noResultsIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: "#F2F4F7", alignItems: "center", justifyContent: "center" },
  noResultsTitle: { marginTop: 13, color: "#101828", fontSize: 18, lineHeight: 23, fontFamily: "PlusJakartaSans_800ExtraBold", textAlign: "center" },
  noResultsSubtitle: { maxWidth: 300, marginTop: 5, color: "#667085", fontSize: 12, lineHeight: 17, fontFamily: "PlusJakartaSans_500Medium", textAlign: "center" },
  noResultTerms: { marginTop: 14, marginBottom: 25, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 7 },
  noResultChip: { minHeight: 34, paddingHorizontal: 11, borderRadius: 9, borderWidth: 1, borderColor: "#D0D5DD", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  noResultChipText: { color: "#475467", fontSize: 11, lineHeight: 15, fontFamily: "PlusJakartaSans_600SemiBold" },
});
