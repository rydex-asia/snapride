import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Notifications = Constants.appOwnership === "expo" ? null : require("expo-notifications");
import HomeScreen from "./screens/home/HomeScreen";
import ChooseRideScreen from "./screens/ride/ChooseRideScreen";
import RideDynamicIsland from "./components/RideDynamicIsland";
import SearchingCaptainScreen from "./screens/ride/SearchingCaptainScreen";
import CaptainOnTheWayScreen from "./screens/ride/CaptainOnTheWayScreen";
import NavigationScreen from "./screens/ride/NavigationScreen";
import TripInProgressScreen from "./screens/ride/TripInProgressScreen";
import PickupDropScreen from "./screens/location/PickupDropScreen";
import BookingScreen from "./screens/home/BookingScreen";
import HelpSupportScreen from "./screens/support/HelpSupportScreen";
import TicketDetailsScreen from "./screens/support/TicketDetailsScreen";
import ChatSupportScreen from "./screens/support/ChatSupportScreen";
import MessageCaptainScreen from "./screens/ride/MessageCaptainScreen";
import SafetyScreen from "./screens/safety/SafetyScreen";
import ShareLiveTripScreen from "./screens/safety/ShareLiveTripScreen";
import ProfileScreen from "./screens/profile/ProfileScreen";
import EditProfileScreen from "./screens/profile/EditProfileScreen";
import SettingsScreen from "./screens/profile/SettingsScreen";
import SavedPlacesScreen from "./screens/location/SavedPlacesScreen";
import AddNewAddressScreen from "./screens/location/AddNewAddressScreen";
import OffersScreen from "./screens/offers/OffersScreen";
import ApplyCouponScreen from "./screens/payments/ApplyCouponScreen";
import WalletScreen from "./screens/payments/WalletScreen";
import AddMoneyScreen from "./screens/payments/AddMoneyScreen";
import TransactionsScreen from "./screens/payments/TransactionsScreen";
import FareScreen from "./screens/payments/FareScreen";
import ReceiptsScreen from "./screens/payments/ReceiptsScreen";
import RefundScreen from "./screens/orders/RefundScreen";
import ReferEarnScreen from "./screens/offers/ReferEarnScreen";
import ScheduleRideScreen from "./screens/ride/ScheduleRideScreen";
import EditRideScreen from "./screens/ride/EditRideScreen";
import SelectLocationScreen from "./screens/location/SelectLocationScreen";
import { HYDERABAD_PLACES } from "./screens/location/hyderabadPlaces";
import PaymentSelectScreen from "./screens/payments/PaymentSelectScreen";
import PaymentMethodScreen from "./screens/payments/PaymentMethodScreen";
import TripSummaryScreen from "./screens/ride/TripSummaryScreen";
import TripReviewScreen from "./screens/ride/TripReviewScreen";
import TripDetailsBottomSheet from "./screens/ride/TripDetailsBottomSheet";
import ParcelChooseRideScreen from "./screens/parcel/ParcelChooseRideScreen";
import TravelScreen from "./screens/advanced/TravelScreen";
import MetroScreen from "./screens/advanced/MetroScreen";
import MetroRouteScreen from "./screens/advanced/MetroRouteScreen";
import MyRidesScreen from "./screens/orders/MyRidesScreen";
import BottomNav from "./components/BottomNav";
import RideFlowChrome from "./components/RideFlowChrome";
import { RideProvider } from "./screens/shared/RideContext";
import {
  bearingDegrees,
  buildRouteFallback,
  decodePolyline,
  fetchStreetRoute,
  haversineMeters,
  isValidCoordinate,
} from "./routeUtils";
import { distanceFromRouteMeters, normalizeLiveLocation, snapLocationToRoute } from "./trackingUtils";
import { connectRideSocket, disconnectRideSocket, joinRideOrderRoom, joinRideUserRoom, setRideSocketToken } from "./socket";
import {
  bootstrapCustomerSession,
  completeBackendRide,
  createBackendRide,
  createPaymentOrder,
  deleteDeliveryAddress,
  fetchDeliveryAddresses,
  loginCustomer,
  registerCustomer,
  saveDeliveryAddress,
  verifyPayment,
} from "./platformApi";
import { openCashfreeCheckout } from "./payments/cashfreeCheckout";
import {
  captureOperationalError,
  setMonitoringScreen,
  setMonitoringUser,
} from "./monitoring";
import SplashScreen from "./screens/onboarding/SplashScreen";
import IntroScreen from "./screens/onboarding/IntroScreen";
import LoginScreen from "./screens/onboarding/LoginScreen";
import SignupScreen from "./screens/onboarding/SignupScreen";
import OtpScreen from "./screens/onboarding/OtpScreen";

import { COLORS } from "./theme/colors";
const DEFAULT_PICKUP_ADDRESS = "Current location";
const OLD_DEFAULT_PICKUP_ADDRESS = "Kacheguda, Hyderabad, Telangana 500027";
const ENABLE_TRACKING_SIMULATION = __DEV__ && process.env.EXPO_PUBLIC_ENABLE_TRACKING_SIMULATION === "true";
const GROCERY_RELEASE_ENABLED = process.env.EXPO_PUBLIC_GROCERY_ENABLED === "true";

const DEFAULT_REGION = {
  latitude: 17.3898,
  longitude: 78.4989,
  latitudeDelta: 0.032,
  longitudeDelta: 0.032
};

const BOTTOM_TABS = [
  { key: "home", label: "Ride", icon: "home" },
  { key: "travel", label: "Travel", icon: "travel" },
  { key: "parcel", label: "Parcel", icon: "parcel" },
  ...(GROCERY_RELEASE_ENABLED
    ? [{ key: "grocery", label: "Grocery", icon: "grocery" }]
    : []),
  { key: "profile", label: "Account", icon: "account" }
];

function isDefaultPickupAddress(value) {
  const text = String(value || "").trim();
  return !text || text === DEFAULT_PICKUP_ADDRESS || text === OLD_DEFAULT_PICKUP_ADDRESS;
}

function formatDeviceAddress(address) {
  if (!address) return DEFAULT_PICKUP_ADDRESS;

  const parts = [
    address.name,
    address.street,
    address.district || address.subregion,
    address.city,
    address.region,
    address.postalCode
  ]
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter((part, index, list) => part && list.indexOf(part) === index);

  return parts.slice(0, 4).join(", ") || DEFAULT_PICKUP_ADDRESS;
}

async function resolveDeviceAddress(coords) {
  try {
    const [address] = await Location.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude
    });
    return formatDeviceAddress(address);
  } catch {
    return DEFAULT_PICKUP_ADDRESS;
  }
}

function getPaymentFooterLabel(option) {
  if (!option) return "Payment method";
  if (option.key === "card") return option.title || "Card";
  if (option.key === "wallet") return `Wallet ${option.value || ""}`.trim();
  if (option.key === "upi") return "UPI";
  if (option.key === "cash") return "Cash";
  return option.title || "Payment";
}

function normalizePaymentOption(option) {
  if (!option) return null;
  if (option.key) return option;

  if (option.paymentMode === "upi") return { key: "upi", title: "UPI" };
  if (option.paymentMode === "card") return { key: "card", title: "Card" };
  if (option.paymentMode === "wallet") return { key: "wallet", title: "Wallet" };
  if (option.paymentMode === "delivery") return { key: "cash", title: "Cash" };
  return { key: option.paymentMode || "payment", title: option.provider || "Payment" };
}

function getCouponFooterLabel(coupon) {
  if (!coupon?.code) return "Apply coupons";
  return coupon.code;
}

function resolvePaymentProvider(option) {
  const key = String(option?.key || option?.paymentMode || "card").toLowerCase();

  if (key === "cash" || key === "delivery") return "CASH";
  if (key === "wallet") return "WALLET";
  if (key === "upi") return "UPI";
  return "CARD";
}

const QUICK_SERVICES = [
  {
    key: "bike",
    title: "Bike",
    subtitle: "Quick rides",
    price: "From ₹48",
    image: require("./assets/vehicles/bike.png")
  },
  {
    key: "auto",
    title: "Auto",
    subtitle: "Doorstep auto",
    price: "From ₹62",
    image: require("./assets/vehicles/auto.png")
  },
  {
    key: "cab",
    title: "Cab",
    subtitle: "Comfort rides",
    price: "From ₹121",
    image: require("./assets/vehicles/cab.png")
  },
  {
    key: "parcel",
    title: "Parcel",
    subtitle: "Delivery fast",
    price: "From ₹74",
    image: require("./assets/vehicles/parcel.png")
  }
];

const RIDE_WITH_US = [
  {
    key: "bike",
    title: "Bike",
    subtitle: "Quick & affordable rides",
    price: "₹8/km",
    badge: "Quickest",
    image: require("./assets/vehicles/bike.png"),
    imageStyle: {
      width: 150,
      height: 110,
      right: -10,
      bottom: 0
    }
  },
  {
    key: "cab",
    title: "Cab",
    subtitle: "Comfortable rides",
    price: "₹15/km",
    badge: "Comfort",
    image: require("./assets/vehicles/cab.png"),
    imageStyle: {
      width: 180,
      height: 110,
      right: -20,
      bottom: 0
    }
  },
  {
    key: "parcel",
    title: "Parcel Delivery",
    subtitle: "Safe & on-time delivery",
    price: "From ₹30",
    badge: "Fast Delivery",
    image: require("./assets/vehicles/parcel.png"),
    imageStyle: {
      width: 180,
      height: 130,
      right: -15,
      bottom: -5
    }
  },
  {
    key: "truck",
    title: "Truck Rentals",
    subtitle: "For shifting & deliveries",
    price: "₹25/km",
    badge: "For Rentals",
    image: require("./assets/vehicles/bus.png"),
    imageStyle: {
      width: 260,
      height: 140,
      right: -10,
      bottom: 0
    }
  }
];
const FEATURES = [
  { key: "safe", label: "Safe", icon: "shield-check-outline" },
  { key: "tracking", label: "Tracking", icon: "crosshairs-gps" },
  { key: "fare", label: "Low Fare", icon: "cash-fast" },
  { key: "support", label: "Support", icon: "headset" }
];

const RIDE_OPTIONS = [
  {
    key: "bike",
    title: "Bike",
    subtitle: "Quick bike rides",
    eta: "2 mins away",
    price: "₹89",
    oldPrice: "₹99",
    image: require("./assets/vehicles/bike.png")
  },
  {
    key: "scooty",
    title: "Scooty",
    subtitle: "Light and quick",
    eta: "2 mins away",
    price: "₹98",
    oldPrice: "₹103",
    image: require("./assets/vehicles/bike.png")
  },
  {
    key: "auto",
    title: "Auto",
    subtitle: "Affordable auto rides",
    eta: "2 mins away",
    price: "₹164",
    oldPrice: "₹178",
    image: require("./assets/vehicles/auto.png")
  },
  {
    key: "auto_priority",
    title: "Auto Priority",
    subtitle: "Priority pickup and quick routing",
    eta: "2 mins away",
    price: "₹209",
    oldPrice: "₹225",
    image: require("./assets/vehicles/auto.png")
  }
];

const BOOKING_SEQUENCE = ["searching", "assigned", "in_progress", "completed"];
const RIDE_STATUS_EVENT_MAP = {
  order_assigned: "DRIVER_ASSIGNED",
  order_accepted: "DRIVER_ASSIGNED",
  otp_verified: "ON_TRIP",
  captain_assigned: "DRIVER_ASSIGNED",
  driver_assigned: "DRIVER_ASSIGNED",
  captain_arriving: "ARRIVING",
  driver_arriving: "ARRIVING",
  captain_arrived: "ARRIVED",
  driver_arrived: "ARRIVED",
  reached_pickup: "ARRIVED",
  trip_started: "ON_TRIP",
  ride_started: "ON_TRIP",
  ride_in_progress: "ON_TRIP",
  ride_status_changed: "ON_TRIP",
  ride_state_changed: "ON_TRIP",
  trip_status_changed: "ON_TRIP",
  status_update: "ON_TRIP",
  trip_update: "ON_TRIP",
  trip_completed: "COMPLETED",
};

const SOURCE_APP = "RIDE_APP";
const PROFILE_SLIDE_DURATION = 280;
const ACCOUNT_TRANSITION_SCREENS = new Set([
  "profile",
  "editProfile",
  "settings",
  "support",
  "ticketDetails",
  "chatSupport",
  "safety",
  "wallet",
  "addMoney",
  "transactions",
  "fareBreakdown",
  "receipts",
  "refundStatus",
  "refer",
  "savedPlaces",
  "addAddress",
  "bookings",
  "offers",
  "paymentMethod",
  "applyCoupon",
]);

function isAccountTransitionScreen(screen) {
  return ACCOUNT_TRANSITION_SCREENS.has(screen);
}

