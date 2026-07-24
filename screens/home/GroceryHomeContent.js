import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import AddSquareIcon from "../../components/AddSquareIcon";
import { GROCERY_TYPOGRAPHY } from "../../theme/typography";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");
const BANNER_SIDE_PADDING = 12;
const BANNER_GAP = 10;
const BANNER_WIDTH = WINDOW_WIDTH - BANNER_SIDE_PADDING * 2;
const BANNER_HEIGHT = 144;
const BANNER_STEP = BANNER_WIDTH + BANNER_GAP;
const PRODUCT_GRID_SIDE_PADDING = 14;
const PRODUCT_GRID_COLUMN_GAP = 3;
const PRODUCT_WIDTH = Math.floor(
  (WINDOW_WIDTH - PRODUCT_GRID_SIDE_PADDING * 2 - PRODUCT_GRID_COLUMN_GAP * 2) / 3
);
const PRODUCT_IMAGE_HEIGHT = 122;
const LISTING_SIDE_PADDING = 10;
const LISTING_PRODUCT_GAP = 10;
const LISTING_PRODUCT_WIDTH = Math.floor((WINDOW_WIDTH - LISTING_SIDE_PADDING * 2 - LISTING_PRODUCT_GAP) / 2);
const LISTING_PRODUCT_IMAGE_HEIGHT = Math.round(LISTING_PRODUCT_WIDTH * 1.0);
const GREEN = "#0B7A33";
const SIZE_BLUE = "#0759F6";
const PRODUCT_IMAGE_BG = "#F7F8FA";
const CATEGORY_BLUE_BG = "#EAF4FF";
const CATEGORY_SIDE_PADDING = 12;
const CATEGORY_GAP = 8;
const CATEGORY_TILE_WIDTH = Math.floor((WINDOW_WIDTH - CATEGORY_SIDE_PADDING * 2 - CATEGORY_GAP * 3) / 4) - 2;
const FEATURE_CARD_HEIGHT = Math.round(CATEGORY_TILE_WIDTH * 1.54);
const CATEGORY_CARD_HEIGHT = Math.round(CATEGORY_TILE_WIDTH * 1.3);
const CATEGORY_IMAGES = [
  require("../../assets/grocery-categories/category1.png"),
  require("../../assets/grocery-categories/category2.png"),
  require("../../assets/grocery-categories/category3.png"),
  require("../../assets/grocery-categories/category4.png"),
  require("../../assets/grocery-categories/category5.png"),
  require("../../assets/grocery-categories/category6.png"),
  require("../../assets/grocery-categories/category7.png"),
  require("../../assets/grocery-categories/category8.png"),
  require("../../assets/grocery-categories/category9.png"),
  require("../../assets/grocery-categories/category10.png"),
  require("../../assets/grocery-categories/category11.png"),
  require("../../assets/grocery-categories/category12.png"),
  require("../../assets/grocery-categories/category13.png"),
  require("../../assets/grocery-categories/category14.png"),
  require("../../assets/grocery-categories/category15.png"),
  require("../../assets/grocery-categories/category16.png"),
  require("../../assets/grocery-categories/category17.png"),
  require("../../assets/grocery-categories/category18.png"),
  require("../../assets/grocery-categories/category19.png"),
  require("../../assets/grocery-categories/category20.png"),
  require("../../assets/grocery-categories/category21.png"),
  require("../../assets/grocery-categories/category22.png"),
  require("../../assets/grocery-categories/category23.png"),
];
export const PRODUCT_IMAGES = {
  rice: require("../../assets/grocery-products/home-lifestyle/daawat-super-basmati-rice.png"),
  oil: require("../../assets/grocery-products/saffola-oil.png"),
  milk: require("../../assets/grocery-products/amul-milk.png"),
  dal: require("../../assets/grocery-products/tata-toor-dal.png"),
  ketchup: require("../../assets/grocery-products/kissan-ketchup.png"),
  atta: require("../../assets/grocery-products/home-lifestyle/aashirvaad-select-atta.png"),
  coffee: require("../../assets/grocery-products/home-lifestyle/nescafe-classic.png"),
  tea: require("../../assets/grocery-products/red-label-tea.png"),
  sugar: require("../../assets/grocery-products/india-gate-sugar.png"),
  ghee: require("../../assets/grocery-products/gowardhan-ghee.png"),
  fortuneAtta: require("../../assets/grocery-products/products/grocery14.png"),
  tataTeaPremium: require("../../assets/grocery-products/products/grocery15.png"),
  saffolaOats: require("../../assets/grocery-products/products/grocery16.png"),
  aashirvaadMasala: require("../../assets/grocery-products/products/grocery17.png"),
  nescafeNew: require("../../assets/grocery-products/products/grocery18.png"),
  oreo: require("../../assets/grocery-products/products/grocery19.png"),
  alooBhujia: require("../../assets/grocery-products/products/grocery20-2.png"),
  kissanJam: require("../../assets/grocery-products/products/grocery20.png"),
  pringles: require("../../assets/grocery-products/products/grocery21.png"),
  liptonTea: require("../../assets/grocery-products/products/grocery22.png"),
  amulTaazaCarton: require("../../assets/grocery-products/products/grocery23.png"),
  amulCurd: require("../../assets/grocery-products/products/grocery24.png"),
  sunlight: require("../../assets/grocery-products/products/grocery25.png"),
  harpic: require("../../assets/grocery-products/products/grocery26.png"),
  surfExcel: require("../../assets/grocery-products/products/grocery27.png"),
  vanish: require("../../assets/grocery-products/products/grocery28.png"),
  lux: require("../../assets/grocery-products/products/grocery29.png"),
  medimix: require("../../assets/grocery-products/products/grocery30.png"),
  colgate: require("../../assets/grocery-products/products/grocery31.png"),
  dettol: require("../../assets/grocery-products/products/grocery32.png"),
  dove: require("../../assets/grocery-products/products/grocery33.png"),
  pears: require("../../assets/grocery-products/products/grocery34.png"),
  lifestyleAtta: require("../../assets/grocery-products/home-lifestyle/aashirvaad-select-atta.png"),
  lifestyleButter: require("../../assets/grocery-products/home-lifestyle/amul-butter.png"),
  lifestyleApples: require("../../assets/grocery-products/home-lifestyle/fresh-apples.png"),
  lifestyleRice: require("../../assets/grocery-products/home-lifestyle/daawat-super-basmati-rice.png"),
  lifestyleLays: require("../../assets/grocery-products/home-lifestyle/lays-chile-limon.png"),
  lifestyleCoffee: require("../../assets/grocery-products/home-lifestyle/nescafe-classic.png"),
  lifestyleBananas: require("../../assets/grocery-products/home-lifestyle/fresh-bananas.png"),
  lifestyleIceCream: require("../../assets/grocery-products/home-lifestyle/chocolate-brownie-ice-cream.png"),
  lifestyleMaggi: require("../../assets/grocery-products/home-lifestyle/maggi-noodles.png"),
  lifestyleDettolSoap: require("../../assets/grocery-products/home-lifestyle/dettol-original-soap.png"),
  lifestyleBisleri: require("../../assets/grocery-products/home-lifestyle/bisleri-water.png"),
};

function withCategoryImages(items, offset = 0) {
  return items.map((item, index) => ({
    ...item,
    image: CATEGORY_IMAGES[(offset + index) % CATEGORY_IMAGES.length],
  }));
}

function resolveProductTagColor(tag = "") {
  const value = String(tag).toLowerCase();

  if (value.includes("import")) return "#C94F1D";
  if (value.includes("trend")) return "#4C9BF4";
  if (value.includes("best")) return "#1D9B63";
  if (value.includes("fresh")) return "#2E8B57"; 
  if (value.includes("offer")) return "#D36C1E";
  if (value.includes("value")) return "#4E7EF1";
  if (value.includes("new")) return "#7E57C2";
  return "#4C9BF4";
}

const GROCERY_KITCHEN = withCategoryImages([
  { id: "vegetables", label: "Vegetables & Fruits", bg: "#e5f3f3" },
  { id: "grains", label: "Atta, Rice & Dal", bg: "#e5f3f3" },
  { id: "oil", label: "Oil, Ghee & Masala", bg: "#e4f2f2" },
  { id: "dairy", label: "Dairy, Bread & Eggs", bg: "#EAF4FF" },
  { id: "bakery", label: "Bakery & Biscuits", bg: "#F7ECE2" },
  { id: "breakfast", label: "Dry Fruits & Cereals", bg: "#F2EAFB" },
  { id: "meat", label: "Chicken, Meat & Fish", bg: "#FBECEE" },
  { id: "kitchen", label: "Kitchenware & Appliances", bg: "#EDF1F6" },
], 12);

const SNACKS_DRINKS = withCategoryImages([
  { id: "chips", label: "Chips & Namkeen", bg: "#ffecc5ff" },
  { id: "sweets", label: "Sweets & Chocolates", bg: "#FBE7EF" },
  { id: "drinks", label: "Drinks & Juices", bg: "#EAF6FF" },
  { id: "tea", label: "Tea, Coffee & Milk Drinks", bg: "#EFE9DD" },
  { id: "instant", label: "Instant Food", bg: "#FFF0D8" },
  { id: "sauces", label: "Sauces & Spreads", bg: "#F8E9E3" },
  { id: "paan", label: "Paan Corner", bg: "#E8F5EA" },
  { id: "icecream", label: "Ice Creams & More", bg: "#EAF6FF" },
], 20);

const BEAUTY_CARE = withCategoryImages([
  { id: "bath", label: "Bath & Body", bg: "#F7E9DC" },
  { id: "hair", label: "Hair", bg: "#F1EAF8" },
  { id: "skin", label: "Skin & Face", bg: "#FFF0DD" },
  { id: "beauty", label: "Beauty & Cosmetics", bg: "#FBE5EC" },
], 5);

const HOUSEHOLD = withCategoryImages([
  { id: "home", label: "Home & Lifestyle", bg: "#EAF7F4" },
  { id: "cleaners", label: "Cleaners & Repellents", bg: "#E9F4F5" },
  { id: "electronics", label: "Electronics", bg: "#EEF1FA" },
  { id: "stationery", label: "Stationery & Games", bg: "#F5EAF4" },
], 8);

const SPOTLIGHT_STORES = withCategoryImages([
  { id: "ice-store", label: "Ice Cream Store", bg: "#E8F3FF" },
  { id: "travel-store", label: "Travel Store", bg: "#EAF6EA" },
  { id: "hobby-store", label: "Hobby Store", bg: "#F3EAF9" },
  { id: "sports-store", label: "Sports Store", bg: "#EAF7EA" },
], 0);

const LIFESTYLE_STORES = withCategoryImages([
  { id: "spiritual", label: "Spiritual Needs", bg: "#FFF2D9" },
  { id: "pet", label: "Pet Store", bg: "#E8F7DE" },
  { id: "fashion", label: "Fashion Basics", bg: "#EAF0FF" },
  { id: "toy", label: "Toy Store", bg: "#FFE6E6" },
  { id: "book", label: "Book Store", bg: "#EFE7DA" },
  { id: "pharma", label: "Pharma Store", bg: "#DDF6FF" },
  { id: "gifts", label: "E-Gifts Store", bg: "#FFF0B8" },
  { id: "jewellery", label: "Jewellery Store", bg: "#FFE3F1" },
], 4);

const BANNERS = [
  {
    id: "frezo-60",
    eyebrow: "SPECIAL OFFER",
    title: "Get up to 25% OFF",
    subtitle: "Delicious goodness on-the-go!",
    cta: "Shop now",
    code: "Ad",
    color: "#10243B",
    background: "#47BDE6",
  },
  {
    id: "fresh-15",
    eyebrow: "FRESH FEST",
    title: "Farm fresh picks",
    subtitle: "delivered in minutes",
    cta: "Extra savings on produce",
    code: "FRESH15",
    color: "#1C4770",
    background: "#EDF7FF",
  },
  {
    id: "home-80",
    eyebrow: "HOME ESSENTIALS WEEK",
    title: "Save on daily needs",
    subtitle: "Flat ₹80 off above ₹799",
    cta: "Use code HOME80",
    code: "HOME80",
    color: "#6A470F",
    background: "#FFF6E8",
  },
];

