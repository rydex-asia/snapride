import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  Easing,
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  PanResponder,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  ClipPath,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RideRouteMap, { SEARCH_ENDPOINT_PIN_METRICS } from "../../components/RideRouteMap";
import BookingOptionBottomSheet from "../../components/BookingOptionBottomSheet";
import { SHADOWS } from "../../theme/shadows";
import { EASING, SHEET_TIMING } from "../../theme/motion";
import { fetchStreetRoute, formatMapAddressLabel } from "../../routeUtils";


const { height, width } = Dimensions.get("window");
const ROUTE_MARKER_CLEARANCE = 24;
const MAP_ADDRESS_PILL_WIDTH = 134;
const MAP_ADDRESS_PILL_HEIGHT = 34;
const MAP_ADDRESS_PILL_JOIN = 1.5;
const NEARBY_CAPTAIN_CAR_IMAGE = require("../../assets/vehicles/frezo-captain-car-topdown-v6.png");
const NEARBY_CAPTAIN_BIKE_IMAGE = require("../../assets/vehicles/frezo-captain-scooter-marker-v6.png");
const UBER_SHEET_SPRING = {
  stiffness: 156,
  damping: 25,
  mass: 0.92,
  overshootClamping: true,
  restDisplacementThreshold: 0.25,
  restSpeedThreshold: 0.25,
};
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedSvgRect = Animated.createAnimatedComponent(Rect);
const AnimatedSvgPath = Animated.createAnimatedComponent(Path);

const rides = [
  {
    id: "1",
    key: "bike",
    name: "Bike",
    image: require("../../assets/vehicles/choose-bike.png"),
    badge: "Quickest",
    eta: "2 min away",
    desc: "Quick Bike rides",
    detail: "Drop 2:42 pm",
    price: "₹60",
    old: "₹68",
    capacity: 1,
    paymentLabel: "Payment method",
    couponLabel: "Apply coupons",
  },
  {
    id: "2",
    key: "scooty",
    name: "Scooty",
    image: require("../../assets/vehicles/choose-scooty.png"),
    eta: "2 min away",
    desc: "Drop in 2:42 pm",
    detail: "2 min away",
    price: "₹69",
    old: "₹77",
    capacity: 1,
    paymentLabel: "Payment method",
    couponLabel: "Apply coupons",
  },
  {
    id: "3",
    key: "auto",
    name: "Auto",
    image: require("../../assets/vehicles/choose-auto.png"),
    eta: "2 min away",
    desc: "Drop in 2:42 pm",
    detail: "2 min away",
    price: "₹170",
    old: "₹184",
    capacity: 3,
    paymentLabel: "Payment method",
    couponLabel: "Apply coupons",
  },
  {
    id: "4",
    key: "car",
    name: "Car",
    image: require("../../assets/vehicles/choose-car.png"),
    eta: "2 min away",
    desc: "Drop in 2:42 pm",
    detail: "2 min away",
    price: "₹270",
    old: "₹289",
    capacity: 4,
    paymentLabel: "Payment method",
    couponLabel: "Apply coupons",
  },
  {
    id: "5",
    key: "car-prime",
    name: "Car prime",
    image: require("../../assets/vehicles/choose-car-prime.png"),
    eta: "2 min away",
    desc: "Drop in 2:42 pm",
    detail: "2 min away",
    price: "₹350",
    old: "₹379",
    capacity: 4,
    paymentLabel: "Payment method",
    couponLabel: "Apply coupons",
  },
];

const parseAmount = (value) => Number(String(value || "").replace(/[^0-9]/g, ""));
const getRideSavings = (ride) => Math.max(parseAmount(ride?.old) - parseAmount(ride?.price), 0);
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

function AddressEtaShape({ variant, shimmer }) {
  const isDrop = variant === "drop";
  const clipId = isDrop ? "drop-eta-clip" : "pickup-eta-clip";
  const gradientId = isDrop ? "drop-eta-shimmer" : "pickup-eta-shimmer";
  const shimmerX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, 66],
  });
  const outlineDashOffset = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -194],
  });

  return (
    <Svg
      pointerEvents="none"
      width={54}
      height={48}
      viewBox="0 0 54 48"
      style={styles.mapEtaShape}
    >
      <Defs>
        <ClipPath id={clipId}>
          <Path d="M0 0H42L54 48H0Z" />
        </ClipPath>
        <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={isDrop ? 0.34 : 0.9} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </SvgLinearGradient>
      </Defs>
      <Path
        d="M0 0H42L54 48H0Z"
        fill={isDrop ? "#1769E8" : "#EEF5FF"}
        stroke={isDrop ? "none" : "#BFD5F7"}
        strokeWidth={isDrop ? 0 : 1.25}
      />
      {!isDrop ? (
        <Path d="M2 0V48" stroke="#1769E8" strokeWidth="4" />
      ) : null}
      <AnimatedSvgRect
        x={shimmerX}
        y={-8}
        width={18}
        height={64}
        fill={`url(#${gradientId})`}
        clipPath={`url(#${clipId})`}
        rotation={-12}
        origin="27, 24"
      />
      <AnimatedSvgPath
        d="M0 0H42L54 48H0Z"
        fill="none"
        stroke={isDrop ? "rgba(255,255,255,0.92)" : "#4F91F4"}
        strokeWidth={isDrop ? 1.8 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="18 176"
        strokeDashoffset={outlineDashOffset}
      />
    </Svg>
  );
}