function resolveAccountTransitionDirection(fromScreen, toScreen, context = {}) {
  const backTargets = {
    editProfile: "profile",
    settings: "profile",
    support: "profile",
    ticketDetails: "support",
    chatSupport: "support",
    safety: "profile",
    wallet: context.walletReturnScreen || "profile",
    addMoney: "wallet",
    transactions: context.transactionsReturnScreen || "profile",
    fareBreakdown: "profile",
    receipts: "profile",
    refundStatus: "profile",
    refer: context.referReturnScreen || "profile",
    savedPlaces: context.savedPlacesReturnScreen || "profile",
    addAddress: "savedPlaces",
    bookings: context.ridesReturnScreen || "profile",
    offers: "profile",
    paymentMethod: context.paymentMethodReturnScreen || "profile",
  };

  if (isAccountTransitionScreen(fromScreen) && (toScreen === "home" || backTargets[fromScreen] === toScreen)) {
    return "reverse";
  }

  return "forward";
}

function ScreenTransition({ children, animatedStyle }) {
  return (
    <Animated.View style={[styles.screenTransition, animatedStyle]}>
      {children}
    </Animated.View>
  );
}


function resolveVehicleType(ride = {}) {
  const value = String(ride?.key || ride?.name || ride?.title || ride?.id || "").toLowerCase();

  if (value.includes("bike") || value.includes("scooty")) return "BIKE";
  if (value.includes("auto")) return "AUTO";
  return "CAB";
}

function parsePriceAmount(value = "") {
  const numeric = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeRideStatus(status, fallback = "ON_TRIP") {
  const value = String(status || "").toUpperCase();

  if (!value) return fallback;
  if (["WAITING_FOR_OTP", "FETCHING_ROUTE", "SEARCHING", "PENDING"].includes(value)) return "SEARCHING";
  if (["DRIVER_ASSIGNED", "ASSIGNED", "CAPTAIN_ASSIGNED"].includes(value)) return "DRIVER_ASSIGNED";
  if (["ARRIVING", "CAPTAIN_ARRIVING", "DRIVER_ARRIVING", "NEARBY"].includes(value)) return "ARRIVING";
  if (["ARRIVED", "CAPTAIN_ARRIVED", "DRIVER_ARRIVED", "REACHED_PICKUP", "AT_PICKUP"].includes(value)) return "ARRIVED";
  if (["ON_TRIP", "IN_PROGRESS", "NAVIGATION", "TRIP_STARTED"].includes(value)) return "ON_TRIP";
  if (["COMPLETED", "TRIP_COMPLETED", "FINISHED"].includes(value)) return "COMPLETED";

  return fallback;
}

function resolveRideStatusFromPayload(payload = {}, eventName = "", fallback = "ON_TRIP") {
  const candidateSources = [payload, payload?.data, payload?.ride, payload?.trip, payload?.payload];

  for (const source of candidateSources) {
    if (!source || typeof source !== "object") {
      continue;
    }

    const explicit =
      source.rideStatus ||
      source.status ||
      source.state ||
      source.stage ||
      source.ride_state ||
      source.rideStage;

    if (explicit) {
      return normalizeRideStatus(explicit, fallback);
    }
  }

  if (eventName && RIDE_STATUS_EVENT_MAP[eventName]) {
    return normalizeRideStatus(RIDE_STATUS_EVENT_MAP[eventName], fallback);
  }

  return fallback;
}

function readRouteCoordsFromPayload(payload = {}) {
  const candidateSources = [payload, payload?.data, payload?.ride, payload?.trip, payload?.payload];

  for (const source of candidateSources) {
    if (!source || typeof source !== "object") {
      continue;
    }

    if (Array.isArray(source.routeCoords) && source.routeCoords.length > 1) {
      return source.routeCoords.filter(isValidCoordinate);
    }

    if (typeof source.routePolyline === "string" && source.routePolyline.trim()) {
      return decodePolyline(source.routePolyline);
    }

    if (typeof source.polyline === "string" && source.polyline.trim()) {
      return decodePolyline(source.polyline);
    }
  }

  return [];
}

function normalizeLocationSearch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\broad\s*no\.?\s*/g, "road ")
    .replace(/\bno\.?\s*(\d+)/g, "$1")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function scoreLocationPlace(place, rawQuery) {
  const query = normalizeLocationSearch(rawQuery);
  if (!query) return 0;

  const title = normalizeLocationSearch(place.title);
  const area = normalizeLocationSearch(place.area);
  const category = normalizeLocationSearch(place.category);
  const subtitle = normalizeLocationSearch(place.subtitle);
  const tags = normalizeLocationSearch((place.tags || []).join(" "));
  const haystack = [title, area, subtitle, category, tags].join(" ");
  const tokens = query.split(" ").filter(Boolean);

  if (title === query) return 160;
  if (subtitle === query) return 146;
  if (title.startsWith(query)) return 132;
  if (area === query) return 118;
  if (area.startsWith(query)) return 104;
  if (subtitle.includes(query)) return 86;
  if (title.includes(query)) return 76;
  if (tags.includes(query)) return 66;
  if (tokens.length > 1 && tokens.every((token) => haystack.includes(token))) return 52;
  return 0;
}

