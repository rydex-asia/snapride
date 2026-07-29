import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Modal,
  PanResponder,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  StatusBar as NativeStatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import AppIcon from "../../components/AppIcon";
import { LinearGradient } from "expo-linear-gradient";
import GroceryHomeContent, { PRODUCT_IMAGES } from "./GroceryHomeContent";
import GroceryCategoryScreen from "./GroceryCategoryScreen";
import GrocerySearchScreen from "./GrocerySearchScreen";
import GroceryProductScreen from "./GroceryProductScreen";
import GroceryCheckoutScreen from "./GroceryCheckoutScreen";
import GroceryWishlistScreen from "./GroceryWishlistScreen";
import GrocerySubstitutionScreen from "./GrocerySubstitutionScreen";
import GroceryAddressSelectionScreen from "./GroceryAddressSelectionScreen";
import GroceryMapAddressScreen from "./GroceryMapAddressScreen";
import GroceryCouponsScreen from "./GroceryCouponsScreen";
import GroceryPaymentMethodScreen from "./GroceryPaymentMethodScreen";
import OrderSuccessScreen from "../payments/OrderSuccessScreen";
import GroceryOrderTrackingScreen from "./GroceryOrderTrackingScreen";
import GroceryRateOrderScreen from "./GroceryRateOrderScreen";
import {
  createGroceryOrder,
  createGrocerySupportRequest,
  createPaymentOrder,
  checkGroceryServiceability,
  cancelUnpaidGroceryOrder,
  fetchGroceryCart,
  fetchGroceryCatalog,
  fetchPaymentStatus,
  setGroceryCartItem,
  validateGroceryCart,
  verifyPayment,
} from "../../platformApi";
import { openCashfreeCheckout } from "../../payments/cashfreeCheckout";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function RollingCartCount({ value }) {
  const roll = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    roll.stopAnimation();
    roll.setValue(0);
    Animated.timing(roll, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [roll, value]);

  return (
    <Animated.Text
      style={[
        styles.groceryViewCartSubtitle,
        {
          opacity: roll,
          transform: [
            { translateY: roll.interpolate({ inputRange: [0, 1], outputRange: [9, 0] }) },
          ],
        },
      ]}
    >
      {value} {value === 1 ? "item" : "items"}
    </Animated.Text>
  );
}

const RIDE_SEARCH_PROMPTS = [
  "Where to?",
  "Search a destination",
  "Plan your next ride",
];

function AnimatedSearchPrompt() {
  const [promptIndex, setPromptIndex] = useState(0);
  const promptProgress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(() => {
      Animated.timing(promptProgress, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || !mounted) return;
        setPromptIndex((current) => (current + 1) % RIDE_SEARCH_PROMPTS.length);
        promptProgress.setValue(0);
        Animated.timing(promptProgress, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    }, 2800);

    return () => {
      mounted = false;
      clearInterval(interval);
      promptProgress.stopAnimation();
    };
  }, [promptProgress]);

  return (
    <View style={styles.searchPromptClip}>
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.searchPlaceholder,
          {
            opacity: promptProgress,
            transform: [
              {
                translateY: promptProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [6, 0],
                }),
              },
            ],
          },
        ]}
      >
        {RIDE_SEARCH_PROMPTS[promptIndex]}
      </Animated.Text>
    </View>
  );
}
import { registerOrderPushNotifications } from "../../pushNotifications";

// Ride-first release gate. Set EXPO_PUBLIC_GROCERY_ENABLED=true to restore the
// complete Grocery mode without changing any screen or navigation code.
const GROCERY_RELEASE_ENABLED = process.env.EXPO_PUBLIC_GROCERY_ENABLED === "true";

const MODE_CONFIG = {
  ride: { label: "Ride", tabImage: require("../../assets/vehicles/choose-car-prime.png") },
  ...(GROCERY_RELEASE_ENABLED
    ? { grocery: { label: "Grocery", tabImage: require("../../assets/vehicles/tab-grocery.png") } }
    : {}),
  parcel: { label: "Parcel", tabImage: require("../../assets/vehicles/tab-parcel.png") },
};

function mapBackendGroceryProduct(product, storeId = product?.storeId) {
  const quantityLabel = product?.name?.match(/\b\d+(?:\.\d+)?\s*(?:kg|g|ml|l|pack)\b/i)?.[0] || "1 pack";
  return {
    ...product,
    backendProductId: product.id,
    storeId,
    price: Number(product.price || 0),
    mrp: Number(product.mrp || product.price || 0),
    qty: product.unit || quantityLabel,
    rating: "4.5",
    reviews: "Verified",
    eta: "6 mins",
    discount: "",
    stock: product.stock > 10 ? "In stock" : `${product.stock} left`,
    color: "#F3F7F2",
    image: product.imageKey && PRODUCT_IMAGES[product.imageKey]
      ? PRODUCT_IMAGES[product.imageKey]
      : product.imageUrl
        ? { uri: product.imageUrl }
        : null,
    imageFit: "contain",
    hasVariants: false,
  };
}

function resolveGroceryPaymentProvider(method = {}) {
  const value = `${method.value || ""} ${method.title || ""}`.toLowerCase();
  if (value.includes("wallet")) return "WALLET";
  if (value.includes("cash")) return "CASH";
  if (value.includes("card")) return "CARD";
  return "UPI";
}

const RIDE_SERVICE_ROWS = [
  [
    {
      key: "bike",
      label: "Bike",
      subtitle: "Fast city rides",
      image: require("../../assets/vehicles/ride-your-way-bike.png"),
      artwork: "bike",
      flex: 1.18,
      tone: "#F7F7F8",
      row: "quick",
    },
    {
      key: "airport",
      label: "Airport",
      subtitle: "Reliable pickups",
      image: require("../../assets/vehicles/ride-your-way-parcel.png"),
      artwork: "parcel",
      flex: 0.82,
      tone: "#F7F7F8",
      row: "service",
    },
  ],
  [
    {
      key: "auto",
      label: "Auto",
      subtitle: "Easy everyday trips",
      image: require("../../assets/vehicles/choose-auto.png"),
      flex: 0.82,
      tone: "#F7F7F8",
      row: "quick",
    },
    {
      key: "car",
      label: "Car",
      subtitle: "Comfort with more room",
      image: require("../../assets/vehicles/ride-your-way-travel.png"),
      artwork: "travel",
      flex: 1.18,
      tone: "#F7F7F8",
      row: "quick",
    },
  ],
];


const RECENTS = [
  {
    title: "Kacheguda Railway Station",
    subtitle: "Kacheguda Station Road, Hyderabad",
    icon: "clock-outline",
  },
  {
    title: "Secunderabad Railway Station",
    subtitle: "Railway Station Road, Secunderabad",
    icon: "clock-outline",
  },
];

const PROMO_CARDS = [
  { key: "ride-2", eyebrow: "SCHEDULED RIDES", title: "Reserve and relax", subtitle: "Book up to 90 days ahead", cta: "Schedule", image: require("../../assets/horizontal-ads/optimized/ride-relax.png") },
  { key: "ride-3", eyebrow: "AIRPORT", title: "Start every flight calmly", subtitle: "Reliable pickups, day or night", cta: "Book airport", image: require("../../assets/horizontal-ads/optimized/ride-airport.png") },
  { key: "ride-4", eyebrow: "AROUND THE CITY", title: "A ride when you need one", subtitle: "Quick everyday city trips", cta: "Ride now", image: require("../../assets/horizontal-ads/optimized/ride-city.png") },
];

const PARCEL_PROMO_CARDS = [
  { key: "parcel-1", image: require("../../assets/horizontal-ads/optimized/parcel-1.png") },
  { key: "parcel-2", image: require("../../assets/horizontal-ads/optimized/parcel-2.png") },
  { key: "parcel-3", image: require("../../assets/horizontal-ads/optimized/parcel-3.png") },
];

const PARCEL_VEHICLES = [
  {
    id: "bike",
    title: "Bike",
    eta: "2 min",
    subtitle: "Small parcels",
    tint: ["#F1F7FF", "#FBFDFF"],
    image: require("../../assets/vehicles/choose-bike.png"),
  },
  {
    id: "auto",
    title: "Auto",
    eta: "3 min",
    subtitle: "Medium parcels",
    tint: ["#F5FAF2", "#FCFEFB"],
    image: require("../../assets/vehicles/choose-auto.png"),
  },
];

const GROCERY_HERO_COLOR = "#8B057F";
const GROCERY_SELECTOR_TAB_WIDTH = 72;
const GROCERY_SELECTOR_SIDE_PADDING = 40;

const GROCERY_CATEGORIES = [
  { key: "all", label: "All", icon: "basket-outline", bg: "#FFB000", hero: "#B7D5F1", ink: "#245E91" },
  { key: "fresh", label: "Fresh", icon: "food-apple-outline", bg: "#16A34A", hero: "#D9EEDF", ink: "#08736F" },
  { key: "electronics", label: "Electronics", icon: "headphones", bg: "#2563EB", hero: "#DDE5F8", ink: "#354D8A" },
  { key: "deals", label: "50% Off", icon: "brightness-percent", bg: "#F97316", hero: "#E8E4FA", ink: "#4A427C" },
  { key: "monsoon", label: "Monsoon", icon: "umbrella-outline", bg: "#06B6D4", hero: "#B7D8F3", ink: "#205E91" },
  { key: "beauty", label: "Beauty", icon: "lipstick", bg: "#EC4899", hero: "#F6DCEB", ink: "#8D3E6B" },
  { key: "pharmacy", label: "Pharmacy", icon: "pill", bg: "#7C3AED", hero: "#E9E0F6", ink: "#5F448A" },
];

const SCREEN_WIDTH = Dimensions.get("window").width;
// Keep the panel anchored while exposing a useful map/ad band. The map itself
// remains full-screen underneath; only the draggable panel travel is bounded.
const HOME_PANEL_REVEAL = 360;
const HOME_PANEL_OPEN_THRESHOLD = 110;
const TAB_BAR_HORIZONTAL = 18;
const TAB_WIDTH = (SCREEN_WIDTH - TAB_BAR_HORIZONTAL * 2) / Object.keys(MODE_CONFIG).length;
const PROMO_CARD_GAP = 10;
const PROMO_WIDTH = SCREEN_WIDTH - 38;
const PROMO_STEP = PROMO_WIDTH + PROMO_CARD_GAP;
const RIDE_AD_WIDTH = Math.min(SCREEN_WIDTH - 70, 318);
const PARCEL_PROMO_WIDTH = PROMO_WIDTH;
const PARCEL_PROMO_CARD_GAP = PROMO_CARD_GAP;
const PARCEL_PROMO_STEP = PARCEL_PROMO_WIDTH + PARCEL_PROMO_CARD_GAP;
const PROMO_CARD_RADIUS = 28;
const PROMO_RENTALS_ASPECT_RATIO = 860 / 1774;
const PROMO_CARD_HEIGHT = Math.round(PROMO_WIDTH * PROMO_RENTALS_ASPECT_RATIO);
const PARCEL_PROMO_CARD_HEIGHT = PROMO_CARD_HEIGHT;

