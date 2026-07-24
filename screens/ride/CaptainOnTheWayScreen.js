import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RideRouteMap from "../../components/RideRouteMap";
import {
  bearingDegrees,
  buildRouteFallback,
  fetchStreetRoute,
  haversineMeters,
  isValidCoordinate,
} from "../../routeUtils";
import {
  RIDE_SHEET_COLLAPSED_HEIGHT as COLLAPSED_SHEET_HEIGHT,
  RIDE_SHEET_DRAG_RANGE as SHEET_DRAG_RANGE,
  RIDE_SHEET_EXPANDED_HEIGHT as EXPANDED_SHEET_HEIGHT,
} from "./rideSheetLayout";
import useRideSheetMotion from "./useRideSheetMotion";

const DEFAULT_PIN = ["2", "1", "4", "5"];
const CAPTAIN_CAR_IMAGE = require("../../assets/vehicles/frezo-captain-car-topdown-v6.png");
const CAPTAIN_BIKE_IMAGE = require("../../assets/vehicles/frezo-captain-scooter-marker-v6.png");

function initialsFor(name) {
  return String(name || "Captain")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C";
}

function ActionButton({ icon, label, onPress, round = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        round && styles.actionButtonRound,
        pressed && styles.pressed,
      ]}
    >
      <MaterialIcons name={icon} size={20} color="#26364D" />
      {!round ? <Text style={styles.actionLabel}>{label}</Text> : null}
    </Pressable>
  );
}

