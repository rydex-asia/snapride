import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
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
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import AppIcon from "../../components/AppIcon";
import AddSquareIcon from "../../components/AddSquareIcon";
import { PRODUCT_IMAGES, ProductCard as HomeProductCard } from "./GroceryHomeContent";

const CATEGORY_RAIL_WIDTH = 78;
const CATEGORY_RAIL_ITEM_HEIGHT = 94;
const PRODUCT_GAP = 0;
const GREEN = "#0B7A33";

const CATEGORY_RAIL = [
  { key: "tea", label: "Tea", accent: "#B71F31", colors: ["#FFF0F1", "#F7DBDE"], image: require("../../assets/grocery-categories/category1.png") },
  { key: "coffee", label: "Instant Coffee", accent: "#8B5E3C", colors: ["#FAF0E8", "#EEDAC9"], image: require("../../assets/grocery-categories/category2.png") },
  { key: "filter", label: "Filter & Ground", accent: "#CC8C4A", colors: ["#FFF5E7", "#F5DFC0"], image: require("../../assets/grocery-categories/category3.png") },
  { key: "mixes", label: "Drink Mixes", accent: "#C76A1C", colors: ["#FFF7DE", "#F7E3A9"], image: require("../../assets/grocery-categories/category4.png") },
  { key: "herbal", label: "Green & Herbal Tea", accent: "#2F8C64", colors: ["#EEF8ED", "#D9EFD7"], image: require("../../assets/grocery-categories/category5.png") },
  { key: "cold", label: "Cold Coffee", accent: "#C56A3A", colors: ["#EDF5FA", "#D9E9F2"], image: require("../../assets/grocery-categories/category6.png") },
];

const FILTERS = [
  { key: "filter", label: "", icon: "tune-variant", compact: true },
  { key: "sort", label: "Sort By", icon: "chevron-down" },
  { key: "drop", label: "Price Drop", icon: "tag-outline", iconColor: "#C84638" },
  { key: "more", label: "Bestseller", icon: "star-outline" },
];