function RideOptionCard({ item, selected, onPress }) {
  const hiddenDetail = item.detail || "Drop in 2:42 pm";
  const selectAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(selectAnim, {
      toValue: selected ? 1 : 0,
      stiffness: 165,
      damping: 27,
      mass: 1.08,
      useNativeDriver: false,
    }).start();
  }, [selectAnim, selected]);

  const animatedCardStyle = {
    borderColor: selectAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(30,93,132,0)", "#1E5D84"],
    }),
    backgroundColor: selectAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["#FFFFFF", "#FFFFFF"],
    }),
    transform: [
      {
        scale: selectAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.002],
        }),
      },
    ],
  };

  const revealStyle = {
    opacity: selectAnim,
    transform: [
      {
        translateY: selectAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [3, 0],
        }),
      },
      {
        scale: selectAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
      },
    ],
  };

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          styles.card,
          animatedCardStyle,
          selected ? styles.cardSelected : styles.cardUnselected,
        ]}
      >
        <View style={styles.left}>
          <View style={styles.vehicleThumb}>
            <Image source={item.image} style={styles.vehicleImage} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.middle}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.name}</Text>
            <View style={styles.capacitySlot}>
              <Animated.View style={[styles.capacityWrap, revealStyle]}>
                <MaterialIcons name="person" size={13} color="#111827" />
                <Text style={styles.capacityText}>{item.capacity}</Text>
              </Animated.View>
            </View>
            <View style={styles.badgeSlot}>
              {item.badge ? (
                <Animated.View style={[styles.quickBadge, revealStyle]}>
                  <MaterialIcons name="directions-run" size={13} color="#FFFFFF" />
                  <Text style={styles.quickBadgeText}>{item.badge}</Text>
                </Animated.View>
              ) : (
                <View style={styles.quickBadgePlaceholder} />
              )}
            </View>
          </View>

          <Text style={styles.detailPrimary} numberOfLines={1}>
            {selected ? item.desc : `${item.eta}  •  ${hiddenDetail}`}
          </Text>
          <Text style={[styles.detailSecondary, !selected && styles.detailSecondaryHidden]}>
            {item.eta}  •  {hiddenDetail}
          </Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.price}>{item.price}</Text>
          {item.old ? <Text style={styles.old}>{item.old}</Text> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

function RideOptionSkeleton({ shimmer }) {
  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 420],
  });

  return (
    <View style={styles.rideSkeletonRow}>
      <View style={styles.rideSkeletonVehicle} />
      <View style={styles.rideSkeletonCopy}>
        <View style={styles.rideSkeletonTitle} />
        <View style={styles.rideSkeletonMeta} />
      </View>
      <View style={styles.rideSkeletonPrice} />
      <AnimatedLinearGradient
        pointerEvents="none"
        colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.92)", "rgba(255,255,255,0)"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.rideSkeletonShine, { transform: [{ translateX }] }]}
      />
    </View>
  );
}

