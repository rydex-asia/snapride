import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Image, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

import RideRouteMap from "../../components/RideRouteMap";
import SharedTripDetailsBottomSheet from "./TripDetailsBottomSheet";
import { SHADOWS } from "../../theme/shadows";
import { isValidCoordinate } from "../../routeUtils";
import {
  RIDE_SHEET_COLLAPSED_HEIGHT as COLLAPSED_SHEET_HEIGHT,
  RIDE_SHEET_DRAG_RANGE as SHEET_DRAG_RANGE,
  RIDE_SHEET_EXPANDED_HEIGHT as EXPANDED_SHEET_HEIGHT,
} from "./rideSheetLayout";
import useRideSheetMotion from "./useRideSheetMotion";

const { height, width } = Dimensions.get("window");
const BASE_FARE = 92;
const BOOSTS = [10, 20, 30];
const BOOST_REVEAL_DELAY = 6000;
const NEARBY_CAPTAIN_CAR_IMAGE = require("../../assets/vehicles/frezo-captain-car-topdown-v6.png");
const NEARBY_CAPTAIN_BIKE_IMAGE = require("../../assets/vehicles/frezo-captain-scooter-marker-v6.png");
const SEARCH_MESSAGES = [
  "Requesting nearby captains",
  "Waiting for a captain to accept",
  "Expanding the search area",
  "Finding the quickest available captain",
];
const SEARCH_TITLES = [
  "Finding nearby captains",
  "Waiting for a captain",
  "Searching a wider area",
  "Finding the quickest captain",
];

const FASTER_SERVICES = [
  {
    key: "auto",
    name: "Auto",
    price: "₹182",
    image: require("../../assets/vehicles/choose-auto.png"),
  },
  {
    key: "scooty",
    name: "Scooty",
    price: "₹98",
    image: require("../../assets/vehicles/choose-scooty.png"),
  },
  {
    key: "cab",
    name: "Cab Non AC",
    price: "₹195",
    image: require("../../assets/vehicles/choose-car.png"),
  },
];

function getAddressParts(value, fallback) {
  const safeValue = String(value || fallback || "").trim();
  const [firstPart, ...restParts] = safeValue.split(",");
  const title = firstPart?.trim() || fallback;
  const detail = restParts.join(",").trim() || safeValue;

  return { title, detail };
}

function BoostChip({ value, selected, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.boostChip,
        selected && styles.boostChipActive,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.boostChipText, selected && styles.boostChipTextActive]}>+ ₹{value}</Text>
    </Pressable>
  );
}

function DashedDivider() {
  return <View style={styles.dashedDivider} />;
}

function FasterServiceRow({ item, selected, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.serviceRow,
        selected && styles.serviceRowSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.serviceImageWrap}>
        <Image source={item.image} resizeMode="contain" style={styles.serviceImage} />
      </View>
      <Text style={styles.serviceName}>{item.name}</Text>
      <Text style={styles.servicePrice}>{item.price}</Text>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected ? <MaterialIcons name="check" size={18} color="#FFFFFF" /> : null}
      </View>
    </Pressable>
  );
}

function TripLocationRow({ type, title, detail, isLast }) {
  const isPickup = type === "pickup";

  return (
    <View style={styles.tripLocationRow}>
      <View style={styles.tripLocationRail}>
        <View style={[styles.tripLocationDot, isPickup ? styles.tripPickupDot : styles.tripDropDot]} />
        {!isLast ? <View style={styles.tripLocationDashedLine} /> : null}
      </View>
      <View style={styles.tripLocationCopy}>
        <Text style={styles.tripLocationTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.tripLocationDetail} numberOfLines={2}>{detail}</Text>
      </View>
      <Pressable style={({ pressed }) => [styles.tripIconButton, pressed && styles.pressed]} hitSlop={8}>
        <MaterialIcons name="edit" size={19} color="#40516A" />
      </Pressable>
    </View>
  );
}

