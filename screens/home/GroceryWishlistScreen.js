import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
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
import { LinearGradient } from "expo-linear-gradient";
import { PRODUCT_IMAGES } from "./GroceryHomeContent";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PAGE_PADDING = 14;
const CARD_GAP = 10;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - PAGE_PADDING * 2 - CARD_GAP) / 2);
const GREEN = "#0B7A33";

const INITIAL_ITEMS = [
  { id: "fav-atta", brand: "AASHIRVAAD", name: "Select Sharbati Atta", qty: "5 kg", price: 349, mrp: 399, rating: "4.7", eta: "8 mins", image: PRODUCT_IMAGES.lifestyleAtta, stock: true, buyAgain: true, fast: true },
  { id: "fav-butter", brand: "AMUL", name: "Pasteurised Butter", qty: "500 g", price: 285, mrp: 300, rating: "4.8", eta: "7 mins", image: PRODUCT_IMAGES.lifestyleButter, stock: true, buyAgain: true, fast: true },
  { id: "fav-apples", brand: "FRESH", name: "Royal Gala Apples", qty: "4 pcs", price: 149, mrp: 180, rating: "4.6", eta: "9 mins", image: PRODUCT_IMAGES.lifestyleApples, stock: true, buyAgain: false, fast: false },
  { id: "fav-rice", brand: "DAAWAT", name: "Super Basmati Rice", qty: "1 kg", price: 189, mrp: 229, rating: "4.7", eta: "9 mins", image: PRODUCT_IMAGES.lifestyleRice, stock: true, buyAgain: true, fast: false },
  { id: "fav-lays", brand: "LAY'S", name: "Chile Limón Potato Chips", qty: "48 g", price: 20, mrp: 25, rating: "4.5", eta: "8 mins", image: PRODUCT_IMAGES.lifestyleLays, stock: true, buyAgain: false, fast: true },
  { id: "fav-coffee", brand: "NESCAFÉ", name: "Classic Instant Coffee", qty: "100 g", price: 299, mrp: 340, rating: "4.7", eta: "8 mins", image: PRODUCT_IMAGES.lifestyleCoffee, stock: true, buyAgain: true, fast: true },
  { id: "fav-maggi", brand: "MAGGI", name: "2-Minute Noodles", qty: "280 g", price: 55, mrp: 60, rating: "4.7", eta: "8 mins", image: PRODUCT_IMAGES.lifestyleMaggi, stock: false, buyAgain: false, fast: true },
  { id: "fav-icecream", brand: "KWALITY WALL'S", name: "Chocolate Brownie Fudge", qty: "700 ml", price: 225, mrp: 275, rating: "4.6", eta: "10 mins", image: PRODUCT_IMAGES.lifestyleIceCream, stock: true, buyAgain: false, fast: false },
];

const QUICK_FILTERS = ["In Stock", "Offers", "Under ₹100", "Buy Again", "Fast Delivery"];

const COLLECTIONS = [
  { id: "weekly", title: "Weekly Staples", subtitle: "5 saved items", colors: ["#FFF3DE", "#F9E2BD"], images: [PRODUCT_IMAGES.lifestyleAtta, PRODUCT_IMAGES.lifestyleRice] },
  { id: "breakfast", title: "Breakfast Picks", subtitle: "4 saved items", colors: ["#EDF7E8", "#D9ECD2"], images: [PRODUCT_IMAGES.lifestyleButter, PRODUCT_IMAGES.lifestyleCoffee] },
  { id: "snacks", title: "Snack Shelf", subtitle: "6 saved items", colors: ["#F5ECFF", "#E7D9F6"], images: [PRODUCT_IMAGES.lifestyleLays, PRODUCT_IMAGES.lifestyleMaggi] },
];