function PaymentFooter({
  selectedRide,
  paymentLabel,
  couponLabel,
  onChooseToPay,
  onOpenCoupon,
  onConfirm,
  animatedStyle,
  isConfirming = false,
}) {
  const footerPaymentLabel = paymentLabel || selectedRide.paymentLabel || "Payment method";
  const footerCouponLabel = couponLabel || selectedRide.couponLabel || "Apply coupons";

  return (
    <Animated.View style={[styles.footer, animatedStyle]}>
      <View style={styles.footerOptionRow}>
        <Pressable
          style={({ pressed }) => [styles.footerOption, pressed && styles.footerOptionPressed]}
          onPress={() => onChooseToPay?.(selectedRide)}
        >
          <View style={styles.footerOptionIcon}>
            <MaterialIcons name="payments" size={17} color="#111827" />
          </View>
          <View style={styles.footerOptionCopy}>
            <Text style={styles.footerOptionValue} numberOfLines={1}>{footerPaymentLabel}</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.footerActionRow}>
        <Pressable
          onPress={() => onOpenCoupon?.(selectedRide)}
          style={({ pressed }) => [styles.couponActionButton, pressed && styles.footerActionPressed]}
        >
          <MaterialIcons name="local-offer" size={18} color="#111827" />
          <Text style={styles.couponActionText} numberOfLines={1}>{footerCouponLabel}</Text>
        </Pressable>

        <Pressable
          onPress={onConfirm}
          disabled={isConfirming}
          style={({ pressed }) => [styles.chooseButton, pressed && !isConfirming && styles.chooseButtonPressed, isConfirming && styles.confirmDisabled]}
        >
          {isConfirming ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
          <Text style={styles.confirmText}>{isConfirming ? "Processing" : `Choose ${selectedRide.name}`}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}


export default function ChooseRideScreen({
  selectedRideKey,
  pickupText,
  dropText,
  pickupCoord,
  dropCoord,
  routeCoords,
  mapRegion,
  paymentLabel,
  couponLabel,
  onBack = () => {},
  onEditPickup,
  onEditDrop,
  onSelectRide = () => {},
  onConfirm = () => {},
  onChooseToPay = () => {},
  onOpenCoupon = () => {},
  onPaymentSelect = () => {},
  onCouponApply = () => {},
  isConfirming = false,
}) {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const estimatedSheetContentHeight = 70 + Math.min(rides.length, 5) * 84 + 148;
  const responsiveExpandedSheetHeight = clamp(
    estimatedSheetContentHeight,
    screenHeight * 0.46,
    screenHeight * 0.72
  );
  const responsiveCollapsedSheetHeight = Math.min(
    responsiveExpandedSheetHeight,
    clamp(screenHeight * 0.46, 320, 410)
  );
  const responsiveSheetDragRange = Math.max(
    72,
    responsiveExpandedSheetHeight - responsiveCollapsedSheetHeight
  );
  const [sheetMetrics, setSheetMetrics] = useState({
    top: screenHeight - responsiveExpandedSheetHeight,
    height: responsiveExpandedSheetHeight,
  });
  const measuredExpandedSheetTop = Number.isFinite(sheetMetrics.top)
    ? sheetMetrics.top
    : screenHeight - responsiveExpandedSheetHeight;
  const automaticMapSafeTop = Math.max(safeAreaInsets.top + 68, 84);
  const automaticSheetClearance = clamp(screenHeight * 0.05, 32, 48);

  const initialSelectedRide = rides.find((ride) => ride.id === selectedRideKey || ride.key === selectedRideKey);
  const [selected, setSelected] = useState(initialSelectedRide?.id || "1");
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;
  const sheetOffset = useRef(new Animated.Value(0)).current;
  const loadingShimmer = useRef(new Animated.Value(0)).current;
  const savingsAnim = useRef(new Animated.Value(0)).current;
  const etaShimmer = useRef(new Animated.Value(0)).current;
  const dragStartOffset = useRef(0);
  const mapRef = useRef(null);
  const pendingMapZoomProgressRef = useRef(0);
  const currentSheetProgressRef = useRef(0);
  const mapZoomFrameRef = useRef(null);
  const addressPillFrameRef = useRef(null);
  const addressPillRequestRef = useRef(0);
  const mapGestureActiveRef = useRef(false);
  const lastGpsTapRef = useRef(0);
  const sheetDraggingRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const cardEntranceAnims = useRef(rides.map(() => new Animated.Value(0))).current;
  const [sheetStage, setSheetStage] = useState("expanded");
  const [cardsLoading, setCardsLoading] = useState(true);
  const [optionSheet, setOptionSheet] = useState(null);

  useEffect(() => {
    const nextRide = rides.find((ride) => ride.id === selectedRideKey || ride.key === selectedRideKey);
    if (nextRide && nextRide.id !== selected) {
      setSelected(nextRide.id);
    }
  }, [selectedRideKey, selected]);

  useEffect(() => {
    if (!selectedRideKey) {
      onSelectRide?.(rides[0]);
    }
  }, [onSelectRide, selectedRideKey]);

  const selectedRide = useMemo(
    () => rides.find((ride) => ride.id === selected) || rides[0],
    [selected]
  );
  const selectedRideSavings = useMemo(
    () => getRideSavings(selectedRide),
    [selectedRide]
  );
  const selectedEtaMinutes = useMemo(
    () => Math.max(1, Number(selectedRide.eta?.match(/\d+/)?.[0] || 2)),
    [selectedRide.eta]
  );

  useEffect(() => {
    etaShimmer.setValue(0);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(etaShimmer, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.delay(650),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [etaShimmer]);

  useEffect(() => {
    savingsAnim.setValue(0);
    Animated.timing(savingsAnim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [savingsAnim, selectedRide.id]);

  const isSheetCollapsed = sheetStage === "collapsed";
  const routeEdgePadding = useMemo(() => ({
    top: automaticMapSafeTop,
    right: 56,
    bottom: Math.max(
      180,
      Math.ceil(
        screenHeight - measuredExpandedSheetTop +
        automaticSheetClearance + ROUTE_MARKER_CLEARANCE
      )
    ),
    left: 56,
  }), [automaticMapSafeTop, automaticSheetClearance, measuredExpandedSheetTop, screenHeight]);
  useEffect(() => {
    sheetAnim.setValue(0);
    footerAnim.setValue(0);
    setCardsLoading(true);
    cardEntranceAnims.forEach((anim) => anim.setValue(0));

    Animated.parallel([
      Animated.timing(sheetAnim, {
        toValue: 1,
        duration: SHEET_TIMING.enterDuration,
        easing: EASING.premium,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(150),
        Animated.stagger(
          58,
          cardEntranceAnims.map((anim) =>
            Animated.timing(anim, {
              toValue: 1,
              duration: 560,
              easing: Easing.bezier(0.22, 1, 0.36, 1),
              useNativeDriver: true,
            })
          )
        ),
      ]),
      Animated.sequence([
        Animated.delay(280),
        Animated.timing(footerAnim, {
          toValue: 1,
          duration: SHEET_TIMING.footerDuration,
          easing: EASING.premium,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setCardsLoading(false));
  }, [cardEntranceAnims, footerAnim, sheetAnim]);

  useEffect(() => () => {
    if (mapZoomFrameRef.current != null) {
      cancelAnimationFrame(mapZoomFrameRef.current);
    }
    if (addressPillFrameRef.current != null) {
      cancelAnimationFrame(addressPillFrameRef.current);
    }
  }, []);

  useEffect(() => {
    const nextOffset = currentSheetProgressRef.current * responsiveSheetDragRange;
    sheetOffset.setValue(nextOffset);
  }, [responsiveSheetDragRange, screenHeight, sheetOffset]);

  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [addressPillPoints, setAddressPillPoints] = useState({ pickup: null, drop: null });
  const [streetRouteCoords, setStreetRouteCoords] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const isSheetLoading = routeLoading || !mapReady || cardsLoading;
  const automaticSheetTitle = isConfirming
    ? `Confirming ${selectedRide.name}`
    : isSheetLoading
      ? "Finding rides…"
      : "Choose a ride";

  useEffect(() => {
    loadingShimmer.stopAnimation();
    loadingShimmer.setValue(0);
    if (!isSheetLoading) return undefined;

    const animation = Animated.loop(
      Animated.timing(loadingShimmer, {
        toValue: 1,
        duration: 1150,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [isSheetLoading, loadingShimmer]);

  const isValidPoint = (point) =>
    point && typeof point.latitude === "number" && typeof point.longitude === "number";

  const fallbackPoint = useMemo(
    () =>
      isValidPoint(mapRegion)
        ? mapRegion
        : isValidPoint(pickupCoord)
          ? pickupCoord
          : { latitude: 12.9352, longitude: 77.6245 },
    [mapRegion, pickupCoord]
  );

  const incomingRouteLooksStreetWise = useMemo(() => {
    const normalized = Array.isArray(routeCoords)
      ? routeCoords.filter(isValidPoint)
      : [];
    return normalized.length > 8;
  }, [routeCoords]);

  useEffect(() => {
    const pickup = isValidPoint(pickupCoord) ? pickupCoord : fallbackPoint;
    const drop = isValidPoint(dropCoord) ? dropCoord : null;

    if (!pickup || !drop || incomingRouteLooksStreetWise) {
      setStreetRouteCoords([]);
      setRouteLoading(false);
      return undefined;
    }

    let cancelled = false;
    setRouteLoading(true);

    fetchStreetRoute(pickup, drop)
      .then((route) => {
        if (cancelled) return;
        const nextCoords = Array.isArray(route?.routeCoords)
          ? route.routeCoords.filter(isValidPoint)
          : [];
        setStreetRouteCoords(nextCoords.length >= 2 ? nextCoords : []);
      })
      .catch((error) => {
        if (!cancelled) {
          console.warn("Street route unavailable", error?.message || error);
          setStreetRouteCoords([]);
        }
      })
      .finally(() => {
        if (!cancelled) setRouteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dropCoord, fallbackPoint, incomingRouteLooksStreetWise, pickupCoord]);

  const routePath = useMemo(() => {
    const normalized = Array.isArray(routeCoords)
      ? routeCoords.filter(isValidPoint)
      : [];
    const fetchedStreetRoute = Array.isArray(streetRouteCoords)
      ? streetRouteCoords.filter(isValidPoint)
      : [];

    if (normalized.length > 8) return normalized;
    if (fetchedStreetRoute.length >= 2) return fetchedStreetRoute;
    if (normalized.length >= 2) return normalized;

    const pickup = isValidPoint(pickupCoord) ? pickupCoord : fallbackPoint;
    const drop = isValidPoint(dropCoord)
      ? dropCoord
      : {
          latitude: pickup.latitude + 0.012,
          longitude: pickup.longitude + 0.012,
        };

    return [
      pickup,
      {
        latitude: pickup.latitude + (drop.latitude - pickup.latitude) * 0.52 + 0.0012,
        longitude: pickup.longitude + (drop.longitude - pickup.longitude) * 0.52 - 0.001,
      },
      drop,
    ];
  }, [routeCoords, streetRouteCoords, pickupCoord, dropCoord, fallbackPoint]);

  const pickupPoint = useMemo(() => {
    if (isValidPoint(pickupCoord)) return pickupCoord;
    if (routePath.length > 0) return routePath[0];
    return fallbackPoint;
  }, [pickupCoord, routePath, fallbackPoint]);

  const dropPoint = useMemo(() => {
    if (isValidPoint(dropCoord)) return dropCoord;
    if (routePath.length > 1) return routePath[routePath.length - 1];
    return null;
  }, [dropCoord, routePath]);

  const routeStartPoint = useMemo(() => {
    if (routePath.length >= 2) return routePath[0];
    return pickupPoint;
  }, [pickupPoint, routePath]);

  const routeEndPoint = useMemo(() => {
    if (routePath.length >= 2) return routePath[routePath.length - 1];
    return dropPoint || pickupPoint;
  }, [dropPoint, pickupPoint, routePath]);

  const initialRegion = useMemo(() => {
    if (routePath.length >= 2) {
      const latitudes = routePath.map((point) => point.latitude);
      const longitudes = routePath.map((point) => point.longitude);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(0.02, (maxLat - minLat) * 1.8),
        longitudeDelta: Math.max(0.02, (maxLng - minLng) * 1.8),
      };
    }

    if (isValidPoint(mapRegion)) return mapRegion;

    return {
      latitude: pickupPoint.latitude,
      longitude: pickupPoint.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    };
  }, [routePath, mapRegion, pickupPoint]);

  const sheetAwareRegions = useMemo(() => {
    if (!routePath.length) return { expanded: initialRegion, collapsed: initialRegion };

    const latitudes = routePath.map((point) => point.latitude);
    const longitudes = routePath.map((point) => point.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const routeCenterLat = (minLat + maxLat) / 2;
    const routeCenterLng = (minLng + maxLng) / 2;
    const routeLatSpan = Math.max(maxLat - minLat, 0.0028);
    const routeLngSpan = Math.max(maxLng - minLng, 0.0028);
    const measuredMapHeight = mapSize.height || screenHeight;
    const measuredMapWidth = mapSize.width || screenWidth;

    const resolveRegion = (progress) => {
      const sheetTop = measuredExpandedSheetTop + responsiveSheetDragRange * progress;
      const viewportTop = automaticMapSafeTop;
      const viewportBottom = Math.min(
        measuredMapHeight - 12,
        sheetTop - automaticSheetClearance
      );
      const viewportHeight = Math.max(88, viewportBottom - viewportTop);
      // Keep the complete route centered in the portion of the map that is
      // actually visible above the sheet. Symmetric horizontal clearance also
      // leaves room for either endpoint pill without pushing the route aside.
      const horizontalRouteClearance = Math.min(
        118,
        Math.max(72, measuredMapWidth * 0.24)
      );
      const viewportLeft = horizontalRouteClearance;
      const viewportRight = horizontalRouteClearance;
      const viewportWidth = Math.max(140, measuredMapWidth - viewportLeft - viewportRight);
      const latitudeDelta = Math.max(
        0.006,
        routeLatSpan * 1.3 * (measuredMapHeight / viewportHeight)
      );
      const longitudeDelta = Math.max(
        0.006,
        routeLngSpan * 1.3 * (measuredMapWidth / viewportWidth)
      );
      const viewportCenterY = viewportTop + viewportHeight / 2;
      const viewportCenterX = viewportLeft + viewportWidth / 2;

      return {
        latitude:
          routeCenterLat +
          ((viewportCenterY - measuredMapHeight / 2) / measuredMapHeight) * latitudeDelta,
        longitude:
          routeCenterLng +
          ((measuredMapWidth / 2 - viewportCenterX) / measuredMapWidth) * longitudeDelta,
        latitudeDelta,
        longitudeDelta,
      };
    };

    return {
      expanded: resolveRegion(0),
      collapsed: resolveRegion(1),
    };
  }, [
    automaticMapSafeTop,
    automaticSheetClearance,
    initialRegion,
    mapSize.height,
    mapSize.width,
    measuredExpandedSheetTop,
    responsiveSheetDragRange,
    routePath,
    screenHeight,
    screenWidth,
  ]);

  const nearbyVehicles = useMemo(() => {
    const latitudeScale = Math.max(Number(initialRegion?.latitudeDelta || 0.03) * 0.09, 0.0014);
    const longitudeScale = Math.max(Number(initialRegion?.longitudeDelta || 0.03) * 0.09, 0.0014);
    const offsets = [
      { lat: 0.52, lng: -0.72, bearing: 78 },
      { lat: -0.68, lng: -0.38, bearing: 18 },
      { lat: 0.3, lng: 0.82, bearing: 244 },
      { lat: -0.82, lng: 0.7, bearing: 318 },
    ];

    const selectedVehicleIdentity = `${selectedRide?.key || ""} ${selectedRide?.name || ""}`;
    const usesBikeCaptain = /bike|scooty|motorbike|motorcycle/i.test(selectedVehicleIdentity);
    const captainMarkerImage = usesBikeCaptain
      ? NEARBY_CAPTAIN_BIKE_IMAGE
      : NEARBY_CAPTAIN_CAR_IMAGE;

    return offsets.map((offset, index) => ({
      id: `bike-${index + 1}`,
      coordinate: {
        latitude: pickupPoint.latitude + latitudeScale * offset.lat,
        longitude: pickupPoint.longitude + longitudeScale * offset.lng,
      },
      bearing: offset.bearing,
      image: captainMarkerImage,
      rotateWithBearing: true,
      markerSize: usesBikeCaptain ? 58 : 72,
    }));
  }, [
    initialRegion.latitudeDelta,
    initialRegion.longitudeDelta,
    pickupPoint.latitude,
    pickupPoint.longitude,
    selectedRide?.key,
    selectedRide?.name,
  ]);

  const updateAddressPillPositions = useCallback(async () => {
    if (!mapReady || !mapRef.current?.pointForCoordinate || !mapSize.width || !mapSize.height) return;
    const requestId = ++addressPillRequestRef.current;

    try {
      const [pickupPixel, dropPixel] = await Promise.all([
        mapRef.current.pointForCoordinate(routeStartPoint),
        mapRef.current.pointForCoordinate(routeEndPoint),
      ]);
      const markerHeadOffsetFromTip =
        SEARCH_ENDPOINT_PIN_METRICS.tipY - SEARCH_ENDPOINT_PIN_METRICS.headCenterY;
      const placePill = (point) => {
        const markerHeadY = point.y - markerHeadOffsetFromTip;
        const rightJoinX =
          point.x + SEARCH_ENDPOINT_PIN_METRICS.headRadius - MAP_ADDRESS_PILL_JOIN;
        const fitsRight = rightJoinX + MAP_ADDRESS_PILL_WIDTH <= mapSize.width;
        return {
          left: fitsRight
            ? rightJoinX
            : point.x - SEARCH_ENDPOINT_PIN_METRICS.headRadius - MAP_ADDRESS_PILL_WIDTH + MAP_ADDRESS_PILL_JOIN,
          top: markerHeadY - MAP_ADDRESS_PILL_HEIGHT / 2,
        };
      };

      const pickup = placePill(pickupPixel);
      const drop = placePill(dropPixel);
      if (requestId !== addressPillRequestRef.current) return;
      setAddressPillPoints({ pickup, drop });
    } catch {
      // Keep the last valid positions while the native map is transitioning.
    }
  }, [
    mapReady,
    mapSize.height,
    mapSize.width,
    routeEndPoint,
    routeStartPoint,
  ]);

  const scheduleAddressPillUpdate = useCallback(() => {
    if (addressPillFrameRef.current != null) return;
    addressPillFrameRef.current = requestAnimationFrame(() => {
      addressPillFrameRef.current = null;
      updateAddressPillPositions();
    });
  }, [updateAddressPillPositions]);

  useEffect(() => {
    if (!mapReady || routePath.length < 2) return undefined;
    const timer = setTimeout(updateAddressPillPositions, 360);
    return () => clearTimeout(timer);
  }, [mapReady, routePath, updateAddressPillPositions]);

  const applyMapZoomProgress = useCallback((progress, duration = 0) => {
    if (!mapRef.current?.animateToRegion) return;
    const normalizedProgress = clamp(progress, 0, 1);
    const expanded = sheetAwareRegions.expanded;
    const collapsed = sheetAwareRegions.collapsed;
    const interpolate = (from, to) => from + (to - from) * normalizedProgress;

    mapRef.current.animateToRegion(
      {
        latitude: interpolate(expanded.latitude, collapsed.latitude),
        longitude: interpolate(expanded.longitude, collapsed.longitude),
        latitudeDelta: interpolate(expanded.latitudeDelta, collapsed.latitudeDelta),
        longitudeDelta: interpolate(expanded.longitudeDelta, collapsed.longitudeDelta),
      },
      duration
    );
  }, [sheetAwareRegions]);

  const recenterRoute = useCallback(() => {
    mapGestureActiveRef.current = false;
    const progress = currentSheetProgressRef.current;
    const sheetTop = measuredExpandedSheetTop + responsiveSheetDragRange * progress;
    const desiredBottomPadding = Math.max(
      120,
      Math.ceil(screenHeight - sheetTop + automaticSheetClearance)
    );
    const dynamicPadding = {
      top: automaticMapSafeTop,
      right: Math.min(118, Math.max(72, screenWidth * 0.24)),
      bottom: Math.min(
        desiredBottomPadding,
        Math.max(80, screenHeight - automaticMapSafeTop - 96)
      ),
      left: Math.min(118, Math.max(72, screenWidth * 0.24)),
    };

    if (mapRef.current?.fitToRoute) {
      mapRef.current.fitToRoute(true, dynamicPadding);
    } else {
      applyMapZoomProgress(progress, 340);
    }
    setTimeout(scheduleAddressPillUpdate, 380);
  }, [
    applyMapZoomProgress,
    automaticMapSafeTop,
    automaticSheetClearance,
    measuredExpandedSheetTop,
    responsiveSheetDragRange,
    scheduleAddressPillUpdate,
    screenHeight,
    screenWidth,
  ]);

  const scheduleMapZoomProgress = useCallback((progress) => {
    pendingMapZoomProgressRef.current = clamp(progress, 0, 1);
    if (mapZoomFrameRef.current != null) return;

    mapZoomFrameRef.current = requestAnimationFrame(() => {
      mapZoomFrameRef.current = null;
      applyMapZoomProgress(pendingMapZoomProgressRef.current, 0);
    });
  }, [applyMapZoomProgress]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return undefined;

    if (routePath.length >= 2) {
      applyMapZoomProgress(0, 280);
      return undefined;
    }

    mapRef.current.animateToRegion?.(initialRegion, 250);
    return undefined;
  }, [applyMapZoomProgress, initialRegion, mapReady, routePath]);

  const handleSelectRide = (ride) => {
    setSelected(ride.id);
    onSelectRide?.(ride);
  };

  const settleSheetStage = (nextStage, releaseVelocity = 0) => {
    if (nextStage === "expanded") setSheetStage("expanded");
    const nextProgress = nextStage === "expanded" ? 0 : 1;
    currentSheetProgressRef.current = nextProgress;
    pendingMapZoomProgressRef.current = nextProgress;
    applyMapZoomProgress(nextProgress, 330);
    Animated.spring(sheetOffset, {
      toValue: nextStage === "expanded" ? 0 : responsiveSheetDragRange,
      ...UBER_SHEET_SPRING,
      velocity: clamp(releaseVelocity, -1.8, 1.8),
      useNativeDriver: true,
    }).start(() => {
      setSheetStage(nextStage);
      sheetDraggingRef.current = false;
    });
  };

  const handleGpsPress = useCallback(() => {
    const now = Date.now();
    const isDoubleTap = now - lastGpsTapRef.current <= 360;
    lastGpsTapRef.current = isDoubleTap ? 0 : now;

    recenterRoute();
    if (isDoubleTap) {
      settleSheetStage("expanded");
    }
  }, [recenterRoute, settleSheetStage]);

  const sheetPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      const verticalDrag = Math.abs(gestureState.dy);
      return verticalDrag > 7 && verticalDrag > Math.abs(gestureState.dx) * 1.25;
    },
    onMoveShouldSetPanResponderCapture: (_, gestureState) => {
      const verticalDrag = Math.abs(gestureState.dy);
      return verticalDrag > 7 && verticalDrag > Math.abs(gestureState.dx) * 1.25;
    },
    onPanResponderGrant: () => {
      sheetDraggingRef.current = true;
      sheetOffset.stopAnimation((value) => {
        dragStartOffset.current = value;
      });
    },
    onPanResponderMove: (_, gestureState) => {
      const nextOffset = clamp(
        dragStartOffset.current + gestureState.dy,
        0,
        responsiveSheetDragRange
      );
      const nextProgress = nextOffset / Math.max(responsiveSheetDragRange, 1);
      sheetOffset.setValue(nextOffset);
      currentSheetProgressRef.current = nextProgress;
      scheduleMapZoomProgress(nextProgress);
    },
    onPanResponderRelease: (_, gestureState) => {
      const projected = clamp(
        dragStartOffset.current + gestureState.dy + gestureState.vy * 96,
        0,
        responsiveSheetDragRange
      );
      const nextStage =
        gestureState.vy < -0.38
          ? "expanded"
          : gestureState.vy > 0.38
            ? "collapsed"
            : projected > responsiveSheetDragRange * 0.5
              ? "collapsed"
              : "expanded";
      settleSheetStage(nextStage, gestureState.vy);
    },
    onPanResponderTerminate: (_, gestureState) => {
      const projected = clamp(
        dragStartOffset.current + gestureState.dy + gestureState.vy * 96,
        0,
        responsiveSheetDragRange
      );
      settleSheetStage(
        projected > responsiveSheetDragRange * 0.5 ? "collapsed" : "expanded",
        gestureState.vy
      );
    },
  }), [
    applyMapZoomProgress,
    responsiveSheetDragRange,
    scheduleMapZoomProgress,
    sheetOffset,
    sheetStage,
  ]);

  const handleConfirm = () => {
    onConfirm?.(selectedRide);
  };

  const sheetAnimatedStyle = {
    opacity: sheetAnim,
    transform: [
      {
        translateY: Animated.add(
          sheetAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [66, 0],
          }),
          sheetOffset
        ),
      },
    ],
  };

  const footerAnimatedStyle = {
    opacity: footerAnim,
    transform: [
      {
        translateY: footerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [34, 0],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" hidden={false} translucent={false} backgroundColor="#FFFFFF" />
      <View
        style={[styles.map, { height: screenHeight }]}
        onLayout={({ nativeEvent }) => setMapSize(nativeEvent.layout)}
      >
        <View style={styles.mapCameraLayer}>
          <RideRouteMap
            ref={mapRef}
            showStatusBarScrim
            pickupCoord={pickupPoint}
            dropCoord={dropPoint}
            routeCoords={routePath}
            mapRegion={initialRegion}
            routeColor="#111111"
            routeWidth={2.5}
            showUserLocation={false}
            showMyLocationButton={false}
            showZoomControls={false}
            showMapControls={false}
            autoFitRoute={false}
            startMarkerVariant="searchPickup"
            endMarkerVariant="searchDrop"
            attachMarkersToRouteEnds
            animateRoute
            routeAnimationDuration={720}
            interactive
            onPanDrag={() => {
              mapGestureActiveRef.current = true;
            }}
            onMapReady={() => setMapReady(true)}
            onRegionChange={scheduleAddressPillUpdate}
            onRegionChangeComplete={(_, details) => {
              scheduleAddressPillUpdate();
              if (sheetDraggingRef.current) return;
              if (details?.isGesture || mapGestureActiveRef.current) {
                mapGestureActiveRef.current = false;
                return;
              }
            }}
            edgePadding={routeEdgePadding}
            nearbyVehicles={nearbyVehicles}
          />

          <View pointerEvents="box-none" style={styles.mapAddressLayer}>
            {addressPillPoints.pickup ? (
              <Pressable
                onPress={onEditPickup || onBack}
                style={({ pressed }) => [
                  styles.mapAddressPill,
                  styles.mapAddressPillPickup,
                  addressPillPoints.pickup,
                  pressed && styles.mapAddressPillPressed,
                ]}
              >
                <View style={[styles.mapEtaBlock, styles.mapEtaBlockPickup]}>
                  <AddressEtaShape variant="pickup" shimmer={etaShimmer} />
                  <Text style={[styles.mapEtaValue, styles.mapEtaTextPickup]}>
                    {selectedEtaMinutes}
                  </Text>
                  <Text style={[styles.mapEtaUnit, styles.mapEtaTextPickup]}>MIN</Text>
                </View>
                <Text style={styles.mapAddressText} numberOfLines={1}>
                  {formatMapAddressLabel(pickupText, "Pickup")}
                </Text>
                <View style={styles.mapAddressEdit}>
                  <MaterialIcons name="edit" size={15} color="#1769E8" />
                </View>
              </Pressable>
            ) : null}

            {addressPillPoints.drop ? (
              <Pressable
                onPress={onEditDrop || onBack}
                style={({ pressed }) => [
                  styles.mapAddressPill,
                  styles.mapAddressPillDrop,
                  addressPillPoints.drop,
                  pressed && styles.mapAddressPillPressed,
                ]}
              >
                <View style={[styles.mapEtaBlock, styles.mapEtaBlockDrop]}>
                  <AddressEtaShape variant="drop" shimmer={etaShimmer} />
                  <Text style={[styles.mapEtaValue, styles.mapEtaTextDrop]}>
                    {selectedEtaMinutes}
                  </Text>
                  <Text style={[styles.mapEtaUnit, styles.mapEtaTextDrop]}>MIN</Text>
                </View>
                <Text style={styles.mapAddressText} numberOfLines={1}>
                  {formatMapAddressLabel(dropText, "Drop")}
                </Text>
                <View style={styles.mapAddressEdit}>
                  <MaterialIcons name="edit" size={15} color="#1769E8" />
                </View>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <Pressable
        style={[styles.backButton, { top: Math.max(safeAreaInsets.top + 12, 42) }]}
        onPress={onBack}
      >
        <MaterialIcons name="arrow-back" size={30} color="#111827" />
      </Pressable>

      <Animated.View
        style={[
          styles.gpsButtonWrap,
          {
            bottom: responsiveExpandedSheetHeight + 12,
            transform: [{ translateY: sheetOffset }],
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Recenter route"
          onPress={handleGpsPress}
          style={({ pressed }) => [styles.gpsButton, pressed && styles.gpsButtonPressed]}
        >
          <MaterialIcons name="my-location" size={21} color="#1769E8" />
        </Pressable>
      </Animated.View>


      <Animated.View
        style={[
          styles.sheet,
          sheetAnimatedStyle,
          { height: responsiveExpandedSheetHeight },
        ]}
        onLayout={({ nativeEvent }) => {
          const { y, height: measuredHeight } = nativeEvent.layout;
          setSheetMetrics((current) => {
            if (
              Math.abs(current.top - y) < 0.5 &&
              Math.abs(current.height - measuredHeight) < 0.5
            ) {
              return current;
            }
            return { top: y, height: measuredHeight };
          });
        }}
        {...sheetPanResponder.panHandlers}
      >
        <View style={styles.handleTouch}>
          <View style={styles.handle} />
        </View>

        <View style={styles.sheetBody}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetHeaderTitle} numberOfLines={1}>
              {automaticSheetTitle}
            </Text>
            {!isSheetLoading && selectedRideSavings > 0 ? (
              <Animated.Text
                numberOfLines={1}
                style={[
                  styles.sheetSavingsText,
                  {
                    opacity: savingsAnim,
                    transform: [{
                      translateY: savingsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [4, 0],
                      }),
                    }],
                  },
                ]}
              >
                Saving ₹{selectedRideSavings} on {selectedRide.name}
              </Animated.Text>
            ) : null}
          </View>
          <View style={styles.sheetTopDivider}>
            <Animated.View
              style={[
                styles.sheetTopDividerProgress,
                {
                  opacity: isSheetLoading ? 1 : 0,
                  transform: [{
                    translateX: loadingShimmer.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-96, screenWidth],
                    }),
                  }],
                },
              ]}
            />
          </View>

          {isSheetCollapsed ? (
            <Animated.View
              style={[
                styles.collapsedRideWrap,
                {
                  opacity: footerAnim,
                  transform: [
                    {
                      translateY: footerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [12, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <RideOptionCard
                item={selectedRide}
                selected
                onPress={() => handleSelectRide(selectedRide)}
              />
            </Animated.View>
          ) : isSheetLoading ? (
            <View style={styles.rideSkeletonList}>
              {[0, 1, 2, 3, 4].map((item) => (
                <RideOptionSkeleton key={`ride-skeleton-${item}`} shimmer={loadingShimmer} />
              ))}
            </View>
          ) : (
            <FlatList
              style={styles.list}
              data={rides}
              renderItem={({ item, index }) => {
                const cardAnim = cardEntranceAnims[index] || cardEntranceAnims[0];
                const cardAnimatedStyle = {
                  opacity: cardAnim,
                  transform: [
                    {
                      translateY: cardAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [22, 0],
                      }),
                    },
                    {
                      scale: cardAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.985, 1],
                      }),
                    },
                  ],
                };

                return (
                  <Animated.View style={cardAnimatedStyle}>
                    <RideOptionCard
                      item={item}
                      selected={selected === item.id}
                      onPress={() => handleSelectRide(item)}
                    />
                  </Animated.View>
                );
              }}
              keyExtractor={(item) => item.id}
              extraData={selected}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              nestedScrollEnabled
              bounces={false}
              decelerationRate="normal"
              keyboardShouldPersistTaps="handled"
            />
          )}

        </View>
      </Animated.View>

      <PaymentFooter
        selectedRide={selectedRide}
        paymentLabel={paymentLabel}
        couponLabel={couponLabel}
        onChooseToPay={() => setOptionSheet("payment")}
        onOpenCoupon={() => setOptionSheet("coupon")}
        onConfirm={handleConfirm}
        isConfirming={isConfirming}
        animatedStyle={footerAnimatedStyle}
      />
      <BookingOptionBottomSheet
        visible={Boolean(optionSheet)}
        type={optionSheet || "payment"}
        amount={selectedRide.price}
        selectedPaymentLabel={paymentLabel}
        selectedCouponCode={couponLabel}
        onClose={() => setOptionSheet(null)}
        onSelectPayment={(option) => {
          onPaymentSelect?.(option);
        }}
        onApplyCoupon={(coupon) => {
          onCouponApply?.(coupon);
        }}
      />
      <View pointerEvents="none" style={styles.rideBottomStrip} />
    </View>
  );
}



const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 32,
    left: 18,
    width: 44,
    height: 44,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5
  },
  badgeSlot: {
    minWidth: 70,
    alignItems: "flex-start"
  },
  capacitySlot: {
    width: 24,
    height: 18,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  capacityText: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "800"
  },
  capacityWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    minHeight: 82,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginHorizontal: 6,
    marginBottom: 2,
    borderWidth: 1.5,
    borderColor: "transparent",
    backgroundColor: "#FFFFFF"
  },
  cardSelected: {
    backgroundColor: "#FFFFFF"
  },
  cardUnselected: {
    backgroundColor: "#FFFFFF",
    borderColor: "transparent"
  },
  chooseButton: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#000000ff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  chooseButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.992 }]
  },
  confirmDisabled: {
    opacity: 0.72
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700"
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  detailPrimary: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 17,
    marginTop: 1,
    fontWeight: "500"
  },
  detailSecondary: {
    fontSize: 12,
    lineHeight: 16,
    color: "#64748B",
    marginTop: 0,
    fontWeight: "500"
  },
  detailSecondaryHidden: {
    opacity: 0
  },
  dropMarkerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 3,
    borderColor: "#FFFFFF"
  },
  dropMarkerOuter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(34,197,94,0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 18,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 52,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#ECECEC",
    ...SHADOWS.footer,elevation:0,borderTopLeftRadius:0,borderTopRightRadius:0,
    gap: 12
  },
  footerOption: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  footerOptionCopy: {
    flex: 1,
    minWidth: 0
  },
  footerOptionIcon: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center"
  },
  footerOptionLabel: {
    color: "#7A808A",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "800"
  },
  footerOptionPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }]
  },
  footerOptionRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center"
  },
  footerActionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  couponActionButton: {
    width: 124,
    flexShrink: 0,
    height: 52,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.4,
    borderColor: "#111827",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7
  },
  couponActionText: {
    flexShrink: 1,
    color: "#111827",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  footerActionPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }]
  },
  footerOptionValue: {
    marginTop: 2,
    color: "#111827",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900"
  },
  footerVerticalDivider: {
    width: 1,
    height: 34,
    marginHorizontal: 10,
    backgroundColor: "#E5E7EB"
  },
  gpsButtonWrap: {
    position: "absolute",
    right: 14,
    width: 46,
    height: 46,
    zIndex: 16
  },
  gpsButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.floating,
    elevation: 0
  },
  gpsButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.95 }]
  },
  handle: {
    width: 42,
    height: 5,
    backgroundColor: "#E1E3E6",
    alignSelf: "center",
    borderRadius: 999
  },
  handleTouch: {
    height: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  left: {
    marginRight: 10
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 154,
    flexGrow: 1
  },
  map: {
    position: "relative",
    height,
    backgroundColor: "#F7F8FB",
    overflow: "hidden"
  },
  mapCameraLayer: {
    ...StyleSheet.absoluteFillObject
  },
  dropAddressPill: {
    left: Math.max(12, width - 176),
    top: 120
  },
  mapAddressLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9
  },
  mapAddressPill: {
    position: "absolute",
    width: MAP_ADDRESS_PILL_WIDTH,
    height: MAP_ADDRESS_PILL_HEIGHT,
    paddingRight: 4,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0
  },
  mapAddressPillPickup: {
    borderWidth: 1,
    borderColor: "#D7E7FF"
  },
  mapAddressPillDrop: {
    borderWidth: 0
  },
  mapAddressPillPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  mapAddressText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
    color: "#111111",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "800"
  },
  mapAddressEdit: {
    width: 28,
    height: 27,
    marginLeft: 3,
    borderLeftWidth: 1,
    borderLeftColor: "#D7E5FA",
    alignItems: "center",
    justifyContent: "center"
  },
  mapEtaBlock: {
    alignSelf: "stretch",
    width: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    zIndex: 2
  },
  mapEtaBlockPickup: {
    backgroundColor: "transparent"
  },
  mapEtaBlockDrop: {
    backgroundColor: "transparent"
  },
  mapEtaShape: {
    position: "absolute",
    left: 0,
    top: 0
  },
  mapEtaValue: {
    fontSize: 19,
    lineHeight: 21,
    fontWeight: "900",
    zIndex: 2
  },
  mapEtaUnit: {
    marginLeft: 2,
    marginTop: 8,
    fontSize: 8,
    lineHeight: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
    zIndex: 2
  },
  mapEtaTextPickup: {
    color: "#1769E8"
  },
  mapEtaTextDrop: {
    color: "#FFFFFF"
  },
  pickupAddressPill: {
    left: 12,
    top: 120
  },
  collapsedRideWrap: {
    paddingHorizontal: 10,
    paddingBottom: 154
  },
  middle: {
    flex: 1
  },
  old: {
    fontSize: 10,
    color: "#9CA3AF",
    textDecorationLine: "line-through"
  },
  pickupMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 7,
    backgroundColor: "#2563EB",
    borderWidth: 3,
    borderColor: "#FFFFFF"
  },
  pickupMarkerOuter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(37,99,235,0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  price: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
    color: "#334155"
  },
  quickBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#2E9E16"
  },
  quickBadgePlaceholder: {
    width: 70,
    height: 20
  },
  quickBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800"
  },
  right: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 8
  },
  routeCarMarker: {
    width: 38,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.floating
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    zIndex: 2,
    paddingHorizontal: 0,
    overflow: "hidden",
    ...SHADOWS.sheet
  },
  sheetBody: {
    flex: 1,
    paddingBottom: 0
  },
  sheetHeader: {
    minHeight: 43,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingBottom: 3
  },
  sheetHeaderTitle: {
    color: "#111111",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
    letterSpacing: -0.25,
    textAlign: "center"
  },
  sheetSavingsText: {
    marginTop: 1,
    color: "#08783E",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    textAlign: "center"
  },
  sheetTopDivider: {
    width: "100%",
    height: 1,
    marginBottom: 4,
    backgroundColor: "#F0F3F6",
    overflow: "hidden"
  },
  sheetTopDividerProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 82,
    height: "100%",
    borderRadius: 1,
    backgroundColor: "#77A9CB"
  },
  rideSkeletonList: {
    paddingHorizontal: 12,
    paddingTop: 4
  },
  rideSkeletonRow: {
    height: 82,
    marginBottom: 2,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#FFFFFF"
  },
  rideSkeletonVehicle: {
    width: 62,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#EEF1F4"
  },
  rideSkeletonCopy: {
    flex: 1,
    marginLeft: 14,
    gap: 9
  },
  rideSkeletonTitle: {
    width: "48%",
    height: 15,
    borderRadius: 6,
    backgroundColor: "#E7EBEF"
  },
  rideSkeletonMeta: {
    width: "72%",
    height: 11,
    borderRadius: 5,
    backgroundColor: "#EFF2F5"
  },
  rideSkeletonPrice: {
    width: 42,
    height: 15,
    borderRadius: 6,
    backgroundColor: "#E7EBEF"
  },
  rideSkeletonShine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 110
  },
  scheduleButton: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  scheduleButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  title: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "700",
    color: "#334155",
    flexShrink: 1
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 22
  },
  vehicleImage: {
    width: 62,
    height: 52
  },
  vehicleThumb: {
    width: 66,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible"
  },
  rideBottomStrip: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    backgroundColor: "#FFFFFF",
    zIndex: 20
  }
});