export default function CaptainOnTheWayScreen({
  ride,
  acceptance,
  rideStatus = "ARRIVING",
  onBack = () => {},
  onForward = () => {},
  onCall = () => {},
  onMessage = () => {},
  onSafety = () => {},
  onTripDetails = () => {},
  pickupAddress = "Road No. 1, Krishna Nagar, V V Nagar",
  pickupCoord,
  routeCoords,
  mapRegion,
  captainCoord,
  captainDistanceText = "420 m away",
  pickupTimeText = "Pickup in 3 mins",
  pinCode = DEFAULT_PIN,
  captainName = "Narsing Rao",
  captainPlate = "TS11 EG 3375",
  captainVehicle = "Hero Splendor",
  captainAvatar,
  rating = "4.8",
}) {
  const insets = useSafeAreaInsets();
  const { sheetOffset, closeSheet } = useRideSheetMotion({
    openOffset: SHEET_DRAG_RANGE,
    closedOffset: EXPANDED_SHEET_HEIGHT + 36,
  });
  const dragStartOffset = useRef(SHEET_DRAG_RANGE);
  const sheetFrameRef = useRef(null);
  const pendingSheetOffsetRef = useRef(SHEET_DRAG_RANGE);
  const [streetApproachRoute, setStreetApproachRoute] = useState([]);

  const eta = String(acceptance?.eta || pickupTimeText || "3 mins")
    .replace(/^Pickup in\s*/i, "")
    .replace(/\b(minutes?|mins?)\b/i, "min")
    .trim();
  const name = String(acceptance?.captainName || ride?.captainName || captainName);
  const plate = String(acceptance?.captainPlate || ride?.captainPlate || captainPlate);
  const vehicle = String(acceptance?.captainVehicle || ride?.captainVehicle || captainVehicle);
  const resolvedRating = String(acceptance?.rating || ride?.rating || rating);
  const rideVehicleIdentity = `${acceptance?.vehicleType || ""} ${ride?.key || ""} ${ride?.name || ""} ${vehicle}`;
  const usesBikeCaptain = /bike|scooty|motorbike|motorcycle/i.test(rideVehicleIdentity);
  const captainVehicleImage = usesBikeCaptain
    ? CAPTAIN_BIKE_IMAGE
    : CAPTAIN_CAR_IMAGE;
  const distanceSource = String(
    acceptance?.distanceText ||
    acceptance?.distance ||
    ride?.distanceText ||
    captainDistanceText ||
    ""
  ).trim().toLowerCase();
  const distanceNumber = Number.parseFloat(distanceSource.replace(/[^0-9.]/g, ""));
  const distanceMeters = Number.isFinite(distanceNumber)
    ? distanceSource.includes("km") ? distanceNumber * 1000 : distanceNumber
    : null;
  const isOneMinuteAway = /^1(?:\s*min|$)/i.test(eta);
  const nearbyDistance = distanceMeters != null && distanceMeters > 0 && distanceMeters < 1000
    ? `${Math.round(distanceMeters)} m`
    : "";
  const arrivalMetric = isOneMinuteAway && nearbyDistance ? nearbyDistance : eta;
  const [displayedArrivalMetric, setDisplayedArrivalMetric] = useState(arrivalMetric);
  const arrivalMetricMotion = useRef(new Animated.Value(1)).current;
  const arrivalStateMotion = useRef(new Animated.Value(1)).current;
  const proximityArrivalTimerRef = useRef(null);
  const [proximityArrived, setProximityArrived] = useState(false);
  const serverArrived = /ARRIVED|REACHED_PICKUP|AT_PICKUP/i.test(String(rideStatus || ""));
  const distanceToPickup = haversineMeters(captainCoord, pickupCoord);
  const hasCaptainArrived = serverArrived || proximityArrived;

  useEffect(() => {
    if (serverArrived) {
      if (proximityArrivalTimerRef.current) {
        clearTimeout(proximityArrivalTimerRef.current);
        proximityArrivalTimerRef.current = null;
      }
      setProximityArrived(true);
      return undefined;
    }

    if (!Number.isFinite(distanceToPickup) || distanceToPickup > 55) {
      if (proximityArrivalTimerRef.current) {
        clearTimeout(proximityArrivalTimerRef.current);
        proximityArrivalTimerRef.current = null;
      }
      setProximityArrived(false);
      return undefined;
    }

    if (distanceToPickup <= 35 && !proximityArrivalTimerRef.current) {
      proximityArrivalTimerRef.current = setTimeout(() => {
        proximityArrivalTimerRef.current = null;
        setProximityArrived(true);
      }, 3200);
    }

    return undefined;
  }, [distanceToPickup, serverArrived]);

  useEffect(() => () => {
    if (proximityArrivalTimerRef.current) clearTimeout(proximityArrivalTimerRef.current);
  }, []);

  useEffect(() => {
    if (!hasCaptainArrived) return undefined;
    arrivalStateMotion.setValue(0);
    Animated.timing(arrivalStateMotion, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    return () => arrivalStateMotion.stopAnimation();
  }, [hasCaptainArrived]);

  useEffect(() => {
    if (arrivalMetric === displayedArrivalMetric) return undefined;

    arrivalMetricMotion.stopAnimation();
    Animated.timing(arrivalMetricMotion, {
      toValue: 0,
      duration: 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      setDisplayedArrivalMetric(arrivalMetric);
      arrivalMetricMotion.setValue(0);
      Animated.timing(arrivalMetricMotion, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    return () => arrivalMetricMotion.stopAnimation();
  }, [arrivalMetric]);

  useEffect(() => {
    if (!isValidCoordinate(captainCoord) || !isValidCoordinate(pickupCoord)) {
      setStreetApproachRoute([]);
      return undefined;
    }

    let cancelled = false;
    fetchStreetRoute(captainCoord, pickupCoord)
      .then((route) => {
        if (cancelled) return;
        const points = Array.isArray(route?.routeCoords)
          ? route.routeCoords.filter(isValidCoordinate)
          : [];
        setStreetApproachRoute(points.length >= 2 ? points : []);
      })
      .catch(() => {
        if (!cancelled) setStreetApproachRoute([]);
      });

    return () => {
      cancelled = true;
    };
  }, [captainCoord, pickupCoord]);

  const approachRoute = useMemo(() => {
    if (streetApproachRoute.length >= 2) return streetApproachRoute;
    if (isValidCoordinate(captainCoord) && isValidCoordinate(pickupCoord)) {
      return buildRouteFallback(captainCoord, pickupCoord);
    }
    return Array.isArray(routeCoords) ? routeCoords.filter(isValidCoordinate) : [];
  }, [captainCoord, pickupCoord, routeCoords, streetApproachRoute]);

  const captainBearing = useMemo(() => {
    if (Number.isFinite(captainCoord?.heading)) return captainCoord.heading;
    return bearingDegrees(captainCoord, pickupCoord);
  }, [captainCoord, pickupCoord]);

  const captainVehicles = useMemo(() => (
    isValidCoordinate(captainCoord)
      ? [{
          id: "assigned-captain",
          coordinate: captainCoord,
          bearing: captainBearing,
          image: captainVehicleImage,
          rotateWithBearing: true,
          markerSize: usesBikeCaptain ? 58 : 72,
        }]
      : []
  ), [captainBearing, captainCoord, captainVehicleImage, usesBikeCaptain]);

  const applyScheduledSheetOffset = (nextOffset) => {
    pendingSheetOffsetRef.current = nextOffset;
    if (sheetFrameRef.current != null) return;
    sheetFrameRef.current = requestAnimationFrame(() => {
      sheetFrameRef.current = null;
      sheetOffset.setValue(pendingSheetOffsetRef.current);
    });
  };

  const settleSheet = (toValue) => {
    if (sheetFrameRef.current != null) {
      cancelAnimationFrame(sheetFrameRef.current);
      sheetFrameRef.current = null;
    }
    sheetOffset.setValue(pendingSheetOffsetRef.current);
    Animated.timing(sheetOffset, {
      toValue,
      duration: 280,
      easing: Easing.bezier(0.2, 0.72, 0.2, 1),
      useNativeDriver: true,
      isInteraction: false,
    }).start(() => {
      pendingSheetOffsetRef.current = toValue;
    });
  };

  const sheetPanResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => (
      Math.abs(gesture.dy) > 7 && Math.abs(gesture.dy) > Math.abs(gesture.dx)
    ),
    onPanResponderGrant: () => {
      if (sheetFrameRef.current != null) {
        cancelAnimationFrame(sheetFrameRef.current);
        sheetFrameRef.current = null;
      }
      sheetOffset.stopAnimation((value) => {
        dragStartOffset.current = value;
        pendingSheetOffsetRef.current = value;
      });
    },
    onPanResponderMove: (_, gesture) => {
      applyScheduledSheetOffset(Math.max(0, Math.min(SHEET_DRAG_RANGE, dragStartOffset.current + gesture.dy)));
    },
    onPanResponderRelease: (_, gesture) => {
      const projected = dragStartOffset.current + gesture.dy + gesture.vy * 72;
      settleSheet(projected < SHEET_DRAG_RANGE * 0.5 ? 0 : SHEET_DRAG_RANGE);
    },
    onPanResponderTerminate: () => settleSheet(SHEET_DRAG_RANGE),
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
  })).current;

  useEffect(() => () => {
    if (sheetFrameRef.current != null) cancelAnimationFrame(sheetFrameRef.current);
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" hidden={false} translucent={false} backgroundColor="#F9FAFC" />

      <RideRouteMap
        showStatusBarScrim
        pickupCoord={captainCoord || pickupCoord}
        dropCoord={pickupCoord}
        routeCoords={approachRoute}
        mapRegion={mapRegion}
        routeColor="#1769E8"
        routeWidth={3}
        routeOpacity={hasCaptainArrived ? 0 : 1}
        showPickupMarker={false}
        showDropMarker
        endMarkerVariant="searchPickup"
        showDropRadar={!hasCaptainArrived}
        dropRadarVariant="search"
        showCaptainMarker={false}
        showUserLocation={false}
        showMyLocationButton={false}
        attachMarkersToRouteEnds
        animateRoute={!hasCaptainArrived}
        routeAnimationDuration={820}
        nearbyVehicles={captainVehicles}
        interactive
        showMapControls={false}
        fitZoomOutLevel={1.35}
        edgePadding={{ top: insets.top + 112, right: 72, bottom: COLLAPSED_SHEET_HEIGHT + 72, left: 72 }}
      />

      <View style={[styles.mapActions, { top: insets.top + 12 }]}>
        <Pressable style={({ pressed }) => [styles.mapButton, pressed && styles.pressed]} onPress={() => closeSheet(onBack)}>
          <MaterialIcons name="arrow-back" size={25} color="#111827" />
        </Pressable>
      </View>

      <Animated.View
        renderToHardwareTextureAndroid
        shouldRasterizeIOS
        style={[
          styles.sheet,
          { height: EXPANDED_SHEET_HEIGHT, transform: [{ translateY: sheetOffset }] },
        ]}
      >
        <View style={styles.handleTouch} {...sheetPanResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        <View style={styles.sheetContent}>
          <View style={styles.statusSurface}>
            {hasCaptainArrived ? (
              <Animated.View
                style={[
                  styles.statusCopy,
                  {
                    opacity: arrivalStateMotion,
                    transform: [{
                      translateY: arrivalStateMotion.interpolate({
                        inputRange: [0, 1],
                        outputRange: [7, 0],
                      }),
                    }],
                  },
                ]}
              >
                <View style={styles.arrivedTitleRow}>
                  <Text style={styles.statusTitle}>Captain has arrived</Text>
                  <View style={styles.atPickupPill}>
                    <Text style={styles.atPickupText}>At pickup</Text>
                  </View>
                </View>
                <Text style={styles.arrivedSubtitle}>Meet your captain at the pickup point</Text>
              </Animated.View>
            ) : (
              <View style={styles.statusCopy}>
                <View style={styles.arrivalRow}>
                  <Text style={styles.statusTitle}>Captain arriving in </Text>
                  <Animated.Text
                    style={[
                      styles.statusTitle,
                      styles.statusEta,
                      {
                        opacity: arrivalMetricMotion,
                        transform: [{
                          translateY: arrivalMetricMotion.interpolate({
                            inputRange: [0, 1],
                            outputRange: [7, 0],
                          }),
                        }],
                      },
                    ]}
                  >
                    {displayedArrivalMetric}
                  </Animated.Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.infoSection}>
            <View style={styles.otpCopy}>
              <Text style={styles.pinTitle}>Ride start PIN</Text>
            </View>
            <View style={styles.otpRow}>
              {pinCode.map((digit, index) => (
                <View key={`${digit}-${index}`} style={styles.otpCell}>
                  <Text style={styles.otpDigit}>{digit}</Text>
                </View>
              ))}
            </View>
            {__DEV__ ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Verify PIN and start ride for testing"
                onPress={() => closeSheet(onForward)}
                style={({ pressed }) => [styles.testStartButton, pressed && styles.pressed]}
              >
                <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.sectionDivider} />
          <View style={styles.captainCard}>
            <View style={styles.captainRow}>
              <View style={styles.avatarWrap}>
                {captainAvatar ? (
                  <Image source={captainAvatar} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.avatarInitials}>{initialsFor(name)}</Text>
                )}
              </View>
              <View style={styles.captainCopy}>
                <View style={styles.nameRow}>
                  <Text style={styles.captainName} numberOfLines={1}>{name}</Text>
                  <View style={styles.ratingPill}>
                    <Text style={styles.ratingText}>★ {resolvedRating}</Text>
                  </View>
                </View>
                <Text style={styles.vehicleText} numberOfLines={1}>{vehicle}  ·  {plate}</Text>
              </View>
            </View>
            <View style={styles.actionRow}>
              <ActionButton icon="call" label="Call" onPress={onCall} round />
              <ActionButton icon="chat-bubble-outline" label="Message" onPress={onMessage} />
            </View>
          </View>
          <View style={styles.sectionDivider} />

          <View style={styles.pickupRow}>
            <View style={styles.pickupCopy}>
              <Text style={styles.infoLabel}>PICKUP</Text>
              <Text style={styles.pickupAddress} numberOfLines={1}>{pickupAddress}</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.detailsButton, pressed && styles.pressed]} onPress={onTripDetails}>
              <MaterialIcons name="more-horiz" size={22} color="#344054" />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#EAF2FA" },
  mapActions: {
    position: "absolute",
    left: 18,
    right: 18,
    zIndex: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mapButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0,
    shadowRadius: 8,
    elevation: 0,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0,
    shadowRadius: 12,
    elevation: 0,
  },
  handleTouch: { height: 27, alignItems: "center", justifyContent: "center" },
  handle: { width: 40, height: 4, borderRadius: 99, backgroundColor: "#DDE3EA" },
  sheetContent: { paddingHorizontal: 18, paddingBottom: 20 },
  statusSurface: {
    minHeight: 58,
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  statusCopy: { flex: 1, justifyContent: "center" },
  arrivalRow: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" },
  statusTitle: { color: "#101828", fontSize: 20, lineHeight: 25, fontWeight: "700", letterSpacing: -0.4 },
  statusEta: { color: "#1769E8" },
  arrivedTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  arrivedSubtitle: { marginTop: 3, color: "#667085", fontSize: 13, lineHeight: 18, fontWeight: "500" },
  atPickupPill: { height: 27, paddingHorizontal: 10, borderRadius: 14, backgroundColor: "#E8F7EE", alignItems: "center", justifyContent: "center" },
  atPickupText: { color: "#138A45", fontSize: 12, lineHeight: 16, fontWeight: "700" },
  sectionDivider: { height: 0, marginTop: 14, borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#D8DEE8" },
  captainCard: { marginTop: 12, borderRadius: 16, backgroundColor: "#F6F8FB", padding: 12 },
  captainRow: { minHeight: 56, flexDirection: "row", alignItems: "center" },
  avatarWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#DCE8F6", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%" },
  avatarInitials: { color: "#24344C", fontSize: 19, lineHeight: 24, fontWeight: "700" },
  captainCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  captainName: { maxWidth: "70%", color: "#101828", fontSize: 17, lineHeight: 22, fontWeight: "700" },
  ratingPill: { height: 22, paddingHorizontal: 7, borderRadius: 99, backgroundColor: "#FFF8E8", alignItems: "center", justifyContent: "center" },
  ratingText: { color: "#5B4A20", fontSize: 12, lineHeight: 15, fontWeight: "700" },
  vehicleText: { marginTop: 4, color: "#344054", fontSize: 13, lineHeight: 18, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  actionButton: { flex: 1, height: 38, borderRadius: 18, backgroundColor: "#F6F8FB", borderWidth: 1, borderColor: "#E2E8F0", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  actionButtonRound: { flex: 0, width: 38, borderRadius: 19 },
  actionLabel: { color: "#344054", fontSize: 13, lineHeight: 17, fontWeight: "600" },
  infoSection: { minHeight: 48, marginTop: 12, borderRadius: 13, backgroundColor: "#EFF5FF", borderWidth: 1, borderColor: "#DCE8F8", paddingHorizontal: 12, flexDirection: "row", alignItems: "center" },
  otpCopy: { flex: 1, paddingRight: 10 },
  pinTitle: { color: "#344054", fontSize: 14, lineHeight: 18, fontWeight: "700" },
  infoLabel: { color: "#667085", fontSize: 10.5, lineHeight: 14, fontWeight: "700", letterSpacing: 0.55 },
  otpRow: { flexDirection: "row", gap: 5 },
  otpCell: { width: 28, height: 34, borderRadius: 4, backgroundColor: "#1769E8", alignItems: "center", justifyContent: "center" },
  otpDigit: { color: "#FFFFFF", fontSize: 15, lineHeight: 19, fontWeight: "700" },
  testStartButton: { width: 34, height: 34, marginLeft: 7, borderRadius: 17, backgroundColor: "#101828", alignItems: "center", justifyContent: "center" },
  pickupRow: { minHeight: 56, marginTop: 12, paddingHorizontal: 2, flexDirection: "row", alignItems: "center" },
  pickupCopy: { flex: 1, minWidth: 0, paddingRight: 10 },
  pickupAddress: { marginTop: 3, color: "#344054", fontSize: 13.5, lineHeight: 18, fontWeight: "600" },
  detailsButton: { width: 42, height: 38, borderRadius: 12, backgroundColor: "#EEF3F8", alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
});