const LIFESTYLE_PRODUCTS = {
  atta: { id: "life-atta", imageKey: "atta", brand: "AASHIRVAAD", name: "Select Sharbati Atta", qty: "5 kg", price: 349, mrp: 399, rating: "4.7", eta: "8 mins", color: PRODUCT_IMAGE_BG, image: PRODUCT_IMAGES.lifestyleAtta, imageFit: "contain" },
  butter: { id: "life-butter", imageKey: "lifestyleButter", brand: "AMUL", name: "Pasteurised Butter", qty: "500 g", price: 285, mrp: 300, rating: "4.8", eta: "7 mins", color: PRODUCT_IMAGE_BG, image: PRODUCT_IMAGES.lifestyleButter, imageFit: "contain" },
  apples: { id: "life-apples", imageKey: "lifestyleApples", brand: "FRESH", name: "Royal Gala Apples", qty: "4 pcs", price: 149, mrp: 180, rating: "4.6", eta: "9 mins", color: PRODUCT_IMAGE_BG, image: PRODUCT_IMAGES.lifestyleApples, imageFit: "contain" },
  rice: { id: "life-rice", imageKey: "rice", brand: "DAAWAT", name: "Super Basmati Rice", qty: "1 kg", price: 189, mrp: 229, rating: "4.7", eta: "9 mins", color: PRODUCT_IMAGE_BG, image: PRODUCT_IMAGES.lifestyleRice, imageFit: "contain" },
  lays: { id: "life-lays", imageKey: "lifestyleLays", brand: "LAY'S", name: "Chile Limón Potato Chips", qty: "48 g", price: 20, mrp: 25, rating: "4.5", eta: "8 mins", color: PRODUCT_IMAGE_BG, image: PRODUCT_IMAGES.lifestyleLays, imageFit: "contain" },
  coffee: { id: "life-coffee", imageKey: "coffee", brand: "NESCAFÉ", name: "Classic Instant Coffee", qty: "100 g", price: 299, mrp: 340, rating: "4.7", eta: "8 mins", color: PRODUCT_IMAGE_BG, image: PRODUCT_IMAGES.lifestyleCoffee, imageFit: "contain" },
  bananas: { id: "life-bananas", imageKey: "lifestyleBananas", brand: "FRESH", name: "Robusta Bananas", qty: "6 pcs", price: 55, mrp: 65, rating: "4.6", eta: "9 mins", color: PRODUCT_IMAGE_BG, image: PRODUCT_IMAGES.lifestyleBananas, imageFit: "contain" },
  iceCream: { id: "life-icecream", imageKey: "lifestyleIceCream", brand: "KWALITY WALL'S", name: "Chocolate Brownie Fudge", qty: "700 ml", price: 225, mrp: 275, rating: "4.6", eta: "10 mins", color: PRODUCT_IMAGE_BG, image: PRODUCT_IMAGES.lifestyleIceCream, imageFit: "contain" },
  maggi: { id: "life-maggi", imageKey: "lifestyleMaggi", brand: "MAGGI", name: "2-Minute Noodles", qty: "280 g", price: 55, mrp: 60, rating: "4.7", eta: "8 mins", color: PRODUCT_IMAGE_BG, image: PRODUCT_IMAGES.lifestyleMaggi, imageFit: "contain" },
  dettolSoap: { id: "life-dettol-soap", imageKey: "lifestyleDettolSoap", brand: "DETTOL", name: "Original Germ Protection Soap", qty: "125 g", price: 52, mrp: 65, rating: "4.6", eta: "8 mins", color: PRODUCT_IMAGE_BG, image: PRODUCT_IMAGES.lifestyleDettolSoap, imageFit: "contain" },
  bisleri: { id: "life-bisleri", imageKey: "lifestyleBisleri", brand: "BISLERI", name: "Mineral Water", qty: "1 L", price: 20, mrp: 20, rating: "4.8", eta: "6 mins", color: PRODUCT_IMAGE_BG, image: PRODUCT_IMAGES.lifestyleBisleri, imageFit: "contain" },
};

const POPULAR_PRODUCTS = [
  LIFESTYLE_PRODUCTS.atta,
  LIFESTYLE_PRODUCTS.butter,
  LIFESTYLE_PRODUCTS.apples,
  LIFESTYLE_PRODUCTS.rice,
  LIFESTYLE_PRODUCTS.coffee,
  LIFESTYLE_PRODUCTS.bananas,
  LIFESTYLE_PRODUCTS.lays,
  LIFESTYLE_PRODUCTS.maggi,
  LIFESTYLE_PRODUCTS.iceCream,
  LIFESTYLE_PRODUCTS.dettolSoap,
  LIFESTYLE_PRODUCTS.bisleri,
];

const FRESH_PRODUCTS = [
  LIFESTYLE_PRODUCTS.apples,
  LIFESTYLE_PRODUCTS.bananas,
  LIFESTYLE_PRODUCTS.iceCream,
  LIFESTYLE_PRODUCTS.bisleri,
  LIFESTYLE_PRODUCTS.butter,
  LIFESTYLE_PRODUCTS.rice,
];

const NEEDS_PRODUCTS = [
  { id: "n-1", tag: "VALUE", name: "Chicken Curry Cut", qty: "500 g", price: 189, mrp: 220, eta: "12 mins", color: "#FBEFEE" },
  { id: "n-2", tag: "HOME", name: "Kitchen Towels", qty: "Pack of 6", price: 149, mrp: 178, eta: "8 mins", color: "#F4F5F7" },
  { id: "n-3", tag: "OFFER", name: "Cow Ghee", qty: "1 L", price: 579, mrp: 630, eta: "9 mins", color: "#FFF6E3" },
  { id: "n-4", tag: "NEW", name: "Seafood Family Pack", qty: "800 g", price: 449, mrp: 510, eta: "12 mins", color: "#EEF6F8" },
];

const FREZO_FESTIVE_SPECIALS = [
  LIFESTYLE_PRODUCTS.coffee,
  LIFESTYLE_PRODUCTS.iceCream,
  LIFESTYLE_PRODUCTS.butter,
  LIFESTYLE_PRODUCTS.rice,
  LIFESTYLE_PRODUCTS.atta,
  LIFESTYLE_PRODUCTS.apples,
];

const FREZO_PICKED_FOR_YOU = [
  LIFESTYLE_PRODUCTS.lays,
  LIFESTYLE_PRODUCTS.maggi,
  LIFESTYLE_PRODUCTS.apples,
  LIFESTYLE_PRODUCTS.bisleri,
  LIFESTYLE_PRODUCTS.iceCream,
  LIFESTYLE_PRODUCTS.coffee,
];

const FREZO_DEALS_OFFERS = [
  LIFESTYLE_PRODUCTS.butter,
  LIFESTYLE_PRODUCTS.lays,
  LIFESTYLE_PRODUCTS.maggi,
  LIFESTYLE_PRODUCTS.dettolSoap,
  LIFESTYLE_PRODUCTS.rice,
  LIFESTYLE_PRODUCTS.atta,
];

const SNACKS_BEVERAGES_PRODUCTS = [
  LIFESTYLE_PRODUCTS.lays,
  LIFESTYLE_PRODUCTS.iceCream,
  LIFESTYLE_PRODUCTS.maggi,
  LIFESTYLE_PRODUCTS.coffee,
  LIFESTYLE_PRODUCTS.bisleri,
  LIFESTYLE_PRODUCTS.bananas,
];

const BEAUTY_PERSONAL_PRODUCTS = [
  LIFESTYLE_PRODUCTS.dettolSoap,
  LIFESTYLE_PRODUCTS.butter,
  LIFESTYLE_PRODUCTS.iceCream,
  LIFESTYLE_PRODUCTS.bananas,
  LIFESTYLE_PRODUCTS.apples,
  LIFESTYLE_PRODUCTS.bisleri,
];

const HOUSEHOLD_ESSENTIAL_PRODUCTS = [
  LIFESTYLE_PRODUCTS.dettolSoap,
  LIFESTYLE_PRODUCTS.bisleri,
  LIFESTYLE_PRODUCTS.atta,
  LIFESTYLE_PRODUCTS.rice,
  LIFESTYLE_PRODUCTS.maggi,
  LIFESTYLE_PRODUCTS.lays,
];

const DAIRY_BREAKFAST_PRODUCTS = [
  LIFESTYLE_PRODUCTS.bisleri,
  LIFESTYLE_PRODUCTS.butter,
  LIFESTYLE_PRODUCTS.bananas,
  LIFESTYLE_PRODUCTS.apples,
  LIFESTYLE_PRODUCTS.coffee,
  LIFESTYLE_PRODUCTS.iceCream,
];

function isBlueCategorySection(title = "") {
  return ["Grocery & Kitchen", "Snacks & Drinks", "Beauty & Personal Care"].includes(title);
}

function CategoryArtwork({ item, style, backgroundColor = PRODUCT_IMAGE_BG }) {
  return (
    <View style={[styles.categoryArtwork, { backgroundColor }, style]}>
      {item.image ? <Image source={item.image} style={styles.categoryArtworkImage} resizeMode="contain" /> : null}
    </View>
  );
}

function CategoryGrid({ title, items, onPressItem }) {
  const cardBackground = title === "Shop by Categories"
    ? "#daeff7ff"
    : isBlueCategorySection(title)
      ? CATEGORY_BLUE_BG
      : PRODUCT_IMAGE_BG;

  return (
    <View style={styles.categorySection}>
      <Text style={styles.categorySectionTitle}>{title}</Text>
      <View style={styles.categoryGrid}>
        {items.map((item, index) => (
          <Pressable
            key={item.id}
            onPress={() => onPressItem?.(item, title)}
            style={({ pressed }) => [styles.categoryTile, pressed && styles.categoryTilePressed]}
          >
            <View style={[styles.categoryCard, { backgroundColor: cardBackground }]}>
              <View style={styles.categoryArtworkFrame}>
                <CategoryArtwork item={item} style={styles.categoryArtwork} backgroundColor={cardBackground} />
              </View>
            </View>
            <Text style={styles.categoryTileLabel} numberOfLines={2}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function StoreGrid({ title, items, onPressItem }) {
  return (
    <View style={styles.categorySection}>
      <Text style={styles.categorySectionTitle}>{title}</Text>
      <View style={styles.categoryGrid}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onPressItem?.(item, title)}
            style={({ pressed }) => [styles.featureTile, pressed && styles.categoryTilePressed]}
          >
            <View style={[styles.featureCard, { backgroundColor: item.bg || PRODUCT_IMAGE_BG }]}>
              <Text style={styles.featureCardLabel} numberOfLines={2}>{item.label}</Text>
              {item.image ? <Image source={item.image} style={styles.featureCardImage} resizeMode="contain" /> : null}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ProductRating({ value, reviews }) {
  const ratingValue = value || "4.5";
  const reviewValue = reviews || "499";

  return (
    <View style={styles.productRatingRow}>
      <MaterialCommunityIcons name="star" size={13} color={GREEN} />
      <Text style={styles.productRatingValue}>{ratingValue}</Text>
    </View>
  );
}

function ProductMetaRow({ rating, eta }) {
  const ratingText = rating || "4.5";
  const etaText = eta || "8 mins";

  return (
    <View style={styles.productMetaRow}>
      <View style={styles.productMetaRating}>
        <MaterialCommunityIcons name="star" size={10} color="#F4B400" />
        <Text style={styles.productMetaRatingText}>{ratingText}</Text>
      </View>
      <View style={styles.productMetaDivider} />
      <View style={styles.productMetaEta}>

        <Text style={styles.productMetaEtaText}>{etaText}</Text>
      </View>
    </View>
  );
}

function AnimatedOfferText({ offerText, textStyle }) {
  const progress = useRef(new Animated.Value(0)).current;
  const initialDelay = useRef(150 + Math.round(Math.random() * 650)).current;

  useEffect(() => {
    const easing = Easing.bezier(0.22, 1, 0.36, 1);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(2800),
        Animated.timing(progress, {
          toValue: 1,
          duration: 480,
          easing,
          useNativeDriver: true,
        }),
        Animated.delay(2800),
        Animated.timing(progress, {
          toValue: 0,
          duration: 480,
          easing,
          useNativeDriver: true,
        }),
      ])
    );
    const timer = setTimeout(() => animation.start(), initialDelay);

    return () => {
      clearTimeout(timer);
      animation.stop();
      progress.stopAnimation();
    };
  }, [initialDelay, progress]);

  const offerY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });
  const saleY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 0],
  });

  return (
    <View style={styles.animatedOfferSlot}>
      <Animated.Text
        numberOfLines={1}
        style={[styles.animatedOfferText, textStyle, { transform: [{ translateY: offerY }] }]}
      >
        {offerText}
      </Animated.Text>
      <Animated.Text
        numberOfLines={1}
        style={[styles.animatedOfferText, textStyle, { transform: [{ translateY: saleY }] }]}
      >
        SALE
      </Animated.Text>
    </View>
  );
}