function TripDetailsSheet({ visible, anim, fare, pickupText, dropText, onClose, onCancel }) {
  if (!visible) return null;

  const pickup = getAddressParts(pickupText, "Current pickup location");
  const drop = getAddressParts(dropText, "Selected destination");
  const backdropOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.66] });
  const sheetTranslateY = anim.interpolate({ inputRange: [0, 1], outputRange: [height, 0] });

  return (
    <View pointerEvents="box-none" style={styles.tripOverlayRoot}>
      <Animated.View pointerEvents="auto" style={[styles.tripBackdrop, { opacity: backdropOpacity }]} />
      <Animated.View
        style={[
          styles.tripDetailsSheet,
          {
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
        <View style={styles.tripSheetContent}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripHeaderTitle}>Trip details</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close trip details"
              style={({ pressed }) => [styles.tripHeaderClose, pressed && styles.pressed]}
              onPress={onClose}
              hitSlop={10}
            >
              <MaterialIcons name="close" size={22} color="#111827" />
            </Pressable>
          </View>

          <View style={styles.tripLocationCard}>
            <TripLocationRow type="pickup" title={pickup.title} detail={pickup.detail} />
            <TripLocationRow type="drop" title={drop.title} detail={drop.detail} isLast />
          </View>

          <View style={styles.tripFareCard}>
            <View style={styles.tripInfoIcon}>
              <MaterialIcons name="receipt-long" size={21} color="#111827" />
            </View>
            <View style={styles.tripInfoCopy}>
              <Text style={styles.tripInfoLabel}>Total fare</Text>
              <Text style={styles.tripFareAmount}>₹{fare}</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-down" size={22} color="#6B7280" />
          </View>

          <View style={styles.tripPaymentCard}>
            <View style={styles.tripCashIcon}>
              <MaterialIcons name="payments" size={21} color="#111827" />
            </View>
            <View style={styles.tripPaymentCopy}>
              <Text style={styles.tripPaymentLabel}>Payment method</Text>
              <Text style={styles.tripPaymentText}>Cash</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.tripChangeButton, pressed && styles.pressed]}>
              <Text style={styles.tripChangeText}>Change</Text>
            </Pressable>
          </View>

          <View style={styles.tripStatusRow}>
            <View style={styles.tripInfoIcon}>
              <MaterialIcons name="route" size={21} color="#111827" />
            </View>
            <View style={styles.tripInfoCopy}>
              <Text style={styles.tripInfoLabel}>Trip status</Text>
              <Text style={styles.tripStatusText}>Searching for captain</Text>
            </View>
          </View>

          <Pressable style={({ pressed }) => [styles.tripCancelButton, pressed && styles.pressed]} onPress={onCancel}>
            <Text style={styles.tripCancelText}>Cancel Ride</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

export default function SearchingCaptainScreen({
  onBack = () => {},
  onForward = () => {},
  onFound,
  pickupText = "13-7-53, Road No. 3, Gaddiannaram, Madhura Puri Colony, Dilsukhnagar",
  dropText = "3-2-37/A/7/A, Sri Nagar Colony, Ramanthapur, Hyderabad, Telangana 500013",
  pickupCoord,
  dropCoord,
  routeCoords,
  mapRegion,
  captainCoord,
  ride,
  acceptance,
  demoMode = false,
  onChangePickup,
}) {
  const [boost, setBoost] = useState(0);
  const [boostAvailable, setBoostAvailable] = useState(false);
  const [boostConfirmed, setBoostConfirmed] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [pickupLocated, setPickupLocated] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [tripDetailsVisible, setTripDetailsVisible] = useState(false);
  const { sheetOffset, closeSheet } = useRideSheetMotion({
    openOffset: SHEET_DRAG_RANGE,
    closedOffset: EXPANDED_SHEET_HEIGHT + 36,
  });
  const dragStartOffset = useRef(SHEET_DRAG_RANGE);
  const sweep = useRef(new Animated.Value(0)).current;
  const captainProgress = useRef(new Animated.Value(0)).current;
  const mapRef = useRef(null);
  const mapMotionRegionsRef = useRef(null);
  const mapMotionFrameRef = useRef(null);
  const pendingMapProgressRef = useRef(1);
  const currentSheetProgressRef = useRef(1);

  const applyMapMotion = (progress, duration = 0) => {
    const regions = mapMotionRegionsRef.current;
    if (!regions || !mapRef.current?.animateToRegion) return;
    const normalized = Math.max(0, Math.min(1, progress));
    const interpolate = (from, to) => from + (to - from) * normalized;
    mapRef.current.animateToRegion({
      latitude: interpolate(regions.expanded.latitude, regions.collapsed.latitude),
      longitude: interpolate(regions.expanded.longitude, regions.collapsed.longitude),
      latitudeDelta: interpolate(regions.expanded.latitudeDelta, regions.collapsed.latitudeDelta),
      longitudeDelta: interpolate(regions.expanded.longitudeDelta, regions.collapsed.longitudeDelta),
    }, duration);
  };

  const scheduleMapMotion = (progress) => {
    pendingMapProgressRef.current = Math.max(0, Math.min(1, progress));
    if (mapMotionFrameRef.current != null) return;
    mapMotionFrameRef.current = requestAnimationFrame(() => {
      mapMotionFrameRef.current = null;
      applyMapMotion(pendingMapProgressRef.current, 0);
    });
  };

  const settleSheet = (toValue) => {
    const progress = toValue / Math.max(SHEET_DRAG_RANGE, 1);
    currentSheetProgressRef.current = progress;
    applyMapMotion(progress, 320);
    Animated.spring(sheetOffset, {
      toValue,
      stiffness: 156,
      damping: 25,
      mass: 0.92,
      overshootClamping: true,
      restDisplacementThreshold: 0.25,
      restSpeedThreshold: 0.25,
      useNativeDriver: true,
    }).start();
  };

  const sheetPanResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => (
      Math.abs(gesture.dy) > 7 && Math.abs(gesture.dy) > Math.abs(gesture.dx)
    ),
    onPanResponderGrant: () => {
      sheetOffset.stopAnimation((value) => {
        dragStartOffset.current = value;
      });
    },
    onPanResponderMove: (_, gesture) => {
      const nextOffset = Math.max(0, Math.min(SHEET_DRAG_RANGE, dragStartOffset.current + gesture.dy));
      sheetOffset.setValue(nextOffset);
      const progress = nextOffset / Math.max(SHEET_DRAG_RANGE, 1);
      currentSheetProgressRef.current = progress;
      scheduleMapMotion(progress);
    },
    onPanResponderRelease: (_, gesture) => {
      const projected = Math.max(0, Math.min(SHEET_DRAG_RANGE, dragStartOffset.current + gesture.dy + gesture.vy * 96));
      const shouldExpand = gesture.vy < -0.38 || (gesture.vy <= 0.38 && projected < SHEET_DRAG_RANGE * 0.5);
      settleSheet(shouldExpand ? 0 : SHEET_DRAG_RANGE);
    },
    onPanResponderTerminate: (_, gesture) => {
      const projected = Math.max(0, Math.min(SHEET_DRAG_RANGE, dragStartOffset.current + gesture.dy + gesture.vy * 96));
      settleSheet(projected < SHEET_DRAG_RANGE * 0.5 ? 0 : SHEET_DRAG_RANGE);
    },
  })).current;

  useEffect(() => {
    sweep.setValue(0);
    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true }
    );

    loop.start();
    return () => loop.stop();
  }, [sweep]);

  useEffect(() => {
    const timer = setTimeout(() => setPickupLocated(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!pickupLocated) return undefined;
    captainProgress.setValue(0);
    const animation = Animated.timing(captainProgress, {
      toValue: 1,
      duration: boostConfirmed ? 10000 : 14000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [boostConfirmed, captainProgress, pickupLocated]);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((current) => (current + 1) % SEARCH_MESSAGES.length);
    }, 4500);
    const boostTimer = setTimeout(() => {
      setBoostAvailable(true);
      settleSheet(0);
    }, BOOST_REVEAL_DELAY);

    return () => {
      clearInterval(messageTimer);
      clearTimeout(boostTimer);
    };
  }, []);

  const parsedRideFare = Number(String(ride?.price || "").replace(/[^0-9]/g, ""));
  const baseFare = Number.isFinite(parsedRideFare) && parsedRideFare > 0 ? parsedRideFare : BASE_FARE;
  const locallyRequestedFare = baseFare + (boostConfirmed ? boost : 0);
  const confirmedFareValue = Number(String(acceptance?.acceptedFare || "").replace(/[^0-9]/g, ""));
  const fare = Number.isFinite(confirmedFareValue) && confirmedFareValue > 0
    ? confirmedFareValue
    : locallyRequestedFare;
  const confirmedBoostValue = Number(String(acceptance?.boostAmount || "").replace(/[^0-9]/g, ""));
  const acceptedBoost = Number.isFinite(confirmedBoostValue) && confirmedBoostValue > 0
    ? confirmedBoostValue
    : Math.max(fare - baseFare, 0);
  const isAccepted = Boolean(acceptance);
  const isBoostedAcceptance = isAccepted && acceptedBoost > 0;
  const progressTranslateX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-96, 360],
  });
  const captainProgressWidth = captainProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["3%", "92%"],
  });

  useEffect(() => {
    if (!isAccepted) return;
    captainProgress.stopAnimation();
    Animated.timing(captainProgress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [captainProgress, isAccepted]);

  useEffect(() => {
    if (!demoMode || acceptance || typeof onFound !== "function") return undefined;

    const timer = setTimeout(() => {
      const acceptedRide = {
        captainName: "Ravi Kumar",
        captainPlate: "TS09 EJ 7788",
        captainVehicle: ride?.name || "Bike",
        rating: "4.8",
        eta: "2 mins",
        acceptedFare: locallyRequestedFare,
        boostAmount: boostConfirmed ? boost : 0,
        captainLocation: isValidCoordinate(pickupCoord)
          ? {
              latitude: pickupCoord.latitude + 0.0032,
              longitude: pickupCoord.longitude - 0.0024,
            }
          : undefined,
      };
      closeSheet(() => onFound(acceptedRide));
    }, 4800);

    return () => clearTimeout(timer);
  }, [acceptance, boost, boostConfirmed, closeSheet, demoMode, locallyRequestedFare, onFound, pickupCoord, ride?.name]);
  const searchMapRegion = useMemo(() => {
    const latitude = Number(pickupCoord?.latitude ?? mapRegion?.latitude);
    const longitude = Number(pickupCoord?.longitude ?? mapRegion?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return mapRegion;
    return { latitude, longitude, latitudeDelta: 0.0075, longitudeDelta: 0.0075 };
  }, [mapRegion, pickupCoord]);
  const mapMotionRegions = useMemo(() => {
    if (!searchMapRegion) {
      return { expanded: searchMapRegion, collapsed: searchMapRegion };
    }

    const pickupLatitude = Number(pickupCoord?.latitude ?? searchMapRegion.latitude);
    const pickupLongitude = Number(pickupCoord?.longitude ?? searchMapRegion.longitude);

    const resolveRegion = (progress) => {
      const sheetTop = height - EXPANDED_SHEET_HEIGHT + SHEET_DRAG_RANGE * progress;
      const viewportTop = 82;
      const viewportBottom = Math.max(viewportTop + 84, sheetTop - 24);
      const viewportHeight = Math.max(84, viewportBottom - viewportTop);
      const visiblePickupSpan = 0.0072 + (progress * 0.0016);
      const latitudeDelta = visiblePickupSpan * (height / viewportHeight);
      const longitudeDelta = Math.max(0.0075, visiblePickupSpan * 1.08);
      const viewportCenterY = viewportTop + viewportHeight / 2;

      return {
        latitude: pickupLatitude + ((viewportCenterY - height / 2) / height) * latitudeDelta,
        longitude: pickupLongitude,
        latitudeDelta,
        longitudeDelta,
      };
    };

    return {
      expanded: resolveRegion(0),
      collapsed: resolveRegion(1),
    };
  }, [pickupCoord, searchMapRegion]);
  mapMotionRegionsRef.current = mapMotionRegions;

  useEffect(() => {
    if (!mapReady || !mapMotionRegions) return undefined;
    const timer = setTimeout(() => applyMapMotion(currentSheetProgressRef.current, 280), 100);
    return () => clearTimeout(timer);
  }, [mapMotionRegions, mapReady]);

  useEffect(() => () => {
    if (mapMotionFrameRef.current != null) cancelAnimationFrame(mapMotionFrameRef.current);
  }, []);

  const nearbyCaptains = useMemo(() => {
    const latitude = Number(pickupCoord?.latitude ?? searchMapRegion?.latitude);
    const longitude = Number(pickupCoord?.longitude ?? searchMapRegion?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
    const offsets = [
      { lat: 0.0034, lng: -0.0043, bearing: 82 },
      { lat: -0.0042, lng: -0.0024, bearing: 18 },
      { lat: 0.0022, lng: 0.0048, bearing: 238 },
      { lat: -0.0048, lng: 0.0039, bearing: 314 },
    ];
    const rideIdentity = `${ride?.key || ""} ${ride?.name || ""} ${ride?.vehicleType || ""}`;
    const usesBikeCaptain = /bike|scooty|motorbike|motorcycle/i.test(rideIdentity);
    const captainMarkerImage = usesBikeCaptain
      ? NEARBY_CAPTAIN_BIKE_IMAGE
      : NEARBY_CAPTAIN_CAR_IMAGE;

    return offsets.map((offset, index) => ({
      id: `search-captain-${index + 1}`,
      coordinate: { latitude: latitude + offset.lat, longitude: longitude + offset.lng },
      bearing: offset.bearing,
      image: captainMarkerImage,
      rotateWithBearing: true,
      markerSize: usesBikeCaptain ? 58 : 72,
    }));
  }, [pickupCoord, ride?.key, ride?.name, ride?.vehicleType, searchMapRegion]);
  const pickupAddress = useMemo(
    () => getAddressParts(pickupText, "Current pickup location"),
    [pickupText],
  );
  const configuredCaptainCount = Number(ride?.nearbyCaptainCount);
  const nearbyCaptainLabel = Number.isFinite(configuredCaptainCount) && configuredCaptainCount > 0
    ? `${configuredCaptainCount} captains currently nearby`
    : demoMode
      ? `${nearbyCaptains.length} captains currently nearby`
      : "Searching nearby captains";

  const openTripDetails = () => {
    setTripDetailsVisible(true);
  };

  const closeTripDetails = (afterClose) => {
    setTripDetailsVisible(false);
    if (afterClose) closeSheet(afterClose);
  };

  const handleBoost = (value) => {
    setBoost((current) => (current === value ? 0 : value));
  };

  const handleConfirmBoost = () => {
    if (!boost) return;
    setBoostConfirmed(true);
    setBoostAvailable(false);
    setMessageIndex(0);
    sweep.setValue(0);
    settleSheet(SHEET_DRAG_RANGE);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" hidden={false} translucent={false} backgroundColor="#F9FAFC" />
      <View style={styles.mapArea}>
        <RideRouteMap
          ref={mapRef}
          showStatusBarScrim
          pickupCoord={pickupCoord}
          dropCoord={dropCoord}
          routeCoords={routeCoords}
          mapRegion={searchMapRegion}
          routeColor="#111111"
          routeWidth={2.5}
          enableStreetRouteFetch
          autoFitRoute={false}
          showUserLocation={false}
          showMyLocationButton={false}
          showCaptainMarker={false}
          startMarkerVariant="searchPickup"
          endMarkerVariant="searchDrop"
          attachMarkersToRouteEnds
          animateRoute
          routeAnimationDuration={720}
          nearbyVehicles={isAccepted ? nearbyCaptains.slice(0, 1) : nearbyCaptains}
          showPickupRadar={pickupLocated && !isAccepted}
          pickupRadarVariant="search"
          interactive
          showMapControls={false}
          onMapReady={() => setMapReady(true)}
          edgePadding={{ top: 86, right: 42, bottom: COLLAPSED_SHEET_HEIGHT + 66, left: 42 }}
        />
        <View pointerEvents="none" style={styles.mapSoftOverlay} />

      </View>

      <Animated.View
        style={[
          styles.sheet,
          {
            height: EXPANDED_SHEET_HEIGHT,
            transform: [{ translateY: sheetOffset }],
          },
        ]}
      >
        <View style={styles.handleTouch} {...sheetPanResponder.panHandlers}>
          <View style={styles.sheetHandle} />
        </View>
        <View style={styles.sheetContent}>
          <View style={styles.searchHeader}>
            <Text style={styles.searchTitle}>
              {isAccepted
                ? isBoostedAcceptance
                  ? "Captain accepted your boosted request"
                  : "Captain accepted your ride"
                : !pickupLocated
                ? "Locating your pickup"
                : boostAvailable
                ? "Captains are currently busy"
                : boostConfirmed
                  ? "Searching with boosted fare"
                  : SEARCH_TITLES[messageIndex]}
            </Text>
            <Text style={styles.searchSubtitle}>
              {isAccepted
                ? `${acceptance?.captainName || "Your captain"} will arrive in ${acceptance?.eta || "2 mins"}`
                : !pickupLocated
                ? "Confirming your pickup point"
                : boostAvailable
                ? "A fare boost may help you get accepted faster"
                : boostConfirmed
                  ? `Boosted request sent • ₹${fare}`
                  : SEARCH_MESSAGES[messageIndex]}
            </Text>
          </View>

          <View style={styles.progressSlot}>
            <View style={styles.progressTrack}>
              {isAccepted ? (
                <View style={styles.acceptedProgressFill} />
              ) : !pickupLocated ? (
                <Animated.View style={[styles.progressFill, { transform: [{ translateX: progressTranslateX }] }]} />
              ) : (
                <Animated.View style={[styles.searchProgressFill, { width: captainProgressWidth }]} />
              )}
            </View>
          </View>

          <Pressable style={({ pressed }) => [styles.searchSummary, pressed && styles.pressed]} onPress={openTripDetails}>
            <LinearGradient
              pointerEvents="none"
              colors={["#F3F8FF", "#FFFFFF"]}
              locations={[0, 0.72]}
              style={styles.summarySurfaceGradient}
            />
            <View style={styles.summaryTopRow}>
              <View>
                <Text style={styles.summaryRideName}>{ride?.name || "Bike"}</Text>
                <Text style={styles.summaryEta}>
                  Pickup in <Text style={styles.summaryEtaTime}>2 mins</Text>
                </Text>
                <Text style={styles.summaryAvailability}>{nearbyCaptainLabel}</Text>
                {isBoostedAcceptance ? (
                  <Text style={styles.acceptedFareMeta}>Original ₹{baseFare} • Boost +₹{acceptedBoost}</Text>
                ) : null}
              </View>
              <View style={styles.summaryRight}>
                <Text style={styles.summaryFare}>₹{fare}</Text>
                <View style={styles.summaryMoreButton}>
                  <MaterialIcons name="more-horiz" size={20} color="#475467" />
                </View>
              </View>
            </View>
          </Pressable>

          {!isAccepted && !boostAvailable ? (
            <View style={styles.pickupSummaryRow}>
              <View style={styles.pickupMarker}>
                <View style={styles.pickupMarkerCore} />
              </View>
              <View style={styles.pickupSummaryCopy}>
                <Text style={styles.pickupSummaryLabel}>PICKUP</Text>
                <Text style={styles.pickupSummaryAddress} numberOfLines={1}>
                  {pickupAddress.title}
                  {pickupAddress.detail && pickupAddress.detail !== pickupAddress.title
                    ? `, ${pickupAddress.detail}`
                    : ""}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change pickup location"
                hitSlop={8}
                onPress={onChangePickup || openTripDetails}
                style={({ pressed }) => [
                  styles.changePickupButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.changePickupText}>Change</Text>
              </Pressable>
            </View>
          ) : null}

          {isAccepted ? (
            <View style={styles.acceptedNotice}>
              <Text style={styles.acceptedNoticeText}>
                {isBoostedAcceptance ? "Boost applied" : "Fare confirmed"}
              </Text>
            </View>
          ) : boostAvailable ? (
            <Animated.View style={styles.boostPanel}>
              <LinearGradient
                pointerEvents="none"
                colors={["#F2F8FF", "rgba(242,248,255,0)"]}
                locations={[0, 1]}
                style={styles.boostTopGradient}
              />
              <Text style={styles.boostSectionLabel}>Fare boost</Text>
              <View style={styles.boostFareRow}>
                <Text style={styles.boostFareLabel}>Current fare</Text>
                <Text style={styles.boostFareValue}>₹{baseFare}</Text>
              </View>

              <View style={styles.boostRow}>
                {BOOSTS.map((value) => (
                  <BoostChip key={value} value={value} selected={boost === value} onPress={() => handleBoost(value)} />
                ))}
              </View>
              <Pressable
                disabled={!boost}
                style={({ pressed }) => [
                  styles.boostConfirmButton,
                  !boost && styles.boostConfirmButtonDisabled,
                  pressed && boost && styles.pressed,
                ]}
                onPress={handleConfirmBoost}
              >
                <Text style={[styles.boostConfirmText, !boost && styles.boostConfirmTextDisabled]}>
                  {boost ? `Send boosted request ₹${baseFare + boost}` : "Select a fare boost"}
                </Text>
              </Pressable>
              <Pressable style={styles.keepSearchingButton} onPress={() => {
                setBoostAvailable(false);
                settleSheet(SHEET_DRAG_RANGE);
              }}>
                <Text style={styles.keepSearchingText}>Continue searching at ₹{baseFare}</Text>
              </Pressable>
            </Animated.View>
          ) : null}

          {!isAccepted ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel captain search"
              style={({ pressed }) => [
                styles.cancelSearchButton,
                pressed && styles.cancelSearchButtonPressed,
              ]}
              onPress={() => closeSheet(onBack)}
            >
              <Text style={styles.cancelSearchText}>Cancel request</Text>
            </Pressable>
          ) : null}

        </View>
      </Animated.View>

      <SharedTripDetailsBottomSheet
        visible={tripDetailsVisible}
        fare={fare}
        vehicle={ride?.name || "Bike"}
        pickupText={pickupText}
        dropText={dropText}
        paymentLabel="Cash"
        statusLabel="Searching for captain"
        onClose={() => closeTripDetails()}
        onCancel={() => closeTripDetails(onBack)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backIcon: {
    position: "absolute",
    top: 50,
    left: 24,
    zIndex: 4,
  },
  bottomStrip: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    backgroundColor: "#FFFFFF",
    zIndex: 10,
  },
  boostChip: {
    flex: 1,
    minWidth: 0,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  boostChipActive: {
    backgroundColor: "#1754E8",
  },
  boostChipText: {
    color: "#344054",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  boostChipTextActive: {
    color: "#FFFFFF",
  },
  boostHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  boostHeaderCopy: {
    flex: 1,
  },
  boostIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  boostPanel: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E7ECF2",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingTop: 13,
    paddingBottom: 6,
    overflow: "hidden",
  },
  boostTopGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 74,
  },
  boostRow: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 10,
    paddingRight: 4,
  },
  boostSubtitle: {
    marginTop: 4,
    color: "#667085",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  boostTitle: {
    color: "#111827",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    letterSpacing: -0.25,
  },
  boostSectionLabel: {
    color: "#101828",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700",
  },
  boostFareRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  boostFareLabel: {
    color: "#667085",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "500",
  },
  boostFareValue: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700",
  },
  boostConfirmButton: {
    height: 46,
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: "#1769E8",
    alignItems: "center",
    justifyContent: "center",
  },
  boostConfirmButtonDisabled: {
    backgroundColor: "#E8EDF4",
  },
  boostConfirmText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  boostConfirmTextDisabled: {
    color: "#98A2B3",
  },
  keepSearchingButton: {
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  keepSearchingText: {
    color: "#344054",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
  },
  cancelSearchButton: {
    width: "100%",
    height: 46,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 14,
    backgroundColor: "#FCFCFD",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelSearchButtonPressed: {
    backgroundColor: "#FFF5F4",
    borderColor: "#F5C7C2",
    transform: [{ scale: 0.988 }],
  },
  cancelSearchText: {
    color: "#B42318",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  checkbox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#C8D0DA",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxSelected: {
    borderColor: "#1754E8",
    backgroundColor: "#1754E8",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentLoadFill: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#1754E8",
  },
  contentLoadTrack: {
    width: "100%",
    height: 3,
    borderRadius: 999,
    backgroundColor: "#E5EAF2",
    overflow: "hidden",
  },
  dashedDivider: {
    marginHorizontal: 0,
    marginVertical: 9,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#C8CED8",
  },
  discountBadge: {
    position: "absolute",
    top: 2,
    left: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#079455",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  fareCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
  },
  fareCopy: {
    flex: 1,
    marginLeft: 10,
  },
  fareLabel: {
    color: "#667085",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  fareValue: {
    marginTop: 3,
    color: "#111827",
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900",
  },
  fareVehicleImage: {
    width: 50,
    height: 50,
  },
  fareVisualWrap: {
    width: 64,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  matchCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E0E6EE",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    overflow: "hidden",
    ...SHADOWS.card,
  },
  matchDivider: {
    height: 1,
    marginVertical: 12,
    backgroundColor: "#E8EDF5",
  },
  forwardIcon: {
    position: "absolute",
    top: 51,
    right: 24,
    zIndex: 4,
  },

  mapArea: {
    flex: 1,
    backgroundColor: "#EEF3F8",
  },
  mapSoftOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  progressFill: {
    width: 86,
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#1754E8",
  },
  searchProgressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#1754E8",
  },
  acceptedProgressFill: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#1769E8",
  },
  acceptedFareMeta: {
    marginTop: 3,
    color: "#1769E8",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },
  acceptedNotice: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 11,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  acceptedNoticeText: {
    color: "#1769E8",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
  },
  progressSlot: {
    height: 18,
    marginHorizontal: -18,
    justifyContent: "center",
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "#E8ECF2",
    overflow: "hidden",
  },
  searchHeader: {
    paddingTop: 8,
    paddingBottom: 9,
  },
  searchTitle: {
    color: "#101828",
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "700",
    letterSpacing: -0.35,
  },
  searchSubtitle: {
    marginTop: 4,
    color: "#667085",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  searchSummary: {
    marginTop: 10,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7ECF2",
    paddingHorizontal: 12,
    paddingVertical: 12,
    overflow: "hidden",
  },
  summarySurfaceGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  summaryRideName: {
    color: "#101828",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
  },
  summaryEta: {
    marginTop: 3,
    color: "#475467",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
  },
  summaryEtaTime: {
    color: "#1769E8",
    fontWeight: "700",
  },
  summaryAvailability: {
    marginTop: 3,
    color: "#667085",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  summaryFare: {
    color: "#101828",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "700",
  },
  summaryRight: {
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
    backgroundColor: "#DDE3EC",
  },
  summaryRow: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabelGroup: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  summaryLabel: {
    color: "#667085",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
  },
  summaryValue: {
    marginTop: 1,
    color: "#344054",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  summaryPayment: {
    color: "#344054",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
  },
  summaryDetailsText: {
    color: "#344054",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
  },
  summaryMoreButton: {
    width: 34,
    height: 30,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#DCE3EC",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  pickupSummaryRow: {
    minHeight: 48,
    marginTop: 10,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  pickupMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  pickupMarkerCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1769E8",
  },
  pickupSummaryCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
    paddingRight: 10,
  },
  pickupSummaryLabel: {
    color: "#667085",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    letterSpacing: 0.55,
  },
  pickupSummaryAddress: {
    marginTop: 2,
    color: "#344054",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
  },
  changePickupButton: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  changePickupText: {
    color: "#344054",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  serviceImage: {
    width: 56,
    height: 46,
  },
  serviceImageWrap: {
    width: 72,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  serviceName: {
    flex: 1,
    color: "#111827",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
  },
  servicePrice: {
    color: "#485467",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    marginRight: 16,
  },
  serviceRow: {
    minHeight: 92,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#DFE6EF",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  serviceRowSelected: {
    borderColor: "#1754E8",
    backgroundColor: "#F4FAF5",
  },
  servicesPanel: {
    marginTop: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E0E6EF",
    backgroundColor: "#F6FAFF",
    padding: 16,
  },
  servicesStack: {
    marginTop: 16,
    gap: 14,
  },
  servicesTitle: {
    color: "#111827",
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: -0.25,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0,
    shadowRadius: 8,
    elevation: 0,
  },
  handleTouch: {
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetHandle: {
    width: 46,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#DFE5EC",
  },
  sheetContent: {
    paddingHorizontal: 18,
    paddingBottom: 22,
  },
  tripBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#111827",
  },
  tripCancelButton: {
    height: 58,
    borderRadius: 999,
    borderWidth: 1.4,
    borderColor: "#8A1F1F",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  tripCancelText: {
    color: "#8A1F1F",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
  },
  tripCashIcon: {
    width: 30,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  tripChangeButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  tripChangeText: {
    color: "#165BAA",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  tripDetailsButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E1E6ED",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F4F7",
  },
  tripDetailsSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    height: height * 0.76,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    ...SHADOWS.sheet,
  },
  tripFareAmount: {
    color: "#111827",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  tripFareCard: {
    minHeight: 62,
    paddingHorizontal: 2,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  tripIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  tripLocationCard: {
    marginTop: 2,
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  tripLocationCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  tripLocationDashedLine: {
    width: 1,
    flex: 1,
    marginTop: 8,
    borderLeftWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D5DAE2",
  },
  tripLocationDetail: {
    marginTop: 2,
    color: "#596273",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  tripLocationDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  tripLocationRail: {
    width: 30,
    alignItems: "center",
    alignSelf: "stretch",
  },
  tripLocationRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 6,
  },
  tripLocationTitle: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "800",
  },
  tripOverlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  tripPaymentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tripPaymentCard: {
    minHeight: 62,
    paddingHorizontal: 2,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  tripPaymentCopy: {
    flex: 1,
  },
  tripPaymentLabel: {
    color: "#8A93A2",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  tripPaymentText: {
    marginTop: 2,
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  tripPickupDot: {
    backgroundColor: "#18A661",
  },
  tripDropDot: {
    backgroundColor: "#E0473B",
  },
  tripSectionTitle: {
    marginTop: 14,
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  tripSheetContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 22,
  },
  tripHeader: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
  },
  tripHeaderClose: {
    position: "absolute",
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  tripHeaderTitle: {
    flex: 1,
    textAlign: "center",
    color: "#111827",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
  },
  tripInfoCopy: {
    flex: 1,
  },
  tripInfoIcon: {
    width: 30,
    height: 36,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tripInfoLabel: {
    color: "#8A93A2",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  tripStatusRow: {
    minHeight: 62,
    paddingHorizontal: 2,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  tripStatusText: {
    marginTop: 2,
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
});