const PRODUCTS_BY_RAIL = {
  tea: [
    {
      id: "tea-1",
      brand: "Urban Platter",
      name: "Blue Butterfly Pea Flower Tea (Rich in antioxidants)",
      qty: "40 g",
      sizes: ["40 g"],
      price: 237,
      mrp: 250,
      eta: "16 MINS",
      rating: "4.6",
      reviews: "251",
      tag: "Ad",
      color: "#F3F5FA",
      accent: "#294FD4",
      unitRate: "₹592.5/100 g",
    },
    {
      id: "tea-2",
      brand: "Jeena Sikho",
      name: "32 Herbs Tea | Ayurvedic Detox Kadha | Natural Ingredients",
      qty: "250 g",
      sizes: ["250 g"],
      price: 1680,
      mrp: 1680,
      eta: "7 MINS",
      rating: "5.0",
      reviews: "133",
      tag: "BESTSELLER",
      color: "#F2F6E8",
      accent: "#5C7A1F",
      unitRate: "₹672/100 g",
    },
    {
      id: "tea-3",
      brand: "Taj Mahal",
      name: "Rich and Flavourful Tea",
      qty: "100 g",
      sizes: ["100 g"],
      price: 75,
      mrp: 80,
      eta: "7 MINS",
      rating: "4.6",
      reviews: "6.4k",
      color: "#F7F1E7",
      accent: "#123F6A",
      unitRate: "₹75/100 g",
    },
    {
      id: "tea-4",
      brand: "",
      name: "Red Label Tea",
      qty: "2 x 100 g",
      sizes: ["100 g", "2 x 100 g"],
      price: 45,
      mrp: 45,
      eta: "7 MINS",
      rating: "4.5",
      reviews: "12.9k",
      tag: "BESTSELLER",
      color: "#F8E9ED",
      accent: "#B61E2E",
      unitRate: "₹45/100 g",
    },
  ],
  coffee: [
    {
      id: "coffee-1",
      brand: "NESCAFE",
      name: "Classic Instant Coffee",
      qty: "100 g",
      price: 199,
      mrp: 220,
      eta: "10 MINS",
      rating: "4.5",
      reviews: "3.2k",
      tag: "Popular",
      color: "#F5EFE9",
      accent: "#7A4B2B",
      unitRate: "₹199/100 g",
    },
    {
      id: "coffee-2",
      brand: "BRU",
      name: "Instant Coffee Powder",
      qty: "50 g",
      price: 106,
      mrp: 120,
      eta: "10 MINS",
      rating: "4.4",
      reviews: "1.8k",
      tag: "Ad",
      color: "#EDE7E1",
      accent: "#5A3626",
      unitRate: "₹212/100 g",
    },
    {
      id: "coffee-3",
      brand: "Tata",
      name: "Cold Coffee Mix",
      qty: "150 g",
      price: 155,
      mrp: 175,
      eta: "12 MINS",
      rating: "4.3",
      reviews: "922",
      tag: "NEW",
      color: "#F1F5F9",
      accent: "#314D73",
      unitRate: "₹103/100 g",
    },
    {
      id: "coffee-4",
      brand: "NESCAFE",
      name: "Gold Blend Coffee",
      qty: "100 g",
      price: 285,
      mrp: 310,
      eta: "9 MINS",
      rating: "4.7",
      reviews: "5.1k",
      tag: "Bestseller",
      color: "#F2EEE4",
      accent: "#7C5A1F",
      unitRate: "₹285/100 g",
    },
  ],
  filter: [
    {
      id: "filter-1",
      brand: "Filter House",
      name: "South Indian Filter Coffee",
      qty: "200 g",
      price: 189,
      mrp: 210,
      eta: "8 MINS",
      rating: "4.6",
      reviews: "812",
      tag: "Ad",
      color: "#F8F1E9",
      accent: "#A05420",
      unitRate: "₹94.5/100 g",
    },
    {
      id: "filter-2",
      brand: "Roast & Brew",
      name: "Medium Roast Ground Coffee",
      qty: "250 g",
      price: 265,
      mrp: 289,
      eta: "9 MINS",
      rating: "4.5",
      reviews: "1.3k",
      tag: "Fresh",
      color: "#F0E9DF",
      accent: "#7A5231",
      unitRate: "₹106/100 g",
    },
    {
      id: "filter-3",
      brand: "Tata",
      name: "Filter Coffee Powder",
      qty: "200 g",
      price: 129,
      mrp: 145,
      eta: "8 MINS",
      rating: "4.4",
      reviews: "560",
      tag: "Value",
      color: "#F4F4F0",
      accent: "#4E5F54",
      unitRate: "₹64.5/100 g",
    },
    {
      id: "filter-4",
      brand: "Coffee County",
      name: "Ground Arabica Blend",
      qty: "180 g",
      price: 225,
      mrp: 250,
      eta: "11 MINS",
      rating: "4.5",
      reviews: "1.0k",
      tag: "Premium",
      color: "#F6EFE7",
      accent: "#945528",
      unitRate: "₹125/100 g",
    },
  ],
  mixes: [
    {
      id: "mix-1",
      brand: "Boost",
      name: "Chocolate Drink Mix",
      qty: "400 g",
      price: 235,
      mrp: 260,
      eta: "9 MINS",
      rating: "4.4",
      reviews: "1.9k",
      tag: "Bestseller",
      color: "#F8F0F0",
      accent: "#B62B2C",
      unitRate: "₹58.8/100 g",
    },
    {
      id: "mix-2",
      brand: "Bournvita",
      name: "Health Drink Mix",
      qty: "500 g",
      price: 282,
      mrp: 310,
      eta: "9 MINS",
      rating: "4.5",
      reviews: "2.8k",
      tag: "Ad",
      color: "#F2EFE6",
      accent: "#8A5E2B",
      unitRate: "₹56.4/100 g",
    },
    {
      id: "mix-3",
      brand: "Horlicks",
      name: "Classic Malt Drink Mix",
      qty: "500 g",
      price: 265,
      mrp: 290,
      eta: "10 MINS",
      rating: "4.3",
      reviews: "1.1k",
      tag: "New",
      color: "#F1F7ED",
      accent: "#4B7B4D",
      unitRate: "₹53/100 g",
    },
    {
      id: "mix-4",
      brand: "Complan",
      name: "Vanilla Nutrition Mix",
      qty: "500 g",
      price: 275,
      mrp: 300,
      eta: "11 MINS",
      rating: "4.4",
      reviews: "740",
      tag: "Value",
      color: "#EEF4FB",
      accent: "#355B8C",
      unitRate: "₹55/100 g",
    },
  ],
  herbal: [
    {
      id: "herbal-1",
      brand: "Organic India",
      name: "Tulsi Green Tea",
      qty: "25 bags",
      price: 199,
      mrp: 220,
      eta: "8 MINS",
      rating: "4.7",
      reviews: "4.2k",
      tag: "Ad",
      color: "#EDF7F0",
      accent: "#2D8A5A",
      unitRate: "₹8/bag",
    },
    {
      id: "herbal-2",
      brand: "Tata",
      name: "Lemongrass Herbal Tea",
      qty: "25 bags",
      price: 168,
      mrp: 185,
      eta: "9 MINS",
      rating: "4.5",
      reviews: "1.3k",
      tag: "Fresh",
      color: "#F1F7EE",
      accent: "#3A7B55",
      unitRate: "₹6.7/bag",
    },
    {
      id: "herbal-3",
      brand: "Lipton",
      name: "Honey Lemon Green Tea",
      qty: "20 bags",
      price: 179,
      mrp: 199,
      eta: "10 MINS",
      rating: "4.4",
      reviews: "980",
      tag: "Popular",
      color: "#F2F7E9",
      accent: "#7A9E2E",
      unitRate: "₹9/bag",
    },
    {
      id: "herbal-4",
      brand: "Twinings",
      name: "Chamomile Tea",
      qty: "20 bags",
      price: 245,
      mrp: 270,
      eta: "10 MINS",
      rating: "4.6",
      reviews: "640",
      tag: "Premium",
      color: "#F6F1EA",
      accent: "#9A6A2D",
      unitRate: "₹12.2/bag",
    },
  ],
  cold: [
    {
      id: "cold-1",
      brand: "Nescafe",
      name: "Cold Coffee Mix",
      qty: "180 g",
      price: 149,
      mrp: 165,
      eta: "8 MINS",
      rating: "4.4",
      reviews: "1.6k",
      tag: "Ad",
      color: "#F1F5FA",
      accent: "#2E5A86",
      unitRate: "₹82.8/100 g",
    },
    {
      id: "cold-2",
      brand: "Bru",
      name: "Iced Coffee Premix",
      qty: "100 g",
      price: 112,
      mrp: 125,
      eta: "9 MINS",
      rating: "4.3",
      reviews: "890",
      tag: "New",
      color: "#F4F0EE",
      accent: "#77502A",
      unitRate: "₹112/100 g",
    },
    {
      id: "cold-3",
      brand: "Starbucks",
      name: "Mocha Frappuccino Mix",
      qty: "150 g",
      price: 319,
      mrp: 349,
      eta: "12 MINS",
      rating: "4.5",
      reviews: "520",
      tag: "Premium",
      color: "#F1F0EA",
      accent: "#3D4C6B",
      unitRate: "₹213/100 g",
    },
    {
      id: "cold-4",
      brand: "Continental",
      name: "Cold Coffee Premix",
      qty: "200 g",
      price: 185,
      mrp: 205,
      eta: "10 MINS",
      rating: "4.2",
      reviews: "411",
      tag: "Value",
      color: "#EEF3F8",
      accent: "#5A6D83",
      unitRate: "₹92.5/100 g",
    },
  ],
};