function ProductSizeChips({ primary, secondary }) {
  return (
    <View style={styles.productSizeRow}>
      <View style={styles.productSizeChip}>
        <Text style={styles.productSizeText}>{primary}</Text>
      </View>
      {secondary ? (
        <View style={styles.productSizeChipMuted}>
          <Text style={styles.productSizeMutedText}>{secondary}</Text>
        </View>
      ) : null}
    </View>
  );
}

function buildVariantOptions(product = {}) {
  const basePrice = Number(product.price || 99);
  const baseMrp = Number(product.mrp || Math.round(basePrice * 1.18));
  const qty = product.qty || "100 g";

  return [
    {
      id: "pack-1",
      title: "Pack of 1",
      qty,
      price: basePrice,
      mrp: baseMrp,
      perPack: `₹${basePrice}/pack`,
    },
    {
      id: "pack-2",
      title: "Pack of 2",
      qty,
      price: Math.max(basePrice * 2 - Math.round(basePrice * 0.06), basePrice),
      mrp: baseMrp * 2,
      perPack: `₹${Math.round((basePrice * 2 - Math.round(basePrice * 0.06)) / 2)}/pack`,
    },
    {
      id: "pack-3",
      title: "Pack of 3",
      qty,
      price: Math.max(basePrice * 3 - Math.round(basePrice * 0.11), basePrice),
      mrp: baseMrp * 3,
      perPack: `₹${Math.round((basePrice * 3 - Math.round(basePrice * 0.11)) / 3)}/pack`,
    },
  ];
}

function hasProductVariants(product = {}) {
  if (Array.isArray(product.variants)) return product.variants.length > 1;
  if (product.hasVariants === false) return false;
  if (product.hasVariants === true) return true;

  const value = `${product.id || ""} ${product.brand || ""} ${product.name || ""} ${product.qty || ""}`.toLowerCase();
  const variantKeywords = [
    "pack",
    "combo",
    "biscuit",
    "cookies",
    "chips",
    "noodle",
    "soap",
    "shampoo",
    "conditioner",
    "body wash",
    "detergent",
    "toothpaste",
    "rice",
    "atta",
    "oil",
    "ghee",
    "tea",
    "coffee",
    "milk",
    "sugar",
    "dal",
    "ketchup",
  ];

  return variantKeywords.some((keyword) => value.includes(keyword));
}

