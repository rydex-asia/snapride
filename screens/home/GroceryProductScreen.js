import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import AppIcon from "../../components/AppIcon";
import { GROCERY_TYPOGRAPHY } from "../../theme/typography";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GREEN = "#138A36";
const CARD_GAP = 8;
const PRODUCT_CARD_WIDTH = 136;
const PRODUCT_IMAGE_BG = "#F9fafc";
const CART_HIDE_OFFSET = 116;
const FONT_ROLES = {
  price: "Manrope_800ExtraBold",
  mrp: "Manrope_500Medium",
  category: "Manrope_600SemiBold",
  description: "Manrope_400Regular",
};

const RELATED_PRODUCTS = [
  { id: "r1", name: "Aashirvaad Whole Wheat Atta", qty: "5 kg", price: 249, mrp: 285, rating: "18,420", color: "#F5E7F2", tag: "13% OFF", image: require("../../assets/grocery-products/aashirvaad-atta.png") },
  { id: "r2", name: "Tata Sampann Toor Dal", qty: "1 kg", price: 179, mrp: 210, rating: "9,834", color: "#FFF0DF", tag: "15% OFF", image: require("../../assets/grocery-products/tata-toor-dal.png") },
  { id: "r3", name: "Daawat Everyday Basmati Rice", qty: "5 kg", price: 499, mrp: 590, rating: "12,610", color: "#F6EEEE", tag: "15% OFF", image: require("../../assets/grocery-products/daawat-rice.png") },
  { id: "r4", name: "Saffola Active Cooking Oil", qty: "1 L", price: 139, mrp: 165, rating: "22,104", color: "#FFF3E2", tag: "16% OFF", image: require("../../assets/grocery-products/saffola-oil.png") },
  { id: "r5", name: "Amul Taaza Toned Milk", qty: "1 L", price: 72, mrp: 78, rating: "31,205", color: "#EFF8E9", tag: "8% OFF", image: require("../../assets/grocery-products/amul-milk.png") },
  { id: "r6", name: "Red Label Natural Care Tea", qty: "500 g", price: 279, mrp: 315, rating: "15,902", color: "#FFEDEE", tag: "11% OFF", image: require("../../assets/grocery-products/red-label-tea.png") },
];

const SIMILAR_PRODUCTS = [
  { id: "s1", name: "Nescafe Classic Instant Coffee", qty: "100 g", price: 299, mrp: 340, rating: "18,499", color: "#F4ECE4", tag: "12% OFF", image: require("../../assets/grocery-products/nescafe-coffee.png") },
  { id: "s2", name: "Kissan Fresh Tomato Ketchup", qty: "500 g", price: 119, mrp: 145, rating: "10,129", color: "#EFEAF8", tag: "18% OFF", image: require("../../assets/grocery-products/kissan-ketchup.png") },
  { id: "s3", name: "Gowardhan Pure Cow Ghee", qty: "1 L", price: 579, mrp: 630, rating: "20,700", color: "#FFF1EF", tag: "8% OFF", image: require("../../assets/grocery-products/gowardhan-ghee.png") },
  { id: "s4", name: "India Gate Everyday Sugar", qty: "1 kg", price: 54, mrp: 62, rating: "13,189", color: "#F0E7F8", tag: "13% OFF", image: require("../../assets/grocery-products/india-gate-sugar.png") },
  { id: "s5", name: "Amul Taaza Toned Milk", qty: "1 L", price: 72, mrp: 78, rating: "22,912", color: "#F7EFE8", tag: "8% OFF", image: require("../../assets/grocery-products/amul-milk.png") },
  { id: "s6", name: "Red Label Natural Care Tea", qty: "500 g", price: 279, mrp: 315, rating: "13,501", color: "#EFE9FA", tag: "11% OFF", image: require("../../assets/grocery-products/red-label-tea.png") },
];

function money(value) {
  return `₹${value}`;
}

function DetailSvgIcon({ name, size = 24, color = "#2D3135" }) {
  if (name === "down") {
    return (
      <Svg width={size} height={size} viewBox="0 0 1024 1024">
        <Path d="M903.232 256l56.768 50.432L512 768 64 306.432 120.768 256 512 659.072z" fill={color} />
      </Svg>
    );
  }

  if (name === "heart" || name === "heart-filled") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={name === "heart-filled" ? "#E44755" : "none"}>
        <Path
          d="M15.7 4C18.87 4 21 6.98 21 9.76C21 15.39 12.16 20 12 20C11.84 20 3 15.39 3 9.76C3 6.98 5.13 4 8.3 4C10.12 4 11.31 4.91 12 5.71C12.69 4.91 13.88 4 15.7 4Z"
          stroke={name === "heart-filled" ? "#E44755" : color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === "share") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M20 13V17.5C20 20.5577 16 20.5 12 20.5C8 20.5 4 20.5577 4 17.5V13M12 3L12 15M12 3L16 7M12 3L8 7"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

function DetailIconButton({ icon, onPress, scrolled, compact = false }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => [styles.iconButton, compact && styles.iconButtonCompact, scrolled && styles.headerIconScrolled, pressed && styles.pressed]}>
      <DetailSvgIcon name={icon} size={compact ? 20 : 24} color="#2D3135" />
    </Pressable>
  );
}

function ProductColorCard({ color, brand, title, image }) {
  return (
    <View style={[styles.productColorCard, { backgroundColor: image ? "transparent" : PRODUCT_IMAGE_BG }]}>
      {image ? (
        <Image source={image} style={styles.heroProductImage} resizeMode="contain" />
      ) : null}
    </View>
  );
}

function PreviewDots({ previews, activeIndex, onSelect }) {
  return (
    <View style={styles.productDots}>
      {previews.map((item, index) => (
        <Pressable
          key={`${item.id}-dot`}
          onPress={() => onSelect(index)}
          hitSlop={10}
          style={index === activeIndex ? styles.productDotActive : styles.productDot}
        />
      ))}
    </View>
  );
}

function RatingRow({ rating = "23,985" }) {
  return (
    <View style={styles.ratingRow}>
      {[0, 1, 2, 3, 4].map((item) => (
        <MaterialCommunityIcons key={item} name="star" size={14} color="#F5C531" />
      ))}
      <Text style={styles.ratingCount}>{rating}</Text>
    </View>
  );
}

