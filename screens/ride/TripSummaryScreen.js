import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

import RideRouteMap from "../../components/RideRouteMap";
import { RIDE_SHEET_EXPANDED_HEIGHT } from "./rideSheetLayout";
import useRideSheetMotion from "./useRideSheetMotion";

const VEHICLE_IMAGE = require("../../assets/vehicles/choose-bike.png");

function formatMoney(value, fallback = "₹92") {
  const text = String(value || fallback).trim();
  return text.startsWith("₹") ? text : `₹${text}`;
}

function moneyNumber(value) {
  const parsed = Number.parseFloat(String(value || "0").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function FareRow({ label, value, strong = false, positive = false }) {
  return (
    <View style={styles.fareRow}>
      <Text style={[styles.fareLabel, strong && styles.fareLabelStrong]}>{label}</Text>
      <Text style={[styles.fareValue, strong && styles.fareValueStrong, positive && styles.positiveValue]}>
        {value}
      </Text>
    </View>
  );
}

function RatingRow({ label, value, onChange }) {
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            accessibilityRole="button"
            accessibilityLabel={`${label} ${star} star${star === 1 ? "" : "s"}`}
            hitSlop={4}
            onPress={() => onChange(star)}
            style={({ pressed }) => [styles.starButton, pressed && styles.starPressed]}
          >
            <MaterialIcons
              name={star <= value ? "star" : "star-border"}
              size={22}
              color={star <= value ? "#F4B400" : "#C8CED8"}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function TripSummaryScreen({
  onBack = () => {},
  onForward = () => {},
  onTripDetails = () => {},
  onReceipt = () => {},
  pickupCoord,
  dropCoord,
  routeCoords,
  mapRegion,
  pickupAddress = "Pickup",
  dropAddress = "Selected destination",
  captainName = "Narsing Rao",
  captainPlate = "TS11 EG 3375",
  captainVehicle = "Hero Splendor",
  rating = "4.8",
  durationText = "18 min",
  distanceText = "6.4 km",
  fare = "₹92",
  discount = "₹10",
  paymentLabel = "Cash",
}) {
  const [tripRating, setTripRating] = useState(0);
  const [captainRating, setCaptainRating] = useState(0);
  const successAnimationRef = useRef(null);
  const { sheetOffset, closeSheet } = useRideSheetMotion();
  const totalFare = formatMoney(fare);
  const discountValue = moneyNumber(discount);
  const tripFare = formatMoney(moneyNumber(fare) + discountValue);

  useEffect(() => {
    successAnimationRef.current?.play();
    const replayTimer = setInterval(() => {
      successAnimationRef.current?.reset();
      successAnimationRef.current?.play();
    }, 5000);

    return () => clearInterval(replayTimer);
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" hidden={false} translucent={false} backgroundColor="#FFFFFF" />

      <RideRouteMap
        showStatusBarScrim
        pickupCoord={pickupCoord}
        dropCoord={dropCoord}
        routeCoords={routeCoords}
        mapRegion={mapRegion}
        routeColor="#8494A8"
        routeWidth={3}
        showUserLocation={false}
        showMyLocationButton={false}
        startMarkerVariant="searchPickup"
        endMarkerVariant="searchDrop"
        showCaptainMarker={false}
        attachMarkersToRouteEnds
        animateRoute={false}
        interactive
        showMapControls={false}
        edgePadding={{ top: 96, right: 48, bottom: RIDE_SHEET_EXPANDED_HEIGHT + 44, left: 48 }}
      />

      <Pressable accessibilityLabel="Close trip summary" style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} onPress={() => closeSheet(onBack)}>
        <MaterialIcons name="close" size={24} color="#101828" />
      </Pressable>

      <Animated.View style={[styles.sheet, { height: RIDE_SHEET_EXPANDED_HEIGHT, transform: [{ translateY: sheetOffset }] }]}> 
        <View style={styles.handle} />
        <View style={styles.content}>
          <View style={styles.completionRow}>
            <View style={styles.completionCopy}>
              <Text style={styles.title}>You’ve arrived</Text>
              <Text style={styles.destination} numberOfLines={1}>{dropAddress}</Text>
            </View>
            <LottieView
              ref={successAnimationRef}
              source={require("../../assets/animations/trip-success.json")}
              autoPlay={false}
              loop={false}
              resizeMode="contain"
              style={styles.successAnimation}
            />
          </View>

          <View style={styles.tripMetrics}>
            <Text style={styles.metricText}>{durationText}</Text>
            <View style={styles.metricDot} />
            <Text style={styles.metricText}>{distanceText}</Text>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.fareSection}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionTitle}>Fare summary</Text>
              <Text style={styles.paymentStatus}>Paid · {paymentLabel}</Text>
            </View>
            <FareRow label="Trip fare" value={tripFare} />
            <FareRow label="Ride discount" value={`−${formatMoney(discountValue, "₹0")}`} positive />
            <View style={styles.totalDivider} />
            <FareRow label="Total paid" value={totalFare} strong />
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.feedbackCard}>
            <View style={styles.captainCard}>
              <Image source={VEHICLE_IMAGE} resizeMode="contain" style={styles.vehicleImage} />
              <View style={styles.captainCopy}>
                <View style={styles.nameRow}>
                  <Text style={styles.captainName} numberOfLines={1}>{captainName}</Text>
                  <View style={styles.ratingPill}>
                    <Text style={styles.ratingText}>★ {rating}</Text>
                  </View>
                </View>
                <Text style={styles.vehicleMeta} numberOfLines={1}>{captainVehicle} · {captainPlate}</Text>
              </View>
              <Pressable accessibilityLabel="Trip details" onPress={onTripDetails} style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}>
                <MaterialIcons name="more-horiz" size={22} color="#344054" />
              </Pressable>
            </View>

            <View style={styles.feedbackDivider} />
            <View style={styles.ratingsSection}>
              <RatingRow label="Rate your trip" value={tripRating} onChange={setTripRating} />
              <RatingRow label="Rate your captain" value={captainRating} onChange={setCaptainRating} />
            </View>

            <View style={styles.actionRow}>
              <Pressable style={({ pressed }) => [styles.receiptButton, pressed && styles.pressed]} onPress={onReceipt}>
                <MaterialIcons name="file-download" size={19} color="#344054" />
                <Text style={styles.receiptText}>Receipt</Text>
              </Pressable>
              <Pressable
                disabled={!tripRating || !captainRating}
                style={({ pressed }) => [
                  styles.rateButton,
                  (!tripRating || !captainRating) && styles.rateButtonDisabled,
                  pressed && tripRating && captainRating && styles.pressed,
                ]}
                onPress={() => closeSheet(() => onForward({ tripRating, captainRating }))}
              >
                <Text style={styles.rateText}>Submit ratings</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={({ pressed }) => [styles.issueButton, pressed && styles.pressed]} onPress={onTripDetails}>
            <Text style={styles.issueText}>Report an issue</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  backButton: { position: "absolute", left: 18, top: 52, zIndex: 8, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.96)", alignItems: "center", justifyContent: "center", elevation: 0, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0, shadowRadius: 8 },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 10, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: "#FFFFFF", elevation: 0, shadowColor: "#0F172A", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0, shadowRadius: 12 },
  handle: { alignSelf: "center", width: 40, height: 4, marginTop: 11, borderRadius: 99, backgroundColor: "#DDE3EA" },
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 20 },
  completionRow: { minHeight: 54, flexDirection: "row", alignItems: "center" },
  completionCopy: { flex: 1, minWidth: 0, paddingRight: 10 },
  title: { color: "#101828", fontSize: 22, lineHeight: 28, fontWeight: "700", letterSpacing: -0.45 },
  destination: { marginTop: 2, color: "#667085", fontSize: 12.5, lineHeight: 17, fontWeight: "500" },
  successAnimation: { width: 54, height: 54, marginRight: -3 },
  tripMetrics: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 },
  metricText: { color: "#475467", fontSize: 12, lineHeight: 16, fontWeight: "600" },
  metricDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#98A2B3" },
  sectionDivider: { height: 0, marginTop: 14, borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#D8DEE8" },
  fareSection: { marginTop: 12, backgroundColor: "#FFFFFF" },
  sectionHeadingRow: { minHeight: 29, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#101828", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  paymentStatus: { color: "#138A45", fontSize: 11.5, lineHeight: 15, fontWeight: "700" },
  fareRow: { minHeight: 25, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fareLabel: { color: "#667085", fontSize: 12, lineHeight: 16, fontWeight: "500" },
  fareValue: { color: "#344054", fontSize: 12, lineHeight: 16, fontWeight: "600" },
  fareLabelStrong: { color: "#101828", fontSize: 14, lineHeight: 18, fontWeight: "700" },
  fareValueStrong: { color: "#101828", fontSize: 15, lineHeight: 19, fontWeight: "700" },
  positiveValue: { color: "#138A45" },
  totalDivider: { height: 0, marginVertical: 6, borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#E2E8F0" },
  feedbackCard: { marginTop: 12, padding: 12, borderRadius: 16, backgroundColor: "#F6F8FB" },
  captainCard: { minHeight: 58, flexDirection: "row", alignItems: "center" },
  vehicleImage: { width: 54, height: 46 },
  captainCopy: { flex: 1, minWidth: 0, marginLeft: 9, paddingRight: 8 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  captainName: { maxWidth: "68%", color: "#101828", fontSize: 15, lineHeight: 19, fontWeight: "700" },
  ratingPill: { height: 21, paddingHorizontal: 7, borderRadius: 11, backgroundColor: "#F5F3FF", alignItems: "center", justifyContent: "center" },
  ratingText: { color: "#5B4A20", fontSize: 11.5, lineHeight: 15, fontWeight: "700" },
  vehicleMeta: { marginTop: 3, color: "#667085", fontSize: 11.5, lineHeight: 15, fontWeight: "500" },
  moreButton: { width: 38, height: 34, borderRadius: 17, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center" },
  feedbackDivider: { height: 0, marginVertical: 9, borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#D8DEE8" },
  ratingsSection: { backgroundColor: "transparent" },
  ratingRow: { minHeight: 32, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ratingLabel: { color: "#344054", fontSize: 12.5, lineHeight: 17, fontWeight: "600" },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  starButton: { width: 27, height: 28, alignItems: "center", justifyContent: "center" },
  starPressed: { transform: [{ scale: 0.88 }] },
  actionRow: { marginTop: 12, flexDirection: "row", gap: 10 },
  receiptButton: { width: 112, height: 44, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  receiptText: { color: "#344054", fontSize: 13, lineHeight: 17, fontWeight: "700" },
  rateButton: { flex: 1, height: 44, borderRadius: 12, backgroundColor: "#101828", alignItems: "center", justifyContent: "center" },
  rateButtonDisabled: { backgroundColor: "#AEB7C5" },
  rateText: { color: "#FFFFFF", fontSize: 14, lineHeight: 18, fontWeight: "700" },
  issueButton: { alignSelf: "center", minHeight: 32, marginTop: 4, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  issueText: { color: "#667085", fontSize: 12, lineHeight: 16, fontWeight: "600" },
  pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
});