function ProductVariantsSheet({ visible, product, onClose, onAddVariant }) {
  const [mounted, setMounted] = useState(visible);
  const [displayProduct, setDisplayProduct] = useState(product);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (product) {
      setDisplayProduct(product);
    }
  }, [product]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  }, [progress, visible]);

  if (!mounted || !displayProduct) return null;

  const variants = buildVariantOptions(displayProduct);
  const title = displayProduct.name || "Minimalist 10% Vitamin C Brightening & Illumination Face Serum";
  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const sheetTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [340, 0],
  });
  const closeScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1],
  });

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.variantOverlay}>
        <Animated.View style={[styles.variantBackdrop, { opacity: backdropOpacity }]}>
          <Pressable style={styles.variantBackdropPressable} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.variantCloseButtonWrap,
            {
              opacity: progress,
              transform: [{ scale: closeScale }, { translateY: sheetTranslateY }],
            },
          ]}
        >
          <Pressable style={styles.variantCloseButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={26} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
        <Animated.View style={[styles.variantSheet, { transform: [{ translateY: sheetTranslateY }] }]}>
          <Text style={styles.variantTitle} numberOfLines={3}>{title}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.variantCardsRow}
          >
            {variants.map((variant, index) => (
              <View
                key={variant.id}
                style={[
                  styles.variantCard,
                  index === variants.length - 1 && styles.variantCardHighlighted,
                ]}
              >
                <View style={styles.variantImageCard}>
                  {displayProduct.image ? (
                    <>
                      {index > 0 ? (
                        <Image source={displayProduct.image} style={[styles.variantPackImage, styles.variantPackImageBack]} resizeMode="contain" />
                      ) : null}
                      {index > 1 ? (
                        <Image source={displayProduct.image} style={[styles.variantPackImage, styles.variantPackImageMid]} resizeMode="contain" />
                      ) : null}
                      <Image source={displayProduct.image} style={styles.variantPackImage} resizeMode="contain" />
                    </>
                  ) : (
                    <Text style={styles.variantImageText} numberOfLines={2}>{displayProduct.brand || title.split(" ")[0]}</Text>
                  )}
                  <Pressable
                    style={styles.variantAddButton}
                    onPress={(event) => onAddVariant?.(displayProduct, variant, event.nativeEvent)}
                    hitSlop={8}
                  >
                    <AddSquareIcon size={46} />
                  </Pressable>
                </View>
                <Text style={styles.variantPackTitle}>{variant.title}</Text>
                <Text style={styles.variantQty}>{variant.qty}</Text>
                <View style={styles.variantPriceRow}>
                  <Text style={styles.variantPrice}>₹{variant.price}</Text>
                  <Text style={styles.variantMrp}>₹{variant.mrp}</Text>
                </View>
                <Text style={styles.variantPerPack}>{variant.perPack}</Text>
                {variant.saveText ? (
                  <View style={styles.variantSaveBand}>
                    <Text style={styles.variantSaveText}>{variant.saveText}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function resolveRailVariant(title = "") {
  const label = title.toLowerCase();
  if (label.includes("reorder")) return "reorder";
  if (label.includes("festive")) return "festive";
  if (label.includes("picked")) return "picked";
  if (label.includes("deal") || label.includes("smart") || label.includes("home essentials")) return "deals";
  if (label.includes("beauty") || label.includes("care")) return "beauty";
  if (label.includes("fresh") || label.includes("grocery")) return "fresh";
  return "regular";
}

function getProductCardVariantStyle(variant) {
  switch (variant) {
    case "festive":
      return styles.festiveProductCard;
    case "reorder":
      return styles.reorderProductCard;
    case "picked":
      return styles.pickedProductCard;
    case "deals":
      return styles.dealsProductCard;
    case "beauty":
      return styles.beautyProductCard;
    case "fresh":
      return styles.freshProductCard;
    default:
      return null;
  }
}

function getProductImageVariantStyle(variant) {
  switch (variant) {
    case "festive":
      return styles.festiveProductImage;
    case "reorder":
      return styles.reorderProductImage;
    case "picked":
      return styles.pickedProductImage;
    case "deals":
      return styles.dealsProductImage;
    case "beauty":
      return styles.beautyProductImage;
    case "fresh":
      return styles.freshProductImage;
    default:
      return null;
  }
}

function getProductImageCustomColor(product = {}) {
  return product.color && product.color !== PRODUCT_IMAGE_BG ? { backgroundColor: product.color } : null;
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

function getProductSectionStyle(title = "") {
  const label = title.toLowerCase();
  if (label.includes("reorder")) return styles.reorderAgainSection;
  if (label.includes("fresh today")) return styles.freshTodaySection;
  return null;
}

function GroceryProductVisual({ product, quantity, onDecrease, onIncrease, onAdd, wishlisted, onToggleWishlist, imageStyle, discount = 0 }) {
  const imageLift = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const previousQuantity = useRef(quantity);

  useEffect(() => {
    if (quantity > previousQuantity.current) {
      imageLift.stopAnimation();
      imageLift.setValue(0);
      Animated.sequence([
        Animated.timing(imageLift, {
          toValue: 1,
          duration: 140,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(imageLift, {
          toValue: 0,
          damping: 11,
          stiffness: 210,
          mass: 0.7,
          useNativeDriver: true,
        }),
      ]).start();
    }
    previousQuantity.current = quantity;
  }, [imageLift, quantity]);

  useEffect(() => {
    heartScale.stopAnimation();
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: wishlisted ? 1.22 : 0.9,
        damping: 8,
        stiffness: 280,
        mass: 0.55,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        damping: 10,
        stiffness: 240,
        mass: 0.65,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heartScale, wishlisted]);

  return (
    <View
      style={[
        styles.productImageMock,
        imageStyle,
        styles.flatProductImagePanel,
        { backgroundColor: product.color || PRODUCT_IMAGE_BG },
      ]}
    >
      {discount > 0 ? (
        <View style={styles.premiumDiscountBadge}>
          <Text style={styles.premiumDiscountBadgeText}>{discount}%{`\n`}OFF</Text>
        </View>
      ) : null}
      {product.image ? (
        <Animated.Image
          source={product.image}
          style={[
            styles.productImageAsset,
            {
              transform: [
                { translateY: imageLift.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
                { scale: imageLift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] }) },
              ],
            },
          ]}
          resizeMode="contain"
        />
      ) : null}
      <Pressable
        style={styles.productWishButton}
        onPress={(event) => {
          event.stopPropagation?.();
          onToggleWishlist?.();
        }}
        hitSlop={6}
      >
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <MaterialCommunityIcons
            name={wishlisted ? "heart" : "heart-outline"}
            size={17}
            color="#C81924"
          />
        </Animated.View>
      </Pressable>
      <ProductImageFooter
        qty={product.qty}
        quantity={quantity}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        onAdd={onAdd}
      />
    </View>
  );
}

function ProductImageFooter({ qty, quantity, onDecrease, onIncrease, onAdd }) {
  const morph = useRef(new Animated.Value(quantity > 0 ? 1 : 0)).current;
  const addPressScale = useRef(new Animated.Value(1)).current;

  const animateAddPress = (toValue) => {
    Animated.spring(addPressScale, {
      toValue,
      damping: 14,
      stiffness: 320,
      mass: 0.45,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    Animated.spring(morph, {
      toValue: quantity > 0 ? 1 : 0,
      damping: 14,
      stiffness: 220,
      mass: 0.72,
      useNativeDriver: true,
    }).start();
  }, [morph, quantity]);

  return (
    <View style={styles.productImageFooter}>
      <View style={styles.productVegMark}>
        <View style={styles.productVegDot} />
      </View>
      <View style={styles.productCardDots}>
        <View style={[styles.productCardDot, styles.productCardDotActive]} />
        <View style={styles.productCardDot} />
        <View style={styles.productCardDot} />
      </View>
      {quantity > 0 ? (
        <Animated.View
          style={[
            styles.productImageFooterStepper,
            {
              opacity: morph,
              transform: [
                { scaleX: morph.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) },
                { scale: morph.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
              ],
            },
          ]}
        >
          <Pressable
            style={styles.productImageFooterStepperButton}
            onPress={(event) => {
              event.stopPropagation?.();
              onDecrease?.();
            }}
            hitSlop={8}
          >
            <Text style={styles.productImageFooterStepperText}>−</Text>
          </Pressable>
          <Text style={styles.productImageFooterStepperValue}>{quantity}</Text>
          <Pressable
            style={styles.productImageFooterStepperButton}
            onPress={(event) => {
              event.stopPropagation?.();
              onIncrease?.(event.nativeEvent);
            }}
            hitSlop={8}
          >
            <Text style={styles.productImageFooterStepperText}>+</Text>
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View
          style={[
            styles.productAddSlot,
            {
              opacity: morph.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
              transform: [{ scale: morph.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] }) }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.productAddTouchSurface,
              { transform: [{ scale: addPressScale }] },
            ]}
          >
            <Pressable
              style={({ pressed }) => [styles.productImageFooterAdd, pressed && styles.productImageFooterAddPressed]}
              onPressIn={() => animateAddPress(0.91)}
              onPressOut={() => animateAddPress(1)}
              onPress={(event) => {
                event.stopPropagation?.();
                onAdd?.(event.nativeEvent);
              }}
              hitSlop={10}
              android_ripple={{ color: "rgba(11,122,51,0.10)", borderless: false }}
            >
              <MaterialCommunityIcons name="plus" size={20} color={GREEN} />
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

export function ProductCard({ product, quantity, onChangeQuantity, onPressProduct, onOpenVariants, variant = "regular", listing = false }) {
  const discount = Math.max(0, Math.round(((product.mrp - product.price) / product.mrp) * 100));
  const isSwiggyCard = product.visualType === "bazana";
  const unitRate = getProductUnitRate(product);
  const [wishlisted, setWishlisted] = useState(false);
  const cardVariantStyle = getProductCardVariantStyle(variant);
  const imageVariantStyle = getProductImageVariantStyle(variant);

  return (
    <Pressable
      onPress={() => onPressProduct?.(product)}
      style={({ pressed }) => [styles.productCard, cardVariantStyle, isSwiggyCard && styles.swiggyProductCard, listing && styles.listingProductCard, pressed && styles.categoryTilePressed]}
    >
      <GroceryProductVisual
        product={product}
        discount={discount}
        quantity={quantity}
        imageStyle={[imageVariantStyle, listing && styles.listingProductImage]}
        wishlisted={wishlisted}
        onToggleWishlist={() => setWishlisted((current) => !current)}
        onDecrease={() => onChangeQuantity(product.id, quantity - 1)}
        onIncrease={(origin) => onChangeQuantity(product.id, quantity + 1, product, origin)}
        onAdd={(origin) => onOpenVariants?.(product, origin)}
      />

      <View style={[styles.productContent, listing && styles.listingProductContent]}>
        <ProductMetaRow rating={product.rating} reviews={product.reviews} eta={product.eta} />
        <Text style={styles.productName} numberOfLines={3}>
          {isSwiggyCard ? [product.brand, product.name].filter(Boolean).join(" ") : product.name}
        </Text>
        <Text style={styles.premiumProductSize}>{product.qty}</Text>
        <View style={styles.premiumProductDivider} />
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>₹{product.price}</Text>
          {product.mrp > product.price ? <Text style={styles.productMrp}>₹{product.mrp}</Text> : null}
        </View>
        {discount > 0 ? (
          <AnimatedOfferText
            offerText={product.offerLabel === "Price Drop" ? "Price Drop" : `${discount}% OFF · Save ₹${Math.max(0, product.mrp - product.price)}`}
            textStyle={[styles.productOfferLine, product.offerLabel === "Price Drop" && styles.productOfferDrop]}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

function ProductRail({ title, subtitle, products, quantities, onChangeQuantity, onPressProduct, onOpenVariants, onSeeAll }) {
  const variant = resolveRailVariant(title);
  const sectionStyle = getProductSectionStyle(title);
  const visibleProducts = products.slice(0, 6);

  return (
    <View style={[styles.productSection, sectionStyle]}>
      {title ? (
        <View style={styles.sectionHeadingRow}>
          <View style={styles.sectionHeadingCopy}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>
      ) : null}
      <View style={styles.productGrid}>
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] || 0}
            onChangeQuantity={onChangeQuantity}
            onPressProduct={onPressProduct}
            onOpenVariants={onOpenVariants}
            variant={variant}
          />
        ))}
      </View>
      {products.length ? (
        <Pressable
          style={({ pressed }) => [styles.productSeeAllBar, pressed && styles.categoryTilePressed]}
          onPress={() => onSeeAll?.({ title, products, variant, cardType: "regular" })}
        >
          <Text style={styles.productSeeAllBarText}>See all</Text>
          <MaterialCommunityIcons name="chevron-right" size={19} color={GREEN} />
        </Pressable>
      ) : null}
    </View>
  );
}

function FrezoProductCard({ product, quantity, onChangeQuantity, onPressProduct, onOpenVariants, variant, listing = false }) {
  const saveAmount = Math.max(0, Number(product.mrp) - Number(product.price));
  const discount = product.mrp > product.price ? Math.round((saveAmount / Number(product.mrp)) * 100) : 0;
  const unitRate = getProductUnitRate(product);
  const dealVariant = variant === "deals";
  const [wishlisted, setWishlisted] = useState(false);
  const cardVariantStyle = getProductCardVariantStyle(variant);
  const imageVariantStyle = getProductImageVariantStyle(variant);

  return (
    <Pressable
      key={product.id}
      onPress={() => onPressProduct?.(product)}
      style={({ pressed }) => [styles.frezoProductCard, cardVariantStyle, dealVariant && styles.frezoDealProductCard, listing && styles.listingProductCard, pressed && styles.categoryTilePressed]}
    >
      <GroceryProductVisual
        product={product}
        discount={discount}
        quantity={quantity}
        imageStyle={[imageVariantStyle, listing && styles.listingProductImage]}
        wishlisted={wishlisted}
        onToggleWishlist={() => setWishlisted((current) => !current)}
        onDecrease={() => onChangeQuantity(product.id, quantity - 1)}
        onIncrease={(origin) => onChangeQuantity(product.id, quantity + 1, product, origin)}
        onAdd={(origin) => onOpenVariants?.(product, origin)}
      />

      <View style={[styles.productContent, listing && styles.listingProductContent]}>
        <ProductMetaRow rating={product.rating} reviews={product.reviews} eta={product.eta || "7 mins"} />
        <Text style={dealVariant ? styles.frezoDealName : styles.frezoName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.premiumProductSize}>{product.qty}</Text>
        <View style={styles.premiumProductDivider} />
        <View style={styles.frezoPriceRowInline}>
          <Text style={styles.frezoPrice}>₹{product.price}</Text>
          {product.mrp > product.price ? <Text style={styles.frezoMrp}>₹{product.mrp}</Text> : null}
        </View>
        {saveAmount > 0 ? (
          <AnimatedOfferText
            offerText={`${discount}% OFF · Save ₹${saveAmount}`}
            textStyle={styles.frezoOfferLine}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

function FrezoProductRail({ title, products, quantities, onChangeQuantity, onPressProduct, onOpenVariants, onSeeAll }) {
  const variant = resolveRailVariant(title);
  const visibleProducts = products.slice(0, 6);

  return (
    <View style={styles.frezoSection}>
      <View style={styles.frezoRowHeader}>
        <Text style={styles.frezoSectionTitle}>{title}</Text>
      </View>
      <View style={[styles.productGrid, styles.frezoProductGrid]}>
        {visibleProducts.map((product) => (
          <FrezoProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] || 0}
            onChangeQuantity={onChangeQuantity}
            onPressProduct={onPressProduct}
            onOpenVariants={onOpenVariants}
            variant={variant}
          />
        ))}
      </View>
      {products.length ? (
        <Pressable
          style={({ pressed }) => [styles.productSeeAllBar, pressed && styles.categoryTilePressed]}
          onPress={() => onSeeAll?.({ title, products, variant, cardType: "frezo" })}
        >
          <Text style={styles.productSeeAllBarText}>See all</Text>
          <MaterialCommunityIcons name="chevron-right" size={19} color={GREEN} />
        </Pressable>
      ) : null}
    </View>
  );
}

const SECTION_FILTERS = ["In stock", "Offers", "Under ₹100", "Fast delivery"];
const SECTION_SORTS = ["Recommended", "Price: Low to High", "Biggest discount"];

function ProductSectionListingScreen({
  section,
  quantities,
  onChangeQuantity,
  onPressProduct,
  onOpenVariants,
  onClose,
  deliveryAddress,
  deliveryEta,
}) {
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortIndex, setSortIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const products = section?.products || [];

  const toggleFilter = (filter) => {
    setActiveFilters((current) => (
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]
    ));
  };

  const visibleProducts = products
    .filter((product) => {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const searchableText = [product.name, product.brand, product.category, product.qty]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (normalizedQuery && !searchableText.includes(normalizedQuery)) return false;
      if (activeFilters.includes("In stock") && product.stock === "Out of stock") return false;
      if (activeFilters.includes("Under ₹100") && Number(product.price) >= 100) return false;
      if (activeFilters.includes("Offers") && Number(product.mrp) <= Number(product.price)) return false;
      if (activeFilters.includes("Fast delivery")) {
        const etaMinutes = Number.parseInt(String(product.eta || deliveryEta || "99"), 10);
        if (Number.isFinite(etaMinutes) && etaMinutes > 10) return false;
      }
      return true;
    })
    .slice()
    .sort((a, b) => {
      if (sortIndex === 1) return Number(a.price) - Number(b.price);
      if (sortIndex === 2) {
        const aDiscount = Number(a.mrp) > 0 ? (Number(a.mrp) - Number(a.price)) / Number(a.mrp) : 0;
        const bDiscount = Number(b.mrp) > 0 ? (Number(b.mrp) - Number(b.price)) / Number(b.mrp) : 0;
        return bDiscount - aDiscount;
      }
      return 0;
    });

  const CardComponent = section?.cardType === "frezo" ? FrezoProductCard : ProductCard;

  return (
    <SafeAreaView style={styles.listingScreen} edges={["top", "left", "right"]}>
      <View style={styles.listingTopBar}>
        <Pressable style={styles.listingBackButton} onPress={onClose} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </Pressable>
        <View style={styles.listingDeliveryCopy}>
          <View style={styles.listingDeliveryTimeRow}>
            <MaterialCommunityIcons name="clock-fast" size={15} color={GREEN} />
            <Text style={styles.listingDeliveryTime}>Delivery in {deliveryEta || "6 mins"}</Text>
          </View>
          <Text style={styles.listingDeliveryAddress} numberOfLines={1}>
            {deliveryAddress || "Current location"}
          </Text>
        </View>
        <Pressable
          style={[styles.listingSearchButton, searchVisible && styles.listingSearchButtonActive]}
          hitSlop={8}
          onPress={() => {
            setSearchVisible((current) => !current);
            if (searchVisible) setSearchQuery("");
          }}
        >
          <MaterialCommunityIcons name={searchVisible ? "close" : "magnify"} size={22} color={searchVisible ? GREEN : "#111827"} />
        </Pressable>
      </View>

      {searchVisible ? (
        <View style={styles.listingSearchWrap}>
          <View style={styles.listingSearchField}>
            <MaterialCommunityIcons name="magnify" size={20} color="#667085" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search in ${section?.title || "products"}`}
              placeholderTextColor="#98A2B3"
              autoFocus
              returnKeyType="search"
              style={styles.listingSearchInput}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#98A2B3" />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.listingTitleBlock}>
        <View style={styles.listingTitleRow}>
          <View style={styles.listingTitleCopy}>
            <Text style={styles.listingEyebrow}>FRESH PICKS</Text>
            <Text style={styles.listingTitle}>{section?.title || "Products"}</Text>
            <Text style={styles.listingResultCount}>{visibleProducts.length} of {products.length} products</Text>
          </View>
          <View style={styles.listingPromisePill}>
            <MaterialCommunityIcons name="shield-check" size={16} color={GREEN} />
            <Text style={styles.listingPromiseText}>Quality checked</Text>
          </View>
        </View>
      </View>

      <View style={styles.listingControls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listingControlsContent}>
          <Pressable
            style={[styles.listingControlChip, sortIndex > 0 && styles.listingControlChipActive]}
            onPress={() => setSortIndex((current) => (current + 1) % SECTION_SORTS.length)}
          >
            <MaterialCommunityIcons name="sort" size={16} color={sortIndex > 0 ? GREEN : "#394150"} />
            <Text style={[styles.listingControlText, sortIndex > 0 && styles.listingControlTextActive]}>{SECTION_SORTS[sortIndex]}</Text>
            <MaterialCommunityIcons name="chevron-down" size={15} color={sortIndex > 0 ? GREEN : "#667085"} />
          </Pressable>
          {activeFilters.length ? (
            <Pressable style={styles.listingFilterCountChip} onPress={() => setActiveFilters([])}>
              <Text style={styles.listingFilterCountText}>{activeFilters.length} applied</Text>
              <MaterialCommunityIcons name="close" size={14} color="#FFFFFF" />
            </Pressable>
          ) : null}
          <View style={styles.listingControlDivider} />
          {SECTION_FILTERS.map((filter) => {
            const active = activeFilters.includes(filter);
            return (
              <Pressable
                key={filter}
                style={[styles.listingControlChip, active && styles.listingControlChipActive]}
                onPress={() => toggleFilter(filter)}
              >
                <Text style={[styles.listingControlText, active && styles.listingControlTextActive]}>{filter}</Text>
                {active ? <MaterialCommunityIcons name="check" size={15} color={GREEN} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.listingScroll} contentContainerStyle={styles.listingScrollContent} showsVerticalScrollIndicator={false}>
        {visibleProducts.length ? (
          <View style={styles.listingProductGrid}>
            {visibleProducts.map((product) => (
              <CardComponent
                key={product.id}
                product={product}
                quantity={quantities[product.id] || 0}
                onChangeQuantity={onChangeQuantity}
                onPressProduct={onPressProduct}
                onOpenVariants={onOpenVariants}
                variant={section?.variant}
                listing
              />
            ))}
          </View>
        ) : (
          <View style={styles.listingEmptyState}>
            <View style={styles.listingEmptyIcon}>
              <MaterialCommunityIcons name={searchQuery ? "magnify-close" : "filter-variant-remove"} size={34} color={GREEN} />
            </View>
            <Text style={styles.listingEmptyTitle}>{searchQuery ? `No results for “${searchQuery}”` : "No products match these filters"}</Text>
            <Text style={styles.listingEmptySubtitle}>Try another search or clear the selected filters.</Text>
            <Pressable
              style={styles.listingClearButton}
              onPress={() => {
                setActiveFilters([]);
                setSearchQuery("");
              }}
            >
              <Text style={styles.listingClearFilters}>Show all products</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductTabs() {
  return (
    <View style={styles.productTabs}>
      <Pressable style={styles.productTabActive}>
        <Text style={styles.productTabActiveText}>Order again</Text>
      </Pressable>
      <Pressable style={styles.productTab}>
        <Text style={styles.productTabText}>Best prices</Text>
      </Pressable>
      <Pressable style={styles.productTab}>
        <Text style={styles.productTabText}>Offers for you</Text>
      </Pressable>
    </View>
  );
}

function ViewMoreProductsButton() {
  return (
    <Pressable style={({ pressed }) => [styles.viewMoreProducts, pressed && styles.categoryTilePressed]}>
      <Text style={styles.viewMoreProductsText}>View more products</Text>
      <MaterialCommunityIcons name="chevron-right" size={24} color={GREEN} />
    </Pressable>
  );
}



function SwiggyPagerDots() {
  return (
    <View style={styles.swiggyPager}>
      <View style={styles.swiggyPagerPill}>
      </View>
      {[0, 1, 2, 3].map((item) => (
        <View key={item} style={styles.swiggyPagerDot} />
      ))}
    </View>
  );
}

function BannerCarousel() {
  const scrollRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const indexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const moveTo = (nextIndex, animated = true) => {
    const safeIndex = ((nextIndex % BANNERS.length) + BANNERS.length) % BANNERS.length;
    indexRef.current = safeIndex;
    setActiveIndex(safeIndex);
    scrollRef.current?.scrollTo({ x: safeIndex * BANNER_STEP, animated });
  };

  useEffect(() => {
    const timer = setInterval(() => moveTo(indexRef.current + 1), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.bannerSection}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        nestedScrollEnabled
        pagingEnabled={false}
        snapToInterval={BANNER_STEP}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannerRail}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(event) => moveTo(Math.round(event.nativeEvent.contentOffset.x / BANNER_STEP), false)}
        scrollEventThrottle={16}
      >
        {BANNERS.map((banner) => (
          <Pressable key={banner.id} style={[styles.bannerCard, { backgroundColor: banner.background }]}>
            <View style={[styles.bannerOrb, styles.bannerOrbTop, { backgroundColor: `${banner.color}12` }]} />
            <View style={[styles.bannerOrb, styles.bannerOrbBottom, { backgroundColor: `${banner.color}10` }]} />
            <View style={styles.bannerCopy}>
              <View style={[styles.bannerBadge, { backgroundColor: `${banner.color}12` }]}>
                <Text style={[styles.bannerEyebrow, { color: banner.color }]}>{banner.eyebrow}</Text>
              </View>
              <Text style={[styles.bannerTitle, { color: banner.color }]}>{banner.title}</Text>
              <Text style={[styles.bannerSubtitle, { color: banner.color }]}>{banner.subtitle}</Text>
              <View style={[styles.bannerCta, { borderColor: `${banner.color}35` }]}>
                <Text style={[styles.bannerCtaText, { color: banner.color }]}>{banner.cta}</Text>
              </View>
            </View>
            <View style={[styles.bannerVisual, { backgroundColor: `${banner.color}12` }]}>
              <View style={[styles.bannerVisualBlock, { backgroundColor: `${banner.color}18` }]} />
              <View style={[styles.bannerVisualCircle, { backgroundColor: `${banner.color}24` }]} />
              <View style={[styles.bannerVisualAccent, { backgroundColor: banner.color }]} />
              <View style={[styles.codePill, { backgroundColor: banner.color }]}>
                <Text style={styles.codePillText}>{banner.code}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </Animated.ScrollView>

      <View style={styles.dotsRow}>
        {BANNERS.map((banner, index) => {
          const inputRange = [(index - 1) * BANNER_STEP, index * BANNER_STEP, (index + 1) * BANNER_STEP];
          const width = scrollX.interpolate({ inputRange, outputRange: [8, 22, 8], extrapolate: "clamp" });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.35, 1, 0.35], extrapolate: "clamp" });
          return <Animated.View key={banner.id} style={[styles.dot, { width, opacity }, index === activeIndex && styles.dotActive]} />;
        })}
      </View>
    </View>
  );
}

function SkeletonBlock({ style, translateX }) {
  return (
    <View style={[styles.skeletonBlock, style]}>
      <Animated.View style={[styles.skeletonShimmerTrack, { transform: [{ translateX }] }]}>
        <ExpoLinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.92)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

function GroceryHomeSkeleton() {
  const shimmer = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1350,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const translateX = shimmer.interpolate({ inputRange: [-1, 1], outputRange: [-180, WINDOW_WIDTH + 40] });

  return (
    <View style={styles.skeletonScreen}>
      <View style={styles.skeletonCategoryRow}>
        {[0, 1, 2, 3].map((item) => <SkeletonBlock key={item} translateX={translateX} style={styles.skeletonCategory} />)}
      </View>
      <SkeletonBlock translateX={translateX} style={styles.skeletonHeading} />
      <View style={styles.skeletonProductGrid}>
        {[0, 1, 2, 3].map((item) => (
          <View key={item} style={styles.skeletonProductCard}>
            <SkeletonBlock translateX={translateX} style={styles.skeletonProductImage} />
            <SkeletonBlock translateX={translateX} style={styles.skeletonLineShort} />
            <SkeletonBlock translateX={translateX} style={styles.skeletonLineLong} />
            <SkeletonBlock translateX={translateX} style={styles.skeletonLineLong} />
            <SkeletonBlock translateX={translateX} style={styles.skeletonLineMedium} />
          </View>
        ))}
      </View>
    </View>
  );
}

export default function GroceryHomeContent({
  selectedCategory = "all",
  onOpenCategory,
  onOpenProduct,
  onCartChange,
  catalogProducts = [],
  catalogCategories = [],
  initialCartItems = [],
  onPersistCartItem,
  cartResetKey = 0,
  deliveryAddress = "Current location",
  deliveryEta = "6 mins",
}) {
  const [isLoading, setIsLoading] = useState(true);
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const [quantities, setQuantities] = useState({});
  const cartProductsRef = useRef({});
  const [variantProduct, setVariantProduct] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 1150);
    return () => clearTimeout(timer);
  }, [contentOpacity]);

  const updateCartTotal = (quantityMap, product, shouldAnimate = false) => {
    const nextTotal = Object.values(quantityMap).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
    const previewProduct = nextTotal > 0 ? product || Object.values(cartProductsRef.current)[0] || null : null;
    const items = Object.entries(quantityMap)
      .filter(([, itemQuantity]) => Number(itemQuantity) > 0)
      .map(([productId, itemQuantity]) => ({
        product: cartProductsRef.current[productId],
        quantity: Number(itemQuantity),
      }))
      .filter((item) => item.product);
    onCartChange?.({ total: nextTotal, product: previewProduct, items, animate: shouldAnimate });
    return nextTotal;
  };

  const syncCartProducts = (quantityMap, product) => {
    const nextProducts = { ...cartProductsRef.current };

    if (product) {
      nextProducts[product.id] = product;
    }

    Object.keys(nextProducts).forEach((productId) => {
      if (!quantityMap[productId]) {
        delete nextProducts[productId];
      }
    });

    cartProductsRef.current = nextProducts;
  };

  const changeQuantity = (id, nextQuantity, product) => {
    setQuantities((current) => {
      const safeQuantity = Math.max(0, nextQuantity);
      const previousQuantity = current[id] || 0;
      const nextMap = { ...current, [id]: safeQuantity };
      const resolvedProduct = product || cartProductsRef.current[id];
      syncCartProducts(nextMap, resolvedProduct);
      updateCartTotal(nextMap, resolvedProduct, safeQuantity > previousQuantity);
      onPersistCartItem?.(resolvedProduct, safeQuantity);
      return nextMap;
    });
  };

  const openVariants = (product) => {
    if (!hasProductVariants(product)) {
      setQuantities((current) => {
        const nextQuantity = (current[product.id] || 0) + 1;
        const nextMap = { ...current, [product.id]: nextQuantity };
        syncCartProducts(nextMap, product);
        updateCartTotal(nextMap, product, true);
        onPersistCartItem?.(product, nextQuantity);
        return nextMap;
      });
      return;
    }

    setVariantProduct(product);
  };

  const closeVariants = () => {
    setVariantProduct(null);
  };

  const addVariant = (product) => {
    setQuantities((current) => {
      const nextQuantity = Math.max(1, (current[product.id] || 0) + 1);
      const nextMap = { ...current, [product.id]: nextQuantity };
      syncCartProducts(nextMap, product);
      updateCartTotal(nextMap, product, true);
      onPersistCartItem?.(product, nextQuantity);
      return nextMap;
    });
    closeVariants();
  };

  useEffect(() => {
    if (!initialCartItems.length) return;
    const quantityMap = {};
    const productMap = {};
    initialCartItems.forEach((item) => {
      if (!item.product?.id || Number(item.quantity) <= 0) return;
      quantityMap[item.product.id] = Number(item.quantity);
      productMap[item.product.id] = item.product;
    });
    cartProductsRef.current = productMap;
    setQuantities(quantityMap);
    updateCartTotal(quantityMap, Object.values(productMap)[0], false);
  }, [initialCartItems]);

  useEffect(() => {
    if (!cartResetKey) return;
    cartProductsRef.current = {};
    setQuantities({});
  }, [cartResetKey]);

  const renderProductRail = (title, products, RailComponent = ProductRail) => (
    <RailComponent
      title={title}
      products={products.length ? products : catalogProducts}
      quantities={quantities}
      onChangeQuantity={changeQuantity}
      onPressProduct={onOpenProduct}
      onOpenVariants={openVariants}
      onSeeAll={setSelectedSection}
    />
  );

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case "electronics":
        return (
          <>
            <CategoryGrid title="Electronics & Appliances" items={[HOUSEHOLD[2], GROCERY_KITCHEN[7]].filter(Boolean)} onPressItem={onOpenCategory} />
          </>
        );
      case "beauty":
        return (
          <>
            <CategoryGrid title="Beauty & Personal Care" items={BEAUTY_CARE} onPressItem={onOpenCategory} />
          </>
        );
      case "pharmacy":
        return (
          <>
            <StoreGrid title="Health & wellness" items={[LIFESTYLE_STORES[5], { id: "care", label: "Daily Care", bg: "#E8F7F0" }]} onPressItem={onOpenCategory} />
          </>
        );
      case "decor":
        return (
          <>
            <StoreGrid title="Home style" items={[LIFESTYLE_STORES[2], LIFESTYLE_STORES[6], SPOTLIGHT_STORES[2]].filter(Boolean)} onPressItem={onOpenCategory} />
            <CategoryGrid title="Household Essentials" items={HOUSEHOLD} onPressItem={onOpenCategory} />
          </>
        );
      case "home":
        return (
          <>
            <CategoryGrid title="Household Essentials" items={HOUSEHOLD} onPressItem={onOpenCategory} />
          </>
        );
      case "grocery":
        return (
          <>
            <CategoryGrid title="Grocery & Kitchen" items={GROCERY_KITCHEN} onPressItem={onOpenCategory} />
            <CategoryGrid title="Snacks & Drinks" items={SNACKS_DRINKS} onPressItem={onOpenCategory} />
          </>
        );
      case "all":
      default:
        return (
          <>
            <CategoryGrid
              title="Shop by Categories"
              items={catalogCategories.length ? catalogCategories : [
                { id: "shop-snacks-beverages", label: "Snacks & Beverages", bg: "#FFF0D8", image: SNACKS_DRINKS[0]?.image },
                { id: "shop-beauty-personal", label: "Beauty & Personal Care", bg: "#FBE5EC", image: BEAUTY_CARE[3]?.image },
                { id: "shop-household-essentials", label: "Household Essentials", bg: "#E9F4F5", image: HOUSEHOLD[1]?.image },
                { id: "shop-dairy-breakfast", label: "Dairy & Breakfast", bg: "#EAF4FF", image: GROCERY_KITCHEN[3]?.image },
                ...GROCERY_KITCHEN,
                ...SNACKS_DRINKS,
                ...BEAUTY_CARE,
                ...HOUSEHOLD,
              ].filter(Boolean)}
              onPressItem={onOpenCategory}
            />
            <BannerCarousel />
            {renderProductRail("Buy Again", POPULAR_PRODUCTS)}
            {renderProductRail("Flash Deals", FREZO_DEALS_OFFERS, FrezoProductRail)}
            {renderProductRail("Fresh Picks", FRESH_PRODUCTS)}
            {renderProductRail("Trending Now", FREZO_PICKED_FOR_YOU, FrezoProductRail)}
            {renderProductRail("Recommended For You", SNACKS_BEVERAGES_PRODUCTS)}
            {renderProductRail("Healthy Choices", DAIRY_BREAKFAST_PRODUCTS)}
            {renderProductRail("Premium Collection", FREZO_FESTIVE_SPECIALS, FrezoProductRail)}
            {renderProductRail("New Arrivals", BEAUTY_PERSONAL_PRODUCTS)}
            {renderProductRail("Combo Savings", HOUSEHOLD_ESSENTIAL_PRODUCTS)}
            {renderProductRail("Restock Your Kitchen", POPULAR_PRODUCTS)}
            <StoreGrid title="Brand Spotlight" items={SPOTLIGHT_STORES} onPressItem={onOpenCategory} />
          </>
        );
    }
  };

  if (isLoading) return <GroceryHomeSkeleton />;

  return (
    <Animated.View style={[styles.container, { opacity: contentOpacity }]}>
      {renderCategoryContent()}
      <ProductVariantsSheet
        visible={!!variantProduct}
        product={variantProduct}
        onClose={closeVariants}
        onAddVariant={addVariant}
      />
      <Modal
        visible={Boolean(selectedSection)}
        onRequestClose={() => setSelectedSection(null)}
        animationType="slide"
        statusBarTranslucent
      >
        <ProductSectionListingScreen
          section={selectedSection}
          quantities={quantities}
          onChangeQuantity={changeQuantity}
          onPressProduct={(product) => {
            setSelectedSection(null);
            onOpenProduct?.(product);
          }}
          onOpenVariants={openVariants}
          onClose={() => setSelectedSection(null)}
          deliveryAddress={deliveryAddress}
          deliveryEta={deliveryEta}
        />
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeletonScreen: {
    minHeight: WINDOW_HEIGHT,
    paddingTop: 18,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  skeletonBlock: {
    overflow: "hidden",
    backgroundColor: "#F4F5F7",
  },
  skeletonShimmerTrack: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 180,
  },
  skeletonCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skeletonCategory: {
    width: CATEGORY_TILE_WIDTH,
    height: 72,
    borderRadius: 14,
  },
  skeletonHeading: {
    width: 142,
    height: 19,
    marginTop: 28,
    marginBottom: 16,
    borderRadius: 8,
  },
  skeletonProductGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 28,
  },
  skeletonProductCard: {
    width: "48%",
  },
  skeletonProductImage: {
    width: "100%",
    height: 184,
    borderRadius: 14,
  },
  skeletonLineShort: {
    width: "38%",
    height: 10,
    marginTop: 12,
    borderRadius: 5,
  },
  skeletonLineLong: {
    width: "100%",
    height: 11,
    marginTop: 8,
    borderRadius: 5,
  },
  skeletonLineMedium: {
    width: "62%",
    height: 11,
    marginTop: 8,
    borderRadius: 5,
  },
  variantOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  variantBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  variantBackdropPressable: {
    flex: 1,
  },
  variantCloseButtonWrap: {
    position: "absolute",
    alignSelf: "center",
    bottom: 322,
    zIndex: 4,
  },
  variantCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: "#747474ff",
    alignItems: "center",
    justifyContent: "center",
  },
  variantSheet: {
    minHeight: 284,
    paddingTop: 16,
    paddingHorizontal: 4,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  variantTitle: {
    paddingHorizontal: 12,
    color: "#2B3037",
    fontSize: 18,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  variantCardsRow: {
    paddingHorizontal: 18,
    paddingTop: 10,
    gap: 8,
  },
  variantCard: {
    width: Math.floor((WINDOW_WIDTH - 20) / 3),
    minHeight: 236,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: "#E0E4EA",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",marginBottom:1,
  },
  variantCardHighlighted: {
    borderColor: "#D7E8FF",
    backgroundColor: "#FFFFFF",
  },
  variantImageCard: {
    height: 112,
    margin: -2,
    borderRadius: 8,
    backgroundColor: "#F8F9FB",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  variantPackImage: {
    width: "75%",
    height: "75%",
  },
  variantPackImageBack: {
    position: "absolute",
    left: 26,
    opacity: 0.7,
    transform: [{ scale: 0.78 }],
  },
  variantPackImageMid: {
    position: "absolute",
    right: 32,
    opacity: 0.72,
    transform: [{ scale: 0.72 }],
  },
  variantImageText: {
    color: "#3A414A",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  variantAddButton: {
    position: "absolute",
    right: -6,
    bottom: -4,
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  variantPackTitle: {
    marginTop: 8,
    paddingHorizontal: 8,
    color: "#30343A",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  variantQty: {
    marginTop: 2,
    paddingHorizontal: 8,
    color: "#68707B",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  
    fontFamily: "Manrope_700Bold",
  },
  variantPriceRow: {
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#fff1aaff",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  variantPrice: {
    color: "#30343A",
    fontSize: 19,
    lineHeight: 23,
    fontWeight: "800",
    letterSpacing: -0.5,
  
    fontFamily: "Manrope_800ExtraBold",
  },
  variantMrp: {
    color: "#8A909A",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "500",
    textDecorationLine: "line-through",
  
    fontFamily: "Manrope_500Medium",
  },
  variantPerPack: {
    marginTop: 4,
    paddingHorizontal: 8,
    color: "#606A78",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
  },


  addButton: {
    minWidth: 56,
    height: 36,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: "#008e32ff",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  addButtonText: {
    color: GREEN,
    fontSize: 12,
    lineHeight: 12,
    fontWeight: "900"
  },
  bannerBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginBottom: 7
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    marginRight: BANNER_GAP,
    borderRadius: 8,
    overflow: "hidden",
    padding: 15,
    flexDirection: "row",
    alignItems: "center"
  },
  bannerCopy: {
    flex: 1,
    zIndex: 2,
    paddingRight: 8
  },
  bannerCta: {
    marginTop: 10,
    alignSelf: "flex-start",
    minHeight: 27,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.64)"
  },
  bannerCtaText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800"
  },
  bannerEyebrow: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "800",
    letterSpacing: 0.45
  },
  bannerOrb: {
    position: "absolute",
    borderRadius: 999
  },
  bannerOrbBottom: {
    width: 120,
    height: 120,
    bottom: -72,
    right: 98
  },
  bannerOrbTop: {
    width: 150,
    height: 150,
    top: -78,
    right: 12
  },
  bannerRail: {
    paddingHorizontal: BANNER_SIDE_PADDING,
    paddingRight: BANNER_SIDE_PADDING - BANNER_GAP
  },
  bannerSection: {
    marginTop: 0,
    marginBottom: 18
  },
  bannerSubtitle: {
    ...GROCERY_TYPOGRAPHY.caption,
    marginTop: 1,
    opacity: 0.72
  },
  bannerTitle: {
    ...GROCERY_TYPOGRAPHY.heroTitle,
  },
  bannerVisual: {
    width: 94,
    height: 100,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2
  },
  bannerVisualAccent: {
    position: "absolute",
    right: 17,
    bottom: 20,
    width: 34,
    height: 8,
    borderRadius: 999,
    opacity: 0.5
  },
  bannerVisualBlock: {
    width: 63,
    height: 68,
    borderRadius: 16,
    transform: [{ rotate: "-7deg" }]
  },
  bannerVisualCircle: {
    position: "absolute",
    right: 14,
    top: 20,
    width: 38,
    height: 38,
    borderRadius: 19
  },
  categoryGrid: {
    paddingHorizontal: CATEGORY_SIDE_PADDING,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: CATEGORY_GAP,
    rowGap: 15
  },
  categorySection: {
    marginTop: 0,
    marginBottom: 18
  },
  categorySectionTitle: {
    marginBottom: 10,
    paddingHorizontal: CATEGORY_SIDE_PADDING,
    color: "#171A1C",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    letterSpacing: -0.45
  },
  categoryArtwork: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  categoryArtworkImage: {
    width: "90%",
    height: "90%",bottom:-9
  },
  categoryArtworkFrame: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  categoryCard: {
    width: "100%",
    borderRadius: 6,
    overflow: "hidden",borderRadius:12,
  },
  categoryTile: {
    width: CATEGORY_TILE_WIDTH
  },
  categoryTileLabel: {
    marginTop: 10,
    minHeight: 30,
    color: "#34393B",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "800",
    textAlign: "center"
  },
  featureCard: {
    width: CATEGORY_TILE_WIDTH,
    height: FEATURE_CARD_HEIGHT,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 9,
    overflow: "hidden",
    justifyContent: "flex-start",borderWidth: 0.2,
    borderColor: "#E0E4EA",
  },
  featureCardLabel: {
    maxWidth: "75%",
    color: "#23272B",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    letterSpacing: -0.2,
    zIndex: 2
  },
  featureCardImage: {
    position: "absolute",
    right: 2,
    bottom: -29,
    width: "120%",
    height: "120%"
  },
  featureTile: {
    width: CATEGORY_TILE_WIDTH
  },
  frezoAddButton: {
    width: 54,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.6,
    borderColor: "#08673D",
    alignItems: "center",
    justifyContent: "center"
  },
  frezoAddButtonText: {
    color: "#0B7A33",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  frezoAddStepper: {
    width: 74,
    height: 36,
    borderRadius: 2,
    backgroundColor: GREEN,
    borderWidth: 1.2,
    borderColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  frezoAddStepperButton: {
    width: 24,
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  frezoAddStepperText: {
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 20,
    fontWeight: "900"
  },
  frezoAddStepperValue: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 17,
    fontWeight: "900"
  },
  frezoBottomRow: {
    marginTop: 6,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6
  },
  frezoBrandText: {
    marginTop: 4,
    color: "#70777F",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.1
  },
  frezoDealDiscountBadge: {
    left: "auto",
    right: 4,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  
    fontFamily: "PlusJakartaSans_700Bold",
  
    fontWeight: "700",
  },
  frezoDealMrp: {
    color: "#8E959D",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    textDecorationLine: "line-through",
  
    fontFamily: "PlusJakartaSans_500Medium",
  },
  frezoDealName: {
    marginTop: 2,
    color: "#1A1F25",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
  
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  frezoDealPrice: {
    color: "#10161D",
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "800",
  
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  frezoDealPriceRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5
  },
  frezoDealProductCard: {
    width: PRODUCT_WIDTH
  },
  frezoDealQty: {
    marginTop: 3,
    color: "#10834B",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  frezoDiscountBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    minWidth: 48,
    height: 20,
    paddingHorizontal: 6,
    borderTopLeftRadius: 7,
    borderBottomRightRadius: 8,
    backgroundColor: "#3E82D9",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  
    fontFamily: "PlusJakartaSans_700Bold",
  
    fontWeight: "700",
  },
  frezoDiscountText: {
    color: "#FFFFFF",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "700",
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  frezoEtaPill: {
    alignSelf: "flex-start",
    marginTop: 7,
    minHeight: 23,
    borderRadius: 999,
    paddingHorizontal: 9,
    backgroundColor: "#EEF9F0",
    borderWidth: 1,
    borderColor: "#D6EEDD",
    flexDirection: "row",
    alignItems: "center",
    gap: 3
  },
  frezoEtaPillText: {
    color: "#2B3B34",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_500Medium",
  },
  frezoFloatingPlus: {
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
    zIndex: 8
  },
  frezoFloatingPlusText: {
    color: "#111820",
    fontSize: 24,
    lineHeight: 27,
    fontWeight: "400"
  },
  frezoFloatingStepper: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 88,
    height: 35,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#09911bff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    zIndex: 8
  },
  frezoMiniStepperButton: {
    width: 28,
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  frezoMiniStepperText: {
    color: "#09911bff",
    fontSize: 24,
    lineHeight: 24,
    fontWeight: "900"
  },
  frezoMiniStepperValue: {
    color: "#09911bff",
    fontSize: 24,
    lineHeight: 24,
    fontWeight: "900"
  },
  frezoHeartButton: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6
  },
  frezoImageQty: {
    position: "absolute",
    right: 3,
    top: "59%",
    color: "#737980",
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "700",
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  frezoMrp: {
    color: "#8B9098",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_500Medium",
    fontWeight: "500",
    textDecorationLine: "line-through",backgroundColor:"#fff1aaff"
  },
  frezoName: {
    ...GROCERY_TYPOGRAPHY.productName,
    marginTop: 4,
    minHeight: 0,
    color: "#05070A",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "600",
    letterSpacing: -0.35,
  
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  frezoPrice: {
    color: "#05070A",
    fontSize: 17,
    lineHeight: 21,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "800",
    letterSpacing: -0.75
  },
  frezoPriceRowInline: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    borderRadius: 0,
    backgroundColor: "#fff1aaff",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5
  },
  frezoOfferLine: {
    marginTop: 2,
    color: GREEN,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  frezoPriceStack: {
    flex: 1,
    minWidth: 0
  },
  frezoProductCard: {
    width: PRODUCT_WIDTH,
    minHeight: 244,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 0,
    borderColor: "transparent",
    padding: 6,
    paddingBottom: 8,
    overflow: "visible",padding:4,
  },

  frezoProductImage: {
    height: PRODUCT_IMAGE_HEIGHT,
    borderRadius: 10,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#E1E3E8",
    backgroundColor: "#f6f6f6",
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  frezoProductImageAsset: {
    width: "60%",
    height: "60%",
    marginBottom: 16,
    zIndex: 1,
    left: 0
  },
  frezoQty: {
    marginTop: 12,
    color: "#30343A",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  frezoRail: {
    paddingRight: 18,
    paddingBottom: 8,
    gap: 0
  },
  frezoRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 10
  },
  frezoSave: {
    marginTop: 2,
    color: "#11934D",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900"
  },
  frezoSectionTitle: {
    color: "#111820",
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900",
    letterSpacing: -0.7
  },
  frezoSeeAll: {
    color: "#0B7A33",
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "700",padding:8,
  },
  frezoSection: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 14
  },
  frezoStock: {
    marginTop: 2,
    color: "#B56927",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900"
  },
  frezoTimeRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 3
  },
  frezoTimeText: {
    color: "#222A31",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_500Medium",
  },
  categoryTilePressed: {
    opacity: 0.72,
    transform: [{
      scale: 0.97
    }]
  },
  codePill: {
    position: "absolute",
    bottom: 10,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  codePillText: {
    color: "#FFFFFF",
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 0.35
  },
  container: {
    paddingTop: 12,
    paddingBottom: 26,
    backgroundColor: "#FFFFFF",
    position: "relative"
  },
  dot: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#A9B2B7"
  },
  dotActive: {
    backgroundColor: GREEN
  },
  dotsRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5
  },
  etaRow: {
    minHeight: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 3
  },
  etaText: {
    color: "#3D474F",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_500Medium",
  },
  imageDot: {
    width: 2,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#4a4a4aff"
  },
  imageDotActive: {
    backgroundColor: "#313131ff"
  },
  imageDotsRow: {
    position: "absolute",
    left: 7,
    bottom: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    zIndex: 5
  },
  productCard: {
    width: PRODUCT_WIDTH,
    minHeight: 230,
    marginRight: 0,
    backgroundColor: "#ffff",
    borderRadius: 6,
    borderWidth: 0,
    borderColor: "#ffff",
    padding: 1,
    paddingBottom: 8,
    overflow: "visible"
  },
  festiveProductCard: {
    backgroundColor: "transparent",
    borderColor: "#E6E8EB"
  },
  reorderProductCard: {
    backgroundColor: "transparent",
    borderColor: "#E6E8EB"
  },
  pickedProductCard: {
    backgroundColor: "transparent",
    borderColor: "#E6E8EB"
  },
  dealsProductCard: {
    backgroundColor: "transparent",
    borderColor: "#E6E8EB"
  },
  beautyProductCard: {
    backgroundColor: "transparent",
    borderColor: "#E6E8EB"
  },
  freshProductCard: {
    backgroundColor: "transparent",
    borderColor: "#E6E8EB"
  },
  productContent: {
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 2
  },
  productImageMock: {
    height: PRODUCT_IMAGE_HEIGHT,
    borderRadius: 10,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#E1E3E8",
    backgroundColor: "#FBFCFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative"
  },
  festiveProductImage: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#E1E3E8"
  },
  reorderProductImage: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#E1E3E8"
  },
  pickedProductImage: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#E1E3E8"
  },
  dealsProductImage: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#E1E3E8"
  },
  beautyProductImage: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#E1E3E8"
  },
  freshProductImage: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#E1E3E8"
  },
  productImageAsset: {
    width: "90%",
    height: "90%",
    marginBottom: 16,
    zIndex: 1
  },
  productImageLifestyleAsset: {
    width: "100%",
    height: "100%",
    marginBottom: 0,
  },
  productTag: {
    position: "absolute",
    left: -1,
    top: -1,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    zIndex: 3
  },
  productTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 10,
    fontWeight: "700",
    letterSpacing: 0.25
  },
  productWishBadge: {
    position: "absolute",
    left: -1,
    top: -1,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 8,
    backgroundColor: "#FFDF2B",
    paddingHorizontal: 7,
    paddingVertical: 4,
    zIndex: 5
  },
  productWishBadgeLower: {
    top: 30
  },
  productWishBadgeText: {
    color: "#1A1A1A",
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 0.2
  },
  productWishButton: {
    position: "absolute",
    top: 5,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 14,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6
  },
  productImageFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
    borderTopWidth: 0,
    backgroundColor: "transparent",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 7
  },
  productVegMark: {
    width: 14,bottom:6,left:-6,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#0A8B2D",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  productVegDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#129B53"
  },
  productImageFooterQty: {
    flex: 1,bottom:-8,
    paddingLeft: -15,
    paddingRight: 44,
    color: "#05070A",
    fontSize: 12,
    lineHeight: 23,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    letterSpacing: -0.6,
    textAlign: "center"
  },
  productImageFooterAdd: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 40,
    height: 42,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#129B53",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,elevation:0,
  },
  productImageFooterStepper: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 76,
    height: 36,
    borderRadius: 6,
    borderWidth: 0,
    borderColor: "#129B53",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10
  },
  productImageFooterStepperButton: {
    width: 25,
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  productImageFooterStepperText: {
    color: "#129B53",
    fontSize: 29,
    lineHeight: 29,
    fontWeight: "700"
  },
  productImageFooterStepperValue: {
    color: "#129B53",
    fontSize: 20,
    lineHeight: 18,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "900"
  },
  productAddButton: {
    position: "absolute",
    right: -15,
    bottom: -15,
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0,
    elevation: 0,
    zIndex: 8
  },
  productAddButtonBlue: {
    borderColor: "transparent"
  },
  productAddButtonText: {
    color: GREEN,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "900"
  },
  productAddButtonTextBlue: {
    color: "#15630bff"
  },
  productStepper: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 88,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: "#15630bff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    zIndex: 8
  },
  productStepperBlue: {
    backgroundColor: "#ffffffff",
    borderColor: "#15630bff"
  },
  productStepperButton: {
    width: 29,
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  productStepperSymbol: {
    color: "#15630bff",
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "700"
  },
  productStepperValue: {
    color: "#15630bff",
    fontSize: 18,
    lineHeight: 18,
    fontWeight: "900"
  },
  productMrp: {
    color: "#8B9098",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_500Medium",
    fontWeight: "500",
    textDecorationLine: "line-through"
  },
  productMetaRow: {
    marginTop: 4,
    minHeight: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  productMetaRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
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
    backgroundColor: "#CDD2D8"
  },
  productMetaEta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  productMetaEtaText: {
    color: "#6F767C",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_500Medium",
  },
  productName: {
    ...GROCERY_TYPOGRAPHY.productName,
    marginTop: 2,
    minHeight: 0,
    color: "#05070A",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    letterSpacing: -0.35,
  
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  productBrand: {
    color: "#7A818A",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    letterSpacing: 0.5
  },
  productPrice: {
    color: "#05070A",
    fontSize: 17,
    lineHeight: 21,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "500",
    letterSpacing: -0.75,
  },
  productPriceRow: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    borderRadius: 0,
    backgroundColor: "#fff1aaff",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4
  },
  productQty: {
    color: "#30343A",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  productQtyChip: {
    alignSelf: "flex-start",
    marginTop: 12
  },
  productQtySubline: {
    alignSelf: "flex-start",
    minHeight: 22,
    marginTop: 4,
    borderRadius: 6,
    borderWidth: 0.6,
    borderColor: "#C9DFFB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    color: "#0759F6",
    fontSize: 11,
    lineHeight: 20,
    fontWeight: "700",
    letterSpacing: -0.1,
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  productRatingCount: {
    color: "#7A818A",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_500Medium",
  },
  productRatingRow: {
    marginTop: 1,
    minHeight: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  productRatingValue: {
    color: GREEN,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_500Medium",
  },
  productEtaInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 0
  },
  productEtaRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  productEtaText: {
    color: "#5E6670",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_500Medium",
  },
  productRail: {
    paddingLeft: 14,
    paddingRight: 14,
    gap: 0
  },
  productGrid: {
    paddingHorizontal: PRODUCT_GRID_SIDE_PADDING,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: PRODUCT_GRID_COLUMN_GAP,
    rowGap: 12,
  },
  frezoProductGrid: {
    paddingHorizontal: 0,
  },
  productSeeAllBar: {
    minHeight: 42,
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE8DE",
    backgroundColor: "#F6FBF7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  productSeeAllBarText: {
    color: GREEN,
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
  },
  productOfferRow: {
    marginTop: 2,
    alignItems: "flex-start"
  },
  productOfferPill: {
    borderRadius: 5,
    backgroundColor: "#FFDF2B",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#C8A700",
  
    fontFamily: "PlusJakartaSans_700Bold",
  
    fontWeight: "700",
  },
  productOfferText: {
    color: "#1A1A1A",
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "700",
    letterSpacing: 0.15,
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  productOfferDrop: {
    color: "#E33F32",
    backgroundColor: "transparent"
  },
  productOfferLine: {
    marginTop: 2,
    color: GREEN,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  productSizeChip: {
    minHeight: 22,
    borderRadius: 6,
    borderWidth: 0.6,
    borderColor: "#01a814ff",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  productSizeChipMuted: {
    minHeight: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E3E8",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  productSizeMutedText: {
    color: "#6D737B",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  productSizeRow: {
    minHeight: 22,
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap"
  },
  productSizeText: {
    color: "#f87939ff",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
  
    fontFamily: "PlusJakartaSans_700Bold",
  },
  productUnitRate: {
    marginTop: 2,
    color: "#6F7680",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700"
  },
  productSection: {
    marginBottom: 4,
    backgroundColor: "#FFFFFF"
  },
  reorderAgainSection: {
    marginHorizontal: 0,
    marginTop: 2,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF"
  },
  freshTodaySection: {
    marginHorizontal: 0,
    marginTop: 2,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF"
  },
  productTab: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent"
  },
  productTabActive: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: GREEN
  },
  productTabActiveText: {
    ...GROCERY_TYPOGRAPHY.button,
    color: GREEN,
  },
  productTabs: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6E8",
    flexDirection: "row",
    alignItems: "center"
  },
  productTabText: {
    ...GROCERY_TYPOGRAPHY.button,
    color: "#101415",
  },
  productUnitRate: {
    marginTop: 3,
    color: "#747A80",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600"
  },
  sectionHeadingCopy: {
    flex: 1,
    paddingRight: 12
  },
  sectionHeadingRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  sectionSubtitle: {
    ...GROCERY_TYPOGRAPHY.caption,
    marginTop: 2,
    color: "#758087",
  },
  sectionTitle: {
    ...GROCERY_TYPOGRAPHY.sectionTitle,
    color: "#101415",
  },
  seeAllText: {
    color: GREEN,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800"
  },
  swiggyDivider: {
    color: "#A2A8AD",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "700"
  },
  swiggyEta: {
    color: "#6F767C",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800"
  },
  swiggyMetaRow: {
    minHeight: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 0
  },
  swiggyProductCard: {
    paddingBottom: 2 ,
  },
  swiggyRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  swiggyRatingText: {
    color: "#149B61",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  swiggyReviewText: {
    color: "#6F767C",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "500",
  
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  swiggySeeAll: {
    marginHorizontal: 16,
    marginTop: 2,
    marginBottom: 28,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EEF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  swiggySeeAllText: {
    color: GREEN,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900"
  },
  viewMoreProducts: {
    marginHorizontal: 20,
    marginTop: -8,
    marginBottom: 30,
    minHeight: 46,
    borderRadius: 4,
    borderWidth: 0,
    borderColor: "#DADDE0",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  viewMoreProductsText: {
    color: GREEN,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900"
  },
  spotlightArtwork: {
    width: CATEGORY_TILE_WIDTH,
    height: 136,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F1F3F2"
  },
  urgencyText: {
    marginTop: 4,
    color: "#D06A1C",
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "700"
  },

  // Premium product-card treatment shared by every home rail.
  productCard: {
    width: PRODUCT_WIDTH,
    minHeight: 230,
    marginRight: 0,
    padding: 0,
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "#E6E8EB",
    overflow: "visible",
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0
  },
  frezoProductCard: {
    width: PRODUCT_WIDTH,
    minHeight: 230,
    marginRight: 0,
    padding: 0,
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "#E6E8EB",
    overflow: "visible",
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0
  },
  productImageMock: {
    height: PRODUCT_IMAGE_HEIGHT,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e9e9e9ff",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0
  },
  flatProductImagePanel: {
    borderRadius: 12,
    backgroundColor: PRODUCT_IMAGE_BG,
  },
  frezoProductImage: {
    height: PRODUCT_IMAGE_HEIGHT,
    borderRadius: 12,
    borderWidth: 0.5,borderColor:"#E1E3E8",
    backgroundColor: "transparent",
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8C98A4",
    shadowOpacity: 0,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 6 },
    elevation: 0
  },
  productImageAsset: {
    width: "100%",
    height: "100%",
    marginBottom: 0,
    zIndex: 1
  },
  frezoProductImageAsset: {
    width: "60%",
    height: "0%",
    marginBottom: 16,
    zIndex: 1
  },
  productWishButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 8
  },
  frezoHeartButton: {
    position: "absolute",
    top: 11,
    right: 10,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 8
  },
  productImageFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 30,
    paddingHorizontal: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 7
  },
  productVegMark: {
    position: "absolute",
    left: 4,
    bottom: 8,
    width: 11,
    height: 11,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#129B53",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  productVegDot: {
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#129B53"
  },
  productCardDots: {
    display: "none"
  },
  productCardDot: {
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#82828261"
  },
  productCardDotActive: {
    backgroundColor: "#7b7b7bff"
  },
  productImageFooterAdd: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    borderWidth: 1.4,
    borderColor: GREEN,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    zIndex: 10
  },
  productImageFooterAddPressed: {
    backgroundColor: "#F1FAF4",
  },
  productAddTouchSurface: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: "hidden",
  },
  productAddSlot: {
    position: "absolute",
    right: 4,
    bottom: 8,
    width: 32,
    height: 32,
    zIndex: 10,
  },
  productImageFooterStepper: {
    position: "absolute",
    right: 4,
    bottom: 8,
    width: 68,
    height: 30,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: GREEN,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#8C98A4",
    shadowOpacity: 0,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0,
    zIndex: 10
  },
  productImageFooterStepperButton: {
    width: 23,
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  productImageFooterStepperText: {
    color: GREEN,
    fontSize: 23,
    lineHeight: 25,
    fontWeight: "700"
  },
  productImageFooterStepperValue: {
    color: GREEN,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "700"
  },
  productContent: {
    minHeight: 118,
    marginTop: 6,
    paddingTop: 0,
    paddingHorizontal: 3,
    paddingBottom: 5,
    borderTopWidth: 0,
    borderTopColor: "transparent",
    backgroundColor: "transparent",
    zIndex: 8
  },
  productPriceRow: {
    marginTop: 4,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignSelf: "flex-start",
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6
  },
  productPrice: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 19,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "800",
    letterSpacing: -0.35
  },
  productMrp: {
    color: "#777A82",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_400Regular",
    fontWeight: "400",
    textDecorationLine: "line-through"
  },
  productUnitRate: {
    marginTop: 0,
    marginBottom: 2,
    color: "#898989ff",
    fontSize: 10,
    lineHeight: 14,
    fontFamily: "PlusJakartaSans_500Medium",
    fontWeight: "500"
  },
  productName: {
    marginTop: 3,
    marginBottom: 0,
    minHeight: 32,
    color: "#15171A",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    letterSpacing: -0.12
  },
  frezoName: {
    marginTop: 3,
    marginBottom: 0,
    minHeight: 32,
    color: "#15171A",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    letterSpacing: -0.12
  },
  frezoDealName: {
    marginTop: 3,
    marginBottom: 0,
    minHeight: 32,
    color: "#15171A",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    letterSpacing: -0.12
  },
  frezoPriceRowInline: {
    marginTop: 4,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignSelf: "flex-start",
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6
  },
  frezoPrice: {
    color: "#081A3D",
    fontSize: 15,
    lineHeight: 19,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    letterSpacing: -0.3
  },
  frezoMrp: {
    color: "#777A82",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_400Regular",
    fontWeight: "400",
    textDecorationLine: "line-through"
  },
  productOfferLine: {
    alignSelf: "flex-start",
    marginTop: 2,
    marginBottom: 0,
    borderRadius: 7,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
    color: "#0B9346",
    fontSize: 11,
    lineHeight: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    overflow: "hidden"
  },
  animatedOfferSlot: {
    alignSelf: "flex-start",
    height: 15,
    minWidth: 58,
    overflow: "hidden",
    justifyContent: "center"
  },
  animatedOfferText: {
    position: "absolute",
    left: 0,
    top: 0
  },
  frezoOfferLine: {
    alignSelf: "flex-start",
    marginTop: 2,
    borderRadius: 8,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
    color: "#0B9346",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
  
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  productSizeRow: {
    minHeight: 20,
    marginTop: 0,
    marginBottom: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap"
  },
  productSizeChip: {
    minHeight: 20,
    minWidth: 36,
    borderRadius: 7,
    borderWidth: 0,
    borderColor: "#b3b3b3ff",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  productSizeChipMuted: {
    minHeight: 20,
    minWidth: 36,
    borderRadius: 7,
    borderWidth: 0,
    borderColor: "#CDD2D8",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  productSizeText: {
    color: SIZE_BLUE,
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600"
  },
  productSizeMutedText: {
    color: "#777A82",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600"
  },
  productMetaRow: {
    marginTop: 0,
    minHeight: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 3
  },
  productMetaRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 6,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0
  },
  productMetaRatingText: {
    color: "#dfad30ff",
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "PlusJakartaSans_500Medium",
    fontWeight: "900"
  },
  productMetaDivider: {
    display: "flex",
    width: 1,
    height: 7,
    backgroundColor: "#C9CDD2",
    marginHorizontal: 3
  },
  productMetaEtaText: {
    color: "#3c3c3cff",
    fontSize: 10,
    lineHeight: 14,
    fontFamily: "PlusJakartaSans_500Medium",
    fontWeight: "500",
    textTransform: "uppercase"
  },
  productMetaReviewText: {
    color: "#6F737B",
    fontSize: 10,
    lineHeight: 14,
    fontFamily: "PlusJakartaSans_500Medium",
    fontWeight: "500"
  },
  premiumDiscountBadge: {
    position: "absolute",
    left: 3,
    top: 3,
    minWidth: 30,
    minHeight: 30,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#5C1697",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10
  },
  premiumDiscountBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    lineHeight: 10,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    textAlign: "center"
  },
  premiumProductSize: {
    marginTop: 1,
    color: "#0062ffff",
    fontSize: 10,
    lineHeight: 13,
    fontFamily: "PlusJakartaSans_500Medium",  fontWeight: "900"
  },
  listingScreen: {
    flex: 1,
    backgroundColor: "#ffffffff"
  },
  listingTopBar: {
    minHeight: 66,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E7E9EC"
  },
  listingBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F7F4"
  },
  listingDeliveryCopy: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 11
  },
  listingDeliveryTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  listingDeliveryTime: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 19,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "800"
  },
  listingDeliveryAddress: {
    marginTop: 2,
    color: "#667085",
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_500Medium"
  },
  listingSearchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    backgroundColor: "#FFFFFF"
  },
  listingSearchButtonActive: {
    borderColor: "#B8DEC3",
    backgroundColor: "#EFF9F2"
  },
  listingSearchWrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF"
  },
  listingSearchField: {
    height: 46,
    paddingHorizontal: 13,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#F4F6F5",
    borderWidth: 1,
    borderColor: "#E5E9E6"
  },
  listingSearchInput: {
    flex: 1,
    minWidth: 0,
    color: "#101828",
    fontSize: 13,
    lineHeight: 18,
    paddingVertical: 0,
    fontFamily: "PlusJakartaSans_600SemiBold"
  },
  listingTitleBlock: {
    paddingHorizontal: 14,
    paddingTop: 15,
    paddingBottom: 13,
    backgroundColor: "#FFFFFF"
  },
  listingTitleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10
  },
  listingTitleCopy: {
    flex: 1,
    minWidth: 0
  },
  listingEyebrow: {
    marginBottom: 2,
    color: GREEN,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1,
    fontFamily: "PlusJakartaSans_800ExtraBold"
  },
  listingTitle: {
    color: "#101828",
    fontSize: 23,
    lineHeight: 29,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "800",
    letterSpacing: -0.45
  },
  listingResultCount: {
    marginTop: 3,
    color: "#667085",
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "PlusJakartaSans_500Medium"
  },
  listingPromisePill: {
    marginBottom: 1,
    paddingHorizontal: 9,
    height: 29,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EFF9F2"
  },
  listingPromiseText: {
    color: GREEN,
    fontSize: 9,
    lineHeight: 12,
    fontFamily: "PlusJakartaSans_700Bold"
  },
  listingControls: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#E7E9EC"
  },
  listingControlsContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    gap: 8
  },
  listingFilterCountChip: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  listingFilterCountText: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 14,
    fontFamily: "PlusJakartaSans_700Bold"
  },
  listingControlChip: {
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9DDE3",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  listingControlChipActive: {
    borderColor: "#81C995",
    backgroundColor: "#EFFAF2"
  },
  listingControlText: {
    color: "#394150",
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600"
  },
  listingControlTextActive: {
    color: GREEN
  },
  listingControlDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E1E4E8"
  },
  listingScroll: {
    flex: 1
  },
  listingScrollContent: {
    paddingHorizontal: LISTING_SIDE_PADDING,
    paddingTop: 10,
    paddingBottom: 36
  },
  listingProductGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    columnGap: LISTING_PRODUCT_GAP,
    rowGap: 10
  },
  listingProductCard: {
    width: LISTING_PRODUCT_WIDTH,
    minHeight: LISTING_PRODUCT_IMAGE_HEIGHT + 140,
    borderRadius: 0,
    overflow: "visible",
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0
  },
  listingProductImage: {
    width: "100%",
    height: LISTING_PRODUCT_IMAGE_HEIGHT,
    borderRadius: 12
  },
  listingProductContent: {
    minHeight: 140,
    marginTop: 7,
    paddingHorizontal: 3,
    paddingTop: 0,
    paddingBottom: 9
  },
  listingEmptyState: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  listingEmptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF7EE"
  },
  listingEmptyTitle: {
    marginTop: 10,
    color: "#475467",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "PlusJakartaSans_600SemiBold",
    textAlign: "center"
  },
  listingEmptySubtitle: {
    marginTop: 4,
    color: "#98A2B3",
    fontSize: 11,
    lineHeight: 17,
    fontFamily: "PlusJakartaSans_500Medium",
    textAlign: "center"
  },
  listingClearButton: {
    marginTop: 14,
    height: 38,
    paddingHorizontal: 17,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN
  },
  listingClearFilters: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "PlusJakartaSans_700Bold"
  },
  premiumProductDivider: {
    marginTop: 3,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderBottomColor: "#C8CCD1"
  }
});