function ProductMetaRibbon() {
  return (
    <Svg pointerEvents="none" style={styles.productMetaRibbon} viewBox="0 0 340 40" preserveAspectRatio="none">
      <Path
        d="M0 40 V15 C0 6 7 1 17 1 H168 C179 1 186 7 191 16 L199 30 C203 37 208 40 216 40 Z"
        fill="#FFFFFF"
      />
      <Path
        d="M168 1 C179 1 186 7 191 16 L199 30 C203 37 208 40 216 40 H340 V15 C340 6 333 1 323 1 H168 Z"
        fill="#0759F6"
      />
    </Svg>
  );
}

function UnitCard({ selected, qty, price, mrp, offer, image, onPress }) {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.unitCard, selected && styles.unitCardSelected, pressed && styles.pressed]}>
      {selected ? <Text style={styles.unitValueBadge}>MOST VALUE</Text> : null}

      <Text style={styles.unitQty}>{qty}</Text>
      <View style={styles.unitPriceRow}>
        <Text style={styles.unitPrice}>{money(price)}</Text>
        <Text style={styles.unitMrp}>{money(mrp)}</Text>
      </View>
      <Text style={styles.unitPerPrice}>₹{(price / Math.max(parseFloat(qty) || 1, 1)).toFixed(1)}/100 g</Text>
      <Text style={styles.unitOffer}>{discount ? `${discount}% OFF` : offer}</Text>
    </Pressable>
  );
}

function DetailChip({ label, value }) {
  return (
    <View style={styles.detailChip}>
      <Text style={styles.detailChipLabel}>{label}</Text>
      <Text style={styles.detailChipValue}>{value}</Text>
    </View>
  );
}

