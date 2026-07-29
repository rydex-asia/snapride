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
  formatDistanceText,
  haversineMeters,
  isValidCoordinate,
} from "../../routeUtils";
import {
  RIDE_SHEET_COLLAPSED_HEIGHT as COLLAPSED_SHEET_HEIGHT,
  RIDE_SHEET_DRAG_RANGE as SHEET_DRAG_RANGE,
  RIDE_SHEET_EXPANDED_HEIGHT as EXPANDED_SHEET_HEIGHT,
} from "./rideSheetLayout";
import useRideSheetMotion from "./useRideSheetMotion";

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

export default function TripInProgressScreen({
  onBack = () => {},
  onForward = () => {},
  onCall = () => {},
  onMessage = () => {},
  onTripDetails = () => {},
  onSafety = () => {},
  pickupCoord,
  dropCoord,
  routeCoords,
  mapRegion,
  captainCoord,
  captainHeading = 0,
  destinationDistanceText = "",
  dropTimeText = "",
  distanceText = "",
  durationText = "",
  pickupAddress = "Pickup",
  dropAddress = "Selected destination",
  rideStatus = "ON_TRIP",
  ride,
  captainName = "Narsing Rao",
  captainPlate = "TS11 EG 3375",
  captainVehicle = "Hero Splendor",
  captainAvatar,
  rating = "4.8",
}) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const { sheetOffset, closeSheet } = useRideSheetMotion({
    openOffset: SHEET_DRAG_RANGE,
    closedOffset: EXPANDED_SHEET_HEIGHT + 36,
  });
  const dragStartOffset = useRef(SHEET_DRAG_RANGE);
  const pendingSheetOffsetRef = useRef(SHEET_DRAG_RANGE);
  const sheetFrameRef = useRef(null);
  const [streetActiveRoute, setStreetActiveRoute] = useState([]);

  const routeTargetCoord = useMemo(() => {
    const statusValue = String(rideStatus || "").toUpperCase();
    return statusValue.includes("ARRIVING") && isValidCoordinate(pickupCoord)
      ? pickupCoord
      : dropCoord;
  }, [dropCoord, pickupCoord, rideStatus]);

  const remainingMeters = haversineMeters(captainCoord, routeTargetCoord);
  const resolvedDistance = destinationDistanceText || distanceText || (
    Number.isFinite(remainingMeters) ? formatDistanceText(remainingMeters) : ""
  );
  const resolvedEta = String(dropTimeText || durationText || "5 min")
    .replace(/^drop\s+in\s*/i, "")
    .replace(/\b(minutes?|mins?)\b/i, "min")
    .trim();

  const resolvedCaptainName = String(ride?.captainName || ride?.driverName || captainName);
  const resolvedCaptainPlate = String(ride?.captainPlate || captainPlate);
  const resolvedCaptainVehicle = String(ride?.captainVehicle || ride?.driverVehicle || captainVehicle);
  const resolvedRating = String(ride?.rating || rating);
  const rideVehicleIdentity = `${ride?.key || ""} ${ride?.name || ""} ${resolvedCaptainVehicle}`;
  const usesBikeCaptain = /bike|scooty|motorbike|motorcycle|splendor/i.test(rideVehicleIdentity);
  const captainVehicleImage = usesBikeCaptain ? CAPTAIN_BIKE_IMAGE : CAPTAIN_CAR_IMAGE;

  useEffect(() => {
    const startCoord = isValidCoordinate(captainCoord)
      ? captainCoord
      : isValidCoordinate(pickupCoord)
        ? pickupCoord
        : null;

    if (!startCoord || !isValidCoordinate(routeTargetCoord)) {
      setStreetActiveRoute([]);
      return undefined;
    }

    let cancelled = false;
    fetchStreetRoute(startCoord, routeTargetCoord)
      .then((route) => {
        if (cancelled) return;
        const points = Array.isArray(route?.routeCoords)
          ? route.routeCoords.filter(isValidCoordinate)
          : [];
        setStreetActiveRoute(points.length >= 2 ? points : []);
      })
      .catch(() => {
        if (!cancelled) setStreetActiveRoute([]);
      });

    return () => {
      cancelled = true;
    };
  }, [captainCoord, pickupCoord, routeTargetCoord]);

  const activeRouteCoords = useMemo(() => {
    const streetRoute = Array.isArray(streetActiveRoute)
      ? streetActiveRoute.filter(isValidCoordinate)
      : [];
    const cleanRoute = Array.isArray(routeCoords) ? routeCoords.filter(isValidCoordinate) : [];

    if (streetRoute.length >= 2) return streetRoute;

    if (isValidCoordinate(captainCoord) && cleanRoute.length >= 2) {
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      cleanRoute.forEach((point, index) => {
        const distance = haversineMeters(captainCoord, point);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      return [captainCoord, ...cleanRoute.slice(Math.min(nearestIndex + 1, cleanRoute.length - 1))];
    }

    if (cleanRoute.length >= 2) return cleanRoute;
    if (isValidCoordinate(captainCoord) && isValidCoordinate(routeTargetCoord)) {
      return buildRouteFallback(captainCoord, routeTargetCoord);
    }
    return cleanRoute;
  }, [captainCoord, routeCoords, routeTargetCoord, streetActiveRoute]);

  const vehicleBearing = useMemo(() => {
    if (Number.isFinite(captainHeading) && captainHeading !== 0) return captainHeading;
    const nextPoint = activeRouteCoords.find((point) => (
      isValidCoordinate(point) && haversineMeters(captainCoord, point) > 8
    ));
    return bearingDegrees(captainCoord, nextPoint || routeTargetCoord);
  }, [activeRouteCoords, captainCoord, captainHeading, routeTargetCoord]);

  const captainVehicles = useMemo(() => (
    isValidCoordinate(captainCoord)
      ? [{
          id: "live-captain",
          coordinate: captainCoord,
          bearing: vehicleBearing,
          image: captainVehicleImage,
          rotateWithBearing: true,
        }]
      : []
  ), [captainCoord, captainVehicleImage, vehicleBearing]);

  const fitMapForSheet = (expanded) => {
    mapRef.current?.fitToRoute?.(true, {
      top: insets.top + 92,
      right: 52,
      bottom: (expanded ? EXPANDED_SHEET_HEIGHT : COLLAPSED_SHEET_HEIGHT) + 42,
      left: 52,
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
      duration: 290,
      easing: Easing.bezier(0.2, 0.72, 0.2, 1),
      useNativeDriver: true,
      isInteraction: false,
    }).start(() => {
      pendingSheetOffsetRef.current = toValue;
      fitMapForSheet(toValue === 0);
    });
  };

  const sheetPanResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => (
      Math.abs(gesture.dy) > 7 && Math.abs(gesture.dy) > Math.abs(gesture.dx)
    ),
    onPanResponderGrant: () => {
      sheetOffset.stopAnimation((value) => {
        dragStartOffset.current = value;
        pendingSheetOffsetRef.current = value;
      });
    },
    onPanResponderMove: (_, gesture) => {
      const next = Math.max(0, Math.min(SHEET_DRAG_RANGE, dragStartOffset.current + gesture.dy));
      pendingSheetOffsetRef.current = next;
      if (sheetFrameRef.current != null) return;
      sheetFrameRef.current = requestAnimationFrame(() => {
        sheetFrameRef.current = null;
        sheetOffset.setValue(pendingSheetOffsetRef.current);
      });
    },
    onPanResponderRelease: (_, gesture) => {
      const projected = dragStartOffset.current + gesture.dy + gesture.vy * 68;
      settleSheet(projected < SHEET_DRAG_RANGE * 0.5 ? 0 : SHEET_DRAG_RANGE);
    },
    onPanResponderTerminate: () => settleSheet(SHEET_DRAG_RANGE),
  })).current;

  useEffect(() => () => {
    if (sheetFrameRef.current != null) cancelAnimationFrame(sheetFrameRef.current);
  }, []);

  const extraDetailsOpacity = sheetOffset.interpolate({
    inputRange: [0, Math.max(SHEET_DRAG_RANGE * 0.72, 1), Math.max(SHEET_DRAG_RANGE, 1)],
    outputRange: [1, 0.12, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" hidden={false} translucent={false} backgroundColor="#FFFFFF" />

      <RideRouteMap
        ref={mapRef}
        showStatusBarScrim
        pickupCoord={captainCoord || pickupCoord}
        dropCoord={routeTargetCoord || dropCoord}
        routeCoords={activeRouteCoords}
        mapRegion={mapRegion}
        routeColor="#1754E8"
        routeWidth={3.2}
        showPickupMarker={false}
        showDropMarker
        endMarkerVariant="searchDrop"
        showCaptainMarker={false}
        nearbyVehicles={captainVehicles}
        showUserLocation={false}
        showMyLocationButton={false}
        interactive
        showMapControls
        showZoomControls={false}
        attachMarkersToRouteEnds
        autoFitRoute
        animateRoute={false}
        edgePadding={{
          top: insets.top + 92,
          right: 52,
          bottom: COLLAPSED_SHEET_HEIGHT + 42,
          left: 52,
        }}
      />

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
          <View style={styles.etaSurface}>
            <View style={styles.etaCopy}>
              <Text style={styles.etaLabel}>Arriving in</Text>
              <Text style={styles.etaValue}>{resolvedEta}</Text>
            </View>
            {resolvedDistance ? (
              <View style={styles.distancePill}>
                <Text style={styles.distanceText}>{resolvedDistance} away</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.sectionDivider} />
          <View style={styles.captainCard}>
            <View style={styles.captainRow}>
              <View style={styles.avatarWrap}>
                {captainAvatar ? (
                  <Image source={captainAvatar} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.avatarInitials}>{initialsFor(resolvedCaptainName)}</Text>
                )}
              </View>
              <View style={styles.captainCopy}>
                <View style={styles.nameRow}>
                  <Text style={styles.captainName} numberOfLines={1}>{resolvedCaptainName}</Text>
                  <View style={styles.ratingPill}>
                    <Text style={styles.ratingText}>★ {resolvedRating}</Text>
                  </View>
                </View>
                <Text style={styles.vehicleText} numberOfLines={1}>
                  {resolvedCaptainVehicle}  ·  {resolvedCaptainPlate}
                </Text>
              </View>
            </View>
            <View style={styles.actionRow}>
              <ActionButton icon="call" label="Call" onPress={onCall} round />
              <ActionButton icon="chat-bubble-outline" label="Message" onPress={onMessage} />
            </View>
          </View>
          <View style={styles.sectionDivider} />

          <View style={styles.destinationRow}>
            <View style={styles.destinationCopy}>
              <Text style={styles.destinationLabel}>Drop</Text>
              <Text style={styles.destinationAddress} numberOfLines={1}>{dropAddress}</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.detailsButton, pressed && styles.pressed]} onPress={onTripDetails}>
              <MaterialIcons name="more-horiz" size={22} color="#344054" />
            </Pressable>
          </View>

          <Animated.View style={[styles.expandedDetails, { opacity: extraDetailsOpacity }]}>
            <View style={styles.detailLine} />

            {__DEV__ ? (
              <Pressable style={({ pressed }) => [styles.testButton, pressed && styles.pressed]} onPress={() => closeSheet(onForward)}>
                <Text style={styles.testButtonText}>Complete trip (test)</Text>
              </Pressable>
            ) : null}
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 10, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: "#FFFFFF", overflow: "hidden", elevation: 0, shadowColor: "#0F172A", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0, shadowRadius: 12 },
  handleTouch: { height: 27, alignItems: "center", justifyContent: "center" },
  handle: { width: 40, height: 4, borderRadius: 99, backgroundColor: "#DDE3EA" },
  sheetContent: { paddingHorizontal: 18, paddingBottom: 20 },
  etaSurface: { minHeight: 58, paddingHorizontal: 2, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  etaCopy: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" },
  etaLabel: { color: "#101828", fontSize: 20, lineHeight: 25, fontWeight: "700", letterSpacing: -0.4 },
  etaValue: { marginLeft: 5, color: "#1769E8", fontSize: 20, lineHeight: 25, fontWeight: "700", letterSpacing: -0.4 },
  distancePill: { height: 28, marginLeft: 8, paddingHorizontal: 10, borderRadius: 14, backgroundColor: "#EEF5FF", alignItems: "center", justifyContent: "center" },
  distanceText: { color: "#1769E8", fontSize: 12, lineHeight: 16, fontWeight: "700" },
  sectionDivider: { height: 0, marginTop: 14, borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#D8DEE8" },
  captainCard: { marginTop: 12, borderRadius: 16, backgroundColor: "#F6F8FB", padding: 12 },
  captainRow: { minHeight: 56, flexDirection: "row", alignItems: "center" },
  avatarWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#DCE8F6", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%" },
  avatarInitials: { color: "#24344C", fontSize: 19, lineHeight: 24, fontWeight: "700" },
  captainCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  captainName: { maxWidth: "70%", color: "#101828", fontSize: 17, lineHeight: 22, fontWeight: "700" },
  ratingPill: { height: 22, paddingHorizontal: 7, borderRadius: 99, backgroundColor: "#F5F3FF", alignItems: "center", justifyContent: "center" },
  ratingText: { color: "#5B4A20", fontSize: 12, lineHeight: 15, fontWeight: "700" },
  vehicleText: { marginTop: 4, color: "#344054", fontSize: 13, lineHeight: 18, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  actionButton: { flex: 1, height: 38, borderRadius: 18, backgroundColor: "#ffffffff", borderWidth: 1, borderColor: "#f1f1f2ff", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  actionButtonRound: { flex: 0, width: 38, borderRadius: 19 },
  actionLabel: { color: "#344054", fontSize: 13, lineHeight: 17, fontWeight: "600" },
  destinationRow: { minHeight: 56, marginTop: 12, paddingHorizontal: 2, flexDirection: "row", alignItems: "center" },
  destinationCopy: { flex: 1, minWidth: 0, paddingRight: 10 },
  destinationLabel: { color: "#000000ff", fontSize: 16.5, lineHeight: 26, fontWeight: "900", letterSpacing: 0.55 },
  destinationAddress: { marginTop: 3, color: "#344054", fontSize: 13.5, lineHeight: 18, fontWeight: "600" },
  detailsButton: { width: 42, height: 34, borderRadius: 17, backgroundColor: "#FFFFFF", borderColor: "#D8DEE8", borderWidth: 1, alignItems: "center", justifyContent: "center" },
  expandedDetails: { paddingTop: 9 },
  detailLine: { height: 0, borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#D8DEE8", marginBottom: 12 },
  addressDetailRow: { minHeight: 48, flexDirection: "row", alignItems: "center" },
  addressDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#1754E8", marginHorizontal: 7, marginRight: 16 },
  addressDetailCopy: { flex: 1, minWidth: 0 },
  addressDetailLabel: { color: "#98A2B3", fontSize: 10, lineHeight: 13, fontWeight: "600" },
  addressDetailText: { marginTop: 2, color: "#344054", fontSize: 13, lineHeight: 17, fontWeight: "600" },
  testButton: { height: 39, marginTop: 8, borderRadius: 13, backgroundColor: "#EEF3FF", alignItems: "center", justifyContent: "center" },
  testButtonText: { color: "#1754E8", fontSize: 12, lineHeight: 16, fontWeight: "700" },
  pressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
});