const PRODUCT_ART_BY_RAIL = {
  tea: [PRODUCT_IMAGES.tea, PRODUCT_IMAGES.tataTeaPremium, PRODUCT_IMAGES.liptonTea, PRODUCT_IMAGES.tea],
  coffee: [PRODUCT_IMAGES.lifestyleCoffee, PRODUCT_IMAGES.nescafeNew, PRODUCT_IMAGES.coffee, PRODUCT_IMAGES.lifestyleCoffee],
  filter: [PRODUCT_IMAGES.nescafeNew, PRODUCT_IMAGES.coffee, PRODUCT_IMAGES.lifestyleCoffee, PRODUCT_IMAGES.nescafeNew],
  mixes: [PRODUCT_IMAGES.lifestyleMaggi, PRODUCT_IMAGES.saffolaOats, PRODUCT_IMAGES.lifestyleCoffee, PRODUCT_IMAGES.lifestyleAtta],
  herbal: [PRODUCT_IMAGES.liptonTea, PRODUCT_IMAGES.tataTeaPremium, PRODUCT_IMAGES.tea, PRODUCT_IMAGES.liptonTea],
  cold: [PRODUCT_IMAGES.lifestyleCoffee, PRODUCT_IMAGES.lifestyleBisleri, PRODUCT_IMAGES.coffee, PRODUCT_IMAGES.lifestyleCoffee],
};

function getDisplayTitle(category) {
  const label = category?.label || "Tea, Coffee and Milk drinks";
  if (String(label).toLowerCase().includes("tea")) {
    return "Tea, Coffee and Milk drinks";
  }
  return label.replace(/&/g, "and");
}

function resolveRailKey(category) {
  const label = String(category?.label || "").toLowerCase();
  if (label.includes("tea")) return "tea";
  if (label.includes("coffee")) return "coffee";
  if (label.includes("drink mix")) return "mixes";
  if (label.includes("herbal")) return "herbal";
  if (label.includes("cold")) return "cold";
  if (label.includes("filter")) return "filter";
  return "tea";
}

function FilterChip({ item, selected }) {
  if (item.compact) {
    return (
      <Pressable style={({ pressed }) => [styles.filterIconChip, pressed && styles.pressed]}>
        <MaterialCommunityIcons name={item.icon} size={20} color="#363B41" />
      </Pressable>
    );
  }

  return (
    <Pressable style={({ pressed }) => [styles.filterChip, selected && styles.filterChipSelected, pressed && styles.pressed]}>
      <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>{item.label}</Text>
      <MaterialCommunityIcons name={item.icon} size={20} color={item.iconColor || "#485059"} />
    </Pressable>
  );
}

function RailItem({ item, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.railItem, pressed && styles.pressed]}>
      <View style={[styles.railItemContent, selected && styles.railItemContentSelected]}>
        <LinearGradient colors={item.colors} style={[styles.railThumb, selected && styles.railThumbSelected]}>
          <Image source={item.image} style={styles.railThumbImage} resizeMode="contain" fadeDuration={0} />
        </LinearGradient>
        <Text style={[styles.railLabel, selected && styles.railLabelSelected]} numberOfLines={2}>
          {item.label}
        </Text>
      </View>
    </Pressable>
  );
}