function ProductDetailsSheet({ visible, product, unit, brand, heroColor, onClose, onAdd }) {
  const title = product?.name || "Cadbury Chocobakes Choco Chip Cookies";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.detailsOverlay}>
        <Pressable style={styles.detailsBackdrop} onPress={onClose} />
        <Pressable style={styles.detailsClose} onPress={onClose}>
          <MaterialCommunityIcons name="close" size={30} color="#FFFFFF" />
        </Pressable>
        <View style={styles.detailsSheet}>
          <View style={styles.detailsHeader}>
            <View style={[styles.detailsThumb, { backgroundColor: product?.image ? PRODUCT_IMAGE_BG : heroColor }]}>
              {product?.image ? (
                <Image source={product.image} style={styles.detailsThumbImage} resizeMode="contain" />
              ) : null}
            </View>
            <Text style={styles.detailsTitle} numberOfLines={3}>{title}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailsContent}>
            <Text style={styles.detailsSectionTitle}>Highlights</Text>
            <View style={styles.detailChipsRow}>
              <DetailChip label="Shelf Life" value="8 months" />
              <DetailChip label="Flavour" value="Choco Chip" />
              <DetailChip label="Type" value="Vegetarian" />
              <DetailChip label="Pack" value={unit.qty} />
            </View>

            <Text style={styles.detailsSectionTitle}>All details</Text>
            <View style={styles.keyInfoCard}>
              <View style={styles.keyInfoHeader}>
                <Text style={styles.keyInfoTitle}>Key Information</Text>
                <MaterialCommunityIcons name="chevron-up" size={22} color="#2F343B" />
              </View>
              {[
                ["Brand", brand],
                ["Shelf Life", "8 months"],
                ["Flavour", "Choco Chip"],
                ["Ingredients", "Wheat flour, cocoa solids, sugar, edible vegetable oil"],
                ["Package Type", "Pouch"],
                ["Dietary Preference", "Vegetarian"],
              ].map(([label, value]) => (
                <View key={label} style={styles.keyInfoRow}>
                  <Text style={styles.keyInfoLabel}>{label}</Text>
                  <Text style={styles.keyInfoValue}>{value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.infoCollapsedRow}>
              <Text style={styles.keyInfoTitle}>Info</Text>
              <MaterialCommunityIcons name="chevron-down" size={22} color="#2F343B" />
            </View>
          </ScrollView>

          <View style={styles.detailsBottomBar}>
            <View>
              <Text style={styles.bottomQty}>{unit.qty}</Text>
              <View style={styles.bottomPriceRow}>
                <Text style={styles.bottomPrice}>{money(unit.price)}</Text>
                <Text style={styles.bottomMrp}>MRP {money(unit.mrp)}</Text>
              </View>
              <Text style={styles.taxText}>Inclusive of all taxes</Text>
            </View>
            <Pressable style={styles.addToCartButton} onPress={onAdd}>
              <Text style={styles.addToCartText}>Add</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MiniProductCard({ item, quantity, onChangeQuantity }) {
  const discount = item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <View style={styles.miniProductCard}>
      <View style={[styles.miniVisual, { backgroundColor: item.color || PRODUCT_IMAGE_BG }]}> 
        {discount > 0 ? (
          <View style={styles.miniDiscountBadge}>
            <Text style={styles.miniDiscountBadgeText}>{discount}%{`\n`}OFF</Text>
          </View>
        ) : null}
        <Pressable
          style={styles.miniHeart}
          onPress={() => setWishlisted((current) => !current)}
          hitSlop={6}
        >
          <MaterialCommunityIcons
            name={wishlisted ? "heart" : "heart-outline"}
            size={18}
            color="#C81924"
          />
        </Pressable>
        {item.image ? (
          <Image source={item.image} style={styles.miniProductImage} resizeMode="contain" />
        ) : null}
        <View style={styles.miniVegMark}><View style={styles.miniVegDot} /></View>
        {quantity > 0 ? (
          <View style={styles.miniStepper}>
            <Pressable style={styles.miniStepperButton} onPress={() => onChangeQuantity(item.id, quantity - 1)}>
              <Text style={styles.miniStepperText}>−</Text>
            </Pressable>
            <Text style={styles.miniStepperValue}>{quantity}</Text>
            <Pressable style={styles.miniStepperButton} onPress={() => onChangeQuantity(item.id, quantity + 1)}>
              <Text style={styles.miniStepperText}>+</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.miniAddButton} onPress={() => onChangeQuantity(item.id, 1)}>
            <MaterialCommunityIcons name="plus" size={22} color="#0759F6" />
          </Pressable>
        )}
      </View>
      <View style={styles.miniInfo}>
        <View style={styles.miniMetaRow}>
          <MaterialCommunityIcons name="star" size={11} color={GREEN} />
          <Text style={styles.miniRatingText}>{item.rating || "4.5"}</Text>
          <Text style={styles.miniReviewText}>• 5 MINS</Text>
        </View>
        <Text style={styles.miniName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.miniQtyText}>{item.qty}</Text>
        <View style={styles.miniInfoDivider} />
        <View style={styles.miniPriceRow}>
          <Text style={styles.miniPrice}>{money(item.price)}</Text>
          {item.mrp > item.price ? <Text style={styles.miniMrp}>{money(item.mrp)}</Text> : null}
        </View>
        {discount > 0 ? (
          <Text style={styles.miniOffer}>{discount}% OFF · Save {money(item.mrp - item.price)}</Text>
        ) : null}
      </View>
    </View>
  );
}

function ProductRailSection({ title, products, quantities, onChangeQuantity }) {
  return (
    <View style={styles.railSection}>
      <Text style={styles.railTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
      >
        {products.map((item) => (
          <MiniProductCard
            key={item.id}
            item={item}
            quantity={quantities[item.id] || 0}
            onChangeQuantity={onChangeQuantity}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default function GroceryProductScreen({ product, onClose, onSearch, onCheckout, onHeaderScrolledChange }) {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const previewPagerRef = useRef(null);
  const units = useMemo(() => {
    const basePrice = Number(product?.price) || 60;
    const baseMrp = Number(product?.mrp) || Math.max(basePrice + 10, 70);
    const qty = product?.qty || "167 g";
    return [
      { id: "single", qty, price: basePrice, mrp: baseMrp, offer: "14% OFF on MRP" },
      { id: "double", qty: `2 x ${qty}`, price: Math.max(basePrice * 2 - 8, basePrice), mrp: baseMrp * 2, offer: "20% OFF on MRP" },
    ];
  }, [product]);
  const [selectedUnit, setSelectedUnit] = useState(units[0]);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [relatedQuantities, setRelatedQuantities] = useState({});
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [activePreview, setActivePreview] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [productWishlisted, setProductWishlisted] = useState(false);
  const cartScale = useRef(new Animated.Value(1)).current;
  const cartSlide = useRef(new Animated.Value(CART_HIDE_OFFSET)).current;
  const heroEntrance = useRef(new Animated.Value(0)).current;
  const sheetEntrance = useRef(new Animated.Value(0)).current;
  const productLift = useRef(new Animated.Value(0)).current;
  const stepperMorph = useRef(new Animated.Value(0)).current;
  const wishlistScale = useRef(new Animated.Value(1)).current;
  const title = product?.name || "Cadbury Chocobakes Choco Chip Cookies";
  const brand = product?.brand || title.split(" ")[0] || "Cadbury";
  const heroColor = product?.color || "#F1E9FA";
  const previewItems = useMemo(
    () => [
      { id: "front", color: heroColor, image: product?.image },
      { id: "side", color: product?.secondaryColor || "#F6EFE5" },
      { id: "pack", color: product?.accentColor || "#EEF4EF" },
    ],
    [heroColor, product?.accentColor, product?.image, product?.secondaryColor]
  );
  const scrollHeaderOpacity = scrollY.interpolate({
    inputRange: [96, 154],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const scrollHeaderTranslateY = scrollY.interpolate({
    inputRange: [96, 154],
    outputRange: [-16, 0],
    extrapolate: "clamp",
  });

  useEffect(() => {
    setSelectedUnit(units[0]);
    setActivePreview(0);
  }, [units]);

  useEffect(() => {
    heroEntrance.setValue(0);
    sheetEntrance.setValue(0);
    Animated.parallel([
      Animated.timing(heroEntrance, {
        toValue: 1,
        duration: 430,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(sheetEntrance, {
        toValue: 1,
        delay: 55,
        damping: 18,
        stiffness: 150,
        mass: 0.9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroEntrance, product?.id, sheetEntrance]);

  useEffect(() => {
    previewPagerRef.current?.scrollTo?.({
      x: activePreview * SCREEN_WIDTH,
      animated: true,
    });
  }, [activePreview]);

  useEffect(() => {
    const color = "#F6F7F7";
    StatusBar.setBarStyle("dark-content", true);
    StatusBar.setTranslucent?.(false);
    StatusBar.setBackgroundColor?.(color, true);
    onHeaderScrolledChange?.(headerScrolled);
  }, [headerScrolled, onHeaderScrolledChange]);

  useEffect(() => {
    if (cartQuantity <= 0) {
      Animated.spring(cartSlide, {
        toValue: CART_HIDE_OFFSET,
        useNativeDriver: true,
        damping: 14,
        stiffness: 190,
      }).start();
      return;
    }

    Animated.parallel([
      Animated.spring(cartSlide, {
        toValue: 0,
        useNativeDriver: true,
        damping: 13,
        stiffness: 210,
        mass: 0.8,
      }),
      Animated.sequence([
        Animated.spring(cartScale, {
          toValue: 1.08,
          useNativeDriver: true,
          damping: 9,
          stiffness: 260,
          mass: 0.6,
        }),
        Animated.spring(cartScale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 12,
          stiffness: 220,
          mass: 0.7,
        }),
      ]),
    ]).start();
  }, [cartQuantity, cartScale, cartSlide]);

  const changeRelatedQuantity = (id, nextQuantity) => {
    setRelatedQuantities((current) => ({ ...current, [id]: Math.max(0, nextQuantity) }));
  };

  const playCartOpenAnimation = () => {
    cartScale.stopAnimation();
    cartSlide.stopAnimation();
    cartScale.setValue(0.92);
    cartSlide.setValue(CART_HIDE_OFFSET);
    Animated.parallel([
      Animated.spring(cartSlide, {
        toValue: 0,
        useNativeDriver: true,
        damping: 12,
        stiffness: 220,
        mass: 0.8,
      }),
      Animated.spring(cartScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 10,
        stiffness: 240,
        mass: 0.7,
      }),
    ]).start();
  };

  const animateProductAdded = () => {
    productLift.stopAnimation();
    stepperMorph.stopAnimation();
    productLift.setValue(0);
    stepperMorph.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(productLift, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(productLift, {
          toValue: 0,
          damping: 12,
          stiffness: 210,
          mass: 0.7,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(stepperMorph, {
        toValue: 1,
        damping: 14,
        stiffness: 230,
        mass: 0.72,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleProductWishlist = () => {
    setProductWishlisted((current) => !current);
    wishlistScale.stopAnimation();
    Animated.sequence([
      Animated.spring(wishlistScale, {
        toValue: 1.2,
        damping: 8,
        stiffness: 280,
        mass: 0.55,
        useNativeDriver: true,
      }),
      Animated.spring(wishlistScale, {
        toValue: 1,
        damping: 11,
        stiffness: 230,
        mass: 0.65,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleScroll = (event) => {
    const nextScrolled = event.nativeEvent.contentOffset.y > 18;
    setHeaderScrolled((current) => (current === nextScrolled ? current : nextScrolled));
  };

  const handlePreviewSwipe = (event) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActivePreview((current) => (current === nextIndex ? current : nextIndex));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F6F7F7"
        translucent={false}
        animated
      />
      <View style={styles.screen}>
        <Animated.View
          pointerEvents={headerScrolled ? "auto" : "none"}
          style={[
            styles.stickyHeader,
            {
              paddingTop: insets.top,
              opacity: scrollHeaderOpacity,
              transform: [{ translateY: scrollHeaderTranslateY }],
            },
          ]}
        >
          <View style={styles.stickyHeaderInner}>
            <Pressable onPress={onClose} hitSlop={12} style={({ pressed }) => [styles.stickyHeaderBack, pressed && styles.pressed]}>
              <DetailSvgIcon name="down" size={24} color="#202124" />
            </Pressable>
            <View style={styles.stickyHeaderCopy}>
              <Text style={styles.stickyHeaderTitle} numberOfLines={1}>{title}</Text>
              <Text style={styles.stickyHeaderSubtitle} numberOfLines={1}>{selectedUnit.qty} · {money(selectedUnit.price)}</Text>
            </View>
            <View style={styles.stickyHeaderActions}>
              <Animated.View style={{ transform: [{ scale: wishlistScale }] }}>
                <DetailIconButton icon={productWishlisted ? "heart-filled" : "heart"} onPress={toggleProductWishlist} compact />
              </Animated.View>
              <DetailIconButton icon="magnify" onPress={onSearch} compact />
              <DetailIconButton icon="share" onPress={() => {}} compact />
            </View>
          </View>
        </Animated.View>
        <View pointerEvents="box-none" style={styles.heroFloatingHeader}>
          <Pressable onPress={onClose} hitSlop={8} style={({ pressed }) => [styles.heroBackButton, { top: insets.top + 10 }, pressed && styles.pressed]}>
            <DetailSvgIcon name="down" size={30} color="#2D3135" />
          </Pressable>
          <View style={[styles.heroActions, { top: insets.top + 10 }]}>
            <Animated.View style={{ transform: [{ scale: wishlistScale }] }}>
              <DetailIconButton icon={productWishlisted ? "heart-filled" : "heart"} onPress={toggleProductWishlist} />
            </Animated.View>
            <DetailIconButton icon="magnify" onPress={onSearch} />
            <DetailIconButton icon="share" />
          </View>
        </View>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
            listener: handleScroll,
          })}
          scrollEventThrottle={16}
        >
          <Animated.View
            style={[
              styles.hero,
              { paddingTop: insets.top + 14 },
              {
                opacity: heroEntrance,
                transform: [
                  { scale: heroEntrance.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) },
                ],
              },
            ]}
          >
            <Animated.View
              style={{
                transform: [
                  { translateY: productLift.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
                  { scale: productLift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] }) },
                ],
              }}
            >
              <ScrollView
                ref={previewPagerRef}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handlePreviewSwipe}
                scrollEventThrottle={16}
                style={styles.productPreviewPager}
              >
                {previewItems.map((item, index) => (
                  <View key={item.id} style={styles.productPreviewPage}>
                    <ProductColorCard color={item.color} brand={brand} title={title} image={index === 0 ? product?.image : null} />
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
            <PreviewDots
              previews={previewItems}
              activeIndex={activePreview}
              onSelect={setActivePreview}
            />
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(98, 98, 98, 0)", "rgba(203, 201, 201, 0.72)", "#ffffffff"]}
              locations={[0, 0.58, 1]}
              style={styles.heroInfoBoundaryShadow}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.infoCard,
              {
                opacity: sheetEntrance,
                transform: [
                  { translateY: sheetEntrance.interpolate({ inputRange: [0, 1], outputRange: [110, 0] }) },
                ],
              },
            ]}
          >
            <ProductMetaRibbon />
            <View pointerEvents="none" style={styles.fullVegBadge}>
              <View style={styles.fullVegMark}>
                <View style={styles.fullVegDot} />
              </View>
              <Text style={styles.fullVegText}>100% VEG</Text>
            </View>
            <View pointerEvents="none" style={styles.productMetaFloat}>
              <View style={styles.deliveryPill}>
                <MaterialCommunityIcons name="clock-outline" size={12} color="#6A7280" />
                <Text style={styles.deliveryText}>{product?.eta || "8 mins"}</Text>
              </View>
              <RatingRow rating={product?.reviews || "23,985"} />
            </View>
            <Pressable style={({ pressed }) => [styles.productDetailPill, pressed && styles.pressed]} onPress={() => setDetailsOpen(true)}>
              <MaterialCommunityIcons name="file-document-outline" size={13} color="#FFFFFF" />
              <Text style={styles.productDetailPillTitle} numberOfLines={1}>Preview details</Text>
            </Pressable>
            <Text style={styles.productTitle}>{title}</Text>
            <View style={styles.quantityHeader}>
              <View>
                <Text style={styles.selectUnitSubtitle}>Select the pack size</Text>
              </View>

            </View>
            <View style={styles.unitsRow}>
              {units.map((unit) => (
                <UnitCard
                  key={unit.id}
                  selected={selectedUnit.id === unit.id}
                  qty={unit.qty}
                  price={unit.price}
                  mrp={unit.mrp}
                  offer={unit.offer}
                  image={product?.image}
                  onPress={() => setSelectedUnit(unit)}
                />
              ))}
            </View>
            <View style={styles.infoPurchaseDivider} />
            <View style={styles.infoPurchaseRow}>
              <View style={styles.infoPurchaseCopy}>
                <Text style={styles.bottomQty}>{selectedUnit.qty}</Text>
                <View style={styles.bottomPriceRow}>
                  <Text style={styles.bottomPrice}>{money(selectedUnit.price)}</Text>
                  <Text style={styles.bottomMrp}>MRP {money(selectedUnit.mrp)}</Text>
                </View>
              </View>
              {cartQuantity > 0 ? (
                <Animated.View
                  style={[
                    styles.cartStepper,
                    {
                      opacity: stepperMorph,
                      transform: [
                        { scaleX: stepperMorph.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) },
                        { scale: stepperMorph.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
                      ],
                    },
                  ]}
                >
                  <Pressable style={styles.cartStepperButton} onPress={() => setCartQuantity((value) => Math.max(0, value - 1))}>
                    <Text style={styles.cartStepperText}>−</Text>
                  </Pressable>
                  <Text style={styles.cartStepperValue}>{cartQuantity}</Text>
                  <Pressable
                    style={styles.cartStepperButton}
                    onPress={() => {
                      playCartOpenAnimation();
                      setCartQuantity((value) => value + 1);
                    }}
                  >
                    <Text style={styles.cartStepperText}>+</Text>
                  </Pressable>
                </Animated.View>
              ) : (
                <Pressable
                  style={styles.addToCartButton}
                  onPress={() => {
                    animateProductAdded();
                    playCartOpenAnimation();
                    setCartQuantity(1);
                  }}
                >
                  <Text style={styles.addToCartText}>Add</Text>
                </Pressable>
              )}
            </View>
          </Animated.View>


          <Pressable style={({ pressed }) => [styles.brandCard, pressed && styles.pressed]}>
            <View style={[styles.brandThumb, { backgroundColor: product?.image ? PRODUCT_IMAGE_BG : heroColor }]}>
              {product?.image ? (
                <Image source={product.image} style={styles.brandThumbImage} resizeMode="contain" />
              ) : (
                <Text style={styles.brandThumbText}>{brand.slice(0, 2).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.brandCopy}>
              <Text style={styles.brandTitle}>{brand} Chocobakes</Text>
              <Text style={styles.brandSubtitle}>Explore all products</Text>
            </View>
            <AppIcon name="chevronRight" size={28} color="#59606A" />
          </Pressable>

          <View style={styles.lowerWhiteSection}>
            <ProductRailSection
              title="Similar products"
              products={SIMILAR_PRODUCTS}
              quantities={relatedQuantities}
              onChangeQuantity={changeRelatedQuantity}
            />
            <ProductRailSection
              title="Time for health"
              products={RELATED_PRODUCTS}
              quantities={relatedQuantities}
              onChangeQuantity={changeRelatedQuantity}
            />
          </View>
        </Animated.ScrollView>

        <Animated.View style={[styles.floatingCartButton, { transform: [{ translateY: cartSlide }, { scale: cartScale }] }]}>
          <Pressable
            hitSlop={10}
            style={({ pressed }) => [styles.floatingCartPressable, pressed && styles.pressed]}
            onPressIn={() => {
              Animated.spring(cartScale, {
                toValue: 0.94,
                useNativeDriver: true,
                damping: 12,
                stiffness: 280,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(cartScale, {
                toValue: 1,
                useNativeDriver: true,
                damping: 11,
                stiffness: 230,
              }).start();
            }}
            onPress={() => onCheckout?.({ product, unit: selectedUnit, quantity: Math.max(1, cartQuantity || 1) })}
          >
            <MaterialCommunityIcons name="cart-outline" size={30} color="#FFFFFF" />
            {cartQuantity > 0 ? <Text style={styles.floatingCartBadge}>{cartQuantity}</Text> : null}
          </Pressable>
        </Animated.View>

        <ProductDetailsSheet
          visible={detailsOpen}
          product={product}
          unit={selectedUnit}
          brand={brand}
          heroColor={heroColor}
          onClose={() => setDetailsOpen(false)}
          onAdd={() => {
            setCartQuantity((value) => Math.max(1, value + 1));
            setDetailsOpen(false);
            onCheckout?.({ product, unit: selectedUnit, quantity: Math.max(1, cartQuantity + 1) });
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addToCartButton: {
    width: 114,
    height: 42,
    borderRadius: 8,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontFamily: FONT_ROLES.category,
    fontWeight: "700",
  },
  bottomMrp: {
    color: "#69707A",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: FONT_ROLES.mrp,
    fontWeight: "500",
    textDecorationLine: "line-through",
  },
  bottomPrice: {
    color: "#20242A",
    fontSize: 17,
    lineHeight: 21,
    fontFamily: FONT_ROLES.price,
    fontWeight: "800",
  },
  bottomPriceRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  bottomQty: {
    color: "#20242A",
    fontSize: 16,
    lineHeight: 20,
    fontFamily: FONT_ROLES.category,
    fontWeight: "800",
  },
  cartStepper: {
    width: 114,
    height: 42,
    borderRadius: 8,
    backgroundColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  cartStepperButton: {
    width: 38,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cartStepperText: {
    color: "#FFFFFF",
    fontSize: 25,
    lineHeight: 28,
    fontFamily: FONT_ROLES.category,
    fontWeight: "600",
  },
  cartStepperValue: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 24,
    fontFamily: FONT_ROLES.category,
    fontWeight: "600",
  },
  floatingCartButton: {
    position: "absolute",
    right: 20,
    bottom: 92,
    width: 60,
    height: 60,
    borderRadius: 34,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#0B6E2B",
    shadowOpacity: 0,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 0,
    zIndex: 10,
  },
  floatingCartPressable: {
    width: "100%",
    height: "100%",
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingCartBadge: {
    position: "absolute",
    right: -2,
    top: -5,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFD21F",
    color: "#111827",
    fontSize: 12,
    lineHeight: 22,
    fontFamily: FONT_ROLES.price,
    fontWeight: "900",
    textAlign: "center",
    overflow: "hidden",
  },
  brandCard: {
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 12,
    padding: 11,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#727272ff",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0.5,
  },
  brandCopy: {
    flex: 1,
    marginLeft: 14,
  },
  brandSubtitle: {
    ...GROCERY_TYPOGRAPHY.caption,
    fontFamily: FONT_ROLES.description,
    marginTop: 3,
    color: "#6B7280",
  },
  brandThumb: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  brandThumbImage: {
    width: "88%",
    height: "88%",
  },
  brandThumbText: {
    color: "#2F3440",
    fontSize: 16,
    lineHeight: 20,
    fontFamily: FONT_ROLES.category,
    fontWeight: "900",
  },
  brandTitle: {
    ...GROCERY_TYPOGRAPHY.cardTitle,
    color: "#20242A",
    fontSize: 15,
    lineHeight: 19,
  },
  content: {
    paddingBottom: 0,
  },
  deliveryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deliveryRatingRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deliveryText: {
    color: "#5F6673",
    fontSize: 9,
    lineHeight: 16,
    fontWeight: "800",
  },
  detailChip: {
    minWidth: 142,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#ECEFF5",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  detailChipLabel: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 5,
    backgroundColor: "#F4F5FA",
    color: "#666D78",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
  },
  detailChipValue: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 9,
    color: "#30343A",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "900",
  },
  detailChipsRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  detailsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  detailsBottomBar: {
    minHeight: 88,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#ECEEF2",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailsClose: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    width: 48,
    height: 48,
    borderRadius: 29,
    backgroundColor: "#1F2025",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  detailsContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  detailsHeader: {
    minHeight: 108,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEEF2",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  detailsOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  detailsSectionTitle: {
    marginTop: 4,
    color: "#30343A",
    fontSize: 17,
    lineHeight: 22,
    fontFamily: FONT_ROLES.category,
    fontWeight: "900",
  },
  detailsSheet: {
    maxHeight: "58%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  detailsThumb: {
    width: 54,
    height: 54,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E5E8EF",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsThumbImage: {
    width: "88%",
    height: "88%",
  },
  detailsThumbText: {
    color: "#30343A",
    fontSize: 15,
    lineHeight: 18,
    fontFamily: FONT_ROLES.category,
    fontWeight: "900",
  },
  detailsTitle: {
    flex: 1,
    color: "#30343A",
    fontSize: 18,
    lineHeight: 24,
    fontFamily: FONT_ROLES.category,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  railContent: {
    paddingRight: 14,
    gap: 8,
  },
  railSection: {
    marginHorizontal: 0,
    marginBottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    borderRadius: 0,
    backgroundColor: "transparent",
  },
  railTitle: {
    ...GROCERY_TYPOGRAPHY.sectionTitle,
    marginBottom: 12,
    color: "#2A2E34",
  },
  hero: {
    minHeight: 540,
    marginHorizontal: 0,
    marginTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 150,
    borderRadius: 0,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
    shadowColor: "#101828",
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 0,
  },
  heroActions: {
    position: "absolute",
    right: 12,
    flexDirection: "row",
    gap: 8,
    zIndex: 32,
  },
  heroBackButton: {
    position: "absolute",
    left: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(226,231,238,0.9)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 32,
    shadowColor: "#101828",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0,
  },
  heroFloatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 0,
    zIndex: 20,
    elevation: 0,
  },
  headerIconScrolled: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E7EE",
    shadowColor: "#101828",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0,
  },
  heroBrandText: {
    ...GROCERY_TYPOGRAPHY.caption,
    position: "absolute",
    top: 24,
    left: 18,
    right: 18,
    color: "rgba(35,39,46,0.72)",
    textAlign: "center",
    zIndex: 2,
  },
  heroProductText: {
    ...GROCERY_TYPOGRAPHY.heroTitle,
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    color: "rgba(35,39,46,0.9)",
    textAlign: "center",
    zIndex: 2,
  },
  heroProductImage: {
    width: "50%",
    height: "50%",
    transform: [{ translateY: 56 }],top:-180
  },
  heroRibbon: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 42,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.34)",
    transform: [{ rotate: "-5deg" }],
  },
  heroInfoBoundaryShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 268,
    height: 132,
    marginHorizontal: 0,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(226,231,238,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#101828",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0,
  },
  iconButtonCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  infoCard: {
    minHeight: 320,
    marginHorizontal: 10,
    marginTop: -400,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    borderRadius: 16,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 0.5,
    borderTopWidth: 0,
    borderColor: "#E1E3E8",
    backgroundColor: "#FFFFFF",
    zIndex: 12,
    shadowColor: "#667085",
    shadowOpacity: 0,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -3 },
    elevation: 0.5,
  },
  fullVegBadge: {
    position: "absolute",
    left: 12,
    top: -58,
    height: 27,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BFE4C9",
    backgroundColor: "rgba(255,255,255,0.97)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 35,
    elevation: 0,
    shadowColor: "#0B6E2B",
    shadowOpacity: 0,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },
  fullVegMark: {
    width: 15,
    height: 15,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: "#159447",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  fullVegDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#159447",
  },
  fullVegText: {
    color: "#117A39",
    fontSize: 10,
    lineHeight: 13,
    fontFamily: FONT_ROLES.category,
    fontWeight: "800",
    letterSpacing: 0.25,
  },
  productMetaFloat: {
    position: "absolute",
    left: 12,
    top: -18,
    height: 18,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
    zIndex: 21,
  },
  productMetaRibbon: {
    position: "absolute",
    left: 0,
    right: 0,
    top: -26,
    height: 34,
    zIndex: 16,
  },
  productDetailPill: {
    position: "absolute",
    right: 6,
    top: -25,
    width: "28%",
    height: 24,
    borderWidth: 0,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    zIndex: 20,
  },

  productDetailPillTitle: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 13,
    fontFamily: FONT_ROLES.category,
    fontWeight: "700",
  },
  infoPurchaseCopy: {
    flex: 1,
    paddingRight: 10,
  },
  infoPurchaseDivider: {
    height: 1,
    marginTop: 14,
    marginBottom: 11,
    backgroundColor: "#ECEFF3",
  },
  infoPurchaseRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lowerWhiteSection: {
    marginTop: 30,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  miniAd: {
    position: "absolute",
    left: 0,
    bottom: 39,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.2)",
    color: "#FFFFFF",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    paddingHorizontal: 5,
    zIndex: 3,
  },
  miniAddButton: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 0,
    zIndex: 10,
  },
  miniAddText: {
    color: GREEN,
    fontSize: 23,
    lineHeight: 25,
    fontWeight: "900",
  },
  miniStepper: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 76,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.8,
    borderColor: "#0759F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  miniStepperButton: {
    width: 22,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  miniStepperText: {
    color: "#0759F6",
    fontSize: 21,
    lineHeight: 23,
    fontWeight: "700",
  },
  miniStepperValue: {
    color: "#0759F6",
    fontSize: 16,
    lineHeight: 19,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "900",
  },
  miniEta: {
    color: "#616978",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_500Medium",
  },
  miniEtaRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  miniEtaInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    minWidth: 0,
  },
  miniImageMetaRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  miniHeart: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6,
  },
  miniColorPlate: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 26,
    minHeight: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.46)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  miniColorStripe: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.32)",
    transform: [{ rotate: "-4deg" }],
  },
  miniColorText: {
    color: "rgba(41,45,52,0.78)",
    fontSize: 10,
    lineHeight: 12,
    fontFamily: FONT_ROLES.category,
    fontWeight: "900",
    textAlign: "center",
  },
  miniMrp: {
    color: "#8B9098",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_400Regular",
    fontWeight: "400",
    textDecorationLine: "line-through",
  },
  miniMetaDivider: {
    width: 1,
    height: 11,
    backgroundColor: "#D7DCE4",
  },
  miniMetaRow: {
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  miniRatingGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  miniRatingText: {
    color: GREEN,
    fontSize: 11,
    lineHeight: 13,
    fontFamily: FONT_ROLES.category,
    fontWeight: "500",
  },
  miniReviewText: {
    color: "#7A818A",
    fontSize: 10,
    lineHeight: 13,
    fontFamily: FONT_ROLES.description,
    fontWeight: "500",
  },
  miniTimeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  miniTimeText: {
    marginTop: 6,
    color: "#7B8088",
    fontSize: 9,
    lineHeight: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  miniName: {
    ...GROCERY_TYPOGRAPHY.productName,
    marginTop: 8,
    minHeight: 32,
    color: "#15171A",
    fontSize: 12,
    lineHeight: 19,
  
    fontFamily: "PlusJakartaSans_600SemiBold",
  
    fontWeight: "600",
  },
  miniOffer: {
    color: GREEN,
    fontSize: 10,
    lineHeight: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  miniOfferRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  miniOfferDash: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CDD2D8",
  },
  miniPrice: {
    color: "#20242A",
    fontSize: 17,
    lineHeight: 21,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "500",
    letterSpacing: -0.75,
  },
  miniPriceRow: {
    marginTop: 9,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignSelf: "flex-start",
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  miniProductCard: {
    width: PRODUCT_CARD_WIDTH,
    minHeight: 328,
    borderWidth: 0,
    borderColor: "transparent",
    borderRadius: 0,
    backgroundColor: "transparent",
    overflow: "visible",
    shadowOpacity: 0,
    elevation: 0,
  },
  miniProductImage: {
    width: "100%",
    height: "100%",
    marginBottom: 0,
    zIndex: 1,
  },
  miniQtyText: {
    marginTop: 3,
    color: "#737980",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  miniQty: {
    alignSelf: "flex-start",
    minHeight: 22,
    marginTop: 4,
    borderRadius: 4,
    borderWidth: 0.6,
    borderColor: "#C5E4CC",
    paddingHorizontal: 5,
    color: GREEN,
    fontSize: 11,
    lineHeight: 20,
    fontWeight: "700",
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  miniQtySubline: {
    alignSelf: "flex-start",
    minHeight: 22,
    marginTop: 4,
    borderRadius: 6,
    borderWidth: 0.6,
    borderColor: "#C5E4CC",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    color: GREEN,
    fontSize: 11,
    lineHeight: 20,
    fontWeight: "700",
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  miniVegDot: {
    width: 8,
    height: 8,
    borderRadius: 6,
    backgroundColor: "#22A35A",
  },
  miniVegMark: {
    position: "absolute",
    left: 9,
    bottom: 9,
    width: 29,
    height: 29,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "#22A35A",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  miniVisual: {
    height: 150,
    borderRadius: 12,
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: PRODUCT_IMAGE_BG,
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  miniInfo: {
    minHeight: 178,
    paddingHorizontal: 3,
    paddingTop: 9,
    paddingBottom: 12,
  },
  miniInfoDivider: {
    marginTop: 8,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderBottomColor: "#C8CCD1",
  },
  miniDiscountBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    minWidth: 42,
    minHeight: 42,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 11,
    backgroundColor: "#5C1697",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 8,
  },
  miniDiscountBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 13,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    textAlign: "center",
  },
  miniImageDividerSvg: {
    position: "absolute",
    left: -10,
    right: 0,
    top: -2,
    zIndex: 0,
  },
  miniImageFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 7,
  },
  miniFooterQty: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 44,
    color: "#05070A",
    fontSize: 12,
    lineHeight: 23,
    fontFamily: FONT_ROLES.category,
    fontWeight: "700",
    letterSpacing: -0.6,
    textAlign: "center",
    bottom: -6,
  },
  pressed: {
    opacity: 0.7,
  },
  packCrimpBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 16,
    backgroundColor: "rgba(35,39,46,0.16)",
  },
  packCrimpTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 16,
    backgroundColor: "rgba(35,39,46,0.16)",
  },
  productColorBase: {
    position: "absolute",
    left: "18%",
    right: "18%",
    bottom: 53,
    height: 16,
    borderRadius: 999,
    backgroundColor: "#ffff",
  },
  productColorCard: {
    width: SCREEN_WIDTH,
    height: 540,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: PRODUCT_IMAGE_BG,
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
  },
  productColorGloss: {
    width: "58%",
    height: "65%",
    borderRadius: 0,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  productPreviewPage: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  productPreviewPager: {
    width: SCREEN_WIDTH,
    flexGrow: 0,
    overflow: "visible",
    zIndex: 1,
    elevation: 0,
  },
  productDot: {
    width: 6,
    height: 6,
    borderRadius: 4,left:-80,
    backgroundColor: "#CDD2DA",top:-280
  },
  productDotActive: {
    width: 6,
    height: 6,left:-80,
    borderRadius: 4,
    backgroundColor: "#6e6e6eff",top:-280
  },
  productDots: {
    position: "absolute",
    right: 92,
    bottom: 152,
    flexDirection: "row",
    gap: 5,
    zIndex: 80,
    elevation: 80,
  },
  productTitle: {
    ...GROCERY_TYPOGRAPHY.heroTitle,
    marginTop: 0,
    color: "#30343A",
  },
  ratingCount: {
    marginLeft: 4,
    color: "#5F6673",
    fontSize: 9,
    lineHeight: 14,
    fontFamily: FONT_ROLES.description,
    fontWeight: "900",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoCollapsedRow: {
    marginTop: 12,
    paddingHorizontal: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  keyInfoCard: {
    marginTop: 12,
    borderRadius: 13,
    backgroundColor: "#F5F6FA",
    overflow: "hidden",
  },
  keyInfoHeader: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E5EC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  keyInfoLabel: {
    width: 116,
    color: "#30343A",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FONT_ROLES.category,
    fontWeight: "700",
  },
  keyInfoRow: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: "row",
    gap: 12,
  },
  keyInfoTitle: {
    color: "#30343A",
    fontSize: 14,
    lineHeight: 19,
    fontFamily: FONT_ROLES.category,
    fontWeight: "700",
  },
  keyInfoValue: {
    flex: 1,
    color: "#606875",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FONT_ROLES.description,
    fontWeight: "400",
  },
  safe: {
    flex: 1,
    backgroundColor: "#f9fafc",
  },
  screen: {
    flex: 1,
    backgroundColor: "#f9fafc",
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    elevation: 0,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0,
    borderBottomColor: "#ffffffff",
    shadowColor: "#3e3e3eff",
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  stickyHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stickyHeaderBack: {
    width: 34,
    height: 34,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stickyHeaderCopy: {
    flex: 1,
    paddingRight: 10,
  },
  stickyHeaderInner: {
    minHeight: 56,
    paddingHorizontal: 14,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  stickyHeaderSubtitle: {
    ...GROCERY_TYPOGRAPHY.caption,
    marginTop: 1,
    color: "#777982",
  },
  stickyHeaderTitle: {
    ...GROCERY_TYPOGRAPHY.cardTitle,
    color: "#202124",
  },
  selectUnitTitle: {
    marginTop: 0,
    color: "#2A2E34",
    fontSize: 15,
    lineHeight: 18,
    fontFamily: FONT_ROLES.category,
    fontWeight: "900",
  },
  selectUnitSubtitle: {
    marginTop: 2,
    color: "#687080",
    fontSize: 10,
    lineHeight: 12,
    fontFamily: FONT_ROLES.description,
    fontWeight: "400",
  },
  authenticPill: {
    minWidth: 112,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E7DF",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  authenticTitle: {
    color: "#087B34",
    fontSize: 10,
    lineHeight: 12,
    fontFamily: FONT_ROLES.category,
    fontWeight: "900",
  },
  authenticSubtitle: {
    marginTop: 1,
    color: "#687080",
    fontSize: 8,
    lineHeight: 10,
    fontFamily: FONT_ROLES.description,
    fontWeight: "400",
  },
  taxText: {
    marginTop: 2,
    color: "#6A7280",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: FONT_ROLES.description,
    fontWeight: "500",
  },
  unitCard: {
    width: 94,
    minHeight: 78,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D6DAE2",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 9,
    paddingTop: 14,
    paddingBottom: 8,
    overflow: "hidden",
  },
  unitCardSelected: {
    borderColor: GREEN,
    borderWidth: 2.5,
    backgroundColor: "transparent",
  },
  unitValueBadge: {
    position: "absolute",
    top: -1,
    alignSelf: "center",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    backgroundColor: GREEN,
    color: "#FFFFFF",
    fontSize: 8,
    lineHeight: 10,
    fontFamily: FONT_ROLES.category,
    fontWeight: "900",
    letterSpacing: 0.2,
    overflow: "hidden",
  },
  unitMrp: {
    color: "#6A7280",
    fontSize: 10,
    lineHeight: 12,
    fontFamily: FONT_ROLES.mrp,
    fontWeight: "500",
    textDecorationLine: "line-through",
  },

  unitOffer: {
    marginTop: 7,
    color: "#079A4A",
    fontSize: 10,
    lineHeight: 12,
    fontFamily: FONT_ROLES.category,
    fontWeight: "700",
  },
  unitPerPrice: {
    marginTop: 2,
    color: "#6A7280",
    fontSize: 9,
    lineHeight: 11,
    fontFamily: FONT_ROLES.description,
    fontWeight: "400",
  },
  unitPrice: {
    color: "#087B34",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONT_ROLES.price,
    fontWeight: "800",
  },
  unitPriceRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  unitQty: {
    color: "#3A3F46",
    fontSize: 14,
    lineHeight: 21,
    fontFamily: FONT_ROLES.category,
    fontWeight: "600",
  },
  unitsRow: {
    marginTop: 9,
    flexDirection: "row",
    gap: 8,
  },
  quantityHeader: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  detailsCard: {
    marginHorizontal: 1,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEF1F5",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#646464ff",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0,
  },
  detailsCardCopy: {
    flex: 1,
  },
  detailsCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F1FFF0",
    borderWidth: 1,
    borderColor: "#D5F1D3",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsCardSubtitle: {
    marginTop: 2,
    color: "#69717D",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FONT_ROLES.description,
    fontWeight: "400",
  },
  detailsCardTitle: {
    color: "#2A2E34",
    fontSize: 15,
    lineHeight: 19,
    fontFamily: FONT_ROLES.category,
    fontWeight: "700",
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.34)",
  },
  drawerButton: {
    marginTop: "auto",
    height: 44,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  drawerButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 18,
    fontFamily: FONT_ROLES.category,
    fontWeight: "900",
  },
  drawerCard: {
    marginTop: 18,
    padding: 12,
    borderRadius: 0,
    backgroundColor: "#F4FAF5",
    borderWidth: 1,
    borderColor: "#D7EBDC",
    flexDirection: "row",
    gap: 10,
  },
  drawerCardText: {
    marginTop: 3,
    color: "#69717D",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FONT_ROLES.description,
    fontWeight: "400",
  },
  drawerCardTitle: {
    color: "#20242A",
    fontSize: 13,
    lineHeight: 17,
    fontFamily: FONT_ROLES.category,
    fontWeight: "900",
  },
  drawerCopy: {
    flex: 1,
  },
  drawerHandle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#D9DEE8",
    marginBottom: 18,
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 80,
    elevation: 80,
  },
  drawerSubtitle: {
    marginTop: 5,
    color: "#69717D",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FONT_ROLES.description,
    fontWeight: "400",
  },
  drawerTitle: {
    color: "#111827",
    fontSize: 22,
    lineHeight: 27,
    fontFamily: FONT_ROLES.category,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  leftDrawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 278,
    paddingTop: 58,
    paddingHorizontal: 16,
    paddingBottom: 22,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "#FFFFFF",
    shadowColor: "#101828",
    shadowOpacity: 0,
    shadowRadius: 18,
    shadowOffset: { width: 7, height: 0 },
    elevation: 0,
  },
});