function SectionHeader({ title, subtitle, action }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

function BuyAgainCard({ item, quantity, onChangeQuantity }) {
  return (
    <View style={styles.buyAgainCard}>
      <View style={styles.buyAgainVisual}>
        <Image source={item.image} style={styles.buyAgainImage} resizeMode="contain" />
        <Pressable style={styles.buyAgainAdd} onPress={() => onChangeQuantity(item.id, quantity + 1)}>
          <MaterialCommunityIcons name="plus" size={19} color={GREEN} />
        </Pressable>
      </View>
      <Text style={styles.buyAgainName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.buyAgainQty}>{item.qty}</Text>
      <Text style={styles.buyAgainPrice}>₹{item.price}</Text>
    </View>
  );
}

function CollectionCard({ collection }) {
  return (
    <Pressable style={({ pressed }) => [styles.collectionCard, pressed && styles.pressed]}>
      <LinearGradient colors={collection.colors} style={styles.collectionGradient}>
        <View style={styles.collectionCopy}>
          <Text style={styles.collectionTitle}>{collection.title}</Text>
          <Text style={styles.collectionSubtitle}>{collection.subtitle}</Text>
          <View style={styles.collectionArrow}>
            <MaterialCommunityIcons name="arrow-right" size={17} color="#344054" />
          </View>
        </View>
        <View style={styles.collectionImages}>
          {collection.images.map((image, index) => (
            <Image key={index} source={image} style={[styles.collectionImage, index === 1 && styles.collectionImageBack]} resizeMode="contain" />
          ))}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function HeartBurst({ progress }) {
  const opacity = progress.interpolate({ inputRange: [0, 0.18, 1], outputRange: [0, 1, 0] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.5] });
  return (
    <Animated.View pointerEvents="none" style={[styles.heartBurst, { opacity, transform: [{ scale }] }]}>
      <View style={[styles.burstDot, styles.burstDotTop]} />
      <View style={[styles.burstDot, styles.burstDotRight]} />
      <View style={[styles.burstDot, styles.burstDotBottom]} />
      <View style={[styles.burstDot, styles.burstDotLeft]} />
    </Animated.View>
  );
}

function WishlistCard({ item, quantity, onChangeQuantity, onRemoved }) {
  const heartScale = useRef(new Animated.Value(1)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const collapse = useRef(new Animated.Value(0)).current;
  const removingRef = useRef(false);
  const discount = item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;

  const removeFavorite = () => {
    if (removingRef.current) return;
    removingRef.current = true;
    burst.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.spring(heartScale, { toValue: 1.28, damping: 7, stiffness: 300, mass: 0.45, useNativeDriver: true }),
        Animated.spring(heartScale, { toValue: 0.88, damping: 10, stiffness: 240, mass: 0.55, useNativeDriver: true }),
      ]),
      Animated.timing(burst, { toValue: 1, duration: 330, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(collapse, {
        toValue: 1,
        duration: 280,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) onRemoved(item.id);
      });
    });
  };

  return (
    <Animated.View
      style={[
        styles.wishlistCell,
        {
          maxHeight: collapse.interpolate({ inputRange: [0, 1], outputRange: [330, 0] }),
          opacity: collapse.interpolate({ inputRange: [0, 0.72, 1], outputRange: [1, 0.45, 0] }),
          marginBottom: collapse.interpolate({ inputRange: [0, 1], outputRange: [CARD_GAP, 0] }),
          transform: [{ scale: collapse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] }) }],
        },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.visual}>
          {discount > 0 ? (
            <View style={styles.discountBadge}><Text style={styles.discountText}>{discount}% OFF</Text></View>
          ) : null}
          <Image source={item.image} style={styles.productImage} resizeMode="contain" />
          <View style={styles.favoriteWrap}>
            <HeartBurst progress={burst} />
            <Pressable style={styles.favoriteButton} onPress={removeFavorite} hitSlop={8}>
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <MaterialCommunityIcons name="heart" size={20} color="#D92D20" />
              </Animated.View>
            </Pressable>
          </View>
          <View style={styles.vegMark}><View style={styles.vegDot} /></View>
          {quantity > 0 ? (
            <View style={styles.stepper}>
              <Pressable style={styles.stepperButton} onPress={() => onChangeQuantity(item.id, quantity - 1)}><Text style={styles.stepperText}>−</Text></Pressable>
              <Text style={styles.stepperValue}>{quantity}</Text>
              <Pressable style={styles.stepperButton} onPress={() => onChangeQuantity(item.id, quantity + 1)}><Text style={styles.stepperText}>+</Text></Pressable>
            </View>
          ) : (
            <Pressable style={styles.addButton} onPress={() => onChangeQuantity(item.id, 1)}>
              <MaterialCommunityIcons name="plus" size={21} color={GREEN} />
            </Pressable>
          )}
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="star" size={11} color="#E5AD25" />
            <Text style={styles.rating}>{item.rating}</Text>
            <View style={styles.metaDivider} />
            <Text style={styles.eta}>{item.eta}</Text>
          </View>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.qty}>{item.qty}</Text>
          <View style={styles.infoDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.price}</Text>
            {item.mrp > item.price ? <Text style={styles.mrp}>₹{item.mrp}</Text> : null}
          </View>
          {discount > 0 ? <Text style={styles.offer}>{discount}% OFF · Save ₹{item.mrp - item.price}</Text> : null}
        </View>
      </View>
    </Animated.View>
  );
}