function resolveHyderabadPlace(text) {
  const query = String(text || "").trim();
  if (!query) return null;

  return HYDERABAD_PLACES
    .map((place) => ({ place, score: scoreLocationPlace(place, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.place.title.localeCompare(b.place.title))[0]?.place || null;
}

function formatResolvedPlaceLabel(place) {
  if (!place) return "";
  return [place.title, place.area, "Hyderabad"].filter(Boolean).join(", ");
}

function resolveRoutePoint({ text, coord, fallbackCoord }) {
  const trimmed = String(text || "").trim();
  const place = resolveHyderabadPlace(trimmed);

  if (place?.coordinate) {
    return {
      text: formatResolvedPlaceLabel(place),
      coord: place.coordinate,
    };
  }

  if (isValidCoordinate(coord)) {
    return {
      text: trimmed,
      coord,
    };
  }

  return {
    text: trimmed,
    coord: fallbackCoord,
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, ms, timeoutMessage) {
  return Promise.race([
    promise,
    delay(ms).then(() => {
      throw new Error(timeoutMessage);
    }),
  ]);
}

function buildResolvedRegion(pickupCoord, dropCoord) {
  if (!isValidCoordinate(pickupCoord) || !isValidCoordinate(dropCoord)) return DEFAULT_REGION;

  const latDelta = Math.max(Math.abs(pickupCoord.latitude - dropCoord.latitude) * 1.9, 0.028);
  const lngDelta = Math.max(Math.abs(pickupCoord.longitude - dropCoord.longitude) * 1.9, 0.028);

  return {
    latitude: (pickupCoord.latitude + dropCoord.latitude) / 2,
    longitude: (pickupCoord.longitude + dropCoord.longitude) / 2,
    latitudeDelta: Math.min(latDelta, 0.18),
    longitudeDelta: Math.min(lngDelta, 0.18),
  };
}

function PlaceholderPanel({ icon, title, subtitle, accent = COLORS.primary }) {
  return (
    <SafeAreaView style={styles.placeholderSafe} edges={["top"]}>
      <View style={styles.placeholderCard}>
        <View style={[styles.placeholderIcon, { backgroundColor: `${accent}14` }]}>
          <MaterialCommunityIcons name={icon} size={34} color={accent} />
        </View>
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderSubtitle}>{subtitle}</Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreenState] = useState("splash");
  const [displayedScreen, setDisplayedScreen] = useState("splash");
  const [activeTab, setActiveTab] = useState("home");
  const windowWidth = Dimensions.get("window").width;
  const [screenTransition, setScreenTransition] = useState(null);
  const screenTransitionAnim = useRef(new Animated.Value(1)).current;
  const screenTransitionTokenRef = useRef("");
  const previousScreenRef = useRef("splash");
  const homeScrollY = useRef(new Animated.Value(0)).current;
  const travelScrollY = useRef(new Animated.Value(0)).current;
  const profileScrollY = useRef(new Animated.Value(0)).current;
  const [homeMode, setHomeMode] = useState("ride");
  const [selectedRideKey, setSelectedRideKey] = useState("bike");
  const [selectedJourneyRide, setSelectedJourneyRide] = useState(null);
  const [bookingStage, setBookingStage] = useState("searching");
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [devicePickup, setDevicePickup] = useState({
    text: DEFAULT_PICKUP_ADDRESS,
    coord: {
      latitude: DEFAULT_REGION.latitude,
      longitude: DEFAULT_REGION.longitude
    }
  });
  const [metroRouteParams, setMetroRouteParams] = useState({ from: "Ameerpet", to: "Raidurg" });
  const [walletReturnScreen, setWalletReturnScreen] = useState("home");
  const [ridesReturnScreen, setRidesReturnScreen] = useState("home");
  const [referReturnScreen, setReferReturnScreen] = useState("home");
  const [savedPlacesReturnScreen, setSavedPlacesReturnScreen] = useState("profile");
  const [scheduleReturnScreen, setScheduleReturnScreen] = useState("rideOptions");
  const [paymentSelectReturnScreen, setPaymentSelectReturnScreen] = useState("rideOptions");
  const [paymentMethodReturnScreen, setPaymentMethodReturnScreen] = useState("wallet");
  const [couponReturnScreen, setCouponReturnScreen] = useState("rideOptions");
  const [transactionsReturnScreen, setTransactionsReturnScreen] = useState("profile");
  const [topUpAmount, setTopUpAmount] = useState("₹200");
  const [selectedPaymentOption, setSelectedPaymentOption] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shareLiveTripReturnScreen, setShareLiveTripReturnScreen] = useState("onTrip");
  const [messageCaptainReturnScreen, setMessageCaptainReturnScreen] = useState("onTheWay");
  const [tripDetailsReturnScreen, setTripDetailsReturnScreen] = useState("onTheWay");
  const [tripDetailsSheetVisible, setTripDetailsSheetVisible] = useState(false);
  const [locationSelectMode, setLocationSelectMode] = useState("pickup");
  const [mapReturnScreen, setMapReturnScreen] = useState("bookRide");
  const [addressMapLocation, setAddressMapLocation] = useState("");
  const [addressMapCoord, setAddressMapCoord] = useState(null);
  const [savedDeliveryAddresses, setSavedDeliveryAddresses] = useState([]);
  const [editingDeliveryAddress, setEditingDeliveryAddress] = useState(null);
  const [tripState, setTripState] = useState("WAITING_FOR_OTP");
  const [navigationTrip, setNavigationTrip] = useState(null);
  const [captainLocation, setCaptainLocation] = useState(null);
  const [liveTrackingState, setLiveTrackingState] = useState({ status: "idle", lastUpdateAt: null, error: null });
  const [rideAcceptance, setRideAcceptance] = useState(null);
  const rideAcceptanceTimerRef = useRef(null);
  const [isResolvingRoute, setIsResolvingRoute] = useState(false);
  const [routeLoadingMessage, setRouteLoadingMessage] = useState("Finding the best route");
  const [routeState, setRouteState] = useState({
    pickupText: DEFAULT_PICKUP_ADDRESS,
    dropText: "",
    pickupCoord: {
      latitude: DEFAULT_REGION.latitude,
      longitude: DEFAULT_REGION.longitude
    },
    dropCoord: {
      latitude: DEFAULT_REGION.latitude + 0.008,
      longitude: DEFAULT_REGION.longitude + 0.008
    },
    routeCoords: []
  });
  const [tripDetails, setTripDetails] = useState({
    pickup: DEFAULT_PICKUP_ADDRESS,
    drop: "Hitech City, Hyderabad"
  });

  useEffect(() => {
    if (currentScreen !== "tripDetailsStatus") return;
    setTripDetailsSheetVisible(true);
    setCurrentScreen(tripDetailsReturnScreen || "onTheWay");
  }, [currentScreen, tripDetailsReturnScreen]);
  const [profileData, setProfileData] = useState({
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul.sharma@example.com",
    gender: "Male",
    dob: "15 Apr 1994"
  });
  const [backendSession, setBackendSession] = useState(null);
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeRideOrder, setActiveRideOrder] = useState(null);
  const [isCreatingRide, setIsCreatingRide] = useState(false);

  useEffect(() => {
    setMonitoringScreen(currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    setMonitoringUser(backendSession?.user || null);
  }, [backendSession?.user]);

  useEffect(() => {
    if (currentScreen !== "splash") {
      return undefined;
    }

    const timer = setTimeout(() => {
      setCurrentScreen("intro");
    }, 1400);

    return () => clearTimeout(timer);
  }, [currentScreen]);

  useLayoutEffect(() => {
    if (!screenTransition) {
      return undefined;
    }

    const transitionKey = screenTransition.key;
    screenTransitionAnim.stopAnimation();

    if (screenTransition.phase === "closing") {
      screenTransitionAnim.setValue(1);
      Animated.timing(screenTransitionAnim, {
        toValue: 0,
        duration: 115,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || screenTransitionTokenRef.current !== transitionKey) return;
        setDisplayedScreen(screenTransition.to);
        previousScreenRef.current = screenTransition.to;
        setScreenTransition((current) => (
          current?.key === transitionKey ? { ...current, phase: "opening" } : current
        ));
      });
    } else {
      screenTransitionAnim.setValue(0);
      Animated.timing(screenTransitionAnim, {
        toValue: 1,
        duration: 185,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || screenTransitionTokenRef.current !== transitionKey) return;
        previousScreenRef.current = screenTransition.to;
        screenTransitionTokenRef.current = "";
        setScreenTransition(null);
      });
    }

    return () => {
      screenTransitionAnim.stopAnimation();
    };
  }, [screenTransition, screenTransitionAnim]);

  const setCurrentScreen = useCallback(
    (nextScreen) => {
      const nextValue = String(nextScreen || "");

      if (!nextValue) {
        return;
      }

      if (screenTransitionTokenRef.current && screenTransition) {
        return;
      }

      if (currentScreen === nextValue && displayedScreen === nextValue) {
        return;
      }

      const needsAccountTransition =
        isAccountTransitionScreen(currentScreen) || isAccountTransitionScreen(nextValue);

      if (!needsAccountTransition) {
        screenTransitionTokenRef.current = "";
        screenTransitionAnim.stopAnimation();
        screenTransitionAnim.setValue(1);
        setScreenTransition(null);
        previousScreenRef.current = nextValue;
        setDisplayedScreen(nextValue);
        setCurrentScreenState(nextValue);
        return;
      }

      const transitionKey = `${displayedScreen}-${nextValue}-${Date.now()}`;
      screenTransitionTokenRef.current = transitionKey;
      setCurrentScreenState(nextValue);
      setScreenTransition({
        key: transitionKey,
        from: displayedScreen,
        to: nextValue,
        phase: "closing",
        direction: resolveAccountTransitionDirection(displayedScreen, nextValue, {
          walletReturnScreen,
          ridesReturnScreen,
          referReturnScreen,
          savedPlacesReturnScreen,
          transactionsReturnScreen,
          paymentMethodReturnScreen,
        }),
      });
    },
    [
      currentScreen,
      displayedScreen,
      screenTransition,
      walletReturnScreen,
      ridesReturnScreen,
      referReturnScreen,
      savedPlacesReturnScreen,
      transactionsReturnScreen,
      paymentMethodReturnScreen,
    ]
  );

  const beginRideAcceptance = useCallback((payload = {}) => {
    const data = payload?.data || payload || {};
    const originalFare = parsePriceAmount(
      selectedJourneyRide?.price || activeRideOrder?.estimatedFare || 0
    );
    const acceptedFare = parsePriceAmount(
      data.acceptedFare ?? data.finalFare ?? data.fare ?? data.estimatedFare ?? originalFare
    );
    const explicitBoost = parsePriceAmount(data.boostAmount ?? data.fareBoost ?? 0);
    const boostAmount = explicitBoost || Math.max(acceptedFare - originalFare, 0);
    const acceptedCaptainLocation =
      data.captainLocation ||
      data.location ||
      data.coords ||
      data.partner?.location ||
      data.driver?.location;
    const initialCaptainLocation = isValidCoordinate(acceptedCaptainLocation)
      ? acceptedCaptainLocation
      : ENABLE_TRACKING_SIMULATION && isValidCoordinate(routeState.pickupCoord)
        ? {
            latitude: routeState.pickupCoord.latitude + 0.0032,
            longitude: routeState.pickupCoord.longitude - 0.0024,
          }
        : null;

    setRideAcceptance({
      captainName: data.captainName || data.driverName || data.partnerName || data.partner?.name || "Your captain",
      eta: data.eta || data.etaText || data.arrivalTime || "2 mins",
      originalFare,
      acceptedFare: acceptedFare || originalFare,
      boostAmount,
      boosted: boostAmount > 0,
    });

    if (initialCaptainLocation) {
      setCaptainLocation({
        latitude: initialCaptainLocation.latitude,
        longitude: initialCaptainLocation.longitude,
        heading: Number.isFinite(initialCaptainLocation.heading)
          ? initialCaptainLocation.heading
          : bearingDegrees(initialCaptainLocation, routeState.pickupCoord),
      });
    }

    if (rideAcceptanceTimerRef.current) clearTimeout(rideAcceptanceTimerRef.current);
    rideAcceptanceTimerRef.current = setTimeout(() => {
      setCurrentScreen("onTheWay");
      rideAcceptanceTimerRef.current = null;
    }, 1500);
  }, [activeRideOrder?.estimatedFare, routeState.pickupCoord, selectedJourneyRide?.price, setCurrentScreen]);

  useEffect(() => () => {
    if (rideAcceptanceTimerRef.current) clearTimeout(rideAcceptanceTimerRef.current);
  }, []);

  useEffect(() => {
    if (
      !ENABLE_TRACKING_SIMULATION ||
      currentScreen !== "onTheWay" ||
      !isValidCoordinate(routeState.pickupCoord)
    ) {
      return undefined;
    }

    const timer = setInterval(() => {
      setCaptainLocation((current) => {
        if (!isValidCoordinate(current)) return current;
        const remainingMeters = haversineMeters(current, routeState.pickupCoord);
        if (remainingMeters <= 18) return current;

        const progress = Math.min(0.12, 28 / Math.max(remainingMeters, 1));
        const next = {
          latitude: current.latitude +
            (routeState.pickupCoord.latitude - current.latitude) * progress,
          longitude: current.longitude +
            (routeState.pickupCoord.longitude - current.longitude) * progress,
        };

        return {
          ...next,
          heading: bearingDegrees(current, next),
        };
      });
    }, 1400);

    return () => clearInterval(timer);
  }, [currentScreen, routeState.pickupCoord]);

  const ensureCustomerSession = useCallback(async () => {
    const session = await bootstrapCustomerSession();
    setBackendSession(session);
    setRideSocketToken(session?.accessToken || "");
    return session;
  }, []);

  const joinRealtimeRooms = useCallback((session, rideOrderId) => {
    if (!session?.accessToken) {
      return null;
    }

    setRideSocketToken(session.accessToken);
    const socket = connectRideSocket({ token: session.accessToken });

    if (session.user?.id) {
      joinRideUserRoom(session.user.id);
    }

    if (rideOrderId) {
      joinRideOrderRoom("RIDE", rideOrderId);
    }

    return socket;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function requestDevicePermissions() {
      try {
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus === "granted") {
          const current = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          const pickupCoord = {
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
            accuracyM: current.coords.accuracy,
            heading: current.coords.heading,
            speedMps: current.coords.speed,
            timestamp: current.timestamp,
          };
          const pickupAddress = await resolveDeviceAddress(pickupCoord);

          if (!mounted) return;

          setDevicePickup({ text: pickupAddress, coord: pickupCoord });
          setRegion((prev) => ({
            ...prev,
            latitude: pickupCoord.latitude,
            longitude: pickupCoord.longitude
          }));
          setRouteState((currentRoute) => ({
            ...currentRoute,
            pickupCoord,
            pickupText: isDefaultPickupAddress(currentRoute.pickupText) ? pickupAddress : currentRoute.pickupText,
            dropCoord: currentRoute.dropCoord || {
              latitude: pickupCoord.latitude + 0.008,
              longitude: pickupCoord.longitude + 0.008
            }
          }));
          setTripDetails((currentTrip) => ({
            ...currentTrip,
            pickup: isDefaultPickupAddress(currentTrip.pickup) ? pickupAddress : currentTrip.pickup
          }));
        }

        if (Notifications) {
          await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
            },
            android: {},
          });
        }
      } catch {
        // Keep defaults if device permissions are unavailable.
      }
    }

    requestDevicePermissions();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    ensureCustomerSession().catch((error) => {
      if (!mounted) return;
      console.warn("Backend customer session bootstrap failed", error);
    });

    return () => {
      mounted = false;
    };
  }, [ensureCustomerSession]);

  const refreshHomeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      const pickupCoord = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        accuracyM: current.coords.accuracy,
        heading: current.coords.heading,
        speedMps: current.coords.speed,
        timestamp: current.timestamp,
      };
      const pickupAddress = await resolveDeviceAddress(pickupCoord);

      setDevicePickup({ text: pickupAddress, coord: pickupCoord });
      setRegion((prev) => ({
        ...prev,
        latitude: pickupCoord.latitude,
        longitude: pickupCoord.longitude
      }));
      setRouteState((currentRoute) => ({
        ...currentRoute,
        pickupCoord,
        pickupText: isDefaultPickupAddress(currentRoute.pickupText) ? pickupAddress : currentRoute.pickupText,
      }));
      setTripDetails((currentTrip) => ({
        ...currentTrip,
        pickup: isDefaultPickupAddress(currentTrip.pickup) ? pickupAddress : currentTrip.pickup
      }));
    } catch {
      // Keep the current region if refresh location is unavailable.
    }
  };

  useEffect(() => {
    setRouteState((current) => {
      const sameFallback =
        current.pickupCoord?.latitude === DEFAULT_REGION.latitude &&
        current.pickupCoord?.longitude === DEFAULT_REGION.longitude;

      if (!sameFallback && current.pickupCoord) return current;

      return {
        ...current,
        pickupCoord: {
          latitude: region.latitude,
          longitude: region.longitude
        },
        pickupText: current.pickupText || DEFAULT_PICKUP_ADDRESS,
        dropCoord: {
          latitude: region.latitude + 0.008,
          longitude: region.longitude + 0.008
        }
      };
    });
  }, [region]);

  const selectedRide = useMemo(
    () => RIDE_OPTIONS.find((option) => option.key === selectedRideKey) || RIDE_OPTIONS[0],
    [selectedRideKey]
  );

  const openMetroRoute = (route) => {
    // Metro is a nested Travel service now that the bottom bar is the single
    // service switcher. Keep Travel highlighted throughout the Metro flow.
    setActiveTab("travel");
    setMetroRouteParams(route || { from: "Ameerpet", to: "Raidurg" });
    setCurrentScreen("metroRoute");
  };

  const navigateToTab = (key) => {
    setActiveTab(key);
    if (key === "home") {
      setHomeMode("ride");
      setCurrentScreen("home");
    }
    if (key === "travel") setCurrentScreen("travel");
    if (key === "parcel") {
      setHomeMode("parcel");
      setCurrentScreen("home");
    }
    if (key === "grocery" && GROCERY_RELEASE_ENABLED) {
      setHomeMode("grocery");
      setCurrentScreen("home");
    }
    if (key === "profile") setCurrentScreen("profile");
  };

  const goHome = () => {
    setActiveTab("home");
    setHomeMode("ride");
    setActiveRideOrder(null);
    setTripState("WAITING_FOR_OTP");
    setNavigationTrip(null);
    setCaptainLocation(null);
    setCurrentScreen("home");
  };

  const advanceOnboarding = (currentStep) => {
    const nextStepMap = {
      intro: "login",
      login: "otp",
      signup: "otp",
      otp: "home",
    };

    const nextStep = nextStepMap[currentStep] || "home";

    if (nextStep === "home") {
      goHome();
      return;
    }

    setCurrentScreen(nextStep);
  };

  const applyAuthenticatedSession = useCallback((session) => {
    setBackendSession(session);
    setRideSocketToken(session?.accessToken || "");
    if (session?.accessToken) {
      joinRealtimeRooms(session);
    }
  }, [joinRealtimeRooms]);

  const handleCustomerLogin = async (credentials) => {
    if (isAuthenticating) return;
    setAuthError("");
    setIsAuthenticating(true);
    try {
      const session = await loginCustomer(credentials);
      applyAuthenticatedSession(session);
      goHome();
    } catch (error) {
      setAuthError(error?.message || "Unable to log in. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCustomerSignup = async (form) => {
    if (isAuthenticating) return;
    const digits = String(form?.mobile || "").replace(/\D/g, "").slice(-10);
    setAuthError("");
    setIsAuthenticating(true);
    try {
      const session = await registerCustomer({
        fullName: String(form?.name || "").trim(),
        phone: `+91${digits}`,
        password: form?.password || "",
      });
      applyAuthenticatedSession(session);
      goHome();
    } catch (error) {
      setAuthError(error?.message || "Unable to create your account. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const openWalletFromHome = () => {
    setWalletReturnScreen("home");
    setCurrentScreen("wallet");
  };

  const openWalletFromProfile = () => {
    setWalletReturnScreen("profile");
    setCurrentScreen("wallet");
  };

  const openRidesFromProfile = () => {
    setRidesReturnScreen("profile");
    setCurrentScreen("bookings");
  };

  const openReferFromHome = () => {
    setReferReturnScreen("home");
    setCurrentScreen("refer");
  };

  const openReferFromProfile = () => {
    setReferReturnScreen("profile");
    setCurrentScreen("refer");
  };

  const openPaymentMethodFromWallet = () => {
    setPaymentMethodReturnScreen("wallet");
    setCurrentScreen("paymentMethod");
  };

  const openPaymentMethodFromProfile = () => {
    setPaymentMethodReturnScreen("profile");
    setCurrentScreen("paymentMethod");
  };

  const openAddMoneyFromWallet = (amount = "₹200") => {
    setTopUpAmount(amount);
    setCurrentScreen("addMoney");
  };

  const openTransactionsFromWallet = () => {
    setTransactionsReturnScreen("wallet");
    setCurrentScreen("transactions");
  };

  const openTransactionsFromProfile = () => {
    setTransactionsReturnScreen("profile");
    setCurrentScreen("transactions");
  };

  const openCouponsFromProfile = () => {
    setActiveTab("profile");
    setCouponReturnScreen("profile");
    setCurrentScreen("applyCoupon");
  };

  const openReceiptsFromProfile = () => {
    setCurrentScreen("receipts");
  };

  const openRefundsFromProfile = () => {
    setCurrentScreen("refundStatus");
  };

  const openFareBreakdownFromProfile = () => {
    setCurrentScreen("fareBreakdown");
  };

  const loadSavedDeliveryAddresses = async () => {
    if (!backendSession?.accessToken) {
      setSavedDeliveryAddresses([]);
      return;
    }
    try {
      const addresses = await fetchDeliveryAddresses(backendSession.accessToken);
      setSavedDeliveryAddresses(addresses || []);
    } catch (error) {
      console.warn("Failed to load saved addresses", error);
    }
  };

  const openSavedPlacesFromProfile = (returnScreen = "profile") => {
    setSavedPlacesReturnScreen(typeof returnScreen === "string" ? returnScreen : "profile");
    loadSavedDeliveryAddresses();
    setCurrentScreen("savedPlaces");
  };

  const openTicketDetails = () => {
    setCurrentScreen("ticketDetails");
  };

  const openChatSupport = () => {
    setCurrentScreen("chatSupport");
  };

  const openShareLiveTrip = (returnScreen = "onTrip") => {
    setShareLiveTripReturnScreen(returnScreen);
    setCurrentScreen("shareLiveTrip");
  };

  const openMessageCaptain = (returnScreen = currentScreen) => {
    setMessageCaptainReturnScreen(returnScreen || "onTheWay");
    setCurrentScreen("messageCaptain");
  };

  const handleOtpVerified = useCallback(
    async ({ pickupCoord = routeState.pickupCoord, dropCoord = routeState.dropCoord } = {}) => {
      if (!isValidCoordinate(pickupCoord) || !isValidCoordinate(dropCoord)) {
        return;
      }

      setTripState("FETCHING_ROUTE");

      let resolvedRoute = null;
      try {
        resolvedRoute = await fetchStreetRoute(pickupCoord, dropCoord);
      } catch (error) {
        console.warn("Failed to fetch navigation route after OTP verification", error);
      }

      const routePoints = Array.isArray(resolvedRoute?.routeCoords)
        ? resolvedRoute.routeCoords.filter(isValidCoordinate)
        : [];
      const safeRoutePoints = routePoints.length >= 2
        ? routePoints
        : buildRouteFallback(pickupCoord, dropCoord);

      if (safeRoutePoints.length < 2) {
        setTripState("ROUTE_UNAVAILABLE");
        setLiveTrackingState((current) => ({ ...current, error: "Navigation route is temporarily unavailable" }));
        return;
      }

      setNavigationTrip({
        pickupCoord,
        dropCoord,
        ...(resolvedRoute || {}),
        routeCoords: safeRoutePoints,
      });
      setCaptainLocation((current) => isValidCoordinate(current) ? current : safeRoutePoints[0] || pickupCoord);
      setTripState("ON_TRIP");
      setCurrentScreen("navigation");
    },
    [routeState.dropCoord, routeState.pickupCoord]
  );

  const handleCompleteRide = useCallback(async () => {
    if (backendSession?.accessToken && activeRideOrder?.id) {
      try {
        await completeBackendRide(backendSession.accessToken, activeRideOrder.id);
      } catch (error) {
        console.warn("Failed to complete backend ride", error);
      }
    }

    setTripState("COMPLETED");
    setCurrentScreen("tripCompleted");
  }, [activeRideOrder?.id, backendSession?.accessToken]);

  useEffect(() => {
    if (!backendSession?.accessToken) {
      return undefined;
    }

    const socket = joinRealtimeRooms(backendSession, activeRideOrder?.id);
    if (!socket) {
      return undefined;
    }

    const handleSocketConnect = () => {
      setLiveTrackingState((current) => ({ ...current, status: "connected", error: null }));
      joinRealtimeRooms(backendSession, activeRideOrder?.id);
    };

    const handleSocketDisconnect = () => {
      setLiveTrackingState((current) => ({ ...current, status: "reconnecting", error: "Live tracking is reconnecting" }));
    };

    const handleSocketError = () => {
      setLiveTrackingState((current) => ({ ...current, status: "reconnecting", error: "Live tracking is temporarily unavailable" }));
    };

    const handleOtpSuccess = async (payload = {}) => {
      const pickupCoord =
        payload?.pickupCoord ||
        payload?.pickup ||
        payload?.data?.pickupCoord ||
        payload?.data?.pickup ||
        routeState.pickupCoord;
      const dropCoord =
        payload?.dropCoord ||
        payload?.drop ||
        payload?.data?.dropCoord ||
        payload?.data?.drop ||
        routeState.dropCoord;

      const nextStatus = resolveRideStatusFromPayload(payload, "otp_verified", "ON_TRIP");
      if (nextStatus) {
        setTripState(nextStatus);
      }

      const routeCoordsFromPayload = readRouteCoordsFromPayload(payload);
      if (routeCoordsFromPayload.length > 1) {
        setNavigationTrip((current) =>
          current
            ? {
                ...current,
                pickupCoord,
                dropCoord,
                routeCoords: routeCoordsFromPayload,
                steps: Array.isArray(payload?.steps) ? payload.steps : current.steps,
                distanceText: payload?.distanceText || payload?.distance || current.distanceText,
                durationText: payload?.durationText || payload?.duration || current.durationText,
                arrivalText: payload?.arrivalText || payload?.arrival || current.arrivalText,
                instructionText: payload?.instructionText || payload?.instruction || current.instructionText,
                nextInstructionText:
                  payload?.nextInstructionText || payload?.nextInstruction || current.nextInstructionText,
              }
            : current
        );
      }

      await handleOtpVerified({ pickupCoord, dropCoord });
    };

    const handleRideStatusUpdate = (eventName) => (payload = {}) => {
      const nextStatus = resolveRideStatusFromPayload(payload, eventName, tripState);
      if (nextStatus) {
        setTripState(nextStatus);
        if (nextStatus === "COMPLETED") {
          setCurrentScreen("tripCompleted");
        } else if (nextStatus === "ON_TRIP") {
          setCurrentScreen("navigation");
        } else if (nextStatus === "ARRIVED") {
          setCurrentScreen("onTheWay");
        } else if (nextStatus === "ARRIVING" || nextStatus === "DRIVER_ASSIGNED") {
          beginRideAcceptance(payload);
        }
      }

      const routeCoordsFromPayload = readRouteCoordsFromPayload(payload);
      const nextCaptainLocation =
        payload?.captainLocation ||
        payload?.location ||
        payload?.coords ||
        payload?.data?.captainLocation ||
        payload?.data?.location ||
        payload?.data?.coords ||
        (isValidCoordinate(payload) ? payload : null);

      if (routeCoordsFromPayload.length > 1 || isValidCoordinate(nextCaptainLocation)) {
        setNavigationTrip((current) =>
          current
            ? {
                ...current,
                ...(routeCoordsFromPayload.length > 1 ? { routeCoords: routeCoordsFromPayload } : null),
                ...(Array.isArray(payload?.steps) || Array.isArray(payload?.data?.steps)
                  ? { steps: payload?.steps || payload?.data?.steps }
                  : null),
                ...(payload?.distanceText || payload?.distance || payload?.data?.distanceText || payload?.data?.distance
                  ? { distanceText: payload.distanceText || payload.distance || payload?.data?.distanceText || payload?.data?.distance }
                  : null),
                ...(payload?.durationText || payload?.duration || payload?.data?.durationText || payload?.data?.duration
                  ? { durationText: payload.durationText || payload.duration || payload?.data?.durationText || payload?.data?.duration }
                  : null),
                ...(payload?.arrivalText || payload?.arrival || payload?.data?.arrivalText || payload?.data?.arrival
                  ? { arrivalText: payload.arrivalText || payload.arrival || payload?.data?.arrivalText || payload?.data?.arrival }
                  : null),
                ...(payload?.instructionText || payload?.instruction || payload?.data?.instructionText || payload?.data?.instruction
                  ? { instructionText: payload.instructionText || payload.instruction || payload?.data?.instructionText || payload?.data?.instruction }
                  : null),
                ...(payload?.nextInstructionText || payload?.nextInstruction || payload?.data?.nextInstructionText || payload?.data?.nextInstruction
                  ? { nextInstructionText: payload.nextInstructionText || payload.nextInstruction || payload?.data?.nextInstructionText || payload?.data?.nextInstruction }
                  : null),
                ...(isValidCoordinate(nextCaptainLocation)
                  ? {
                      captainLocation: {
                        latitude: nextCaptainLocation.latitude,
                        longitude: nextCaptainLocation.longitude,
                      },
                      captainHeading: Number.isFinite(nextCaptainLocation.heading)
                        ? nextCaptainLocation.heading
                        : current?.captainHeading || 0,
                    }
                  : null),
              }
            : current
        );
      }
    };

    const handleCaptainLocation = (payload = {}) => {
      const normalizedLocation = normalizeLiveLocation(payload);
      if (!normalizedLocation || normalizedLocation.expired) return;
      const activeRoute = navigationTrip?.routeCoords?.length > 1 ? navigationTrip.routeCoords : routeState.routeCoords;
      const nextLocation = snapLocationToRoute(normalizedLocation, activeRoute, 70);

      setCaptainLocation(nextLocation);
      setLiveTrackingState({ status: nextLocation.stale ? "stale" : "live", lastUpdateAt: nextLocation.timestamp, error: null });

      setNavigationTrip((current) =>
        current
          ? {
              ...current,
              captainLocation: {
                ...nextLocation,
              },
              captainHeading: Number.isFinite(nextLocation.heading)
                ? nextLocation.heading
                : current.captainHeading || 0,
            }
          : current
      );
    };

    const handleTripCompleted = () => {
      setTripState("COMPLETED");
      setCurrentScreen("tripCompleted");
    };

    const onOrderAssigned = handleRideStatusUpdate("order_assigned");
    const onOrderAccepted = handleRideStatusUpdate("order_accepted");
    const onRideStatusChanged = handleRideStatusUpdate("ride_status_changed");
    const onRideStateChanged = handleRideStatusUpdate("ride_state_changed");
    const onTripStatusChanged = handleRideStatusUpdate("trip_status_changed");
    const onStatusUpdate = handleRideStatusUpdate("status_update");
    const onTripUpdate = handleRideStatusUpdate("trip_update");
    const onCaptainAssigned = handleRideStatusUpdate("captain_assigned");
    const onDriverAssigned = handleRideStatusUpdate("driver_assigned");
    const onCaptainArriving = handleRideStatusUpdate("captain_arriving");
    const onDriverArriving = handleRideStatusUpdate("driver_arriving");
    const onCaptainArrived = handleRideStatusUpdate("captain_arrived");
    const onDriverArrived = handleRideStatusUpdate("driver_arrived");
    const onReachedPickup = handleRideStatusUpdate("reached_pickup");
    const onTripStarted = handleRideStatusUpdate("trip_started");
    const onRideStarted = handleRideStatusUpdate("ride_started");
    const onRideInProgress = handleRideStatusUpdate("ride_in_progress");

    socket.on("connect", handleSocketConnect);
    socket.on("disconnect", handleSocketDisconnect);
    socket.on("connect_error", handleSocketError);
    socket.on("otp_verified", handleOtpSuccess);
    socket.on("captain_location", handleCaptainLocation);
    socket.on("partner_location_update", handleCaptainLocation);
    socket.on("order_assigned", onOrderAssigned);
    socket.on("order_accepted", onOrderAccepted);
    socket.on("ride_status_changed", onRideStatusChanged);
    socket.on("ride_state_changed", onRideStateChanged);
    socket.on("trip_status_changed", onTripStatusChanged);
    socket.on("status_update", onStatusUpdate);
    socket.on("trip_update", onTripUpdate);
    socket.on("captain_assigned", onCaptainAssigned);
    socket.on("driver_assigned", onDriverAssigned);
    socket.on("captain_arriving", onCaptainArriving);
    socket.on("driver_arriving", onDriverArriving);
    socket.on("captain_arrived", onCaptainArrived);
    socket.on("driver_arrived", onDriverArrived);
    socket.on("reached_pickup", onReachedPickup);
    socket.on("trip_started", onTripStarted);
    socket.on("ride_started", onRideStarted);
    socket.on("ride_in_progress", onRideInProgress);
    socket.on("trip_completed", handleTripCompleted);

    return () => {
      socket.off("connect", handleSocketConnect);
      socket.off("disconnect", handleSocketDisconnect);
      socket.off("connect_error", handleSocketError);
      socket.off("otp_verified", handleOtpSuccess);
      socket.off("captain_location", handleCaptainLocation);
      socket.off("partner_location_update", handleCaptainLocation);
      socket.off("order_assigned", onOrderAssigned);
      socket.off("order_accepted", onOrderAccepted);
      socket.off("ride_status_changed", onRideStatusChanged);
      socket.off("ride_state_changed", onRideStateChanged);
      socket.off("trip_status_changed", onTripStatusChanged);
      socket.off("status_update", onStatusUpdate);
      socket.off("trip_update", onTripUpdate);
      socket.off("captain_assigned", onCaptainAssigned);
      socket.off("driver_assigned", onDriverAssigned);
      socket.off("captain_arriving", onCaptainArriving);
      socket.off("driver_arriving", onDriverArriving);
      socket.off("captain_arrived", onCaptainArrived);
      socket.off("driver_arrived", onDriverArrived);
      socket.off("reached_pickup", onReachedPickup);
      socket.off("trip_started", onTripStarted);
      socket.off("ride_started", onRideStarted);
      socket.off("ride_in_progress", onRideInProgress);
      socket.off("trip_completed", handleTripCompleted);
    };
  }, [activeRideOrder?.id, backendSession, beginRideAcceptance, handleOtpVerified, joinRealtimeRooms, navigationTrip?.routeCoords, routeState.dropCoord, routeState.pickupCoord, routeState.routeCoords, tripState]);

  useEffect(() => {
    if (!captainLocation?.timestamp) return undefined;
    const timer = setInterval(() => {
      if (Date.now() - captainLocation.timestamp > 15000) {
        setCaptainLocation((current) => current ? { ...current, stale: true } : current);
        setLiveTrackingState((current) => ({ ...current, status: "stale", error: "Captain location has not updated" }));
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [captainLocation?.timestamp]);

  const rerouteTarget = currentScreen === "onTheWay" ? routeState.pickupCoord : routeState.dropCoord;

  useEffect(() => {
    if (!isValidCoordinate(captainLocation) || !isValidCoordinate(rerouteTarget)) return undefined;
    if (!["onTheWay", "navigation", "onTrip"].includes(currentScreen)) return undefined;
    let cancelled = false;
    const refreshRoute = async () => {
      const activeRoute = navigationTrip?.routeCoords?.length > 1 ? navigationTrip.routeCoords : routeState.routeCoords;
      const offRoute = distanceFromRouteMeters(captainLocation, activeRoute) > 80;
      if (!offRoute && liveTrackingState.status === "stale") return;
      try {
        const nextRoute = await fetchStreetRoute(captainLocation, rerouteTarget, { travelMode: "DRIVE" });
        if (!cancelled) setNavigationTrip((current) => current ? { ...current, ...nextRoute } : current);
      } catch (_error) {
        if (!cancelled) setLiveTrackingState((current) => ({ ...current, error: "ETA refresh is temporarily unavailable" }));
      }
    };
    const interval = setInterval(refreshRoute, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [captainLocation, currentScreen, liveTrackingState.status, navigationTrip?.routeCoords, rerouteTarget, routeState.routeCoords]);

  useEffect(() => {
    return () => {
      disconnectRideSocket();
    };
  }, []);

  const openPaymentMethodFromRide = () => {
    setPaymentSelectReturnScreen(currentScreen === "parcelRideOptions" ? "parcelRideOptions" : "rideOptions");
    setCurrentScreen("paymentSelect");
  };

  const openScheduleRide = (returnScreen) => {
    const fallbackReturnScreen = currentScreen === "bookRide" ? "bookRide" : "rideOptions";
    setScheduleReturnScreen(typeof returnScreen === "string" ? returnScreen : fallbackReturnScreen);
    setCurrentScreen("scheduleRide");
  };

  const openEditRide = () => {
    setCurrentScreen("editRide");
  };

  const openCouponFromRide = () => {
    setCouponReturnScreen(currentScreen === "parcelRideOptions" ? "parcelRideOptions" : "rideOptions");
    setCurrentScreen("applyCoupon");
  };

  const openCouponFromMetro = () => {
    setActiveTab("travel");
    setCouponReturnScreen("metroRoute");
    setCurrentScreen("applyCoupon");
  };

  const closePaymentFlow = (returnScreen = paymentMethodReturnScreen) => {
    if (returnScreen === "profile") {
      setActiveTab("profile");
      setCurrentScreen("profile");
      return;
    }

    if (returnScreen === "rideOptions") {
      setActiveTab("chooseRide");
      setCurrentScreen("rideOptions");
      return;
    }

    if (returnScreen === "parcelRideOptions") {
      setActiveTab("parcel");
      setCurrentScreen("parcelRideOptions");
      return;
    }

    if (returnScreen === "paymentSelect") {
      setActiveTab("chooseRide");
      setCurrentScreen("paymentSelect");
      return;
    }

    if (returnScreen === "addMoney") {
      setCurrentScreen("wallet");
      return;
    }

    setActiveTab("home");
    setCurrentScreen("wallet");
  };

  const openMap = (mode = "pickup") => {
    setMapReturnScreen("bookRide");
    setLocationSelectMode(mode);
    setCurrentScreen("map");
  };

  const openChooseRide = (details) => {
    if (details) {
      const nextPickupText = details.pickupText || details.pickup || tripDetails.pickup;
      const nextDropText = details.dropText || details.drop || tripDetails.drop;
      const nextPickupCoord = details.pickupCoord || routeState.pickupCoord;
      const nextDropCoord = details.dropCoord || routeState.dropCoord;
      const nextRouteCoords = details.routeCoords || routeState.routeCoords || [];

      setTripDetails({
        pickup: nextPickupText,
        drop: nextDropText
      });

      setRouteState({
        pickupText: nextPickupText,
        dropText: nextDropText,
        pickupCoord: nextPickupCoord,
        dropCoord: nextDropCoord,
        routeCoords: nextRouteCoords,
        distanceText: details.distanceText || routeState.distanceText || "",
        durationText: details.durationText || routeState.durationText || "",
        arrivalText: details.arrivalText || routeState.arrivalText || "",
        routeSource: details.routeSource || routeState.routeSource || "fallback",
      });
    }

    setActiveTab("chooseRide");
    setCurrentScreen("rideOptions");
  };

  const resolveRouteAndOpenNext = useCallback(async ({
    nextScreen = "rideOptions",
    pickupText: pickupTextOverride,
    dropText: dropTextOverride,
    pickupCoord: pickupCoordOverride,
    dropCoord: dropCoordOverride,
  } = {}) => {
    if (isResolvingRoute) return;

    const startedAt = Date.now();
    const pickupFallback = {
      latitude: region.latitude,
      longitude: region.longitude,
    };
    const dropFallback = {
      latitude: region.latitude + 0.008,
      longitude: region.longitude + 0.008,
    };
    const pickupPoint = resolveRoutePoint({
      text: pickupTextOverride ?? routeState.pickupText ?? tripDetails.pickup,
      coord: pickupCoordOverride || routeState.pickupCoord,
      fallbackCoord: pickupFallback,
    });
    const dropPoint = resolveRoutePoint({
      text: dropTextOverride ?? routeState.dropText ?? tripDetails.drop,
      coord: dropCoordOverride || routeState.dropCoord,
      fallbackCoord: dropFallback,
    });
    const pickupText = pickupPoint.text || tripDetails.pickup || "Current location";
    const dropText = dropPoint.text || tripDetails.drop || "Selected destination";
    const pickupCoord = pickupPoint.coord;
    const dropCoord = dropPoint.coord;

    setIsResolvingRoute(true);
    setRouteLoadingMessage("Finding the best route");

    if (!isValidCoordinate(pickupCoord) || !isValidCoordinate(dropCoord)) {
      setRouteLoadingMessage("Select pickup and drop first");
      await delay(650);
      setIsResolvingRoute(false);
      return;
    }

    let routePayload = {
      routeCoords: [],
      distanceText: "",
      durationText: "",
      arrivalText: "",
      routeSource: "unavailable",
    };

    try {
      setRouteLoadingMessage("Checking live route");
      routePayload = {
        ...(await withTimeout(
          fetchStreetRoute(pickupCoord, dropCoord),
          8000,
          "Route request timed out"
        )),
        routeSource: "street",
      };
    } catch (error) {
      console.warn("Route service unavailable", error?.message || error);
      setRouteLoadingMessage("Route unavailable — please retry");
      await delay(900);
      setIsResolvingRoute(false);
      return;
    }

    const nextDetails = {
      pickupText,
      dropText,
      pickupCoord,
      dropCoord,
      ...routePayload,
    };

    setTripDetails({ pickup: pickupText, drop: dropText });
    setRouteState(nextDetails);
    setRegion(buildResolvedRegion(pickupCoord, dropCoord));

    const remainingDelay = Math.max(0, 320 - (Date.now() - startedAt));
    if (remainingDelay) {
      await delay(remainingDelay);
    }

    setIsResolvingRoute(false);

    if (nextScreen === "parcelRideOptions") {
      setActiveTab("parcel");
      setCurrentScreen("parcelRideOptions");
      return;
    }

    openChooseRide(nextDetails);
  }, [isResolvingRoute, openChooseRide, region, routeState, tripDetails]);

  const openRideOptions = (item) => {
    const mapSelection = {
      bike: "bike",
      auto: "auto",
      cab: "auto_priority",
      parcel: "scooty",
      truck: "auto_priority"
    };

    const nextRideKey = mapSelection[item?.key] || "cab";
    setSelectedRideKey(nextRideKey);
    setCurrentScreen("rideOptions");
  };

  const openPickupDrop = (item) => {
    const mapSelection = {
      bike: "bike",
      auto: "auto",
      cab: "auto_priority",
      parcel: "scooty"
    };

    if (item?.key && mapSelection[item.key]) {
      setSelectedRideKey(mapSelection[item.key]);
    }

    const currentPickupText = devicePickup.text || DEFAULT_PICKUP_ADDRESS;
    const currentPickupCoord = devicePickup.coord || {
      latitude: region.latitude,
      longitude: region.longitude
    };

    setRouteState((current) => ({
      ...current,
      pickupText: currentPickupText,
      pickupCoord: currentPickupCoord,
      routeCoords: []
    }));
    setTripDetails((current) => ({
      ...current,
      pickup: currentPickupText
    }));
    setCurrentScreen("bookRide");
  };

  const onSearchPress = () => {
    openPickupDrop();
  };

  const isParcelFlow = homeMode === "parcel" || activeTab === "parcel";

  const onSeePrices = () => {
    resolveRouteAndOpenNext();
  };

  const ensureRidePayment = async (session, ride) => {
    const provider = resolvePaymentProvider(selectedPaymentOption);
    const amount = Math.max(parsePriceAmount(ride?.price || selectedRide?.price), 1);
    const orderType = currentScreen === "parcelRideOptions" || isParcelFlow ? "PARCEL" : "RIDE";
    const paymentOrder = await createPaymentOrder(session.accessToken, {
      sourceApp: SOURCE_APP,
      orderType,
      provider,
      amount,
      currency: "INR",
      description: String(ride?.name || "Rydex") + " booking",
      metadata: {
        vehicleType: resolveVehicleType(ride),
        pickup: String(routeState.pickupText || tripDetails.pickup || ""),
        drop: String(routeState.dropText || tripDetails.drop || ""),
      },
    });

    if (!paymentOrder?.requiresGateway) {
      if (paymentOrder?.gateway === "mock" && paymentOrder?.paymentId && paymentOrder?.orderId) {
        await verifyPayment(session.accessToken, {
          paymentId: paymentOrder.paymentId,
          gateway: paymentOrder.gateway,
          gatewayOrderId: paymentOrder.orderId,
        });
      }
      return paymentOrder;
    }

    const checkoutResult = await openCashfreeCheckout(paymentOrder);
    await verifyPayment(session.accessToken, {
      paymentId: paymentOrder.paymentId,
      gateway: paymentOrder.gateway,
      gatewayOrderId: checkoutResult?.orderId || paymentOrder.orderId,
    });

    return paymentOrder;
  };

  const onConfirmRide = async (ride) => {
    if (isCreatingRide) {
      return;
    }

    const chosenRide = ride || selectedJourneyRide || selectedRide;

    setRideAcceptance(null);

    if (chosenRide) {
      setSelectedJourneyRide(chosenRide);
    }

    setIsCreatingRide(true);

    try {
      let session = backendSession;

      if (!session?.accessToken) {
        try {
          session = await ensureCustomerSession();
        } catch (sessionError) {
          console.warn("Backend session unavailable; continuing local ride flow", sessionError);
        }
      }

      if (session?.accessToken) {
        await ensureRidePayment(session, chosenRide);
      }

      setBookingStage("searching");
      setTripState("SEARCHING");
      setActiveTab("trips");
      setCurrentScreen("searchingCaptain");

      if (!session?.accessToken) {
        return;
      }

      const created = await createBackendRide(session.accessToken, {
        sourceApp: SOURCE_APP,
        vehicleType: resolveVehicleType(chosenRide),
        pickupAddress: routeState.pickupText || tripDetails.pickup,
        pickupLat: routeState.pickupCoord?.latitude,
        pickupLng: routeState.pickupCoord?.longitude,
        dropAddress: routeState.dropText || tripDetails.drop,
        dropLat: routeState.dropCoord?.latitude,
        dropLng: routeState.dropCoord?.longitude,
        estimatedFare: parsePriceAmount(chosenRide?.price || selectedRide?.price),
      });

      setActiveRideOrder(created?.ride || null);
      setSelectedJourneyRide((current) => ({
        ...(current || {}),
        ...(chosenRide || {}),
        backendRideId: created?.ride?.id,
        rideOtp: created?.otp,
      }));

      joinRealtimeRooms(session, created?.ride?.id);

      const nextStatus = resolveRideStatusFromPayload(created?.ride || created, "order_created", "SEARCHING");
      setTripState(nextStatus);

      if (created?.dispatch?.partner) {
        beginRideAcceptance({
          ...(created?.ride || {}),
          partner: created.dispatch.partner,
          captainName: created.dispatch.partner?.name,
        });
      }
    } catch (error) {
      console.warn("Failed to confirm ride", error);
      captureOperationalError(error, {
        feature: "ride_booking",
        operation: "confirm_ride",
        paymentMethod: resolvePaymentProvider(selectedPaymentOption),
        vehicleType: resolveVehicleType(chosenRide),
      });
    } finally {
      setIsCreatingRide(false);
    }
  };
  const onAdvanceBooking = () => {
    const currentIndex = BOOKING_SEQUENCE.indexOf(bookingStage);
    const nextIndex = currentIndex + 1;

    if (currentIndex === -1 || nextIndex >= BOOKING_SEQUENCE.length) {
      setBookingStage("searching");
      goHome();
      return;
    }

    setBookingStage(BOOKING_SEQUENCE[nextIndex]);
  };

  const renderScreen = (screen = currentScreen) => {
    switch (screen) {
      case "splash":
        return <SplashScreen />;
      case "intro":
        return (
          <IntroScreen
            onSkip={() => goHome()}
            onNext={() => advanceOnboarding("intro")}
          />
        );
      case "login":
        return (
          <LoginScreen
            onBack={() => {
              setAuthError("");
              setCurrentScreen("intro");
            }}
            onSkip={() => goHome()}
            onLogin={handleCustomerLogin}
            onCreateAccount={() => {
              setAuthError("");
              setCurrentScreen("signup");
            }}
            errorMessage={authError}
            isLoading={isAuthenticating}
          />
        );
      case "signup":
        return (
          <SignupScreen
            onBack={() => {
              setAuthError("");
              setCurrentScreen("login");
            }}
            onLogin={() => {
              setAuthError("");
              setCurrentScreen("login");
            }}
            onSignup={handleCustomerSignup}
            errorMessage={authError}
            isLoading={isAuthenticating}
          />
        );
      case "otp":
        return (
          <OtpScreen
            onBack={() => setCurrentScreen("signup")}
            onVerify={() => advanceOnboarding("otp")}
            onResend={() => {}}
          />
        );
      case "home":
        return (
          <HomeScreen
            mode={homeMode}
            navigationScrollY={homeScrollY}
            onModeChange={(nextMode) => {
              setHomeMode(nextMode);
              setActiveTab(nextMode === "parcel" ? "parcel" : nextMode === "grocery" ? "grocery" : "home");
            }}
            walletAmount="₹250"
            notificationCount={2}
            quickServices={QUICK_SERVICES}
            rideWithUsCards={RIDE_WITH_US}
            features={FEATURES}
            onSearchPress={onSearchPress}
            onProfilePress={() => navigateToTab("profile")}
            onQuickServicePress={openPickupDrop}
            onRideCardPress={openRideOptions}
            onOpenWallet={openWalletFromHome}
            onReferPress={openReferFromHome}
            onRefreshHome={refreshHomeLocation}
            groceryAccessToken={backendSession?.accessToken}
            groceryDelivery={{
              address: devicePickup.text,
              latitude: devicePickup.coord?.latitude,
              longitude: devicePickup.coord?.longitude,
            }}
            grocerySavedAddresses={savedDeliveryAddresses}
            onRefreshGroceryAddresses={loadSavedDeliveryAddresses}
            onSelectGroceryAddress={(selection) => {
              const latitude = Number(selection?.latitude);
              const longitude = Number(selection?.longitude);
              if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
              const nextPickup = {
                text: selection?.address || selection?.label || "Selected delivery location",
                coord: { latitude, longitude },
              };
              setDevicePickup(nextPickup);
              setRouteState((current) => ({ ...current, pickupText: nextPickup.text, pickupCoord: nextPickup.coord }));
            }}
            onAddGroceryAddress={() => {
              setSavedPlacesReturnScreen("home");
              setEditingDeliveryAddress(null);
              setAddressMapLocation("");
              setAddressMapCoord(null);
              setCurrentScreen("addAddress");
            }}
            onOpenGroceryAddresses={() => openSavedPlacesFromProfile("home")}
          />
        );
      case "map":
        return (
          <SelectLocationScreen
            mode={mapReturnScreen === "addAddress" ? "address" : locationSelectMode}
            pickupCoord={routeState.pickupCoord}
            dropCoord={routeState.dropCoord}
            mapRegion={region}
            onBack={() => {
              if (mapReturnScreen === "addAddress") {
                setMapReturnScreen("bookRide");
                setCurrentScreen("addAddress");
                return;
              }

              if (locationSelectMode === "drop") {
                setLocationSelectMode("pickup");
                setCurrentScreen("map");
                return;
              }

              setCurrentScreen("bookRide");
            }}
            onConfirm={(selection) => {
              const location = selection?.location || "";
              const pickupCoord =
                selection?.pickupCoord || routeState.pickupCoord;
              const dropCoord =
                selection?.dropCoord || routeState.dropCoord;

              if (mapReturnScreen === "addAddress") {
                setAddressMapLocation(location || "Kacheguda Railway Station, Hyderabad");
                setAddressMapCoord(pickupCoord);
                setMapReturnScreen("bookRide");
                setLocationSelectMode("pickup");
                setCurrentScreen("addAddress");
                return;
              }

              if (locationSelectMode === "pickup") {
                setRouteState((current) => ({
                  ...current,
                  pickupText: location || current.pickupText,
                  pickupCoord,
                  routeCoords: [],
                }));
                setTripDetails((current) => ({
                  ...current,
                  pickup: location || current.pickup,
                }));
                setLocationSelectMode("drop");
                setCurrentScreen("map");
                return;
              }

              const nextDropText = location || routeState.dropText || tripDetails.drop;
              const nextPickupText = routeState.pickupText || tripDetails.pickup;
              const nextPickupCoord = routeState.pickupCoord;

              setRouteState((current) => ({
                ...current,
                dropText: nextDropText,
                dropCoord,
                routeCoords: [],
              }));
              setTripDetails((current) => ({
                ...current,
                drop: nextDropText,
              }));
              setLocationSelectMode("pickup");
              resolveRouteAndOpenNext({
                nextScreen: isParcelFlow ? "parcelRideOptions" : "rideOptions",
                pickupText: nextPickupText,
                dropText: nextDropText,
                pickupCoord: nextPickupCoord,
                dropCoord,
              });
            }}
          />
        );
      case "rideOptions":
        return (
          <ChooseRideScreen
            selectedRideKey={selectedRideKey}
            pickupText={routeState.pickupText || tripDetails.pickup}
            dropText={routeState.dropText || tripDetails.drop}
            pickupCoord={routeState.pickupCoord}
            dropCoord={routeState.dropCoord}
            routeCoords={routeState.routeCoords}
            mapRegion={region}
            paymentLabel={getPaymentFooterLabel(selectedPaymentOption)}
            couponLabel={getCouponFooterLabel(appliedCoupon)}
            onBack={() => {
              setActiveTab("home");
              setCurrentScreen("bookRide");
            }}
            onSelectRide={(ride) => setSelectedRideKey(ride?.key || ride?.id)}
            onConfirm={onConfirmRide}
            isConfirming={isCreatingRide}
            onPaymentSelect={(option) => setSelectedPaymentOption(normalizePaymentOption(option))}
            onCouponApply={(coupon) => setAppliedCoupon(coupon)}
            onScheduleRide={openScheduleRide}
            onEditRide={openEditRide}
          />
        );
      case "scheduleRide":
        return (
          <ScheduleRideScreen
            pickupText={routeState.pickupText || tripDetails.pickup || "Current pickup location"}
            dropText={routeState.dropText || tripDetails.drop || "Selected destination"}
            fare={selectedJourneyRide?.price || selectedRide?.price || "₹198"}
            onBack={() => setCurrentScreen(scheduleReturnScreen)}
            onSchedule={() => setCurrentScreen(scheduleReturnScreen === "bookRide" ? "bookRide" : "booking")}
          />
        );
      case "editRide":
        return <EditRideScreen onBack={() => setCurrentScreen("rideOptions")} onUpdateRide={() => setCurrentScreen("rideOptions")} />;
      case "searchingCaptain":
        return (
        <SearchingCaptainScreen
          mapRegion={region}
          pickupText={routeState.pickupText || tripDetails.pickup}
          dropText={routeState.dropText || tripDetails.drop}
          pickupCoord={routeState.pickupCoord}
          dropCoord={routeState.dropCoord}
          routeCoords={routeState.routeCoords}
          captainCoord={captainLocation}
          ride={selectedJourneyRide || selectedRide}
          acceptance={rideAcceptance}
          demoMode={!backendSession?.accessToken}
          onBack={() => setCurrentScreen("rideOptions")}
          onChangePickup={() => setCurrentScreen("bookRide")}
          onSafety={() => setCurrentScreen("safety")}
          onFound={(payload) => beginRideAcceptance(payload)}
        />
        );
      case "onTheWay":
        return (
          <CaptainOnTheWayScreen
            ride={selectedJourneyRide || selectedRide}
            acceptance={rideAcceptance}
            rideStatus={tripState}
            pickupAddress={routeState.pickupText || tripDetails.pickup}
            pickupCoord={routeState.pickupCoord}
            dropCoord={routeState.dropCoord}
            routeCoords={routeState.routeCoords}
            mapRegion={region}
            captainCoord={captainLocation}
            onBack={() => {
              setCurrentScreen("searchingCaptain");
            }}
            onForward={() => handleOtpVerified({
              pickupCoord: routeState.pickupCoord,
              dropCoord: routeState.dropCoord,
            })}
            onSupport={() => setCurrentScreen("safety")}
            onShare={() => openShareLiveTrip(screen)}
            onSafety={() => setCurrentScreen("safety")}
            onMessage={() => openMessageCaptain("onTheWay")}
            onTripDetails={() => setTripDetailsSheetVisible(true)}
            onArrived={() => setCurrentScreen("onTrip")}
          />
        );
      case "tripDetailsStatus":
        return null;
      case "arrivedPickup":
        return (
          <NavigationScreen
            pickupAddress={routeState.pickupText || tripDetails.pickup}
            dropAddress={routeState.dropText || tripDetails.drop}
            pickupCoord={routeState.pickupCoord}
            dropCoord={routeState.dropCoord}
            routeCoords={navigationTrip?.routeCoords || routeState.routeCoords || []}
            steps={navigationTrip?.steps || []}
            distanceText={navigationTrip?.distanceText || ""}
            durationText={navigationTrip?.durationText || ""}
            arrivalText={navigationTrip?.arrivalText || ""}
            currentInstruction={navigationTrip?.instructionText || ""}
            nextInstruction={navigationTrip?.nextInstructionText || ""}
            captainCoord={captainLocation}
            captainHeading={navigationTrip?.captainHeading || 0}
            rideStatus="ARRIVING"
            ride={selectedJourneyRide || selectedRide}
            onBack={() => {
              if (screen === "searchingCaptain") {
                setActiveTab("chooseRide");
                setCurrentScreen("rideOptions");
                return;
              }

              if (screen === "onTheWay") {
                setCurrentScreen("searchingCaptain");
                return;
              }

              if (screen === "arrivedPickup") {
                setCurrentScreen("onTheWay");
                return;
              }

              if (screen === "onTrip") {
                setCurrentScreen("arrivedPickup");
                return;
              }

              if (screen === "tripCompleted") {
                setCurrentScreen("onTrip");
              }
            }}
            onCall={() => {}}
            onMessage={() => openMessageCaptain("arrivedPickup")}
            onTripDetails={() => setTripDetailsSheetVisible(true)}
            onSafety={() => setCurrentScreen("safety")}
            onCancel={() => goHome()}
            onTripCompleted={() => setCurrentScreen("onTrip")}
          />
        );
      case "navigation":
      case "onTrip":
        return (
          <TripInProgressScreen
            pickupAddress={routeState.pickupText || tripDetails.pickup}
            dropAddress={routeState.dropText || tripDetails.drop}
            pickupCoord={navigationTrip?.pickupCoord || routeState.pickupCoord}
            dropCoord={navigationTrip?.dropCoord || routeState.dropCoord}
            routeCoords={navigationTrip?.routeCoords || []}
            steps={navigationTrip?.steps || []}
            distanceText={navigationTrip?.distanceText || ""}
            durationText={navigationTrip?.durationText || ""}
            arrivalText={navigationTrip?.arrivalText || ""}
            currentInstruction={navigationTrip?.instructionText || ""}
            nextInstruction={navigationTrip?.nextInstructionText || ""}
            captainCoord={navigationTrip?.captainLocation || captainLocation}
            captainHeading={navigationTrip?.captainHeading || 0}
            rideStatus={tripState}
            ride={selectedJourneyRide || selectedRide}
            onBack={() => setCurrentScreen("onTheWay")}
            onForward={() => setCurrentScreen("tripCompleted")}
            onCall={() => {}}
            onMessage={() => openMessageCaptain("onTrip")}
            onTripDetails={() => setTripDetailsSheetVisible(true)}
            onSafety={() => setCurrentScreen("safety")}
            onCancel={() => goHome()}
            onTripCompleted={handleCompleteRide}
          />
        );
      case "tripCompleted":
        return (
          <TripSummaryScreen
            pickupAddress={routeState.pickupText || tripDetails.pickup}
            dropAddress={routeState.dropText || tripDetails.drop}
            pickupCoord={routeState.pickupCoord}
            dropCoord={routeState.dropCoord}
            routeCoords={navigationTrip?.routeCoords || routeState.routeCoords}
            mapRegion={region}
            captainCoord={navigationTrip?.captainLocation || captainLocation}
            captainName={selectedJourneyRide?.captainName || selectedJourneyRide?.driverName || selectedRide?.captainName || selectedRide?.driverName || "Narsing Rao"}
            captainPlate={selectedJourneyRide?.captainPlate || selectedRide?.captainPlate || "TS11 EG 3375"}
            captainVehicle={selectedJourneyRide?.captainVehicle || selectedRide?.captainVehicle || selectedJourneyRide?.name || selectedRide?.name || "Bike"}
            durationText={navigationTrip?.durationText || "18 min"}
            distanceText={navigationTrip?.distanceText || "6.4 km"}
            fare={selectedJourneyRide?.price || selectedRide?.price || "₹92"}
            paymentLabel={getPaymentFooterLabel(selectedPaymentOption)}
            onBack={goHome}
            onForward={goHome}
            onMessage={() => openMessageCaptain("tripCompleted")}
            onTripDetails={() => setTripDetailsSheetVisible(true)}
          />
        );
      case "tripReview":
        return (
          <TripReviewScreen
            onBack={() => setCurrentScreen("tripCompleted")}
            onSkip={goHome}
            onSubmit={goHome}
            fare={selectedJourneyRide?.price || selectedRide?.price || "₹60"}
            captainName={selectedJourneyRide?.captainName || selectedJourneyRide?.driverName || selectedRide?.captainName || selectedRide?.driverName || "Manoj Kumar"}
            captainPlate={selectedJourneyRide?.captainPlate || selectedRide?.captainPlate || "TG08ET3421"}
            captainVehicle={selectedJourneyRide?.captainVehicle || selectedRide?.captainVehicle || "Bajaj Pulsar 125"}
          />
        );
      case "bookRide":
        return (
          <PickupDropScreen
            onBack={goHome}
            onOpenMap={openMap}
            onOpenSavedPlaces={() => openSavedPlacesFromProfile("bookRide")}
            onScheduleRide={() => openScheduleRide("bookRide")}
            onChooseRide={(draftRoute) => {
              if (isParcelFlow) {
                resolveRouteAndOpenNext({
                  ...draftRoute,
                  nextScreen: "parcelRideOptions",
                });
                return;
              }

              resolveRouteAndOpenNext(draftRoute);
            }}
            onRouteChange={setRouteState}
            onClearAll={() => {}}
            mapRegion={region}
            pickupText={routeState.pickupText || DEFAULT_PICKUP_ADDRESS}
            dropText={routeState.dropText || ""}
            isResolvingRoute={isResolvingRoute}
            routeLoadingMessage={routeLoadingMessage}
          />
        );
      case "parcelRideOptions":
        return (
          <ParcelChooseRideScreen
            selectedRideKey={selectedRideKey}
            paymentLabel={getPaymentFooterLabel(selectedPaymentOption)}
            couponLabel={getCouponFooterLabel(appliedCoupon)}
            pickupCoord={routeState.pickupCoord}
            dropCoord={routeState.dropCoord}
            routeCoords={routeState.routeCoords}
            mapRegion={region}
            onBack={() => setCurrentScreen("bookRide")}
            onSelectRide={(ride) => setSelectedRideKey(ride?.key || ride?.id || "bike")}
            onPaymentSelect={(option) => setSelectedPaymentOption(normalizePaymentOption(option))}
            onCouponApply={(coupon) => setAppliedCoupon(coupon)}
            onConfirm={onConfirmRide}
            isConfirming={isCreatingRide}
          />
        );
      case "booking":
        return (
          <BookingScreen
            ride={selectedRide}
            bookingStage={bookingStage}
            onAdvance={onAdvanceBooking}
            onBack={goHome}
          />
        );
      case "travel":
        return <TravelScreen onBack={goHome} scrollY={travelScrollY} />;
      case "metro":
        return <MetroScreen onFindRoute={openMetroRoute} />;
      case "metroRoute":
        return (
          <MetroRouteScreen
            route={metroRouteParams}
            couponLabel={getCouponFooterLabel(appliedCoupon)}
            onBack={() => setCurrentScreen("metro")}
            onChangeRoute={() => setCurrentScreen("metro")}
            onOpenCoupon={openCouponFromMetro}
          />
        );
      case "bookings":
        return (
          <MyRidesScreen
            onTrackRide={() => setCurrentScreen("onTheWay")}
            onOpenRideDetails={() => setCurrentScreen("trips")}
            onBack={() => {
              if (ridesReturnScreen === "profile") {
                setActiveTab("profile");
                setCurrentScreen("profile");
                return;
              }

              goHome();
            }}
          />
        );
      case "wallet":
        return (
          <WalletScreen
            onOpenPaymentMethod={openPaymentMethodFromWallet}
            onOpenAddMoney={openAddMoneyFromWallet}
            onOpenTransactions={openTransactionsFromWallet}
            onBack={() => {
              if (walletReturnScreen === "profile") {
                setActiveTab("profile");
                setCurrentScreen("profile");
                return;
              }

              setActiveTab("home");
              setCurrentScreen("home");
            }}
          />
        );
      case "addMoney":
        return (
          <AddMoneyScreen
            amount={topUpAmount}
            onBack={() => setCurrentScreen("wallet")}
            onPay={(payload) => {
              setTopUpAmount(`₹${payload?.amount || 200}`);
              setPaymentMethodReturnScreen("addMoney");
              setCurrentScreen("paymentMethod");
            }}
          />
        );
      case "transactions":
        return (
          <TransactionsScreen
            onBack={() => {
              if (transactionsReturnScreen === "wallet") {
                setCurrentScreen("wallet");
                return;
              }
              if (transactionsReturnScreen === "settings") {
                setCurrentScreen("settings");
                return;
              }
              setActiveTab("profile");
              setCurrentScreen("profile");
            }}
          />
        );
      case "fareBreakdown":
        return <FareScreen onBack={() => setCurrentScreen("profile")} />;
      case "receipts":
        return <ReceiptsScreen onBack={() => setCurrentScreen("profile")} />;
      case "refundStatus":
        return <RefundScreen onBack={() => setCurrentScreen("profile")} />;
      case "refer":
        return (
          <ReferEarnScreen
            onBack={() => {
              if (referReturnScreen === "profile") {
                setActiveTab("profile");
                setCurrentScreen("profile");
                return;
              }

              setActiveTab("home");
              setCurrentScreen("home");
            }}
          />
        );
      case "paymentMethod":
        return (
          <PaymentMethodScreen
            amount={
              paymentMethodReturnScreen === "addMoney"
                ? topUpAmount
                : selectedJourneyRide?.price || selectedRide?.price || topUpAmount
            }
            onBack={() => {
              if (paymentMethodReturnScreen === "settings") {
                setCurrentScreen("settings");
                return;
              }
              if (paymentMethodReturnScreen === "profile") {
                setActiveTab("profile");
                setCurrentScreen("profile");
                return;
              }
              if (paymentMethodReturnScreen === "rideOptions") {
                setActiveTab("chooseRide");
                setCurrentScreen("rideOptions");
                return;
              }

              if (paymentMethodReturnScreen === "parcelRideOptions") {
                setActiveTab("parcel");
                setCurrentScreen("parcelRideOptions");
                return;
              }

              if (paymentMethodReturnScreen === "paymentSelect") {
                setActiveTab("chooseRide");
                setCurrentScreen("paymentSelect");
                return;
              }

              if (paymentMethodReturnScreen === "addMoney") {
                setCurrentScreen("addMoney");
                return;
              }

              setActiveTab("home");
              setCurrentScreen("wallet");
            }}
            onContinue={(option) => {
              const normalized = normalizePaymentOption(option);
              if (normalized) {
                setSelectedPaymentOption(normalized);
              }
              closePaymentFlow(paymentMethodReturnScreen);
            }}
          />
        );
      case "paymentSelect":
        return (
          <PaymentSelectScreen
            onBack={() => {
              if (paymentSelectReturnScreen === "rideOptions") {
                setActiveTab("chooseRide");
                setCurrentScreen("rideOptions");
                return;
              }

              if (paymentSelectReturnScreen === "parcelRideOptions") {
                setActiveTab("parcel");
                setCurrentScreen("parcelRideOptions");
                return;
              }

              setActiveTab("home");
              setCurrentScreen("wallet");
            }}
            onAddPaymentMethod={() => {
              setPaymentMethodReturnScreen("paymentSelect");
              setCurrentScreen("paymentMethod");
            }}
            onContinue={(option) => {
              if (option) {
                setSelectedPaymentOption(normalizePaymentOption(option));
              }
              setPaymentMethodReturnScreen("paymentSelect");
              closePaymentFlow(paymentSelectReturnScreen);
            }}
          />
        );
      case "trips":
        return <TripSummaryScreen onBack={goHome} onForward={goHome} />;
      case "support":
        return <HelpSupportScreen onBack={() => setCurrentScreen("profile")} onOpenTicketDetails={openTicketDetails} onOpenChatSupport={openChatSupport} />;
      case "ticketDetails":
        return (
          <TicketDetailsScreen
            onBack={() => setCurrentScreen("support")}
            onOpenChat={() => setCurrentScreen("chatSupport")}
          />
        );
      case "chatSupport":
        return <ChatSupportScreen onBack={() => setCurrentScreen("support")} />;
      case "messageCaptain":
        return (
          <MessageCaptainScreen
            onBack={() => setCurrentScreen(messageCaptainReturnScreen)}
            onCall={() => {}}
            captainName={
              selectedJourneyRide?.captainName
              || selectedJourneyRide?.driverName
              || selectedRide?.captainName
              || selectedRide?.driverName
              || rideAcceptance?.captainName
              || "Ravi Kumar"
            }
            arrivalLabel={
              messageCaptainReturnScreen === "onTrip"
                ? "Your trip is in progress"
                : messageCaptainReturnScreen === "tripCompleted"
                  ? "Trip completed"
                  : `Arriving in ${rideAcceptance?.eta || "3 min"}`
            }
          />
        );
      case "safety":
        return (
          <SafetyScreen
            onBack={() => setCurrentScreen("profile")}
            onShareLiveTrip={() => openShareLiveTrip("safety")}
          />
        );
      case "shareLiveTrip":
        return (
          <ShareLiveTripScreen
            onBack={() => setCurrentScreen(shareLiveTripReturnScreen)}
            onShare={() => setCurrentScreen(shareLiveTripReturnScreen)}
          />
        );
      case "profile":
        return (
          <ProfileScreen
            profile={profileData}
            onBack={goHome}
            onLogout={goHome}
            onOpenEditProfile={() => setCurrentScreen("editProfile")}
            onOpenSettings={() => setCurrentScreen("settings")}
            onOpenSupport={() => setCurrentScreen("support")}
            onOpenSafety={() => setCurrentScreen("safety")}
            onOpenWallet={openWalletFromProfile}
            onOpenRefer={openReferFromProfile}
            onOpenPaymentMethod={openPaymentMethodFromProfile}
            onOpenSavedPlaces={openSavedPlacesFromProfile}
            onOpenRides={openRidesFromProfile}
            onOpenBookings={openRidesFromProfile}
            onOpenCoupons={openCouponsFromProfile}
            onOpenTransactions={openTransactionsFromProfile}
            onOpenReceipts={openReceiptsFromProfile}
            onOpenRefunds={openRefundsFromProfile}
            onOpenFareBreakdown={openFareBreakdownFromProfile}
            scrollY={profileScrollY}
          />
        );
      case "editProfile":
        return (
          <EditProfileScreen
            initialProfile={profileData}
            onBack={() => setCurrentScreen("profile")}
            onSave={(nextProfile) => {
              if (nextProfile) {
                setProfileData((current) => ({ ...current, ...nextProfile }));
              }
              setCurrentScreen("profile");
            }}
            onLogout={goHome}
          />
        );
      case "settings":
        return (
          <SettingsScreen
            onBack={() => setCurrentScreen("profile")}
            onOpenHelp={() => setCurrentScreen("support")}
            onOpenEditProfile={() => setCurrentScreen("editProfile")}
            onOpenSavedPlaces={() => openSavedPlacesFromProfile("settings")}
            onOpenPayments={() => {
              setPaymentMethodReturnScreen("settings");
              setCurrentScreen("paymentMethod");
            }}
            onOpenTransactions={() => {
              setTransactionsReturnScreen("settings");
              setCurrentScreen("transactions");
            }}
            onOpenLogout={goHome}
          />
        );
      case "savedPlaces":
        return (
          <SavedPlacesScreen
            places={savedDeliveryAddresses.map((address) => ({
              key: address.id,
              icon: address.label === "work" ? "briefcase-outline" : address.label === "home" ? "home" : "location",
              title: `${String(address.label || "other").charAt(0).toUpperCase()}${String(address.label || "other").slice(1)}`,
              tag: address.isDefault ? "Default" : "",
              address: [address.house, address.addressLine, address.landmark].filter(Boolean).join(", "),
              phone: address.phone,
              raw: address,
            }))}
            onBack={() => setCurrentScreen(savedPlacesReturnScreen)}
            onAddNewAddress={() => {
              setEditingDeliveryAddress(null);
              setAddressMapLocation("");
              setAddressMapCoord(null);
              setCurrentScreen("addAddress");
            }}
            onEditPlace={(place) => {
              setEditingDeliveryAddress(place?.raw || null);
              setAddressMapLocation(place?.raw?.addressLine || "");
              setAddressMapCoord(place?.raw ? { latitude: Number(place.raw.latitude), longitude: Number(place.raw.longitude) } : null);
              setCurrentScreen("addAddress");
            }}
            onDeletePlace={async (place) => {
              if (!backendSession?.accessToken || !place?.key) return;
              try {
                await deleteDeliveryAddress(backendSession.accessToken, place.key);
                await loadSavedDeliveryAddresses();
              } catch (error) {
                console.warn("Failed to delete address", error);
              }
            }}
            onSelectPlace={(place) => {
              const address = place?.raw;
              if (!address) return;
              const nextPickup = {
                text: [address.house, address.addressLine, address.landmark].filter(Boolean).join(", "),
                coord: { latitude: Number(address.latitude), longitude: Number(address.longitude) },
              };
              setDevicePickup(nextPickup);
              setRouteState((current) => ({ ...current, pickupText: nextPickup.text, pickupCoord: nextPickup.coord }));
              setCurrentScreen(savedPlacesReturnScreen || "home");
            }}
          />
        );
      case "addAddress":
        return (
          <AddNewAddressScreen
            mapLocation={addressMapLocation}
            initialAddress={editingDeliveryAddress}
            defaultRecipientName={profileData.name}
            defaultPhone={profileData.phone}
            onBack={() => setCurrentScreen(savedPlacesReturnScreen === "home" ? "home" : "savedPlaces")}
            onSave={async (form) => {
              if (!backendSession?.accessToken) {
                setCurrentScreen("login");
                return;
              }
              const coord = addressMapCoord || devicePickup.coord;
              try {
                await saveDeliveryAddress(backendSession.accessToken, {
                  label: form.addressType,
                  addressLine: form.address,
                  house: form.house,
                  landmark: form.landmark || undefined,
                  deliveryInstructions: form.instructions || undefined,
                  recipientName: form.name,
                  phone: form.phone,
                  latitude: coord.latitude,
                  longitude: coord.longitude,
                  isDefault: form.defaultAddress,
                }, editingDeliveryAddress?.id);
                setAddressMapLocation("");
                setAddressMapCoord(null);
                setEditingDeliveryAddress(null);
                await loadSavedDeliveryAddresses();
                if (savedPlacesReturnScreen === "home") {
                  const nextPickup = {
                    text: [form.house, form.address, form.landmark].filter(Boolean).join(", "),
                    coord,
                  };
                  setDevicePickup(nextPickup);
                  setRouteState((current) => ({ ...current, pickupText: nextPickup.text, pickupCoord: nextPickup.coord }));
                }
              } catch (error) {
                console.warn("Failed to save address", error);
                throw error;
              }
            }}
            onSaved={() => setCurrentScreen(savedPlacesReturnScreen === "home" ? "home" : "savedPlaces")}
            onLocateMe={() => {
              setAddressMapLocation(devicePickup.text || "Current location");
              setAddressMapCoord(devicePickup.coord);
            }}
            onSelectOnMap={() => {
              setMapReturnScreen("addAddress");
              setLocationSelectMode("pickup");
              setCurrentScreen("map");
            }}
          />
        );
      case "offers":
        return <OffersScreen onBack={() => setCurrentScreen("profile")} />;
      case "applyCoupon":
        return (
          <ApplyCouponScreen
            onBack={() => setCurrentScreen(couponReturnScreen)}
            onContinue={(coupon) => {
              if (coupon) {
                setAppliedCoupon(coupon);
              }
              setCurrentScreen(couponReturnScreen);
            }}
            onApplyCoupon={(coupon) => {
              if (coupon) {
                setAppliedCoupon(coupon);
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  const bottomNavScreens = new Set(["home", "travel", "metro", "bookings", "booking", "profile"]);
  const transitionTargetScreen = screenTransition?.to || currentScreen || displayedScreen;
  const showBottomNav = bottomNavScreens.has(transitionTargetScreen);
  const authScreens = ["splash", "intro", "login", "signup", "otp"];
  const showStandaloneBottomStrip =
    !showBottomNav &&
    !authScreens.includes(transitionTargetScreen);

  const showRideFlowChrome = [
    "arrivedPickup",
  ].includes(currentScreen);
  const showRideDynamicIsland = [
    "searchingCaptain",
    "onTheWay",
    "arrivedPickup",
    "onTrip",
    "navigation",
  ].includes(currentScreen);
  const showRideStatusBarShadow = [
    "bookRide",
    "rideOptions",
    "searchingCaptain",
    "onTheWay",
    "arrivedPickup",
    "navigation",
    "onTrip",
    "tripCompleted",
    "trips",
    "tripReview",
    "scheduleRide",
    "editRide",
    "selectLocation",
  ].includes(transitionTargetScreen);

  const accountScreenMotionStyle = screenTransition
    ? {
        opacity: screenTransitionAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.16, 1],
        }),
        transform: [
          {
            translateX: screenTransitionAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [
                screenTransition.phase === "opening"
                  ? (screenTransition.direction === "forward" ? 10 : -10)
                  : (screenTransition.direction === "forward" ? -7 : 7),
                0,
              ],
            }),
          },
        ],
      }
    : null;

  const renderProfileTransition = () => {
    if (!screenTransition) {
      return null;
    }

    const paneOpacity = screenTransitionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const paneTranslateY = screenTransitionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [screenTransition.direction === "forward" ? 10 : -6, 0],
    });

    return (
      <View pointerEvents="none" key={screenTransition.key} style={styles.profileTransitionOverlay}>
        <Animated.View
          style={[
            styles.profileTransitionPane,
            { opacity: paneOpacity, transform: [{ translateY: paneTranslateY }] },
          ]}
        >
          {renderScreen(screenTransition.to)}
        </Animated.View>
      </View>
    );
  };

  return (
    <RideProvider>
      <View style={styles.app}>
        <>
          <StatusBar
            style="dark"
            hidden={false}
            translucent={transitionTargetScreen === "home"}
            backgroundColor={
              transitionTargetScreen === "home"
                ? "transparent"
                  : "#FFFFFF"
            }
            animated
          />
          <ScreenTransition animatedStyle={accountScreenMotionStyle}>
            {renderScreen(displayedScreen)}
            {showRideFlowChrome ? (
              <RideFlowChrome
                stage={currentScreen}
                pickupText={routeState.pickupText || tripDetails.pickup}
                captainName={selectedJourneyRide?.captainName || selectedJourneyRide?.driverName || selectedRide?.captainName || selectedRide?.driverName || "Manoj"}
                onMessage={() => openMessageCaptain(currentScreen)}
                onCall={() => {}}
                onBack={() => {
                  if (currentScreen === "arrivedPickup") {
                    setCurrentScreen("onTheWay");
                  }
                }}
                onForward={() => {
                  if (currentScreen === "arrivedPickup") {
                    setCurrentScreen("arrivedPickup");
                  }
                }}
              />
            ) : null}
          </ScreenTransition>
          {showBottomNav ? (
            <BottomNav
              items={BOTTOM_TABS}
              activeKey={activeTab}
              onSelect={navigateToTab}
              animatedStyle={currentScreen === "home" ? {
                opacity: homeScrollY.interpolate({
                  inputRange: [0, 54, 132],
                  outputRange: [1, 0.92, 0],
                  extrapolate: "clamp",
                }),
                transform: [{
                  translateY: homeScrollY.interpolate({
                    inputRange: [0, 48, 138],
                    outputRange: [0, 12, 76],
                    extrapolate: "clamp",
                  }),
                }],
              } : currentScreen === "travel" ? {
                opacity: travelScrollY.interpolate({
                  inputRange: [0, 54, 132],
                  outputRange: [1, 0.92, 0],
                  extrapolate: "clamp",
                }),
                transform: [{
                  translateY: travelScrollY.interpolate({
                    inputRange: [0, 48, 138],
                    outputRange: [0, 12, 76],
                    extrapolate: "clamp",
                  }),
                }],
              } : currentScreen === "profile" ? {
                opacity: profileScrollY.interpolate({
                  inputRange: [0, 54, 132],
                  outputRange: [1, 0.92, 0],
                  extrapolate: "clamp",
                }),
                transform: [{
                  translateY: profileScrollY.interpolate({
                    inputRange: [0, 48, 138],
                    outputRange: [0, 12, 76],
                    extrapolate: "clamp",
                  }),
                }],
              } : null}
            />
          ) : null}
          <RideDynamicIsland
            visible={showRideDynamicIsland}
            stage={rideAcceptance && currentScreen === "searchingCaptain" ? "onTheWay" : currentScreen}
            pickupText={routeState.pickupText || tripDetails.pickup}
            captainName={selectedJourneyRide?.captainName || selectedJourneyRide?.driverName || selectedRide?.captainName || selectedRide?.driverName || "Manoj"}
            onCall={() => {}}
            onMessage={() => openMessageCaptain(currentScreen)}
          />
          <TripDetailsBottomSheet
            visible={tripDetailsSheetVisible}
            fare={selectedJourneyRide?.price || selectedRide?.price || "₹92"}
            vehicle={selectedJourneyRide?.name || selectedRide?.name || "Bike Lite"}
            pickupText={routeState.pickupText || tripDetails.pickup}
            dropText={routeState.dropText || tripDetails.drop}
            paymentLabel={getPaymentFooterLabel(selectedPaymentOption).toLowerCase()}
            onClose={() => setTripDetailsSheetVisible(false)}
            onCancel={() => {
              setTripDetailsSheetVisible(false);
              goHome();
            }}
          />
          {showStandaloneBottomStrip ? <View pointerEvents="none" style={styles.accountBottomStrip} /> : null}
        </>
      </View>
    </RideProvider>
  );
}

const styles = StyleSheet.create({
  accountBottomStrip: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    backgroundColor: "#FFFFFF",
    zIndex: 60,
    elevation: 60
  },
  app: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  screenTransition: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    position: "relative"
  },
  profileTransitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    overflow: "hidden",
    zIndex: 40,
    elevation: 40
  },
  profileTransitionPane: {
    ...StyleSheet.absoluteFillObject
  },
  placeholderSafe: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  placeholderCard: {
    margin: 16,
    marginTop: 24,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    padding: 24,
    alignItems: "center"
  },
  placeholderIcon: {
    width: 84,
    height: 84,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  placeholderTitle: {
    marginTop: 18,
    color: "#111827",
    fontSize: 26,
    fontWeight: "800"
  },
  placeholderSubtitle: {
    marginTop: 8,
    color: "#667085",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20
  },
  blankScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  blankBackButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center"
  }
});