function ProgressiveProductImage({ source }) {
  const imageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    imageOpacity.stopAnimation();
    imageOpacity.setValue(0);
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [imageOpacity, source]);

  return (
    <Animated.Image
      source={source}
      resizeMode="contain"
      fadeDuration={0}
      style={[styles.subcategoryProductImage, { opacity: imageOpacity }]}
    />
  );
}

function AnimatedProductCell({ item, index, railKey, children }) {
  const reveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    reveal.setValue(0);
    Animated.timing(reveal, {
      toValue: 1,
      duration: 360,
      delay: Math.min(index * 75, 300),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [index, item.id, railKey, reveal]);

  return (
    <Animated.View
      style={[
        styles.subcategoryProductCell,
        {
          opacity: reveal,
          transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function ProductImageDivider() {
  return (
    <Svg style={styles.productImageDividerSvg} width="100%" height={46} viewBox="0 0 160 46" preserveAspectRatio="none">
      <Path
        d="M0 0 H38 C48 0 50 14 62 14 H98 C110 14 112 0 122 0 H160 V46 H0 Z"
        fill="#FFFFFF"
        stroke="#D9DCE3"
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProductImageFooter({ qty, quantity, onDecrease, onIncrease, onAdd }) {
  return (
    <View style={styles.productImageFooter}>
      <ProductImageDivider />
      <View style={styles.productVegMark}>
        <View style={styles.productVegDot} />
      </View>
      <Text style={styles.productImageFooterQty} numberOfLines={1}>{qty}</Text>
      {quantity > 0 ? (
        <View style={styles.footerStepper}>
          <Pressable style={styles.footerStepperButton} onPress={onDecrease} hitSlop={8}>
            <Text style={styles.footerStepperText}>−</Text>
          </Pressable>
          <Text style={styles.footerStepperValue}>{quantity}</Text>
          <Pressable style={styles.footerStepperButton} onPress={onIncrease} hitSlop={8}>
            <Text style={styles.footerStepperText}>+</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.footerAddButton} onPress={onAdd} hitSlop={8}>
          <MaterialCommunityIcons name="plus" size={22} color="#129B53" />
        </Pressable>
      )}
    </View>
  );
}

function ProductMetaRow({ rating, eta }) {
  const ratingText = String(rating || "4.5").replace(/\.0$/, "");

  return (
    <View style={styles.productMetaRow}>
      <View style={styles.productMetaRating}>
        <MaterialCommunityIcons name="star" size={11} color="#129B53" />
        <Text style={styles.productMetaRatingText}>{ratingText}</Text>
      </View>
      <View style={styles.productMetaEta}>
        <MaterialCommunityIcons name="clock-time-four-outline" size={11} color="#6F767C" />
        <Text style={styles.productMetaEtaText}>{eta || "8 mins"}</Text>
      </View>
    </View>
  );
}

function getProductUnitRate(product = {}) {
  if (product.unitRate) return product.unitRate;

  const qty = String(product.qty || "").trim();
  const price = Number(product.price);
  if (!qty || !Number.isFinite(price) || price <= 0) return "";

  const matcher = /([\d.]+)\s*(kg|g|l|ml|pcs?|pack|packs?)\b/gi;
  let latestMatch = null;
  let match = matcher.exec(qty);
  while (match) {
    latestMatch = match;
    match = matcher.exec(qty);
  }
  if (!latestMatch) return "";

  const amount = Number(latestMatch[1]);
  const unit = latestMatch[2].toLowerCase();
  if (!Number.isFinite(amount) || amount <= 0) return "";

  let baseAmount = amount;
  let label = "";
  if (unit === "kg") {
    baseAmount = amount * 1000;
    label = "100 g";
  } else if (unit === "g") {
    label = "100 g";
  } else if (unit === "l") {
    baseAmount = amount * 1000;
    label = "100 ml";
  } else if (unit === "ml") {
    label = "100 ml";
  } else if (unit.startsWith("pc")) {
    label = "pc";
  } else if (unit.startsWith("pack")) {
    label = "pack";
  } else {
    return "";
  }

  const unitPrice = label === "pc" || label === "pack" ? price / baseAmount : (price / baseAmount) * 100;
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) return "";

  const formatted = Number.isInteger(unitPrice)
    ? String(unitPrice)
    : unitPrice.toFixed(1).replace(/\.0$/, "");
  return `₹${formatted}/${label}`;
}

function ProductCard({ item, quantity, onChangeQuantity }) {
  const discount = item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
  const isAd = String(item.tag || "").toLowerCase() === "ad";
  const badgeText = item.tag && !isAd ? item.tag : "";
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <Pressable style={({ pressed }) => [styles.subcategoryProductCard, pressed && styles.pressed]}>
      <View style={[styles.subcategoryProductVisual, { backgroundColor: item.color }]}> 
        {discount > 0 ? (
          <View style={styles.subcategoryBadge}> 
            <Text style={styles.subcategoryBadgeText}>{discount}%{`\n`}OFF</Text>
          </View>
        ) : null}

        <ProgressiveProductImage source={item.image} />

        <Pressable
          style={styles.subcategoryFavoriteButton}
          onPress={() => setWishlisted((current) => !current)}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name={wishlisted ? "heart" : "heart-outline"}
            size={14}
            color={wishlisted ? "#E53935" : "#16191D"}
          />
        </Pressable>

        <View style={styles.subcategoryVegMark}>
          <View style={styles.subcategoryVegDot} />
        </View>

        {quantity > 0 ? (
          <View style={styles.subcategoryStepper}>
            <Pressable style={styles.subcategoryStepperButton} onPress={() => onChangeQuantity(item.id, quantity - 1)}>
              <Text style={styles.subcategoryStepperSymbol}>−</Text>
            </Pressable>
            <Text style={styles.subcategoryStepperValue}>{quantity}</Text>
            <Pressable style={styles.subcategoryStepperButton} onPress={() => onChangeQuantity(item.id, quantity + 1)}>
              <Text style={styles.subcategoryStepperSymbol}>+</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.subcategoryAddButton} onPress={() => onChangeQuantity(item.id, 1)} hitSlop={8}>
            <MaterialCommunityIcons name="plus" size={24} color="#138A36" />
          </Pressable>
        )}
      </View>

      <View style={styles.subcategoryProductInfo}>
        <ProductMetaRow rating={item.rating} eta={item.eta || "5 MINS"} />
        <Text style={styles.subcategoryProductName} numberOfLines={2}>
          {[item.brand, item.name].filter(Boolean).join(" ")}
        </Text>
        <Text style={styles.subcategoryQty}>{item.qty}</Text>
        <View style={styles.subcategoryInfoDivider} />
        <View style={styles.subcategoryPriceRow}>
          <Text style={styles.subcategoryPrice}>₹{item.price}</Text>
          {item.mrp > item.price ? <Text style={styles.subcategoryMrp}>₹{item.mrp}</Text> : null}
        </View>
        {discount > 0 ? (
          <Text style={styles.subcategoryOfferText}>{discount}% OFF · Save ₹{item.mrp - item.price}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function GroceryCategoryScreen({ category, onClose, onSearch }) {
  const [selectedRail, setSelectedRail] = useState(resolveRailKey(category));
  const [quantities, setQuantities] = useState({});
  const sharedHeaderEntrance = useRef(new Animated.Value(0)).current;
  const listingEntrance = useRef(new Animated.Value(0)).current;
  const selectedIndicatorY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const nextRail = resolveRailKey(category);
    const nextIndex = Math.max(0, CATEGORY_RAIL.findIndex((item) => item.key === nextRail));
    setSelectedRail(nextRail);
    selectedIndicatorY.setValue(nextIndex * CATEGORY_RAIL_ITEM_HEIGHT);
    sharedHeaderEntrance.setValue(0);
    listingEntrance.setValue(0);
    Animated.parallel([
      Animated.timing(sharedHeaderEntrance, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(listingEntrance, {
        toValue: 1,
        duration: 360,
        delay: 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [category, listingEntrance, selectedIndicatorY, sharedHeaderEntrance]);

  const changeQuantity = (id, nextQuantity) => {
    setQuantities((current) => ({ ...current, [id]: Math.max(0, nextQuantity) }));
  };

  const title = useMemo(() => getDisplayTitle(category), [category]);
  const visibleProducts = useMemo(() => {
    const products = PRODUCTS_BY_RAIL[selectedRail] || PRODUCTS_BY_RAIL.tea;
    const images = PRODUCT_ART_BY_RAIL[selectedRail] || PRODUCT_ART_BY_RAIL.tea;
    return products.map((product, index) => ({ ...product, image: images[index % images.length] }));
  }, [selectedRail]);

  const selectRail = (key) => {
    const nextIndex = Math.max(0, CATEGORY_RAIL.findIndex((item) => item.key === key));
    setSelectedRail(key);
    Animated.spring(selectedIndicatorY, {
      toValue: nextIndex * CATEGORY_RAIL_ITEM_HEIGHT,
      damping: 17,
      stiffness: 220,
      mass: 0.75,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.headerButton}>
            <AppIcon name="back" size={28} color="#2C3137" />
          </Pressable>
          <Animated.View
            style={[
              styles.categoryHeaderCopy,
              {
                opacity: sharedHeaderEntrance,
                transform: [
                  { scale: sharedHeaderEntrance.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) },
                ],
              },
            ]}
          >
            {category?.image ? (
              <Animated.View
                style={[
                  styles.categoryHeaderImageWrap,
                  {
                    transform: [
                      { scale: sharedHeaderEntrance.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) },
                    ],
                  },
                ]}
              >
                <Image source={category.image} style={styles.categoryHeaderImage} resizeMode="contain" />
              </Animated.View>
            ) : null}
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          </Animated.View>
          <View style={styles.headerButton} />
        </View>

        <Pressable style={styles.subcategorySearchBar} onPress={onSearch}>
          <MaterialCommunityIcons name="magnify" size={21} color="#475467" />
          <Text style={styles.subcategorySearchPlaceholder} numberOfLines={1}>Search in {title}</Text>
          <View style={styles.subcategorySearchDivider} />
          <MaterialCommunityIcons name="microphone-outline" size={21} color="#667085" />
        </Pressable>

        <Animated.View
          style={[
            styles.body,
            {
              opacity: listingEntrance,
              transform: [
                { translateY: listingEntrance.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
              ],
            },
          ]}
        >
          <ScrollView
            style={styles.railScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.railContent}
          >
            <Animated.View
              pointerEvents="none"
              style={[styles.railSelectedIndicator, { transform: [{ translateY: selectedIndicatorY }] }]}
            />
            {CATEGORY_RAIL.map((item) => (
              <RailItem
                key={item.key}
                item={item}
                selected={item.key === selectedRail}
                onPress={() => selectRail(item.key)}
              />
            ))}
          </ScrollView>

          <ScrollView
            style={styles.productScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productContent}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRail}
            >
              {FILTERS.map((item) => (
                <FilterChip key={item.key} item={item} selected={false} />
              ))}
            </ScrollView>

            <View style={styles.subcategoryProductGrid}>
              {visibleProducts.map((item, index) => (
                <AnimatedProductCell key={item.id} item={item} index={index} railKey={selectedRail}>
                  <HomeProductCard
                    product={item}
                    quantity={quantities[item.id] || 0}
                    onChangeQuantity={changeQuantity}
                    onOpenVariants={(product) => changeQuantity(product.id, (quantities[product.id] || 0) + 1)}
                    variant="regular"
                  />
                </AnimatedProductCell>
              ))}
            </View>

          </ScrollView>
        </Animated.View>

        <View style={styles.deliveryBanner}>
          <Text style={styles.deliveryBannerText}>
            <Text style={styles.deliveryBannerStrong}>FREE DELIVERY</Text>
            {" on orders above ₹99"}
          </Text>
        </View>
        <View style={styles.subcategoryBottomNav}>
          <Pressable style={styles.subcategoryNavItem} onPress={onClose}>
            <MaterialCommunityIcons name="home-outline" size={22} color="#667085" />
            <Text style={styles.subcategoryNavText}>Home</Text>
          </Pressable>
          <View style={styles.subcategoryNavItem}>
            <View style={styles.subcategoryNavActiveIcon}>
              <MaterialCommunityIcons name="view-grid-outline" size={21} color={GREEN} />
            </View>
            <Text style={[styles.subcategoryNavText, styles.subcategoryNavTextActive]}>Categories</Text>
          </View>
          <Pressable style={styles.subcategoryNavItem} onPress={onSearch}>
            <MaterialCommunityIcons name="magnify" size={22} color="#667085" />
            <Text style={styles.subcategoryNavText}>Search</Text>
          </Pressable>
          <View style={styles.subcategoryNavItem}>
            <MaterialCommunityIcons name="cart-outline" size={22} color="#667085" />
            <Text style={styles.subcategoryNavText}>Cart</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0,
    elevation: 0,
    zIndex: 6,
  },
  addButtonText: {
    color: "#245CF2",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "900",
  },
  body: {
    flex: 1,
    flexDirection: "row",
    paddingLeft: 6,
    paddingRight: 10,
    paddingBottom: 104,
    gap: PRODUCT_GAP,
  },
  badge: {
    position: "absolute",
    left: 8,
    top: 8,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    zIndex: 3,
  },
  badgeText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  deliveryBanner: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 62,
    height: 42,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: "#EAFBFD",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 0,
  },
  deliveryBannerStrong: {
    fontWeight: "900",
    color: "#202428",
  },
  deliveryBannerText: {
    color: "#2B3136",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  etaText: {
    color: "#677077",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_500Medium",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
  },
  filterChip: {
    marginRight: 10,
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E7EC",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  filterChipSelected: {
    borderColor: "#D0DBFF",
    backgroundColor: "#F4F7FF",
  },
  filterChipText: {
    color: "#3F464D",
    fontSize: 13,
    lineHeight: 15,
    fontWeight: "700",
  },
  filterChipTextSelected: {
    color: "#275CFF",
  },
  filterIconChip: {
    marginRight: 10,
    width: 38,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E7EC",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0,
  },
  filterRail: {
    paddingTop: 4,
    paddingBottom: 12,
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subcategorySearchBar: {
    height: 48,
    marginHorizontal: 12,
    marginBottom: 10,
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#D9DDE3",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    shadowColor: "#101828",
    shadowOpacity: 0,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0,
  },
  subcategorySearchPlaceholder: {
    flex: 1,
    color: "#667085",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  subcategorySearchDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#D0D5DD",
  },
  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryHeaderCopy: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  categoryHeaderImageWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F4F8F3",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  categoryHeaderImage: {
    width: 34,
    height: 34,
  },
  headerTitle: {
    flexShrink: 1,
    color: "#202428",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.3,
    paddingHorizontal: 0,
  },
  metaRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 4,
  },
  metaInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 0,
  },
  imageMetaRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mrp: {
    color: "#8B9098",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_400Regular",
    fontWeight: "400",
    textDecorationLine: "line-through",
  },
  offerText: {
    marginTop: 2,
    color: "#14A15A",
    fontSize: 13,
    lineHeight: 15,
    fontWeight: "600",
  
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  price: {
    color: "#05070A",
    fontSize: 19,
    lineHeight: 23,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    letterSpacing: -0.15,
  },
  priceRow: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    borderRadius: 0,
    backgroundColor: "#fff1aaff",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    minHeight: 300,
    borderRadius: 20,
    borderWidth: 0,
    borderColor: "transparent",
    padding: 6,
    overflow: "visible",
  },
  productContent: {
    paddingHorizontal: 2,
    paddingTop: 1,
    paddingBottom: 136,
  },
  productGrid: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: PRODUCT_GAP,
    rowGap: 6,
  },
  productName: {
    marginTop: 2,
    color: "#565B63",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: -0.1,
  
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  productMetaRow: {
    marginTop: 4,
    minHeight: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  productMetaRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  productMetaRatingText: {
    color: "#4F5962",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_500Medium",
  },
  productMetaDivider: {
    width: 1,
    height: 10,
    backgroundColor: "#CDD2D8",
  },
  productMetaEta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  productMetaEtaText: {
    color: "#6F767C",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_500Medium",
  },
  productCell: {
    width: "48%",
  },
  productVisual: {
    height: 150,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E1E3E8",
    backgroundColor: "#FBFCFF",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0,
  },
  productImageFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 46,
    borderTopWidth: 0,
    backgroundColor: "transparent",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 7,
  },
  productImageDividerSvg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: -1,
    zIndex: 0,
  },
  productVegMark: {
    width: 24,
    height: 24,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: "#129B53",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  productVegDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#129B53",
  },
  productImageFooterQty: {
    flex: 1,
    paddingLeft: 7,
    paddingRight: 44,
    color: "#05070A",
    fontSize: 12,
    lineHeight: 23,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    letterSpacing: -0.6,
    textAlign: "center",
  },
  footerAddButton: {
    position: "absolute",
    right: -1,
    bottom: 4,
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1.4,
    borderColor: "#129B53",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  footerStepper: {
    position: "absolute",
    right: -1,
    bottom: 5,
    width: 76,
    height: 36,
    borderRadius: 11,
    borderWidth: 1.3,
    borderColor: "#129B53",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  footerStepperButton: {
    width: 25,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  footerStepperText: {
    color: "#129B53",
    fontSize: 23,
    lineHeight: 25,
    fontWeight: "900",
  },
  footerStepperValue: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 18,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "900",
  },
  railThumb: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#344054",
    shadowOpacity: 0,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0,
  },
  railThumbSelected: {
    borderWidth: 1.5,
    borderRadius: 18,
    borderColor: "#7CC48E",
    shadowColor: GREEN,
    shadowOpacity: 0,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0,
  },
  railThumbImage: {
    width: "90%",
    height: "90%",
  },
  railContent: {
    paddingBottom: 86,
    paddingTop: 0,
    alignItems: "center",
    width: CATEGORY_RAIL_WIDTH,
    position: "relative",
  },
  railScroll: {
    width: CATEGORY_RAIL_WIDTH,
    minWidth: CATEGORY_RAIL_WIDTH,
    maxWidth: CATEGORY_RAIL_WIDTH,
    flexBasis: CATEGORY_RAIL_WIDTH,
    flexGrow: 0,
    flexShrink: 0,
  },
  railItem: {
    width: CATEGORY_RAIL_WIDTH,
    height: CATEGORY_RAIL_ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  railItemContent: {
    alignItems: "center",
    transform: [{ scale: 1 }],
  },
  railItemContentSelected: {
    transform: [{ scale: 1.05 }],
  },
  railLabel: {
    width: 68,
    marginTop: 5,
    color: "#8B9096",
    fontSize: 11,
    lineHeight: 13,
    textAlign: "center",
    fontWeight: "700",
  },
  railLabelSelected: {
    color: GREEN,
    fontWeight: "900",
  },
  railSelectedIndicator: {
    position: "absolute",
    left: 0,
    top: 7,
    width: 4,
    height: 72,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: GREEN,
    zIndex: 8,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    color: "#159A5A",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_500Medium",
  },
  reviewsText: {
    color: "#7D848A",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_500Medium",
  },
  metaDivider: {
    color: "#A5ABB0",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "700",
  },
  stepper: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 88,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: "#138A36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  stepperButton: {
    width: 32,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperSymbol: {
    color: "#138A36",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
  },
  stepperValue: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  productScroll: {
    flex: 1,
    minWidth: 0,
  },
  sizeChip: {
    alignSelf: "flex-start",
    marginTop: 0,
    minHeight: 22,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0,
    borderColor: "#C9D8EB",
    backgroundColor: "#FFFFFF",
    marginRight: 6,
  },
  sizeRow: {
    marginTop: 0,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  sizeText: {
    color: "#138A36",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  qtySubline: {
    alignSelf: "flex-start",
    minHeight: 22,
    marginTop: 4,
    borderRadius: 6,
    borderWidth: 0.6,
    borderColor: "#C9DFFB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    color: "#138A36",
    fontSize: 11,
    lineHeight: 20,
    fontWeight: "700",
    letterSpacing: -0.1,
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  unitRate: {
    marginTop: 1,
    color: "#8A9096",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  adLabel: {
    position: "absolute",
    left: 8,
    bottom: 10,
    color: "#B4B7BC",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    zIndex: 3,
  },
  subcategoryProductGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
    paddingRight: 2,
    paddingBottom: 12,
  },
  subcategoryProductCell: {
    width: "49%",
    alignItems: "center",
  },
  subcategoryProductCard: {
    width: 124,
    minHeight: 272,
    padding: 0,
    paddingBottom: 0,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: "transparent",
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    overflow: "visible",
  },
  subcategoryProductVisual: {
    height: 126,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  subcategoryProductImage: {
    width: "100%",
    height: "100%",
  },
  subcategoryImageSurfaceSvg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  subcategoryBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    minWidth: 34,
    minHeight: 34,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#5C1697",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
  },
  subcategoryBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    lineHeight: 10,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "800",
    textAlign: "center",
  },
  subcategoryArtwork: {
    width: "68%",
    height: "53%",
    marginTop: -3,
    padding: 5,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#27364A",
    shadowOpacity: 0,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0,
    transform: [{ rotate: "-2deg" }],
  },
  subcategoryArtworkBrand: {
    maxWidth: "100%",
    color: "#FFFFFF",
    fontSize: 8,
    lineHeight: 10,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  subcategoryArtworkLabel: {
    width: "100%",
    minHeight: 30,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.94)",
    alignItems: "center",
    justifyContent: "center",
  },
  subcategoryArtworkName: {
    fontSize: 7,
    lineHeight: 9,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    textAlign: "center",
  },
  subcategoryFavoriteButton: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6,
    shadowColor: "#30343A",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  subcategoryAddButton: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6,
  },
  subcategoryStepper: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 72,
    height: 34,
    borderRadius: 8,
    borderWidth: 1.7,
    borderColor: "#138A36",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 6,
  },
  subcategoryStepperButton: {
    width: 24,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  subcategoryStepperSymbol: {
    color: "#138A36",
    fontSize: 20,
    lineHeight: 22,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
  },
  subcategoryStepperValue: {
    color: "#138A36",
    fontSize: 13,
    lineHeight: 16,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
  },
  subcategoryEta: {
    marginTop: 4,
    paddingHorizontal: 1,
    color: "#858A91",
    fontSize: 10,
    lineHeight: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  subcategoryProductName: {
    minHeight: 30,
    marginTop: 5,
    paddingHorizontal: 1,
    color: "#15171A",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  subcategoryQty: {
    marginTop: 3,
    paddingHorizontal: 1,
    color: "#777A82",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  subcategoryOfferRow: {
    minHeight: 16,
    marginTop: 2,
    paddingHorizontal: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  subcategoryOfferText: {
    color: "#0C9D69",
    fontSize: 10,
    lineHeight: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  subcategoryOfferDivider: {
    flex: 1,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D6DADF",
  },
  subcategoryPriceRow: {
    minHeight: 21,
    marginTop: 5,
    paddingHorizontal: 1,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  subcategoryPrice: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 19,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "800",
    letterSpacing: -0.75,
  },
  subcategoryMrp: {
    color: "#777A82",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_400Regular",
    fontWeight: "400",
    textDecorationLine: "line-through",
  },
  subcategoryProductInfo: {
    minHeight: 146,
    paddingHorizontal: 3,
    paddingTop: 8,
    paddingBottom: 7,
  },
  subcategoryInfoDivider: {
    marginTop: 5,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderBottomColor: "#C8CCD1",
  },
  subcategoryVegMark: {
    position: "absolute",
    left: 6,
    bottom: 6,
    width: 23,
    height: 23,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1.5,
    borderColor: "#129B53",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  subcategoryVegDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#129B53",
  },
  subcategoryBottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 62,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#E4E7EC",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#101828",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 0,
    zIndex: 20,
  },
  subcategoryNavItem: {
    minWidth: 62,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  subcategoryNavActiveIcon: {
    width: 36,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#EAF6ED",
    alignItems: "center",
    justifyContent: "center",
  },
  subcategoryNavText: {
    color: "#667085",
    fontSize: 9,
    lineHeight: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  subcategoryNavTextActive: {
    color: GREEN,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
});