function EmptyWishlist({ quantities, onChangeQuantity }) {
  return (
    <View style={styles.emptySection}>
      <View style={styles.emptyIcon}>
        <MaterialCommunityIcons name="heart-outline" size={38} color="#98A2B3" />
      </View>
      <Text style={styles.emptyTitle}>Save the things you love</Text>
      <Text style={styles.emptySubtitle}>Tap the heart on any product to keep it here for later.</Text>
      <Pressable style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>Explore groceries</Text>
        <MaterialCommunityIcons name="arrow-right" size={17} color="#FFFFFF" />
      </Pressable>
      <View style={styles.emptyRecommendations}>
        <SectionHeader title="Popular right now" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.buyAgainRow}>
          {INITIAL_ITEMS.slice(2, 6).map((item) => (
            <BuyAgainCard key={item.id} item={item} quantity={quantities[item.id] || 0} onChangeQuantity={onChangeQuantity} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export default function GroceryWishlistScreen({ onClose }) {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [quantities, setQuantities] = useState({});
  const [activeFilters, setActiveFilters] = useState([]);

  const changeQuantity = (id, nextQuantity) => {
    setQuantities((current) => ({ ...current, [id]: Math.max(0, nextQuantity) }));
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setQuantities((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const toggleFilter = (filter) => {
    setActiveFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]);
  };

  const visibleItems = items.filter((item) => {
    if (activeFilters.includes("In Stock") && !item.stock) return false;
    if (activeFilters.includes("Offers") && item.mrp <= item.price) return false;
    if (activeFilters.includes("Under ₹100") && item.price >= 100) return false;
    if (activeFilters.includes("Buy Again") && !item.buyAgain) return false;
    if (activeFilters.includes("Fast Delivery") && !item.fast) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onClose} hitSlop={10}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#344054" />
        </Pressable>
        <View style={styles.headerCopy}>
          <View style={styles.headerTitleRow}>
            <MaterialCommunityIcons name="heart" size={21} color="#D92D20" />
            <Text style={styles.title}>Favorites</Text>
          </View>
          <Text style={styles.headerSubtitle}>{items.length} saved products</Text>
        </View>
        <Pressable style={styles.headerSearch}>
          <MaterialCommunityIcons name="magnify" size={22} color="#475467" />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {items.length ? (
          <>
            <View style={styles.section}>
              <SectionHeader title="Buy Again" subtitle="Your frequently purchased favorites" action="See all" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.buyAgainRow}>
                {items.filter((item) => item.buyAgain).map((item) => (
                  <BuyAgainCard key={item.id} item={item} quantity={quantities[item.id] || 0} onChangeQuantity={changeQuantity} />
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <SectionHeader title="Collections" subtitle="Keep favorites organised your way" action="Manage" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collectionRow}>
                {COLLECTIONS.map((collection) => <CollectionCard key={collection.id} collection={collection} />)}
              </ScrollView>
            </View>

            <View style={styles.filterSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {QUICK_FILTERS.map((filter) => {
                  const active = activeFilters.includes(filter);
                  return (
                    <Pressable key={filter} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => toggleFilter(filter)}>
                      <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text>
                      {active ? <MaterialCommunityIcons name="check" size={14} color={GREEN} /> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.productsSection}>
              <SectionHeader title="Wishlist Products" subtitle={`${visibleItems.length} of ${items.length} products`} />
              {visibleItems.length ? (
                <View style={styles.grid}>
                  {visibleItems.map((item) => (
                    <WishlistCard
                      key={item.id}
                      item={item}
                      quantity={quantities[item.id] || 0}
                      onChangeQuantity={changeQuantity}
                      onRemoved={removeItem}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.filterEmpty}>
                  <MaterialCommunityIcons name="filter-variant-remove" size={31} color="#98A2B3" />
                  <Text style={styles.filterEmptyTitle}>No favorites match these filters</Text>
                  <Pressable onPress={() => setActiveFilters([])}><Text style={styles.clearFilters}>Clear filters</Text></Pressable>
                </View>
              )}
            </View>
          </>
        ) : <EmptyWishlist quantities={quantities} onChangeQuantity={changeQuantity} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { flex: 1, backgroundColor: "#F6F7F8" },
  content: { paddingBottom: 34 },
  header: { minHeight: 70, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E4E7EC" },
  backButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "#F7F8FA" },
  headerCopy: { flex: 1, marginLeft: 11 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  title: { color: "#101828", fontSize: 21, lineHeight: 27, fontFamily: "PlusJakartaSans_800ExtraBold", letterSpacing: -0.4 },
  headerSubtitle: { marginTop: 1, color: "#667085", fontSize: 10, lineHeight: 14, fontFamily: "PlusJakartaSans_500Medium" },
  headerSearch: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "#E4E7EC", alignItems: "center", justifyContent: "center" },
  section: { marginTop: 9, paddingHorizontal: PAGE_PADDING, paddingTop: 15, paddingBottom: 17, backgroundColor: "#FFFFFF" },
  sectionHeader: { marginBottom: 11, minHeight: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionHeaderCopy: { flex: 1, minWidth: 0 },
  sectionTitle: { color: "#101828", fontSize: 18, lineHeight: 23, fontFamily: "PlusJakartaSans_800ExtraBold", letterSpacing: -0.3 },
  sectionSubtitle: { marginTop: 2, color: "#667085", fontSize: 10, lineHeight: 14, fontFamily: "PlusJakartaSans_500Medium" },
  sectionAction: { marginLeft: 8, color: GREEN, fontSize: 11, lineHeight: 15, fontFamily: "PlusJakartaSans_700Bold" },
  buyAgainRow: { gap: 9, paddingRight: 6 },
  buyAgainCard: { width: 126, paddingBottom: 8, borderRadius: 0, borderWidth: 0, borderColor: "transparent", backgroundColor: "transparent", overflow: "visible" },
  buyAgainVisual: { width: "100%", height: 100, borderRadius: 12, overflow: "hidden", backgroundColor: "#F7F8FA", alignItems: "center", justifyContent: "center", position: "relative" },
  buyAgainImage: { width: "100%", height: "100%" },
  buyAgainAdd: { position: "absolute", right: 5, bottom: 5, width: 30, height: 30, borderRadius: 7, borderWidth: 1.2, borderColor: GREEN, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  buyAgainName: { minHeight: 31, marginTop: 6, paddingHorizontal: 7, color: "#101828", fontSize: 11, lineHeight: 15, fontFamily: "PlusJakartaSans_700Bold" },
  buyAgainQty: { paddingHorizontal: 7, color: "#0759F6", fontSize: 9, lineHeight: 12, fontFamily: "PlusJakartaSans_600SemiBold" },
  buyAgainPrice: { marginTop: 3, paddingHorizontal: 7, color: "#101828", fontSize: 13, lineHeight: 17, fontFamily: "PlusJakartaSans_800ExtraBold" },
  collectionRow: { gap: 10, paddingRight: 6 },
  collectionCard: { width: 218, height: 126, borderRadius: 15, overflow: "hidden" },
  collectionGradient: { flex: 1, padding: 13, flexDirection: "row", overflow: "hidden" },
  collectionCopy: { width: "58%", zIndex: 2 },
  collectionTitle: { color: "#101828", fontSize: 15, lineHeight: 19, fontFamily: "PlusJakartaSans_800ExtraBold" },
  collectionSubtitle: { marginTop: 3, color: "#667085", fontSize: 9, lineHeight: 13, fontFamily: "PlusJakartaSans_600SemiBold" },
  collectionArrow: { marginTop: 15, width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.76)", alignItems: "center", justifyContent: "center" },
  collectionImages: { flex: 1, position: "relative" },
  collectionImage: { position: "absolute", right: -7, bottom: -14, width: 94, height: 105, zIndex: 2, transform: [{ rotate: "5deg" }] },
  collectionImageBack: { right: 29, bottom: -19, width: 76, height: 90, zIndex: 1, transform: [{ rotate: "-8deg" }] },
  filterSection: { marginTop: 9, backgroundColor: "#FFFFFF", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#EAECF0" },
  filterRow: { paddingHorizontal: PAGE_PADDING, paddingVertical: 11, gap: 8 },
  filterChip: { height: 34, paddingHorizontal: 11, borderRadius: 8, borderWidth: 1, borderColor: "#D9DDE3", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", gap: 5 },
  filterChipActive: { borderColor: "#7BC28D", backgroundColor: "#EFF9F1" },
  filterText: { color: "#475467", fontSize: 10, lineHeight: 14, fontFamily: "PlusJakartaSans_600SemiBold" },
  filterTextActive: { color: GREEN, fontFamily: "PlusJakartaSans_700Bold" },
  productsSection: { paddingHorizontal: PAGE_PADDING, paddingTop: 15, paddingBottom: 24, backgroundColor: "#FFFFFF" },
  grid: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", columnGap: CARD_GAP },
  wishlistCell: { width: CARD_WIDTH, overflow: "hidden" },
  card: { width: CARD_WIDTH, minHeight: 304, borderRadius: 0, backgroundColor: "transparent", overflow: "visible" },
  visual: { width: "100%", height: Math.round(CARD_WIDTH * 0.92), borderRadius: 12, backgroundColor: "#F7F8FA", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" },
  productImage: { width: "100%", height: "100%" },
  discountBadge: { position: "absolute", left: 5, top: 5, minHeight: 25, paddingHorizontal: 6, borderRadius: 6, backgroundColor: "#5C1697", alignItems: "center", justifyContent: "center", zIndex: 5 },
  discountText: { color: "#FFFFFF", fontSize: 8, lineHeight: 11, fontFamily: "PlusJakartaSans_800ExtraBold" },
  favoriteWrap: { position: "absolute", top: 5, right: 5, width: 34, height: 34, alignItems: "center", justifyContent: "center", zIndex: 7 },
  favoriteButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.96)", alignItems: "center", justifyContent: "center" },
  heartBurst: { ...StyleSheet.absoluteFillObject, zIndex: 8 },
  burstDot: { position: "absolute", width: 4, height: 4, borderRadius: 2, backgroundColor: "#F04438" },
  burstDotTop: { left: 15, top: 0 },
  burstDotRight: { right: 0, top: 15, backgroundColor: "#F79009" },
  burstDotBottom: { left: 15, bottom: 0, backgroundColor: "#12B76A" },
  burstDotLeft: { left: 0, top: 15, backgroundColor: "#7F56D9" },
  vegMark: { position: "absolute", left: 6, bottom: 6, width: 20, height: 20, borderWidth: 1.3, borderColor: GREEN, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  vegDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: GREEN },
  addButton: { position: "absolute", right: 5, bottom: 5, width: 34, height: 34, borderRadius: 8, borderWidth: 1.2, borderColor: GREEN, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", zIndex: 5 },
  stepper: { position: "absolute", right: 5, bottom: 5, width: 82, height: 34, borderRadius: 8, borderWidth: 1.2, borderColor: GREEN, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 5 },
  stepperButton: { width: 27, height: "100%", alignItems: "center", justifyContent: "center" },
  stepperText: { color: GREEN, fontSize: 20, lineHeight: 23, fontFamily: "PlusJakartaSans_700Bold" },
  stepperValue: { color: GREEN, fontSize: 13, lineHeight: 17, fontFamily: "PlusJakartaSans_800ExtraBold" },
  cardInfo: { minHeight: 141, paddingHorizontal: 3, paddingTop: 8, paddingBottom: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rating: { color: "#9A7417", fontSize: 10, lineHeight: 13, fontFamily: "PlusJakartaSans_600SemiBold" },
  metaDivider: { width: 1, height: 8, marginHorizontal: 2, backgroundColor: "#D0D5DD" },
  eta: { color: "#667085", fontSize: 9, lineHeight: 12, fontFamily: "PlusJakartaSans_600SemiBold", textTransform: "uppercase" },
  name: { minHeight: 34, marginTop: 5, color: "#101828", fontSize: 12, lineHeight: 16, fontFamily: "PlusJakartaSans_700Bold" },
  qty: { marginTop: 2, color: "#0759F6", fontSize: 10, lineHeight: 13, fontFamily: "PlusJakartaSans_700Bold" },
  infoDivider: { marginTop: 5, borderBottomWidth: 1, borderStyle: "dashed", borderBottomColor: "#D0D5DD" },
  priceRow: { marginTop: 5, flexDirection: "row", alignItems: "baseline", gap: 6 },
  price: { color: "#101828", fontSize: 16, lineHeight: 20, fontFamily: "PlusJakartaSans_800ExtraBold" },
  mrp: { color: "#98A2B3", fontSize: 11, lineHeight: 14, fontFamily: "PlusJakartaSans_500Medium", textDecorationLine: "line-through" },
  offer: { marginTop: 2, color: "#079455", fontSize: 9, lineHeight: 12, fontFamily: "PlusJakartaSans_700Bold" },
  filterEmpty: { minHeight: 230, alignItems: "center", justifyContent: "center" },
  filterEmptyTitle: { marginTop: 9, color: "#475467", fontSize: 13, lineHeight: 18, fontFamily: "PlusJakartaSans_600SemiBold" },
  clearFilters: { marginTop: 7, color: GREEN, fontSize: 12, lineHeight: 16, fontFamily: "PlusJakartaSans_700Bold" },
  emptySection: { paddingTop: 58, alignItems: "center", backgroundColor: "#FFFFFF" },
  emptyIcon: { width: 82, height: 82, borderRadius: 41, backgroundColor: "#F2F4F7", alignItems: "center", justifyContent: "center" },
  emptyTitle: { marginTop: 16, color: "#101828", fontSize: 21, lineHeight: 27, fontFamily: "PlusJakartaSans_800ExtraBold" },
  emptySubtitle: { maxWidth: 290, marginTop: 6, color: "#667085", fontSize: 12, lineHeight: 18, fontFamily: "PlusJakartaSans_500Medium", textAlign: "center" },
  emptyButton: { height: 44, marginTop: 18, paddingHorizontal: 18, borderRadius: 10, backgroundColor: GREEN, flexDirection: "row", alignItems: "center", gap: 7 },
  emptyButtonText: { color: "#FFFFFF", fontSize: 12, lineHeight: 16, fontFamily: "PlusJakartaSans_700Bold" },
  emptyRecommendations: { width: "100%", marginTop: 50, paddingHorizontal: PAGE_PADDING, paddingTop: 16, paddingBottom: 30, borderTopWidth: 8, borderTopColor: "#F6F7F8", alignItems: "stretch" },
  pressed: { opacity: 0.72 },
});