function GroceryCategorySelector({ value, onChange, heroColor = GROCERY_HERO_COLOR, inkColor = "#245E91" }) {
  const selectorScrollRef = useRef(null);
  const selectedIndex = Math.max(0, GROCERY_CATEGORIES.findIndex((item) => item.key === value));
  const previousIndexRef = useRef(selectedIndex);
  const activeCurveX = useRef(
    new Animated.Value(GROCERY_SELECTOR_SIDE_PADDING + selectedIndex * GROCERY_SELECTOR_TAB_WIDTH)
  ).current;
  const curveStretch = useRef(new Animated.Value(1)).current;
  const curveStretchShift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const nextX = GROCERY_SELECTOR_SIDE_PADDING + selectedIndex * GROCERY_SELECTOR_TAB_WIDTH;
    const direction = Math.sign(selectedIndex - previousIndexRef.current);
    previousIndexRef.current = selectedIndex;
    activeCurveX.stopAnimation();
    curveStretch.stopAnimation();
    curveStretchShift.stopAnimation();
    Animated.parallel([
      Animated.timing(activeCurveX, {
        toValue: nextX,
        useNativeDriver: true,
        duration: 360,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      }),
      Animated.sequence([
        Animated.parallel([
          Animated.timing(curveStretch, {
            toValue: direction === 0 ? 1 : 1.05,
            duration: 140,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(curveStretchShift, {
            toValue: direction * 6,
            duration: 140,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(curveStretch, {
            toValue: 1,
            duration: 220,
            easing: Easing.bezier(0.22, 1, 0.36, 1),
            useNativeDriver: true,
          }),
          Animated.timing(curveStretchShift, {
            toValue: 0,
            duration: 220,
            easing: Easing.bezier(0.22, 1, 0.36, 1),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    const contentWidth =
      GROCERY_CATEGORIES.length * GROCERY_SELECTOR_TAB_WIDTH + GROCERY_SELECTOR_SIDE_PADDING * 2;
    const maxScrollX = Math.max(0, contentWidth - SCREEN_WIDTH);
    const centeredX =
      GROCERY_SELECTOR_SIDE_PADDING +
      selectedIndex * GROCERY_SELECTOR_TAB_WIDTH -
      (SCREEN_WIDTH - GROCERY_SELECTOR_TAB_WIDTH) / 2;
    selectorScrollRef.current?.scrollTo({
      x: Math.max(0, Math.min(maxScrollX, centeredX)),
      animated: true,
    });
  }, [activeCurveX, curveStretch, curveStretchShift, selectedIndex]);

  return (
    <View style={[styles.grocerySelectorShell, { backgroundColor: heroColor }]}>
      <ScrollView
        ref={selectorScrollRef}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.grocerySelectorRail}
      >
        <View pointerEvents="none" style={[styles.grocerySelectorBaseline, { backgroundColor: inkColor }]} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.grocerySelectorActiveCurve,
            { transform: [{ translateX: activeCurveX }] },
          ]}
        >
          <Animated.View
            style={[
              styles.grocerySelectorCurveShape,
              { transform: [{ translateX: curveStretchShift }, { scaleX: curveStretch }] },
            ]}
          >
            <Svg width="100%" height="100%" viewBox="0 0 104 74" preserveAspectRatio="none">
              <Path
                d="M1 73 H8 C16 73 20 66 20 57 V16 C20 7 26 2 35 2 H69 C78 2 84 7 84 16 V57 C84 66 88 73 96 73 H103 V74 H1 Z"
                fill="#FFFFFF"
              />
              <Path
                d="M1 73 H8 C16 73 20 66 20 57 V16 C20 7 26 2 35 2 H69 C78 2 84 7 84 16 V57 C84 66 88 73 96 73 H103"
                fill="none"
                stroke={inkColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>
        </Animated.View>
        {GROCERY_CATEGORIES.map((item) => {
          const selected = item.key === value;

          return (
            <Pressable
              key={item.key}
              onPress={() => onChange?.(item.key)}
              style={({ pressed }) => [
                styles.grocerySelectorTab,
                selected && styles.grocerySelectorTabActive,
                pressed && styles.grocerySelectorTabPressed,
              ]}
            >
              <View
                style={[
                  styles.grocerySelectorIconWrap,
                  selected && styles.grocerySelectorIconWrapActive,
                ]}
              >
                <AppIcon
                  name={item.icon}
                  size={26}
                  color={selected ? "#111111" : inkColor}
                />
              </View>
              <Text
                style={[
                  styles.grocerySelectorText,
                  { color: inkColor },
                  selected && styles.grocerySelectorTextActive,
                ]}
                numberOfLines={2}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function GroceryHeaderSearchRow({ onSearchPress, onWishlistPress }) {
  return (
    <View style={styles.groceryHeaderSearchRow}>
      <Pressable style={styles.groceryHeaderSearchInput} onPress={onSearchPress}>
        <AppIcon name="magnify" size={25} color="#3B3B3B" />
        <Text style={styles.groceryHeaderSearchText} numberOfLines={1}>Search for Atta, Tshirt...</Text>

      </Pressable>

    </View>
  );
}

function DeliveryHeaderCopy({
  eta = "6 Mins",
  address = "Current location",
  addressLabel = "Pickup from",
  onPress,
  light = false,
  accentEta = false,
}) {
  const etaParts = accentEta
    ? String(eta).match(/^(.*?)(\d+\s*(?:mins?|minutes?))(.*)$/i)
    : null;

  return (
    <Pressable style={styles.deliveryHeaderCopy} onPress={onPress}>
      <View style={styles.deliveryHeaderTitleRow}>
        {accentEta ? (
          <View style={styles.deliveryHeaderLocationBadge}>
            <AppIcon name="map-marker" size={14} color="#3730A3" />
          </View>
        ) : null}
        {etaParts ? (
          <Text style={[styles.deliveryHeaderTitle, light && styles.deliveryHeaderTitleLight]}>
            {etaParts[1]}
            <Text style={styles.deliveryHeaderEtaAccent}>{etaParts[2]}</Text>
            {etaParts[3]}
          </Text>
        ) : (
          <Text style={[styles.deliveryHeaderTitle, light && styles.deliveryHeaderTitleLight]}>{eta}</Text>
        )}
        <AppIcon name="chevron-right" size={19} color={light ? "#FFFFFF" : "#111111"} />
      </View>
      <Text style={[styles.deliveryHeaderAddress, light && styles.deliveryHeaderAddressLight]} numberOfLines={1}>
        {addressLabel}: {address}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen({
  mode = "ride",
  navigationScrollY,
  onModeChange,
  onSearchPress,
  onProfilePress,
  onQuickServicePress,
  onRideCardPress,
  onRefreshHome,
  groceryAccessToken,
  groceryDelivery,
  grocerySavedAddresses = [],
  onRefreshGroceryAddresses,
  onSelectGroceryAddress,
  onAddGroceryAddress,
  onOpenGroceryAddresses,
}) {
  const availableInitialMode = !GROCERY_RELEASE_ENABLED && mode === "grocery" ? "ride" : mode;
  const [activeMode, setActiveMode] = useState(availableInitialMode);
  const [contentMode, setContentMode] = useState(availableInitialMode);
  const [refreshing, setRefreshing] = useState(false);
  const [statusBarStyle, setStatusBarStyle] = useState("light");
  const [grocerySearchOpen, setGrocerySearchOpen] = useState(false);
  const [grocerySearchQuery, setGrocerySearchQuery] = useState("");
  const [groceryCategoryOpen, setGroceryCategoryOpen] = useState(false);
  const [selectedGroceryCategoryCard, setSelectedGroceryCategoryCard] = useState(null);
  const [selectedGroceryProduct, setSelectedGroceryProduct] = useState(null);
  const [groceryProductHeaderScrolled, setGroceryProductHeaderScrolled] = useState(false);
  const [groceryCheckout, setGroceryCheckout] = useState(null);
  const [groceryPaymentOpen, setGroceryPaymentOpen] = useState(false);
  const [groceryOrderSuccessOpen, setGroceryOrderSuccessOpen] = useState(false);
  const [groceryOrderTrackingOpen, setGroceryOrderTrackingOpen] = useState(false);
  const [groceryRatingOpen, setGroceryRatingOpen] = useState(false);
  const [groceryRatingData, setGroceryRatingData] = useState(null);
  const [groceryCancelOrderOpen, setGroceryCancelOrderOpen] = useState(false);
  const [groceryRefundOpen, setGroceryRefundOpen] = useState(false);
  const [groceryCancellationData, setGroceryCancellationData] = useState(null);
  const [groceryWishlistOpen, setGroceryWishlistOpen] = useState(false);
  const [grocerySubstitutionReview, setGrocerySubstitutionReview] = useState(null);
  const [groceryAddressOpen, setGroceryAddressOpen] = useState(false);
  const [groceryMapAddressOpen, setGroceryMapAddressOpen] = useState(false);
  const [groceryCouponsOpen, setGroceryCouponsOpen] = useState(false);
  const [groceryAppliedCoupon, setGroceryAppliedCoupon] = useState(null);
  const [groceryCartPreview, setGroceryCartPreview] = useState(null);
  const [groceryCartTotal, setGroceryCartTotal] = useState(0);
  const [groceryCartItems, setGroceryCartItems] = useState([]);
  const [groceryCatalogProducts, setGroceryCatalogProducts] = useState([]);
  const [groceryCatalogCategories, setGroceryCatalogCategories] = useState([]);
  const [restoredGroceryCartItems, setRestoredGroceryCartItems] = useState([]);
  const [groceryCartResetKey, setGroceryCartResetKey] = useState(0);
  const [groceryOrder, setGroceryOrder] = useState(null);
  const [isPlacingGroceryOrder, setIsPlacingGroceryOrder] = useState(false);
  const [groceryServiceability, setGroceryServiceability] = useState(null);
  const [groceryPaymentError, setGroceryPaymentError] = useState("");
  const [selectedGroceryCategory, setSelectedGroceryCategory] = useState("all");
  const [selectedParcelVehicle, setSelectedParcelVehicle] = useState("bike");
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [connectionBannerVisible, setConnectionBannerVisible] = useState(false);
  const [homeOpeningPromoVisible, setHomeOpeningPromoVisible] = useState(true);
  const [rideHeaderCollapsed, setRideHeaderCollapsed] = useState(false);
  const [homePanelDragging, setHomePanelDragging] = useState(false);
  const [homeSurfaceResetKey, setHomeSurfaceResetKey] = useState(0);
  const internalScrollY = useRef(new Animated.Value(0)).current;
  const scrollY = navigationScrollY || internalScrollY;
  const homeScrollRef = useRef(null);
  const statusBarStyleRef = useRef("light");
  const activeUnderlineX = useRef(new Animated.Value(0)).current;
  const screenRevealY = useRef(new Animated.Value(0)).current;
  const homePanelDragY = useRef(new Animated.Value(0)).current;
  const homePanelDragStartRef = useRef(0);
  const homePanelHintPlayedRef = useRef(false);
  const homePanelHintAnimationRef = useRef(null);
  const homeOpeningPromoOpacity = useRef(new Animated.Value(1)).current;
  const headerEnterAnim = useRef(new Animated.Value(0)).current;
  const modeEnterAnim = useRef(new Animated.Value(0)).current;
  const groceryCartFlyAnim = useRef(new Animated.Value(0)).current;
  const groceryCartPillAnim = useRef(new Animated.Value(0)).current;
  const cartPersistTimersRef = useRef({});
  const pendingCartQuantitiesRef = useRef({});
  const previousConnectionStatusRef = useRef("checking");
  const rideHeaderCollapsedRef = useRef(false);
  const isConnectionOnline = connectionStatus !== "offline";
  const isRideMode = contentMode === "ride";
  const isParcelMode = contentMode === "parcel";
  const isGroceryMode = contentMode === "grocery";
  const homePanelPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          !isGroceryMode && Math.abs(gesture.dy) > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: () => {
          homePanelHintAnimationRef.current?.stop();
          homePanelHintAnimationRef.current = null;
          setHomePanelDragging(true);
          homePanelDragY.stopAnimation((value) => {
            homePanelDragStartRef.current = value;
          });
        },
        onPanResponderMove: (_, gesture) => {
          const nextValue = Math.max(
            0,
            Math.min(HOME_PANEL_REVEAL, homePanelDragStartRef.current + gesture.dy)
          );
          homePanelDragY.setValue(nextValue);
        },
        onPanResponderRelease: (_, gesture) => {
          const projected = homePanelDragStartRef.current + gesture.dy + gesture.vy * 42;
          const destination = projected > HOME_PANEL_OPEN_THRESHOLD ? HOME_PANEL_REVEAL : 0;
          Animated.spring(homePanelDragY, {
            toValue: destination,
            stiffness: 168,
            damping: 24,
            mass: 0.92,
            overshootClamping: true,
            restDisplacementThreshold: 0.4,
            restSpeedThreshold: 0.4,
            useNativeDriver: false,
          }).start(({ finished }) => {
            if (finished && destination === 0) {
              homePanelDragY.setValue(0);
              homePanelDragStartRef.current = 0;
              setHomePanelDragging(false);
              setHomeSurfaceResetKey((current) => current + 1);
            }
          });
        },
        onPanResponderTerminate: () => {
          Animated.spring(homePanelDragY, {
            toValue: 0,
            stiffness: 168,
            damping: 24,
            mass: 0.92,
            overshootClamping: true,
            useNativeDriver: false,
          }).start(({ finished }) => {
            if (finished) {
              homePanelDragY.setValue(0);
              homePanelDragStartRef.current = 0;
              setHomePanelDragging(false);
              setHomeSurfaceResetKey((current) => current + 1);
            }
          });
        },
      }),
    [homePanelDragY, isGroceryMode]
  );
  const selectedGroceryCategoryItem =
    GROCERY_CATEGORIES.find((item) => item.key === selectedGroceryCategory) || GROCERY_CATEGORIES[0];
  const groceryHeroColor = selectedGroceryCategoryItem.hero || GROCERY_HERO_COLOR;
  const groceryHeroInk = selectedGroceryCategoryItem.ink || "#245E91";

  const currentGroceryAddress = useMemo(() => ({
    id: "current-location",
    label: "Current location",
    address: groceryDelivery?.address || "Current location",
    latitude: Number(groceryDelivery?.latitude || 17.3898),
    longitude: Number(groceryDelivery?.longitude || 78.4989),
  }), [groceryDelivery?.address, groceryDelivery?.latitude, groceryDelivery?.longitude]);
  const homeMapCoordinate = useMemo(() => ({
    latitude: Number(groceryDelivery?.latitude || 17.3898),
    longitude: Number(groceryDelivery?.longitude || 78.4989),
  }), [groceryDelivery?.latitude, groceryDelivery?.longitude]);
  const groceryCouponCartTotal = useMemo(() => {
    const checkoutItems = groceryCheckout?.items || [];
    if (checkoutItems.length) {
      return checkoutItems.reduce(
        (sum, item) => sum + Number(item.unit?.price || item.product?.price || 0) * Number(item.quantity || 0),
        0
      );
    }
    return Number(groceryCheckout?.unit?.price || groceryCheckout?.product?.price || 0) * Number(groceryCheckout?.quantity || 0);
  }, [groceryCheckout]);

  const groceryCouponDiscount = useMemo(() => {
    if (!groceryAppliedCoupon) return 0;
    const rawDiscount = groceryAppliedCoupon.discountType === "percent"
      ? Math.round(groceryCouponCartTotal * Number(groceryAppliedCoupon.discountValue || 0) / 100)
      : Number(groceryAppliedCoupon.discountValue || 0);
    return Math.min(Number(groceryAppliedCoupon.maxDiscount || rawDiscount), rawDiscount);
  }, [groceryAppliedCoupon, groceryCouponCartTotal]);

  const groceryPaymentAmount = Math.max(
    1,
    groceryCouponCartTotal + 8 + 10 + (groceryCouponCartTotal >= 99 ? 0 : 20) - groceryCouponDiscount
  );

  const openGroceryAddresses = () => {
    onRefreshGroceryAddresses?.();
    setGroceryAddressOpen(true);
  };

  const applyGroceryAddress = (selection) => {
    if (!selection) return;
    onSelectGroceryAddress?.(selection);
    setGroceryMapAddressOpen(false);
    setGroceryAddressOpen(false);
  };

  const addGroceryAddress = () => {
    setGroceryMapAddressOpen(false);
    setGroceryAddressOpen(false);
    if (onAddGroceryAddress) onAddGroceryAddress();
    else onOpenGroceryAddresses?.();
  };

  useEffect(() => {
    if (!groceryAccessToken) return;
    registerOrderPushNotifications(groceryAccessToken).catch(() => undefined);
  }, [groceryAccessToken]);

  useEffect(() => {
    if (!isGroceryMode || !groceryDelivery?.latitude || !groceryDelivery?.longitude) return undefined;
    let cancelled = false;
    setGroceryServiceability(null);
    checkGroceryServiceability(groceryDelivery.latitude, groceryDelivery.longitude)
      .then((result) => {
        if (!cancelled) setGroceryServiceability(result);
      })
      .catch((error) => {
        if (!cancelled) setGroceryServiceability({ serviceable: false, message: error?.message || "Unable to check delivery availability" });
      });
    return () => {
      cancelled = true;
    };
  }, [groceryDelivery?.latitude, groceryDelivery?.longitude, isGroceryMode]);

  useEffect(() => {
    if (!isGroceryMode || !groceryServiceability) return undefined;
    if (!groceryServiceability.serviceable) {
      setGroceryCatalogProducts([]);
      return undefined;
    }

    let cancelled = false;
    fetchGroceryCatalog(groceryServiceability.store?.id)
      .then((catalog) => {
        if (cancelled) return;
        const products = (catalog?.stores || []).flatMap((store) =>
          (store.products || []).map((product) => mapBackendGroceryProduct(product, store.id))
        );
        setGroceryCatalogProducts(products);
        setGroceryCatalogCategories((catalog?.categories || []).map((category, index) => ({
          id: category.id,
          label: category.name,
          slug: category.slug,
          bg: ["#FFF0D8", "#EAF4FF", "#E8F7F0", "#FBE5EC"][index % 4],
        })));
      })
      .catch((error) => {
        if (!cancelled) console.warn("Failed to load grocery catalog", error);
      });

    return () => {
      cancelled = true;
    };
  }, [groceryServiceability, isGroceryMode]);

  useEffect(() => {
    if (!isGroceryMode || !groceryAccessToken) return undefined;
    let cancelled = false;
    fetchGroceryCart(groceryAccessToken)
      .then((cart) => {
        if (cancelled) return;
        setRestoredGroceryCartItems((cart?.items || []).map((item) => ({
          product: mapBackendGroceryProduct(item.product, item.product?.storeId || cart.storeId),
          quantity: Number(item.quantity) || 0,
        })));
      })
      .catch((error) => {
        if (!cancelled) console.warn("Failed to restore grocery cart", error);
      });
    return () => {
      cancelled = true;
    };
  }, [groceryAccessToken, isGroceryMode]);

  useEffect(() => () => {
    Object.values(cartPersistTimersRef.current).forEach(clearTimeout);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let checkInFlight = false;

    const checkInternet = async () => {
      if (AppState.currentState !== "active" || checkInFlight) return;

      checkInFlight = true;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      try {
        await fetch("https://clients3.google.com/generate_204", {
          method: "HEAD",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!cancelled) {
          setConnectionStatus("online");
        }
      } catch (error) {
        if (!cancelled) {
          setConnectionStatus("offline");
        }
      } finally {
        checkInFlight = false;
        clearTimeout(timeout);
      }
    };

    checkInternet();
    const interval = setInterval(checkInternet, 30000);
    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") checkInternet();
    });

    return () => {
      cancelled = true;
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (groceryCheckout) {
      NativeStatusBar.setBarStyle("dark-content", true);
      NativeStatusBar.setTranslucent?.(false);
      NativeStatusBar.setBackgroundColor?.("#FFFFFF", true);

      return;
    }

    NativeStatusBar.setBarStyle("dark-content", true);
    NativeStatusBar.setTranslucent?.(!isGroceryMode);
    NativeStatusBar.setBackgroundColor?.(
      isGroceryMode
        ? groceryHeroColor
        : selectedGroceryProduct
          ? "#F6F7F7"
          : "transparent",
      true
    );
  }, [groceryCheckout, groceryHeroColor, isGroceryMode, selectedGroceryProduct]);

  useEffect(() => {
    if (connectionStatus === "checking") {
      previousConnectionStatusRef.current = connectionStatus;
      return;
    }

    if (previousConnectionStatusRef.current === "checking") {
      previousConnectionStatusRef.current = connectionStatus;
      return;
    }

    if (previousConnectionStatusRef.current === connectionStatus) {
      return;
    }

    previousConnectionStatusRef.current = connectionStatus;
    setConnectionBannerVisible(true);
    screenRevealY.stopAnimation();
    Animated.sequence([
      Animated.spring(screenRevealY, {
        toValue: 72,
        damping: 18,
        stiffness: 170,
        mass: 0.9,
        useNativeDriver: false,
      }),
      Animated.delay(1700),
      Animated.timing(screenRevealY, {
        toValue: 0,
        duration: 360,
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setConnectionBannerVisible(false);
      }
    });
  }, [screenRevealY, connectionStatus]);

  useEffect(() => {
    if (!isGroceryMode) return;
    homePanelDragY.stopAnimation();
    homePanelDragY.setValue(0);
  }, [homePanelDragY, isGroceryMode]);

  useEffect(() => {
    if (isGroceryMode || homePanelHintPlayedRef.current) return undefined;

    homePanelHintPlayedRef.current = true;
    homePanelDragY.stopAnimation();
    homePanelDragY.setValue(0);
    homePanelDragStartRef.current = 0;
    setHomePanelDragging(true);

    const hintAnimation = Animated.sequence([
      Animated.delay(260),
      Animated.timing(homePanelDragY, {
        toValue: HOME_PANEL_REVEAL,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.delay(3300),
      Animated.spring(homePanelDragY, {
        toValue: 0,
        stiffness: 155,
        damping: 24,
        mass: 0.92,
        overshootClamping: true,
        restDisplacementThreshold: 0.4,
        restSpeedThreshold: 0.4,
        useNativeDriver: false,
      }),
    ]);
    homePanelHintAnimationRef.current = hintAnimation;

    hintAnimation.start(() => {
      homePanelHintAnimationRef.current = null;
      homePanelDragY.setValue(0);
      homePanelDragStartRef.current = 0;
      setHomePanelDragging(false);
      setHomeSurfaceResetKey((current) => current + 1);
    });

    return () => {
      hintAnimation.stop();
      homePanelHintAnimationRef.current = null;
      homePanelDragY.setValue(0);
      homePanelDragStartRef.current = 0;
    };
  }, [homePanelDragY, isGroceryMode]);

  useEffect(() => {
    if (isGroceryMode || !homeOpeningPromoVisible) return undefined;

    homeOpeningPromoOpacity.setValue(1);
    const timeout = setTimeout(() => {
      homePanelHintAnimationRef.current?.stop();
      homePanelHintAnimationRef.current = null;
      Animated.timing(homeOpeningPromoOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        homePanelDragY.stopAnimation();
        homePanelDragY.setValue(0);
        homePanelDragStartRef.current = 0;
        setHomePanelDragging(false);
        setHomeOpeningPromoVisible(false);
        setHomeSurfaceResetKey((current) => current + 1);
      });
    }, 5000);

    return () => clearTimeout(timeout);
  }, [
    homeOpeningPromoOpacity,
    homeOpeningPromoVisible,
    homePanelDragY,
    isGroceryMode,
  ]);

  const tabsCollapseStyle = {
    opacity: scrollY.interpolate({
      inputRange: [0, 16, 48],
      outputRange: [1, 0.72, 0],
      extrapolate: "clamp",
    }),
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 72],
          outputRange: [0, -8],
          extrapolate: "clamp",
        }),
      },
      {
        scale: scrollY.interpolate({
          inputRange: [0, 72],
          outputRange: [1, 0.97],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  const unifiedTabsFadeStyle = {
    opacity: scrollY.interpolate({
      inputRange: [0, 16, 48],
      outputRange: [1, 0.72, 0],
      extrapolate: "clamp",
    }),
  };

  const searchCardStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 24, 64, 104],
          outputRange: [0, -8, -22, -30],
          extrapolate: "clamp",
        }),
      },
      {
        scale: scrollY.interpolate({
          inputRange: [0, 64, 104],
          outputRange: [1, 0.994, 0.988],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  const scrolledSearchShellStyle = {
    opacity: scrollY.interpolate({
      inputRange: [0, 28, 72],
      outputRange: [0, 0.36, 1],
      extrapolate: "clamp",
    }),
  };

  const floatingHeaderBackdropStyle = isGroceryMode
    ? {
        opacity: 1,
        transform: [
          {
            translateY: scrollY.interpolate({
              inputRange: [0, 24, 64, 112],
              outputRange: [0, -14, -40, -62],
              extrapolate: "clamp",
            }),
          },
        ],
      }
    : {
        opacity: scrollY.interpolate({
          inputRange: [0, 18, 52],
          outputRange: [0.94, 0.98, 1],
          extrapolate: "clamp",
        }),
        transform: [
          {
            translateY: scrollY.interpolate({
              inputRange: [0, 24, 64, 112],
              outputRange: [0, -14, -40, -62],
              extrapolate: "clamp",
            }),
          },
        ],
      };

  const parcelHeaderStackStyle = {
    opacity: scrollY.interpolate({
      inputRange: [0, 32, 84],
      outputRange: [1, 0.97, 0.9],
      extrapolate: "clamp",
    }),
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 24, 64, 112],
          outputRange: [0, -14, -40, -62],
          extrapolate: "clamp",
        }),
      },
      {
        scale: scrollY.interpolate({
          inputRange: [0, 64, 104],
          outputRange: [1, 0.994, 0.988],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  // Keep the scrolling content attached to the moving header. Previously only
  // Grocery used this lift, so Ride/Parcel left the header's original layout
  // space behind as a large white panel when the header translated upward.
  const scrollViewHeaderLiftStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 24, 64, 112],
          outputRange: [0, -14, -40, -62],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  const tabItems = useMemo(() => Object.entries(MODE_CONFIG), []);
  const activeTabIndex = tabItems.findIndex(([key]) => key === activeMode);

  React.useEffect(() => {
    const availableMode = !GROCERY_RELEASE_ENABLED && mode === "grocery" ? "ride" : mode;
    setActiveMode(availableMode);
    setContentMode(availableMode);
    scrollY.setValue(0);
    statusBarStyleRef.current = "light";
    setStatusBarStyle("light");
    requestAnimationFrame(() => homeScrollRef.current?.scrollTo({ y: 0, animated: false }));
  }, [mode, scrollY]);

  React.useEffect(() => {
    headerEnterAnim.stopAnimation();
    modeEnterAnim.stopAnimation();
    headerEnterAnim.setValue(0);
    modeEnterAnim.setValue(0);
    Animated.parallel([
      Animated.timing(headerEnterAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(modeEnterAnim, {
        toValue: 1,
        duration: 440,
        delay: 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerEnterAnim, mode, modeEnterAnim]);

  React.useEffect(() => {
    Animated.spring(activeUnderlineX, {
      toValue: activeTabIndex * TAB_WIDTH,
      useNativeDriver: true,
      damping: 22,
      stiffness: 155,
      mass: 0.95,
    }).start();
  }, [activeTabIndex, activeUnderlineX]);




  const handleScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: (event) => {
          const y = event.nativeEvent.contentOffset.y;
          const nextRideHeaderCollapsed = y > 44;
          if (isRideMode && rideHeaderCollapsedRef.current !== nextRideHeaderCollapsed) {
            rideHeaderCollapsedRef.current = nextRideHeaderCollapsed;
            setRideHeaderCollapsed(nextRideHeaderCollapsed);
          }
          const nextStatusBarStyle = y > 58 ? "dark" : "light";
          if (statusBarStyleRef.current !== nextStatusBarStyle) {
            statusBarStyleRef.current = nextStatusBarStyle;
            setStatusBarStyle(nextStatusBarStyle);
          }
        },
      }),
    [isRideMode, scrollY]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshHome?.();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRoutePress = () => onSearchPress?.();
  const openGrocerySearch = () => setGrocerySearchOpen(true);
  const closeGrocerySearch = () => {
    setGrocerySearchOpen(false);
    setGrocerySearchQuery("");
  };
  const openGroceryCategory = (item, sectionTitle) => {
    setSelectedGroceryCategoryCard({ ...item, sectionTitle });
    setGroceryCategoryOpen(true);
  };
  const handleGroceryCategorySelect = (key) => {
    setSelectedGroceryCategory(key);
    requestAnimationFrame(() => homeScrollRef.current?.scrollTo({ y: 0, animated: false }));
  };
  const closeGroceryCategory = () => {
    setGroceryCategoryOpen(false);
    setSelectedGroceryCategoryCard(null);
  };
  const openGroceryProduct = (product) => {
    setGroceryProductHeaderScrolled(false);
    setSelectedGroceryProduct(product);
  };
  const closeGroceryProduct = () => {
    setGroceryProductHeaderScrolled(false);
    setSelectedGroceryProduct(null);
  };
  const openGroceryCheckout = ({ product, unit, quantity, items }) => {
    if (items?.length) {
      setGroceryCheckout({ product, unit, quantity, items });
      return;
    }

    const nextItems = [...groceryCartItems];
    if (product) {
      const productId = product.id || `detail-${product.name}`;
      const existingIndex = nextItems.findIndex((item) => (item.product?.id || `detail-${item.product?.name}`) === productId);
      const nextItem = { product, unit, quantity: Math.max(1, Number(quantity) || 1) };
      if (existingIndex >= 0) nextItems[existingIndex] = nextItem;
      else nextItems.push(nextItem);
    }

    setGroceryCheckout({ product, unit, quantity, items: nextItems });
  };
  const handleGroceryCartChange = ({ total, product, items = [], animate }) => {
    setGroceryCartTotal(total);
    setGroceryCartItems(items);

    if (total <= 0) {
      setGroceryCartPreview(null);
      groceryCartFlyAnim.stopAnimation();
      groceryCartPillAnim.stopAnimation();
      groceryCartFlyAnim.setValue(0);
      groceryCartPillAnim.setValue(0);
      return;
    }

    if (product) {
      setGroceryCartPreview(product);
    }

    if (!animate || !product) {
      groceryCartPillAnim.setValue(1);
      return;
    }

    groceryCartFlyAnim.stopAnimation();
    groceryCartPillAnim.stopAnimation();
    groceryCartFlyAnim.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(groceryCartFlyAnim, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(groceryCartFlyAnim, {
          toValue: 0,
          duration: 90,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(170),
        Animated.spring(groceryCartPillAnim, {
          toValue: 1,
          damping: 12,
          stiffness: 190,
          mass: 0.75,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };
  const persistGroceryCartItem = (product, quantity) => {
    if (!groceryAccessToken || !product?.backendProductId) return;
    const productId = product.backendProductId;
    pendingCartQuantitiesRef.current[productId] = Math.max(0, Number(quantity) || 0);
    clearTimeout(cartPersistTimersRef.current[productId]);
    cartPersistTimersRef.current[productId] = setTimeout(() => {
      const pendingQuantity = pendingCartQuantitiesRef.current[productId];
      setGroceryCartItem(groceryAccessToken, productId, pendingQuantity)
        .catch((error) => Alert.alert("Cart not updated", error?.message || "Please try again."));
      delete cartPersistTimersRef.current[productId];
      delete pendingCartQuantitiesRef.current[productId];
    }, 220);
  };
  const openGroceryCartPreview = () => {
    if (!groceryCartPreview || groceryCartTotal <= 0) return;

    openGroceryCheckout({
      product: groceryCartPreview,
      unit: {
        qty: groceryCartPreview.qty,
        price: groceryCartPreview.price,
        mrp: groceryCartPreview.mrp,
        discount: groceryCartPreview.discount,
      },
      quantity: groceryCartTotal,
      items: groceryCartItems,
    });
  };
  const closeGroceryCheckout = () => {
    if (groceryOrder?.id && groceryAccessToken && !groceryOrderSuccessOpen) {
      cancelUnpaidGroceryOrder(groceryAccessToken, groceryOrder.id)
        .catch((error) => console.warn("Failed to release unpaid grocery order", error));
    }
    setGroceryPaymentOpen(false);
    setGroceryOrderSuccessOpen(false);
    setGroceryOrderTrackingOpen(false);
    setGroceryRatingOpen(false);
    setGroceryRatingData(null);
    setGroceryCancelOrderOpen(false);
    setGroceryRefundOpen(false);
    setGroceryCancellationData(null);
    setGrocerySubstitutionReview(null);
    setGroceryCheckout(null);
    setGroceryOrder(null);
  };
  const openGroceryOrderTracking = () => {
    setGroceryOrderSuccessOpen(false);
    setGroceryOrderTrackingOpen(true);
  };
  const openGroceryRating = (ratingData = {}) => {
    setGroceryRatingData(ratingData);
    setGroceryOrderTrackingOpen(false);
    setGroceryRatingOpen(true);
  };
  const finishGroceryRating = () => {
    setGroceryRatingOpen(false);
    setGroceryRatingData(null);
    setGroceryCheckout(null);
    setGroceryOrder(null);
  };
  const submitGroceryItemIssue = async (report) => {
    const activeOrderId = groceryOrder?.id;
    if (!groceryAccessToken || !activeOrderId || String(activeOrderId).startsWith("demo-")) return;
    await createGrocerySupportRequest(groceryAccessToken, activeOrderId, {
      category: "ITEM_ISSUE",
      message: `${report.issueType}: ${report.items.map((item) => item.name).join(", ")}. Resolution: ${report.resolution}. ${report.note || ""}`.trim(),
    });
  };
  const openGroceryCancellation = (trackingData = {}) => {
    setGroceryCancellationData({
      items: trackingData.items || groceryOrder?.items || groceryCheckout?.items || [],
      total: trackingData.total || groceryOrder?.total || groceryPaymentAmount,
      paymentMethod: trackingData.paymentMethod || groceryOrder?.paymentMethod || "UPI",
    });
    setGroceryOrderTrackingOpen(false);
    setGroceryCancelOrderOpen(true);
  };
  const returnToGroceryTracking = () => {
    setGroceryCancelOrderOpen(false);
    setGroceryOrderTrackingOpen(true);
  };
  const finishGroceryCancellation = (result) => {
    setGroceryCancellationData((current) => ({ ...current, ...result }));
    setGroceryOrderTrackingOpen(false);
    setGroceryCancelOrderOpen(false);
    setGroceryRefundOpen(false);
    setGroceryCheckout(null);
    setGroceryOrder(null);
  };
  const closeGroceryRefund = () => {
    setGroceryRefundOpen(false);
    setGroceryOrderTrackingOpen(false);
    setGroceryCancellationData(null);
    setGroceryCheckout(null);
    setGroceryOrder(null);
  };
  const openGroceryPayment = async () => {
    if (!groceryAccessToken) {
      setGroceryPaymentError("");
      setGroceryPaymentOpen(true);
      return;
    }
    if (!groceryServiceability?.serviceable) {
      Alert.alert("Delivery unavailable", groceryServiceability?.message || "Frezo is not delivering to this address yet.");
      return;
    }
    try {
      const checkoutItems = groceryCheckout?.items || [];
      const pendingEntries = Object.entries(pendingCartQuantitiesRef.current);
      pendingEntries.forEach(([productId]) => clearTimeout(cartPersistTimersRef.current[productId]));
      pendingCartQuantitiesRef.current = {};
      cartPersistTimersRef.current = {};
      await Promise.all([
        ...pendingEntries.map(([productId, quantity]) => setGroceryCartItem(groceryAccessToken, productId, quantity)),
        ...checkoutItems
        .filter((item) => item.product?.backendProductId)
        .map((item) => setGroceryCartItem(
          groceryAccessToken,
          item.product.backendProductId,
          Math.max(0, Number(item.quantity) || 0)
        )),
      ]);
      const validation = await validateGroceryCart(groceryAccessToken);
      if (!validation?.valid) {
        setGrocerySubstitutionReview({
          issues: validation?.issues || [],
          cartItems: checkoutItems,
        });
        return;
      }
      setGroceryPaymentOpen(true);
    } catch (error) {
      Alert.alert("Unable to validate cart", error?.message || "Please check your connection and try again.");
    }
  };
  const applyGrocerySubstitution = async ({ updatedItems, unavailableProduct, substitute, quantity }) => {
    const nextItems = updatedItems || [];
    setGroceryCheckout((current) => current ? { ...current, items: nextItems, revision: Date.now() } : current);
    setGroceryCartItems(nextItems);
    setGrocerySubstitutionReview(null);

    if (!groceryAccessToken) return;
    const unavailableId = unavailableProduct?.backendProductId || unavailableProduct?.id;
    const substituteId = substitute?.backendProductId || substitute?.id;
    try {
      await Promise.all([
        unavailableId ? setGroceryCartItem(groceryAccessToken, unavailableId, 0) : Promise.resolve(),
        substituteId ? setGroceryCartItem(groceryAccessToken, substituteId, Math.max(1, Number(quantity) || 1)) : Promise.resolve(),
      ]);
    } catch (error) {
      Alert.alert("Cart update pending", error?.message || "The substitution is shown locally but could not be synced yet.");
    }
  };
  const closeGroceryPayment = () => {
    setGroceryPaymentError("");
    setGroceryPaymentOpen(false);
  };
  const showGroceryOrderSuccess = async (paymentMethod) => {
    if (isPlacingGroceryOrder) return;
    if (!groceryAccessToken) {
      setIsPlacingGroceryOrder(true);
      setGroceryPaymentError("");
      const demoOrder = {
        id: `demo-${Date.now()}`,
        status: "CONFIRMED",
        total: groceryCheckout?.items?.reduce(
          (sum, item) => sum + Number(item.unit?.price || item.product?.price || 0) * Math.max(1, Number(item.quantity) || 1),
          0
        ) || 0,
      };
      setGroceryOrder(demoOrder);
      setTimeout(() => {
        setGroceryPaymentOpen(false);
        setGroceryOrderSuccessOpen(true);
        setIsPlacingGroceryOrder(false);
      }, 350);
      return;
    }

    const checkoutItems = groceryCheckout?.items || [];
    const unavailableItem = checkoutItems.find((item) => !item.product?.backendProductId || !item.product?.storeId);
    if (!checkoutItems.length || unavailableItem) {
      Alert.alert(
        "Item unavailable",
        unavailableItem
          ? `${unavailableItem.product?.name || "An item"} is not currently available from the live store catalog.`
          : "Your cart is empty."
      );
      return;
    }

    const storeId = checkoutItems[0].product.storeId;
    if (checkoutItems.some((item) => item.product.storeId !== storeId)) {
      Alert.alert("Separate orders needed", "Items from different stores must be ordered separately.");
      return;
    }

    setIsPlacingGroceryOrder(true);
    setGroceryPaymentError("");
    try {
      let order = groceryOrder;
      if (!order) {
        const created = await createGroceryOrder(groceryAccessToken, {
          sourceApp: "FREZO_APP",
          storeId,
          deliveryAddress: groceryDelivery?.address || "Current location",
          deliveryLat: Number(groceryDelivery?.latitude || 17.3898),
          deliveryLng: Number(groceryDelivery?.longitude || 78.4989),
          items: checkoutItems.map((item) => ({
            productId: item.product.backendProductId,
            quantity: Math.max(1, Number(item.quantity) || 1),
          })),
        });
        order = created?.order;
        setGroceryOrder(order || null);
      }
      if (!order?.id) throw new Error("Unable to create grocery order");

      const paymentOrder = await createPaymentOrder(groceryAccessToken, {
        sourceApp: "FREZO_APP",
        orderType: "GROCERY",
        orderId: order.id,
        provider: resolveGroceryPaymentProvider(paymentMethod),
        amount: Number(order.total || 1),
        currency: "INR",
        description: `Frezo order ${order.id.slice(-8)}`,
        idempotencyKey: `grocery-${order.id}-${paymentMethod?.key || "payment"}-${Date.now()}`,
      });

      let paymentResult = paymentOrder;
      if (paymentOrder?.requiresGateway) {
        const checkoutResult = await openCashfreeCheckout(paymentOrder);
        paymentResult = await verifyPayment(groceryAccessToken, {
          paymentId: paymentOrder.paymentId,
          gateway: paymentOrder.gateway,
          gatewayOrderId: checkoutResult?.orderId || paymentOrder.orderId,
        });
      } else if (paymentOrder?.gateway === "mock") {
        paymentResult = await verifyPayment(groceryAccessToken, {
          paymentId: paymentOrder.paymentId,
          gateway: "mock",
          gatewayOrderId: paymentOrder.orderId,
        });
      }

      if (paymentResult?.status === "AUTHORIZED" && paymentOrder?.paymentId) {
        for (let attempt = 0; attempt < 4 && paymentResult?.status !== "PAID"; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          paymentResult = await fetchPaymentStatus(groceryAccessToken, paymentOrder.paymentId);
        }
      }

      if (paymentResult?.status !== "PAID") {
        setGroceryPaymentError("Payment is pending confirmation. You can retry or choose another method.");
        return;
      }

      setGroceryPaymentOpen(false);
      setGroceryOrderSuccessOpen(true);
      setGroceryCartItems([]);
      setGroceryCartTotal(0);
      setGroceryCartPreview(null);
      setRestoredGroceryCartItems([]);
      setGroceryCartResetKey((value) => value + 1);
    } catch (error) {
      const message = error?.message || "Payment could not be completed. Please try again.";
      setGroceryPaymentError(message);
      Alert.alert("Payment unsuccessful", `${message}\n\nYour order has not been dispatched. You can retry safely.`);
    } finally {
      setIsPlacingGroceryOrder(false);
    }
  };
  const openGroceryWishlist = () => {
    setGroceryWishlistOpen(true);
  };
  const closeGroceryWishlist = () => {
    setGroceryWishlistOpen(false);
  };
  const openSearchFromCategory = () => {
    setGroceryCategoryOpen(false);
    setGrocerySearchQuery(selectedGroceryCategoryCard?.label || "");
    setGrocerySearchOpen(true);
  };
  const openSearchFromProduct = () => {
    setSelectedGroceryProduct(null);
    setGrocerySearchQuery(selectedGroceryProduct?.name || "");
    setGrocerySearchOpen(true);
  };

  const modeContentStyle = {
    opacity: modeEnterAnim.interpolate({
      inputRange: [0, 0.45, 1],
      outputRange: [0.35, 0.82, 1],
    }),
    transform: [
      {
        translateY: modeEnterAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
      {
        scale: modeEnterAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.992, 1],
        }),
      },
    ],
  };

  const headerEnterStyle = {
    opacity: headerEnterAnim,
    transform: [
      {
        translateY: headerEnterAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-10, 0],
        }),
      },
    ],
  };

  const switchMode = (nextMode) => {
    if (nextMode === "grocery" && !GROCERY_RELEASE_ENABLED) return;
    if (nextMode === activeMode && nextMode === contentMode) {
      return;
    }

    // Each mode opens from a clean top state. Fading the shared content here
    // briefly washed out Grocery while the previous mode's scroll value settled.
    homeScrollRef.current?.scrollTo({ y: 0, animated: false });
    scrollY.setValue(0);
    statusBarStyleRef.current = "light";
    setStatusBarStyle("light");
    setActiveMode(nextMode);
    setContentMode(nextMode);
    onModeChange?.(nextMode);
  };

  const handleTilePress = (item, row = "quick") => {
    if (isRideMode && row === "quick") {
      onRideCardPress?.(item);
      return;
    }

    onQuickServicePress?.({ ...item, mode: activeMode, row });
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      {groceryCheckout ? (
        <StatusBar
          style="dark"
          backgroundColor="#FFFFFF"
          translucent={false}
          animated
        />
      ) : selectedGroceryProduct ? null : (
        <StatusBar
          style="dark"
          backgroundColor={isGroceryMode ? groceryHeroColor : "transparent"}
          translucent={!isGroceryMode}
          animated
        />
      )}
      {connectionBannerVisible ? (
        <View
          pointerEvents="none"
          style={[
            styles.connectionBanner,
            isConnectionOnline ? styles.connectionBannerOnline : styles.connectionBannerOffline,
          ]}
        >
          <View style={styles.connectionCopy}>
            <Text style={styles.connectionTitle}>
              {isConnectionOnline ? "Online and ready" : "You’re offline"}
            </Text>
            <Text style={styles.connectionSubtitle}>
              {isConnectionOnline ? "Book rides and parcels without interruption" : "Check your connection to continue"}
            </Text>
          </View>
          <AppIcon name={isConnectionOnline ? "wifi" : "wifi-off"} size={28} color="#FFFFFF" />
        </View>
      ) : null}
      {!isGroceryMode ? (
        <View style={styles.homeRevealBackdrop}>
          <MapView
            key={`${homeMapCoordinate.latitude}-${homeMapCoordinate.longitude}`}
            style={styles.homeRevealMap}
            initialRegion={{
              ...homeMapCoordinate,
              latitudeDelta: 0.028,
              longitudeDelta: 0.028,
            }}
            toolbarEnabled={false}
            liteMode
            rotateEnabled={false}
            pitchEnabled={false}
            showsCompass={false}
            showsMyLocationButton={false}
          >
            <Marker coordinate={homeMapCoordinate}>
              <View style={styles.homeMapPinOuter}>
                <View style={styles.homeMapPinInner} />
              </View>
            </Marker>
          </MapView>
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0)", "rgba(15,23,42,0.14)"]}
            locations={[0, 0.62, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          {homeOpeningPromoVisible ? (
          <AnimatedPressable
            style={[styles.homeMajorOffer, { opacity: homeOpeningPromoOpacity }]}
            onPress={() => (
              isParcelMode
                ? onQuickServicePress?.({ key: "parcel", mode: activeMode })
                : onRideCardPress?.({ key: "cab", mode: activeMode })
            )}
          >
            <LinearGradient
              pointerEvents="none"
              colors={isParcelMode ? ["#FFF5DE", "#FFFFFF"] : ["#E8F3FF", "#FFFFFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.homeMajorOfferCopy}>
              <Text style={styles.homeMajorOfferEyebrow}>RYDEX EXCLUSIVE</Text>
              <Text style={styles.homeMajorOfferTitle}>
                {isParcelMode ? "Send more for less with fast parcel delivery" : "Save 20% on your next airport ride"}
              </Text>
              <Text style={styles.homeMajorOfferAction}>
                {isParcelMode ? "Send a parcel" : "View offer"}
              </Text>
            </View>
            <Image
              source={
                isParcelMode
                  ? require("../../assets/vehicles/ride-your-way-parcel.png")
                  : require("../../assets/vehicles/choose-car.png")
              }
              resizeMode="contain"
              style={styles.homeMajorOfferVehicle}
            />
          </AnimatedPressable>
          ) : null}
        </View>
      ) : null}
      <Animated.View
        key={`home-surface-${homeSurfaceResetKey}`}
        collapsable={false}
        style={[
          styles.screenRevealLayer,
          !isGroceryMode && (homePanelDragging || connectionBannerVisible) && styles.screenRevealLayerDragging,
          isGroceryMode
            ? { top: screenRevealY }
            : (homePanelDragging || connectionBannerVisible)
              ? { top: Animated.add(screenRevealY, homePanelDragY) }
              : null,
        ]}
      >
        {!isGroceryMode && (homePanelDragging || connectionBannerVisible) ? (
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(255,255,255,1)", "rgba(255,255,255,0.72)", "rgba(255,255,255,0)"]}
            locations={[0, 0.34, 1]}
            style={styles.screenRevealTopGlow}
          />
        ) : null}
      <Animated.View
        {...(!isGroceryMode ? homePanelPanResponder.panHandlers : {})}
        style={[
          styles.topShell,
          isGroceryMode && styles.topShellGrocery,
          !isGroceryMode && styles.topShellParcel,
        ]}
      >
        {!isGroceryMode ? (
          <LinearGradient
            pointerEvents="none"
            colors={["#E0E7FF", "#EEF2FF", "#FFFFFF"]}
            locations={[0, 0.48, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        ) : null}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.floatingHeaderBackdrop,
            isGroceryMode && styles.groceryFloatingHeaderBackdrop,
            isGroceryMode && { backgroundColor: groceryHeroColor },
            floatingHeaderBackdropStyle
          ]}
        />
        <Animated.View
          style={[
          styles.parcelHeaderStack,
          !isGroceryMode && styles.serviceHeaderStack,
          isGroceryMode && { backgroundColor: groceryHeroColor },
            isGroceryMode && parcelHeaderStackStyle,
          ]}
        >
          <Animated.View style={headerEnterStyle}>
            {isGroceryMode ? (
              <View style={[styles.groceryHeaderBlock, { backgroundColor: groceryHeroColor }]}>
                <View style={[styles.deliveryHeaderRow, styles.groceryDeliveryHeaderRow]}>
                  <DeliveryHeaderCopy
                    eta={groceryServiceability ? (groceryServiceability.serviceable ? groceryServiceability.etaLabel : "Unavailable") : "Checking…"}
                    address={groceryDelivery?.address || "Current location"}
                    onPress={openGroceryAddresses}
                  />
                  <View style={styles.groceryHeaderActions}>
                    <Pressable
                      style={[styles.groceryHeaderIconButton, { borderColor: `${groceryHeroInk}80` }]}
                      onPress={() => onQuickServicePress?.({ key: "profile", mode: "grocery" })}
                      hitSlop={8}
                    >
                      <AppIcon name="account" size={19} color={groceryHeroInk} />
                    </Pressable>
                    <Pressable
                      style={[styles.groceryHeaderIconButton, { borderColor: `${groceryHeroInk}80` }]}
                      onPress={openGroceryWishlist}
                      hitSlop={8}
                    >
                      <AppIcon name="heart-outline" size={19} color={groceryHeroInk} />
                    </Pressable>
                  </View>
                </View>
                <GroceryHeaderSearchRow
                  onSearchPress={openGrocerySearch}
                  onWishlistPress={openGroceryWishlist}
                />
                <GroceryCategorySelector
                  value={selectedGroceryCategory}
                  onChange={handleGroceryCategorySelect}
                  heroColor={groceryHeroColor}
                  inkColor={groceryHeroInk}
                />
              </View>
            ) : (
              <>
                <View style={styles.deliveryHeaderRow}>
                  <DeliveryHeaderCopy
                    eta={isRideMode ? "Pickup in 6 mins" : "Parcel pickup"}
                    address={groceryDelivery?.address || "Current location"}
                    addressLabel="Pickup from"
                    onPress={onSearchPress}
                    accentEta
                  />

                  <Pressable
                    style={styles.parcelHelpChip}
                    accessibilityRole="button"
                    accessibilityLabel="Open profile"
                    onPress={onProfilePress}
                  >
                    <AppIcon name="account-outline" size={20} color="#252A31" />
                  </Pressable>
                </View>

                <View style={styles.parcelTopSearchCardWrap}>
                  <View style={[styles.rideSearchRow, styles.searchBarForeground]}>
                    <Pressable style={[styles.searchCard, styles.rideSearchCard]} onPress={onSearchPress}>
                      <AppIcon name="magnify" size={25} color="#111111" />
                      <AnimatedSearchPrompt />
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        ref={homeScrollRef}
        style={scrollViewHeaderLiftStyle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isRideMode && styles.rideScrollContent,
          isRideMode && rideHeaderCollapsed && styles.rideScrollContentCollapsed,
          isGroceryMode && styles.groceryScrollContent,
          (isParcelMode || isGroceryMode) && styles.parcelScrollContent,
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="normal"
        overScrollMode="never"
      >
        {isRideMode ? (
          <>
            <Animated.View style={[styles.homeModeContent, rideHeaderCollapsed && styles.homeModeContentCollapsed, modeContentStyle]}>
            <View style={styles.recentsWrap}>
              {RECENTS.map((item, index) => (
                <React.Fragment key={item.title}>
                  <Pressable
                    style={({ pressed }) => [styles.recentRow, pressed && styles.recentRowPressed]}
                    onPress={handleRoutePress}
                  >
                    <View style={styles.recentIconWell}>
                      <AppIcon name={item.icon} size={20} color="#343A44" />
                    </View>
                    <View style={styles.recentCopy}>
                      <Text style={styles.recentText} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.recentSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                    </View>
                    <AppIcon name="chevron-right" size={19} color="#A0A5AE" />
                  </Pressable>
                  {index < RECENTS.length - 1 ? <View style={styles.recentDivider} /> : null}
                </React.Fragment>
              ))}
            </View>

            <View style={styles.rideSectionHeader}>
              <Text style={styles.rideSectionTitle}>Ride your way</Text>
            </View>
            <View style={styles.rideServiceBento}>
              {RIDE_SERVICE_ROWS.map((row, rowIndex) => (
                <View key={`service-row-${rowIndex}`} style={styles.rideServiceBentoRow}>
                  {row.map((item) => (
                    <Pressable
                      key={item.key}
                      style={({ pressed }) => [
                        styles.rideServiceBentoCard,
                        { flex: item.flex, backgroundColor: item.tone },
                        pressed && styles.rideCardPressed,
                      ]}
                      onPress={() => handleTilePress(item, item.row)}
                    >
                      <LinearGradient
                        pointerEvents="none"
                        colors={["#EAF5FF", "#F3F7FA", "#F7F7F8"]}
                        locations={[0, 0.44, 1]}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={styles.rideServiceBentoCopy}>
                        <Text style={styles.rideServiceBentoTitle}>{item.label}</Text>
                        <Text style={styles.rideServiceBentoSubtitle} numberOfLines={2}>
                          {item.subtitle}
                        </Text>
                      </View>
                      {item.image ? (
                        <Image
                          source={item.image}
                          resizeMode="contain"
                          style={[
                            styles.rideServiceBentoImage,
                            item.flex < 1 && styles.rideServiceBentoImageCompact,
                            item.artwork === "bike" && styles.rideServiceBentoImageBike,
                            item.artwork === "parcel" && styles.rideServiceBentoImageParcel,
                            item.artwork === "travel" && styles.rideServiceBentoImageTravel,
                          ]}
                        />
                      ) : (
                        <View style={styles.rideServiceBentoIcon}>
                          <AppIcon name={item.icon} size={30} color="#3730A3" />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>

            <View style={styles.rideSectionHeadingRow}>
              <Text style={styles.rideSectionTitle}>Offers for you</Text>
              <Pressable onPress={() => onQuickServicePress?.({ key: "offers", mode: "ride" })} hitSlop={8}>
                <Text style={styles.rideSeeAllText}>See all</Text>
              </Pressable>
            </View>
            <Pressable
              style={({ pressed }) => [styles.rideOfferCard, pressed && styles.rideCardPressed]}
              onPress={() => onQuickServicePress?.({ key: "offers", mode: "ride" })}
            >
              <LinearGradient
                colors={["#EEF5FF", "#F8FBFF", "#FFFFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.rideOfferIcon}>
                <AppIcon name="ticket-percent-outline" size={24} color="#4F46E5" />
              </View>
              <View style={styles.rideOfferCopy}>
                <Text style={styles.rideOfferTitle}>Save on your next ride</Text>
                <Text style={styles.rideOfferSubtitle}>See available coupons and personalised offers</Text>
              </View>
              <AppIcon name="chevron-right" size={20} color="#667085" />
            </Pressable>

            <View style={styles.promoSectionHeader}>
              <Text style={styles.promoSectionTitle}>Made for the way you move</Text>
              <Text style={styles.promoSectionSubtitle}>More ways to ride, plan and save</Text>
            </View>

            <View style={styles.rideAdViewport}>
              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={RIDE_AD_WIDTH + 12}
                decelerationRate="fast"
                contentContainerStyle={styles.rideAdRail}
              >
                {PROMO_CARDS.map((item) => (
                  <Pressable
                    key={item.key}
                    style={({ pressed }) => [styles.rideAdCard, pressed && styles.rideCardPressed]}
                    onPress={() => handleTilePress(item, "promo")}
                  >
                    <ImageBackground
                      source={item.image}
                      resizeMode="cover"
                      style={styles.rideAdImage}
                      imageStyle={styles.rideAdImageRadius}
                    >
                      <LinearGradient
                        colors={["rgba(7,18,44,0.92)", "rgba(7,18,44,0.64)", "rgba(7,18,44,0.04)"]}
                        locations={[0, 0.54, 1]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.rideAdOverlay}
                      >
                        <Text style={styles.rideAdEyebrow}>{item.eyebrow}</Text>
                        <Text style={styles.rideAdTitle} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.rideAdSubtitle} numberOfLines={2}>{item.subtitle}</Text>
                        <View style={styles.rideAdAction}>
                          <Text style={styles.rideAdActionText}>{item.cta}</Text>
                          <AppIcon name="arrow-right" size={14} color="#12213D" />
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <Pressable
              style={({ pressed }) => [styles.safetySupportCard, pressed && styles.rideCardPressed]}
              onPress={() => onQuickServicePress?.({ key: "safety", mode: "ride" })}
            >
              <View style={styles.safetySupportIcon}>
                <AppIcon name="safety" size={22} color="#4F46E5" />
              </View>
              <View style={styles.safetySupportCopy}>
                <Text style={styles.safetySupportTitle}>Safety and support</Text>
                <Text style={styles.safetySupportSubtitle}>Help is available whenever you ride</Text>
              </View>
              <AppIcon name="chevron-right" size={20} color="#667085" />
            </Pressable>
            </Animated.View>
          </>
        ) : isParcelMode ? (
          <Animated.View style={[styles.homeModeContent, styles.parcelHomeContent, modeContentStyle]}>
            <View style={styles.recentsWrap}>
              {RECENTS.map((item, index) => (
                <React.Fragment key={`parcel-${item.title}`}>
                  <Pressable
                    style={({ pressed }) => [styles.recentRow, pressed && styles.recentRowPressed]}
                    onPress={onSearchPress}
                  >
                    <View style={styles.recentIconWell}>
                      <AppIcon name={item.icon} size={20} color="#343A44" />
                    </View>
                    <View style={styles.recentCopy}>
                      <Text style={styles.recentText} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.recentSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                    </View>
                    <AppIcon name="chevron-right" size={19} color="#A0A5AE" />
                  </Pressable>
                  {index < RECENTS.length - 1 ? <View style={styles.recentDivider} /> : null}
                </React.Fragment>
              ))}
            </View>

            <View style={styles.parcelSectionHeadingRow}>
              <View>
                <Text style={styles.rideSectionTitle}>Choose a vehicle</Text>
                <Text style={styles.parcelSectionCaption}>Matched to your package size</Text>
              </View>
            </View>
            <View style={styles.parcelVehicleRow}>
              {PARCEL_VEHICLES.map((item) => {
                const selected = selectedParcelVehicle === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      setSelectedParcelVehicle(item.id);
                      onSearchPress?.();
                    }}
                    style={({ pressed }) => [
                      styles.vehicleDockCard,
                      styles.parcelVehicleDockCard,
                      selected && styles.vehicleDockCardSelected,
                      pressed && styles.rideCardPressed,
                    ]}
                  >
                    <LinearGradient colors={item.tint} style={StyleSheet.absoluteFillObject} />
                    <View style={styles.vehicleDockTopRow}>
                      <Text style={styles.vehicleDockEta}>{item.eta}</Text>
                      {selected ? <View style={styles.vehicleDockActiveDot} /> : null}
                    </View>
                    <View style={styles.vehicleDockImageWrap}>
                      <Image source={item.image} resizeMode="contain" style={styles.vehicleDockImage} />
                    </View>
                    <Text style={styles.vehicleDockLabel}>{item.title}</Text>
                    <Text style={styles.vehicleDockCaption}>{item.subtitle}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.rideSectionHeadingRow}>
              <Text style={styles.rideSectionTitle}>Offers for parcel</Text>
              <Text style={styles.rideSeeAllText}>See all</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.parcelOfferCard, pressed && styles.rideCardPressed]} onPress={() => onQuickServicePress?.({ key: "offers", mode: "parcel" })}>
              <View style={styles.parcelOfferIcon}>
                <AppIcon name="ticket-percent-outline" size={23} color="#4F46E5" />
              </View>
              <View style={styles.rideOfferCopy}>
                <Text style={styles.rideOfferTitle}>Save on your next delivery</Text>
                <Text style={styles.rideOfferSubtitle}>View available parcel coupons and rewards</Text>
              </View>
              <AppIcon name="chevron-right" size={20} color="#667085" />
            </Pressable>

            <View style={styles.promoSectionHeader}>
              <Text style={styles.promoSectionTitle}>Send with confidence</Text>
              <Text style={styles.promoSectionSubtitle}>Simple delivery for every kind of parcel</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={RIDE_AD_WIDTH + 12} decelerationRate="fast" contentContainerStyle={styles.parcelAdRail}>
              {PARCEL_PROMO_CARDS.map((item, index) => (
                <Pressable key={item.key} style={styles.parcelAdCard} onPress={onSearchPress}>
                  <ImageBackground source={item.image} resizeMode="cover" style={styles.parcelAdImage} imageStyle={styles.parcelAdImageRadius}>
                    <LinearGradient colors={["rgba(8,24,58,0.88)", "rgba(8,24,58,0.42)", "transparent"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.parcelAdOverlay}>
                      <Text style={styles.parcelAdEyebrow}>{index === 0 ? "SAFE DELIVERY" : index === 1 ? "SAME DAY" : "SCHEDULED"}</Text>
                      <Text style={styles.parcelAdTitle}>{index === 0 ? "Documents, delivered safely" : index === 1 ? "Across the city today" : "Plan your delivery ahead"}</Text>
                      <View style={styles.parcelAdCta}><Text style={styles.parcelAdCtaText}>Send now</Text></View>
                    </LinearGradient>
                  </ImageBackground>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable style={styles.parcelProtectionCard} onPress={() => onQuickServicePress?.({ key: "safety", mode: "parcel" })}>
              <View style={styles.safetySupportIcon}><AppIcon name="shield-check-outline" size={22} color="#4F46E5" /></View>
              <View style={styles.safetySupportCopy}>
                <Text style={styles.safetySupportTitle}>Package protection</Text>
                <Text style={styles.safetySupportSubtitle}>Tracked delivery and verified partners</Text>
              </View>
              <AppIcon name="chevron-right" size={20} color="#667085" />
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.homeModeContent, styles.groceryModeContent, modeContentStyle]}>
            <GroceryHomeContent
              selectedCategory={selectedGroceryCategory}
              onOpenCategory={openGroceryCategory}
              onOpenProduct={openGroceryProduct}
              onCartChange={handleGroceryCartChange}
              catalogProducts={groceryCatalogProducts}
              catalogCategories={groceryCatalogCategories}
              initialCartItems={restoredGroceryCartItems}
              onPersistCartItem={persistGroceryCartItem}
              cartResetKey={groceryCartResetKey}
              deliveryAddress={groceryDelivery?.address || "Current location"}
              deliveryEta={groceryServiceability?.etaLabel || "6 mins"}
            />
          </Animated.View>
        )}

        <View
          style={[
            styles.bottomSpacer,
            !isGroceryMode && styles.bottomSpacerCompact,
          ]}
        />
      </Animated.ScrollView>
      </Animated.View>

      {isGroceryMode && groceryCartPreview && groceryCartTotal > 0 ? (
        <View pointerEvents="box-none" style={styles.groceryCartOverlay}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.groceryCartFlyingThumb,
              {
                opacity: groceryCartFlyAnim.interpolate({
                  inputRange: [0, 0.08, 0.76, 1],
                  outputRange: [0, 1, 1, 0],
                }),
                transform: [
                  {
                    translateY: groceryCartFlyAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-260, 0],
                    }),
                  },
                  {
                    translateX: groceryCartFlyAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [68, 0],
                    }),
                  },
                  {
                    scale: groceryCartFlyAnim.interpolate({
                      inputRange: [0, 0.45, 1],
                      outputRange: [0.72, 1.08, 0.58],
                    }),
                  },
                ],
              },
            ]}
          >
            {groceryCartPreview.image ? (
              <Image source={groceryCartPreview.image} style={styles.groceryCartThumbImage} resizeMode="cover" />
            ) : (
              <Text style={styles.groceryCartThumbInitial}>{groceryCartPreview.name?.charAt(0) || "F"}</Text>
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.groceryViewCartPillWrap,
              {
                opacity: groceryCartPillAnim,
                transform: [
                  {
                    translateY: groceryCartPillAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [28, 0],
                    }),
                  },
                  {
                    scale: groceryCartPillAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable style={styles.groceryViewCartPill} onPress={openGroceryCartPreview}>
              <View style={styles.groceryViewCartThumbRing}>
                {groceryCartPreview.image ? (
                  <Image source={groceryCartPreview.image} style={styles.groceryCartThumbImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.groceryCartThumbInitial}>{groceryCartPreview.name?.charAt(0) || "F"}</Text>
                )}
              </View>
              <View style={styles.groceryViewCartCopy}>
                <Text style={styles.groceryViewCartTitle}>View cart</Text>
                <RollingCartCount value={groceryCartTotal} />
              </View>
              <AppIcon name="chevronRight" size={26} color="#FFFFFF" />
            </Pressable>
          </Animated.View>
        </View>
      ) : null}

      <Modal visible={grocerySearchOpen} onRequestClose={closeGrocerySearch}>
        <GrocerySearchScreen
          query={grocerySearchQuery}
          onChangeQuery={setGrocerySearchQuery}
          onClose={closeGrocerySearch}
          onOpenProduct={(product) => {
            closeGrocerySearch();
            openGroceryProduct(product);
          }}
        />
      </Modal>

      <Modal visible={groceryWishlistOpen} onRequestClose={closeGroceryWishlist}>
        <GroceryWishlistScreen onClose={closeGroceryWishlist} />
      </Modal>

      <Modal visible={groceryAddressOpen && !groceryMapAddressOpen} onRequestClose={() => setGroceryAddressOpen(false)} animationType="slide">
        <GroceryAddressSelectionScreen
          currentLocation={currentGroceryAddress}
          savedAddresses={grocerySavedAddresses}
          initialSelection={currentGroceryAddress}
          deliveryEta={groceryServiceability?.etaLabel || "6 mins"}
          onBack={() => setGroceryAddressOpen(false)}
          onSelectMap={() => setGroceryMapAddressOpen(true)}
          onAddNew={addGroceryAddress}
          onContinue={applyGroceryAddress}
        />
      </Modal>

      <Modal visible={groceryMapAddressOpen} onRequestClose={() => setGroceryMapAddressOpen(false)} animationType="slide">
        <GroceryMapAddressScreen
          currentLocation={currentGroceryAddress}
          savedAddresses={grocerySavedAddresses}
          onBack={() => setGroceryMapAddressOpen(false)}
          onAddNew={addGroceryAddress}
          onContinue={applyGroceryAddress}
        />
      </Modal>

      <Modal visible={groceryCategoryOpen} onRequestClose={closeGroceryCategory}>
        <GroceryCategoryScreen
          category={selectedGroceryCategoryCard}
          onClose={closeGroceryCategory}
          onSearch={openSearchFromCategory}
        />
      </Modal>

      <Modal
        visible={Boolean(selectedGroceryProduct)}
        onRequestClose={closeGroceryProduct}
        transparent
        statusBarTranslucent
        animationType="none"
      >
        <GroceryProductScreen
          product={selectedGroceryProduct}
          onClose={closeGroceryProduct}
          onSearch={openSearchFromProduct}
          onCheckout={openGroceryCheckout}
          onHeaderScrolledChange={setGroceryProductHeaderScrolled}
        />
      </Modal>

      <Modal
        visible={Boolean(groceryCheckout)}
        onRequestClose={closeGroceryCheckout}
        statusBarTranslucent
        animationType="slide"
      >
        <GroceryCheckoutScreen
          key={groceryCheckout?.revision || "grocery-checkout"}
          product={groceryCheckout?.product}
          unit={groceryCheckout?.unit}
          quantity={groceryCheckout?.quantity}
          items={groceryCheckout?.items}
          onClose={closeGroceryCheckout}
          onChangePayment={openGroceryPayment}
          deliveryAddress={groceryDelivery?.address || "Current location"}
          deliveryEta={groceryServiceability?.etaLabel || "Checking…"}
          onItemsChange={(items) => {
            setGroceryCheckout((current) => current ? { ...current, items } : current);
          }}
          onQuantityChange={persistGroceryCartItem}
          onOpenCoupons={() => setGroceryCouponsOpen(true)}
          appliedCoupon={groceryAppliedCoupon}
        />
      </Modal>
      <Modal visible={groceryCouponsOpen} onRequestClose={() => setGroceryCouponsOpen(false)} animationType="slide" statusBarTranslucent>
        <GroceryCouponsScreen
          cartTotal={groceryCouponCartTotal}
          initialCoupon={groceryAppliedCoupon}
          onBack={() => setGroceryCouponsOpen(false)}
          onApply={setGroceryAppliedCoupon}
          onContinue={(coupon) => {
            setGroceryAppliedCoupon(coupon || null);
            setGroceryCouponsOpen(false);
          }}
        />
      </Modal>
      <Modal
        visible={Boolean(grocerySubstitutionReview)}
        onRequestClose={() => setGrocerySubstitutionReview(null)}
        animationType="slide"
        statusBarTranslucent
      >
        <GrocerySubstitutionScreen
          issues={grocerySubstitutionReview?.issues || []}
          cartItems={grocerySubstitutionReview?.cartItems || groceryCheckout?.items || []}
          catalogProducts={groceryCatalogProducts}
          onClose={() => setGrocerySubstitutionReview(null)}
          onApply={applyGrocerySubstitution}
        />
      </Modal>
      <Modal
        visible={groceryPaymentOpen}
        onRequestClose={closeGroceryPayment}
        animationType="slide"
      >
        <GroceryPaymentMethodScreen
          onBack={closeGroceryPayment}
          onContinue={showGroceryOrderSuccess}
          isProcessing={isPlacingGroceryOrder}
          errorMessage={groceryPaymentError}
          amount={groceryPaymentAmount}
          savings={groceryCouponDiscount}
          deliveryAddress={groceryDelivery?.address || "Current location"}
        />
      </Modal>
      <Modal
        visible={groceryOrderSuccessOpen}
        onRequestClose={closeGroceryCheckout}
        animationType="fade"
      >
        <OrderSuccessScreen
          orderId={groceryOrder?.id ? `#FRZ${groceryOrder.id.slice(-8).toUpperCase()}` : "#FRZ123456"}
          eta={groceryServiceability?.etaLabel || "25–30 min"}
          onTrackOrder={openGroceryOrderTracking}
          onBackHome={closeGroceryCheckout}
        />
      </Modal>
      <Modal
        visible={groceryOrderTrackingOpen}
        onRequestClose={closeGroceryCheckout}
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
      >
        <GroceryOrderTrackingScreen
          orderId={groceryOrder?.id || "demo-order"}
          accessToken={groceryAccessToken}
          initialEta={groceryServiceability?.etaLabel}
          onClose={closeGroceryCheckout}
          onCancelOrder={finishGroceryCancellation}
          onRateOrder={openGroceryRating}
        />
      </Modal>
      <Modal
        visible={groceryRatingOpen}
        onRequestClose={finishGroceryRating}
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
      >
        <GroceryRateOrderScreen
          order={groceryRatingData?.order || groceryOrder || {}}
          items={groceryRatingData?.items || groceryOrder?.items || groceryCheckout?.items || []}
          partnerName={groceryRatingData?.partnerName || "Your delivery partner"}
          onBack={finishGroceryRating}
          onDone={finishGroceryRating}
          onReportIssue={submitGroceryItemIssue}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  activeUnderline: {
    position: "absolute",
    borderRadius: 18,
    bottom: -8,
    left: 0,
    width: TAB_WIDTH,
    height: 4,
    backgroundColor: "#000000ff"
  },
  connectionBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 88,
    paddingTop: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.72,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    zIndex: 60
  },
  connectionBannerOffline: {
    backgroundColor: "#D92D20"
  },
  connectionBannerOnline: {
    backgroundColor: "#159447"
  },
  connectionCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 14
  },
  connectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900"
  },
  connectionSubtitle: {
    marginTop: 2,
    color: "rgba(255,255,255,0.88)",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "600"
  },
  bottomSpacer: {
    height: 0
  },
  bottomSpacerCompact: {
    height: 0
  },
  groceryCartOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 90,
    elevation: 90
  },
  groceryCartFlyingThumb: {
    position: "absolute",
    alignSelf: "center",
    bottom: 150,
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 4,
    borderColor: "#1F8F17",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#0D5311",
    shadowOpacity: 0,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 8 },
    elevation: 0
  },
  groceryCartThumbImage: {
    width: "60%",
    height: "60%"
  },
  groceryCartThumbInitial: {
    color: "#1F8F17",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900"
  },
  groceryViewCartPillWrap: {
    position: "absolute",
    left: SCREEN_WIDTH * 0.245,
    right: SCREEN_WIDTH * 0.245,
    bottom: 130,
    borderRadius: 999,
    shadowColor: "#0D5311",
    shadowOpacity: 0,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 0
  },
  groceryViewCartPill: {
    minHeight: 55,
    borderRadius: 999,
    paddingLeft: 4,
    paddingRight: 12,
    backgroundColor: "#1F8F17",
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  groceryViewCartThumbRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#F7FFF2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  groceryViewCartCopy: {
    flex: 1,
    minWidth: 0
  },
  groceryViewCartTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    letterSpacing: -0.35
  },
  groceryViewCartSubtitle: {
    marginTop: 1,
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700"
  },
  cardGrid: {
    marginTop: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  cardGridCollapsed: {
    marginTop: 0
  },
  cardGridSecondary: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C7C7C7",
    marginHorizontal: 4
  },
  dotActive: {
    width: 22,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#4F46E5"
  },
  dotsRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  emptyModeSpace: {
    minHeight: 860
  },
  floatingHeaderBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    borderBottomColor: "transparent",
    zIndex: 1
  },
  groceryFloatingHeaderBackdrop: {
    height: 320,
    backgroundColor: GROCERY_HERO_COLOR,
    opacity: 1
  },
  groceryEmptyMeta: {
    marginTop: 4,
    color: GROCERY_HERO_COLOR,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600"
  },
  groceryEmptyResults: {
    paddingTop: 74,
    alignItems: "center"
  },
  groceryEmptyTitle: {
    marginTop: 12,
    color: "#222A24",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900"
  },
  groceryPopularBlock: {
    marginBottom: 24
  },
  groceryPopularChip: {
    minHeight: 35,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE7E0"
  },
  groceryPopularChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  groceryPopularChipText: {
    color: "#344038",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800"
  },
  grocerySearchAdd: {
    minWidth: 51,
    height: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#0B7A33",
    backgroundColor: "#FFFFFF"
  },
  grocerySearchAddText: {
    color: "#0B7A33",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "900"
  },
  grocerySearchBack: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center"
  },
  grocerySearchContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 46
  },
  grocerySearchHeader: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECE9"
  },
  grocerySearchHeaderSpacer: {
    width: 38,
    height: 38
  },
  grocerySearchInput: {
    flex: 1,
    height: 50,
    color: "#18201B",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600"
  },
  grocerySearchInputWrap: {
    height: 52,
    marginTop: 14,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE5DF"
  },
  grocerySearchResult: {
    minHeight: 74,
    marginBottom: 9,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7ECE8"
  },
  grocerySearchResultAction: {
    alignItems: "flex-end",
    gap: 5
  },
  grocerySearchResultCopy: {
    flex: 1,
    minWidth: 0
  },
  grocerySearchResultIcon: {
    width: 54,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  grocerySearchResultMeta: {
    marginTop: 3,
    color: "#79827C",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "600"
  },
  grocerySearchResultName: {
    color: "#19201B",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900"
  },
  grocerySearchResultPrice: {
    color: "#19201B",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900"
  },
  groceryHeaderActionButton: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  groceryHeaderBlock: {
    marginHorizontal: 0,
    paddingTop: 10,
    backgroundColor: GROCERY_HERO_COLOR,
    position: "relative",
    zIndex: 10,
    overflow: "visible"
  },
  groceryDeliveryCopy: {
    flex: 1,
    minWidth: 0
  },
  deliveryHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  deliveryHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deliveryHeaderLocationBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFE9B5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  deliveryHeaderTitle: {
    color: "#111111",
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900",
    letterSpacing: -0.65,
  },
  deliveryHeaderEtaAccent: {
    color: "#3730A3",
  },
  deliveryHeaderTitleLight: {
    color: "#FFFFFF"
  },
  deliveryHeaderAddress: {
    marginTop: 3,
    color: "#656B75",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    letterSpacing: -0.12,
  },
  deliveryHeaderAddressLight: {
    color: "rgba(255,255,255,0.82)"
  },
  deliveryHeaderRow: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 7,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  groceryDeliveryHeaderRow: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
  },
  groceryHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  groceryHeaderIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  groceryDeliveryRow: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  groceryDeliveryTitle: {
    color: "#151515",
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "800"
  },
  groceryDeliverySubtitle: {
    marginTop: 2,
    marginLeft: 9,
    color: "#6F6578",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600"
  },
  groceryHeaderSearchInput: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingLeft: 14,
    paddingRight: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  groceryHeaderSearchRow: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  groceryHeaderSearchDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E1E1E1",
    marginLeft: 2
  },
  groceryHeaderSearchText: {
    flex: 1,
    color: "#66646B",
    fontSize: 15.5,
    lineHeight: 19,
    fontWeight: "600"
  },
  grocerySelectorTabPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }]
  },
  grocerySelectorIconWrap: {
    width: 38,
    height: 31,
    borderRadius: 20,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center"
  },
  grocerySelectorIconWrapActive: {
    transform: [{ scale: 1 }]
  },
  grocerySelectorRail: {
    paddingHorizontal: GROCERY_SELECTOR_SIDE_PADDING,
    paddingTop: 0,
    paddingBottom: 0,
    height: 74,
    alignItems: "flex-end",
    position: "relative"
  },
  grocerySelectorBaseline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.72)"
  },
  grocerySelectorShell: {
    height: 74,
    minHeight: 74,
    marginTop: 18,
    marginBottom: 0,
    backgroundColor: GROCERY_HERO_COLOR,
    borderBottomWidth: 0,
    borderBottomColor: "transparent",
    overflow: "visible"
  },
  grocerySelectorTab: {
    width: GROCERY_SELECTOR_TAB_WIDTH,
    height: 66,
    paddingHorizontal: 3,
    paddingTop: 10,
    paddingBottom: 3,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 0,
    borderRadius: 20,
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: "transparent",
    position: "relative",
    zIndex: 2
  },
  grocerySelectorTabActive: {
    borderRadius: 20
  },
  grocerySelectorActiveCurve: {
    position: "absolute",
    left: -16,
    width: 104,
    bottom: 0,
    height: 74,
    zIndex: 1
  },
  grocerySelectorCurveShape: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent"
  },
  grocerySelectorText: {
    marginTop: 0,
    color: "rgba(255,255,255,0.9)",
    fontSize: 11.2,
    lineHeight: 13,
    fontWeight: "700",
    letterSpacing: -0.25,
    textAlign: "center"
  },
  grocerySelectorTextActive: {
    color: "#111111",
    fontWeight: "900"
  },
  grocerySelectorUnderline: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    height: 9,
    borderRadius: 999,
    backgroundColor: "transparent"
  },
  grocerySelectorUnderlineActive: {
    backgroundColor: "transparent"
  },
  grocerySearchScreen: {
    flex: 1,
    backgroundColor: "#F8FAF8"
  },
  grocerySearchSectionTitle: {
    marginBottom: 12,
    color: "#18201B",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.25
  },
  grocerySearchTitle: {
    color: "#151A17",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: -0.35
  },
  homeModeContent: {
    paddingTop: 10
  },
  homeModeContentCollapsed: {
    paddingTop: 0,
    marginTop: 0
  },
  groceryModeContent: {
    paddingTop: 0,
    marginTop: 0
  },
  groceryScrollContent: {
    backgroundColor: "#FFFFFF"
  },
  modeTabImage: {
    width: 46,
    height: 40,
    marginRight: -3
  },
  modeTabImageInactive: {
    opacity: 0.62
  },
  parcelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C7C7C7",
    marginHorizontal: 4
  },
  parcelDotActive: {
    width: 22,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#4F46E5"
  },
  parcelDotsRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  parcelHeaderStack: {
    marginTop: 46,
    zIndex: 4
  },
  serviceHeaderStack: {
    paddingBottom: 16,
  },
  parcelHeaderWrap: {
    paddingHorizontal: 4,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  parcelHelpChip: {
    marginTop: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.82)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(169,103,0,0.16)",
    shadowColor: "#8A5A00",
    shadowOpacity: 0,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0
  },
  parcelHelpText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700"
  },
  parcelHorizontalCard: {
    width: PARCEL_PROMO_WIDTH,
    height: PARCEL_PROMO_CARD_HEIGHT,
    marginRight: PARCEL_PROMO_CARD_GAP,
    borderRadius: PROMO_CARD_RADIUS,
    overflow: "hidden",
    backgroundColor: "#FFFFFF"
  },
  parcelHorizontalContent: {
    paddingRight: 16
  },
  parcelPickupMetaWrap: {
    flex: 1,
    paddingTop: 0
  },
  parcelPickupSubtitle: {
    marginTop: 1,
    marginLeft: 10,
    color: "#7A7A7A",
    fontSize: 11,
    fontWeight: "500"
  },
  parcelPickupTitle: {
    marginLeft: 3,
    color: "#111111",
    fontSize: 15,
    fontWeight: "700"
  },
  parcelPickupTitleRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  parcelPromoCard: {
    height: PARCEL_PROMO_CARD_HEIGHT,
    width: PARCEL_PROMO_WIDTH,
    paddingHorizontal: 0,
    marginRight: PARCEL_PROMO_CARD_GAP,
    borderRadius: PROMO_CARD_RADIUS,
    overflow: "hidden",
    backgroundColor: "#FFFFFF"
  },
  parcelPromoCardImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: PROMO_CARD_RADIUS,
    overflow: "hidden"
  },
  parcelPromoCardImageRadius: {
    borderRadius: PROMO_CARD_RADIUS
  },
  parcelPromoTrack: {
    flexDirection: "row",
    width: PARCEL_PROMO_STEP * PARCEL_PROMO_CARDS.length - PARCEL_PROMO_CARD_GAP
  },
  parcelPromoViewport: {
    marginTop: 16,
    marginHorizontal: 0
  },
  parcelScrollContent: {
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 16
  },
  parcelHomeContent: {
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 56
  },
  parcelRecentCard: {
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: "#F7F8FA",
    overflow: "hidden"
  },
  parcelRecentRow: {
    minHeight: 62,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center"
  },
  parcelRecentIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center"
  },
  parcelRecentCopy: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 11
  },
  parcelRecentTitle: {
    color: "#1D2939",
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: "800"
  },
  parcelRecentAddress: {
    marginTop: 2,
    color: "#667085",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "600"
  },
  parcelRecentDivider: {
    height: 1,
    marginLeft: 59,
    backgroundColor: "#E7EAF0"
  },
  parcelSectionHeadingRow: {
    marginTop: 32,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  parcelSectionCaption: {
    marginTop: 2,
    color: "#7A8290",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "600"
  },
  parcelVehicleRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 12
  },
  parcelVehicleDockCard: {
    flex: 1,
    width: "auto"
  },
  parcelVehicleCard: {
    flex: 1,
    minWidth: 0,
    height: 148,
    padding: 6,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowOpacity: 0,
    elevation: 0
  },
  parcelVehicleVisual: {
    height: 94,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  parcelVehicleImage: {
    width: "82%",
    height: 82
  },
  parcelVehicleArrow: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  parcelVehicleFooter: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 7,
    paddingTop: 7,
    justifyContent: "flex-start"
  },
  parcelVehicleTitle: {
    color: "#1D2939",
    fontSize: 13.5,
    lineHeight: 17,
    fontWeight: "900"
  },
  parcelVehicleMeta: {
    maxWidth: "100%",
    marginTop: 2,
    color: "#7A8493",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600"
  },
  parcelChoiceRail: {
    paddingTop: 10,
    paddingRight: 18,
    gap: 9
  },
  parcelSizeChoice: {
    minWidth: 104,
    minHeight: 58,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 15,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "transparent"
  },
  parcelSizeChoiceSelected: {
    backgroundColor: "#FFF8E5",
    borderColor: "#4F46E5"
  },
  parcelSizeChoiceLabel: {
    color: "#344054",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800"
  },
  parcelSizeChoiceLabelSelected: {
    color: "#3730A3"
  },
  parcelSizeChoiceMeta: {
    marginTop: 2,
    color: "#8A93A2",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600"
  },
  parcelSizeChoiceMetaSelected: {
    color: "#3730A3"
  },
  parcelTypeRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8
  },
  parcelTypeCard: {
    flex: 1,
    minWidth: 0,
    height: 82,
    borderRadius: 16,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center"
  },
  parcelTypeCardSelected: {
    backgroundColor: "#FFF8E5"
  },
  parcelTypeIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center"
  },
  parcelTypeIconSelected: {
    backgroundColor: "#4F46E5"
  },
  parcelTypeLabel: {
    maxWidth: "95%",
    marginTop: 6,
    color: "#475467",
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: "700"
  },
  parcelTypeLabelSelected: {
    color: "#3730A3"
  },
  parcelDeliveryOptions: {
    marginTop: 10,
    padding: 4,
    borderRadius: 17,
    backgroundColor: "#F2F4F7",
    flexDirection: "row",
    gap: 4
  },
  parcelDeliveryOption: {
    flex: 1,
    minWidth: 0,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  parcelDeliveryOptionSelected: {
    backgroundColor: "#FFFFFF",
    shadowOpacity: 0,
    elevation: 0
  },
  parcelDeliveryLabel: {
    color: "#667085",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "700"
  },
  parcelDeliveryLabelSelected: {
    color: "#3730A3",
    fontWeight: "900"
  },
  parcelDeliveryMeta: {
    marginTop: 2,
    color: "#98A2B3",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "600"
  },
  parcelDeliveryMetaSelected: {
    color: "#3730A3"
  },
  parcelOfferCard: {
    minHeight: 82,
    marginTop: 10,
    paddingHorizontal: 13,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    shadowOpacity: 0,
    elevation: 0
  },
  parcelOfferIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  parcelAdRail: {
    marginHorizontal: -18,
    paddingLeft: 18,
    paddingTop: 12,
    paddingRight: 6
  },
  parcelAdCard: {
    width: RIDE_AD_WIDTH,
    height: 156,
    marginRight: 12,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#EAF0F8"
  },
  parcelAdImage: {
    width: "100%",
    height: "100%"
  },
  parcelAdImageRadius: {
    borderRadius: 22
  },
  parcelAdOverlay: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 15,
    justifyContent: "center"
  },
  parcelAdEyebrow: {
    color: "#BED3FF",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1
  },
  parcelAdTitle: {
    width: "58%",
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "900",
    letterSpacing: -0.3
  },
  parcelAdCta: {
    alignSelf: "flex-start",
    marginTop: 11,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#FFFFFF"
  },
  parcelAdCtaText: {
    color: "#18315F",
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: "800"
  },
  parcelProtectionCard: {
    minHeight: 72,
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    shadowOpacity: 0,
    elevation: 0
  },
  parcelSelectorStage: {
    marginTop: -14,
    minHeight: 560,
    position: "relative"
  },
  parcelContinueButton: {
    marginTop: 16,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3730A3",
    shadowOpacity: 0,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 0
  },
  parcelContinueText: {
    color: "#18120A",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800"
  },
  parcelEyebrow: {
    color: "#3730A3",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  parcelNoteCard: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.82)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  parcelNoteText: {
    flex: 1,
    color: "#364152",
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "600"
  },
  parcelPanelCopy: {
    flex: 1,
    paddingRight: 12
  },
  parcelPanelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  parcelPanelIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(245, 168, 0, 0.14)",
    alignItems: "center",
    justifyContent: "center"
  },
  parcelServicesPanel: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 24,
    paddingHorizontal: 18,
    paddingBottom: 20,
    minHeight: 560
  },
  parcelPanelSubtitle: {
    marginTop: 4,
    color: "#526070",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500"
  },
  parcelPanelTitle: {
    marginTop: 2,
    color: "#111827",
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900",
    letterSpacing: -0.3
  },
  parcelSizeBadge: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F1F5FF"
  },
  parcelSizeBadgeSelected: {
    backgroundColor: "rgba(255,255,255,0.92)"
  },
  parcelSizeBadgeText: {
    color: "#334155",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800"
  },
  parcelSizeBadgeTextSelected: {
    color: "#1E293B"
  },
  parcelSizeCard: {
    flex: 1,
    minHeight: 134,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)"
  },
  parcelSizeCardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95
  },
  parcelSizeCardSelected: {
    borderWidth: 1.5,
    borderColor: "rgba(245, 168, 0, 0.30)",
    shadowOpacity: 0,
    elevation: 0
  },
  parcelSizeCardShell: {
    width: "48.5%"
  },
  parcelSizeGrid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12
  },
  parcelSizeIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center"
  },
  parcelSizeIconWrapSelected: {
    backgroundColor: "#4F46E5"
  },
  parcelSizeSubtitle: {
    marginTop: 5,
    color: "#667085",
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "500"
  },
  parcelSizeTitle: {
    color: "#111827",
    fontSize: 15.5,
    lineHeight: 19,
    fontWeight: "900"
  },
  parcelTopSearchCardWrap: {
    marginTop: 9,
    paddingHorizontal: 18,
    zIndex: 4,
    position: "relative",
    overflow: "visible"
  },
  promoCard: {
    height: PROMO_CARD_HEIGHT,
    width: PROMO_WIDTH,
    overflow: "hidden",
    marginRight: PROMO_CARD_GAP,
    borderRadius: PROMO_CARD_RADIUS,
    backgroundColor: "#FFFFFF"
  },
  promoCardImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: PROMO_CARD_RADIUS,
    overflow: "hidden"
  },
  promoCardImageRadius: {
    borderRadius: PROMO_CARD_RADIUS
  },
  promoCopy: {
    marginTop: 12,
    paddingHorizontal: 4
  },
  promoHorizontalContent: {
    paddingRight: 16
  },
  promoHorizontalImage: {
    width: PROMO_WIDTH,
    height: PROMO_CARD_HEIGHT,
    borderRadius: PROMO_CARD_RADIUS,
    overflow: "hidden"
  },
  promoHorizontalItem: {
    width: PROMO_WIDTH,
    marginRight: PROMO_CARD_GAP
  },
  promoHorizontalSubtitle: {
    marginTop: 2,
    paddingHorizontal: 2,
    color: "#666666",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500"
  },
  promoHorizontalTitle: {
    marginTop: 10,
    paddingHorizontal: 2,
    color: "#111111",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700"
  },
  promoSectionHeader: {
    marginTop: 32,
    paddingHorizontal: 2
  },
  promoSectionSubtitle: {
    marginTop: 2,
    color: "#777E89",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  promoSectionTitle: {
    color: "#111111",
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
    letterSpacing: -0.25
  },
  rideAdViewport: {
    marginTop: 12,
    marginHorizontal: -18
  },
  rideAdRail: {
    paddingLeft: 18,
    paddingRight: 6
  },
  rideAdCard: {
    width: RIDE_AD_WIDTH,
    height: 166,
    marginRight: 12,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#E9EEF6"
  },
  rideAdImage: {
    width: "100%",
    height: "100%"
  },
  rideAdImageRadius: {
    borderRadius: 22
  },
  rideAdOverlay: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 17,
    paddingVertical: 15,
    justifyContent: "center"
  },
  rideAdEyebrow: {
    color: "#B8D1FF",
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1
  },
  rideAdTitle: {
    width: "58%",
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: -0.35
  },
  rideAdSubtitle: {
    width: "57%",
    marginTop: 5,
    color: "rgba(255,255,255,0.82)",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "600"
  },
  rideAdAction: {
    alignSelf: "flex-start",
    minHeight: 28,
    marginTop: 11,
    paddingLeft: 11,
    paddingRight: 8,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  rideAdActionText: {
    color: "#12213D",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "800"
  },
  promoSubtitle: {
    marginTop: 2,
    color: "#666666",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500"
  },
  promoTitle: {
    color: "#111111",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    letterSpacing: -0.25
  },
  promoTrack: {
    flexDirection: "row",
    width: PROMO_STEP * PROMO_CARDS.length - PROMO_CARD_GAP
  },
  promoViewport: {
    marginTop: 11,
    marginHorizontal: 0
  },
  recentDivider: {
    height: 1,
    backgroundColor: "#ECEEF2",
    marginLeft: 62
  },
  recentRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7
  },
  recentRowPressed: {
    backgroundColor: "#F8F9FB",
    opacity: 0.9
  },
  recentsWrap: {
    marginTop: 2,
    marginBottom: 0,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E8EC",
    overflow: "hidden",
    shadowOpacity: 0,
    elevation: 0
  },
  recentIconWell: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  recentCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
    marginRight: 8
  },
  recentText: {
    color: "#000000ff",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  recentSubtitle: {
    marginTop: 1,
    color: "#747B86",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "500"
  },
  rideSectionHeader: {
    marginTop: 2
  },
  rideSectionHeaderSpaced: {
    marginTop: 32
  },
  rideSectionHeadingRow: {
    marginTop: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  rideSectionHeadingRowCompact: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  rideSectionSubtitle: {
    marginTop: 3,
    color: "#717987",
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "600"
  },
  rideSectionTitle: {
    color: "#111827",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: -0.25
  },
  rideServiceBento: {
    marginTop: 12,
    gap: 10
  },
  rideServiceBentoRow: {
    height: 126,
    flexDirection: "row",
    gap: 10
  },
  rideServiceBentoCard: {
    minWidth: 0,
    overflow: "hidden",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 13,
    position: "relative"
  },
  rideServiceBentoCopy: {
    zIndex: 2,
    maxWidth: "72%"
  },
  rideServiceBentoTitle: {
    color: "#171B22",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
    letterSpacing: -0.2
  },
  rideServiceBentoSubtitle: {
    marginTop: 3,
    color: "#6C7480",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600"
  },
  rideServiceBentoImage: {
    position: "absolute",
    width: 106,
    height: 78,
    right: 2,
    bottom: -1
  },
  rideServiceBentoImageCompact: {
    width: 84,
    height: 67,
    right: -1,
    bottom: 0
  },
  rideServiceBentoImageBike: {
    width: 166,
    height: 111,
    right: -7,
    bottom: -12
  },
  rideServiceBentoImageParcel: {
    width: 136,
    height: 91,
    right: -12,
    bottom: -4
  },
  rideServiceBentoImageTravel: {
    width: 172,
    height: 86,
    right: -10,
    bottom: -2
  },
  rideServiceBentoIcon: {
    position: "absolute",
    right: 13,
    bottom: 13,
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFE9AD",
    alignItems: "center",
    justifyContent: "center"
  },
  rideSeeAllText: {
    color: "#3730A3",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  rideVehicleCardsRow: {
    marginTop: 12,
    marginBottom: 4,
    flexDirection: "row",
    gap: 10
  },
  rideVehicleCard: {
    flex: 1,
    minWidth: 0,
    height: 94,
    borderRadius: 15,
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 5,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center"
  },
  rideVehicleImageWrap: {
    width: "100%",
    height: 58,
    alignItems: "center",
    justifyContent: "center"
  },
  rideVehicleCardImage: {
    width: 68,
    height: 54
  },
  rideVehicleCardLabel: {
    maxWidth: "100%",
    marginTop: 2,
    color: "#242A33",
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "900"
  },
  vehicleDockRail: {
    gap: 10,
    paddingTop: 11,
    paddingBottom: 4,
    paddingRight: 18
  },
  vehicleDockCard: {
    width: 118,
    height: 146,
    borderRadius: 18,
    overflow: "hidden",
    paddingHorizontal: 11,
    paddingTop: 10,
    paddingBottom: 9,
    borderWidth: 1,
    borderColor: "rgba(27,50,83,0.055)"
  },
  vehicleDockCardSelected: {
    borderColor: "rgba(245,168,0,0.30)",
    shadowOpacity: 0,
    elevation: 0
  },
  vehicleDockTopRow: {
    minHeight: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  vehicleDockEta: {
    color: "#4B5565",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700"
  },
  vehicleDockActiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4F46E5"
  },
  vehicleDockImageWrap: {
    height: 76,
    marginHorizontal: -6,
    alignItems: "center",
    justifyContent: "center"
  },
  vehicleDockImage: {
    width: 106,
    height: 75
  },
  vehicleDockLabel: {
    color: "#111827",
    fontSize: 14.5,
    lineHeight: 18,
    fontWeight: "800",
    letterSpacing: -0.2
  },
  vehicleDockCaption: {
    marginTop: 1,
    color: "#737C8A",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700"
  },
  rideUtilityRail: {
    minHeight: 62,
    marginTop: 13,
    borderRadius: 17,
    backgroundColor: "#F7F9FC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5
  },
  rideUtilityAction: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7
  },
  rideUtilityIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center"
  },
  rideUtilityLabel: {
    color: "#2B3442",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "700"
  },
  rideUtilityDivider: {
    width: 1,
    height: 27,
    backgroundColor: "#E1E7F0"
  },
  travelDeckHeader: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  travelChipRail: {
    gap: 7,
    paddingTop: 12,
    paddingBottom: 11,
    paddingRight: 18
  },
  travelDeckChip: {
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 13,
    backgroundColor: "#F3F5F8",
    alignItems: "center",
    justifyContent: "center"
  },
  travelDeckChipSelected: {
    backgroundColor: "#172033"
  },
  travelDeckChipText: {
    color: "#596273",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "700"
  },
  travelDeckChipTextSelected: {
    color: "#FFFFFF"
  },
  travelFeatureCard: {
    height: 194,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#DDE8F5"
  },
  travelFeatureImage: {
    width: "100%",
    height: "100%"
  },
  travelFeatureImageRadius: {
    borderRadius: 22
  },
  travelFeatureOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between"
  },
  travelFeatureBadge: {
    alignSelf: "flex-start",
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 9,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center"
  },
  travelFeatureBadgeText: {
    color: "#172033",
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 0.8
  },
  travelFeatureBottom: {
    flexDirection: "row",
    alignItems: "flex-end"
  },
  travelFeatureCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 14
  },
  travelFeatureTitle: {
    maxWidth: 245,
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: -0.45
  },
  travelFeatureSubtitle: {
    marginTop: 4,
    color: "rgba(255,255,255,0.78)",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "600"
  },
  travelFeatureArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  rideOfferCard: {
    minHeight: 84,
    marginTop: 10,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden"
  },
  rideOfferIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  rideOfferCopy: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 12
  },
  rideOfferTitle: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800"
  },
  rideOfferSubtitle: {
    marginTop: 3,
    color: "#667085",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600"
  },
  travelServiceGrid: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10
  },
  travelServiceCard: {
    flex: 1,
    minWidth: 0,
    height: 82,
    borderRadius: 16,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center"
  },
  travelServiceIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center"
  },
  travelServiceLabel: {
    marginTop: 6,
    color: "#242A33",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "800"
  },
  safetySupportCard: {
    minHeight: 72,
    marginTop: 32,
    marginBottom: 24,
    borderRadius: 17,
    backgroundColor: "#F6F9FE",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center"
  },
  safetySupportIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center"
  },
  safetySupportCopy: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 12
  },
  safetySupportTitle: {
    color: "#172033",
    fontSize: 14.5,
    lineHeight: 19,
    fontWeight: "800"
  },
  safetySupportSubtitle: {
    marginTop: 2,
    color: "#667085",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600"
  },
  rideCardPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }]
  },
  rideSearchCard: {
    flex: 1,
    height: 50,
    minHeight: 50,
    borderRadius: 999
  },
  rideSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0
  },
  searchBarForeground: {
    zIndex: 3,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    shadowColor: "#64748B",
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 0
  },
  rideWithUsTitle: {
    marginTop: 16,
    color: "#111111",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.1
  },
  safe: {
    flex: 1,
    backgroundColor: "#ffffffff"
  },
  screenRevealLayer: {
    flex: 1,
    zIndex: 5,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: "hidden",
    shadowOpacity: 0,
    elevation: 0
  },
  screenRevealLayerDragging: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.96)",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.96,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: -10 },
    elevation: 12
  },
  screenRevealTopGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 24,
    zIndex: 80
  },
  homeRevealBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    zIndex: 1
  },
  homeRevealMap: {
    ...StyleSheet.absoluteFillObject
  },
  homeMapPinOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#111111",
    alignItems: "center",
    justifyContent: "center"
  },
  homeMapPinInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#4F46E5"
  },
  homeMajorOffer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 0,
    borderColor: "transparent",
    paddingLeft: 26,
    paddingRight: 16,
    paddingVertical: 24,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    zIndex: 3
  },
  homeMajorOfferCopy: {
    flex: 1,
    minWidth: 0,
    zIndex: 2
  },
  homeMajorOfferEyebrow: {
    color: "#3730A3",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 0.75
  },
  homeMajorOfferTitle: {
    marginTop: 8,
    color: "#101828",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    maxWidth: 220
  },
  homeMajorOfferAction: {
    marginTop: 18,
    color: "#3730A3",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  homeMajorOfferVehicle: {
    width: "43%",
    height: "78%",
    marginLeft: 4
  },
  scrollContent: {
    paddingTop: 26,
    paddingHorizontal: 10,
    paddingBottom: 70,
    backgroundColor: "#ffffffff",
    overflow: "visible"
  },
  rideScrollContent: {
    paddingTop: 0,
    paddingHorizontal: 18,
    paddingBottom: 16
  },
  rideScrollContentCollapsed: {
    marginTop: 0
  },
  scrolledSearchShell: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    height: 68,
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    borderBottomColor: "transparent"
  },
  searchCard: {
    minHeight: 28,
    borderRadius: 999,
    backgroundColor: "#ffffffff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D7DAE0",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 8,
    shadowOpacity: 0,
    elevation: 4,
  },
  searchCardWrap: {
    zIndex: 14,
    backgroundColor: "transparent",
    marginTop: 62,
    position: "relative"
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: "#6b6a6aff",
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: "600"
  },
  searchPromptClip: {
    flex: 1,
    height: 24,
    justifyContent: "center",
    overflow: "hidden"
  },
  secondaryCard: {
    flex: 1,
    height: 68,
    borderRadius: 16,
    backgroundColor: "#ffffffff"
  },
  sectionTitle: {
    marginTop: 16,
    color: "#111111",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2
  },
  smallCard: {
    width: 48,
    height: 48,
    borderRadius: 39,
    backgroundColor: "#f1f1f1ff",
    justifyContent: "center",
    alignItems: "center"
  },
  smallCardLabel: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "700"
  },
  smallCardPressable: {
    width: "23%",
    alignItems: "center"
  },
  tabItem: {
    flex: 1,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    backgroundColor: "transparent"
  },
  tabItemActive: {
    backgroundColor: "transparent"
  },
  tabsWrap: {
    position: "absolute",
    top: 30,
    left: 18,
    right: 18,
    flexDirection: "row",
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
    zIndex: 7,
    overflow: "visible"
  },
  tabText: {
    color: "#424242ff",
    fontFamily: "serif",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.1
  },
  tabTextActive: {
    color: "#000000ff",
    fontWeight: "800"
  },
  groceryTopTabText: {
    color: "rgba(255,255,255,0.82)"
  },
  groceryTopTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  topShell: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: 0,
    zIndex: 30,
    overflow: "visible"
  },
  topShellGrocery: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    overflow: "visible"
  },
  topShellParcel: {
    marginHorizontal: 0,
    marginTop: 0,
    paddingBottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowOpacity: 0,
    elevation: 0
  }
});
