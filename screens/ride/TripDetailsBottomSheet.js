import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");
const SHEET_HEIGHT = Math.min(Math.max(height * 0.68, 520), height - 90, 620);
const VEHICLE_IMAGE = require("../../assets/vehicles/choose-bike.png");

function formatFare(value) {
  const text = String(value || "₹92").trim();
  return text.startsWith("₹") ? text : `₹${text}`;
}

function addressParts(value, fallback) {
  const text = String(value || fallback).trim();
  const [title, ...rest] = text.split(",");
  return { title: title?.trim() || fallback, detail: rest.join(",").trim() || text };
}

function LocationRow({ type, title, detail, last = false }) {
  return (
    <View style={styles.locationRow}>
      <View style={styles.locationRail}>
        <View style={[styles.locationDot, type === "pickup" ? styles.pickupDot : styles.dropDot]} />
        {!last ? <View style={styles.locationLine} /> : null}
      </View>
      <View style={styles.locationCopy}>
        <Text style={styles.locationLabel}>{type === "pickup" ? "Pickup" : "Drop"}</Text>
        <Text style={styles.locationTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.locationDetail} numberOfLines={1}>{detail}</Text>
      </View>
    </View>
  );
}

export default function TripDetailsBottomSheet({
  visible,
  fare = "₹92",
  vehicle = "Bike Lite",
  pickupText = "Current pickup location",
  dropText = "Selected destination",
  paymentLabel = "Cash",
  statusLabel,
  onClose = () => {},
  onCancel = () => {},
}) {
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 320,
        easing: Easing.bezier(0.2, 0.72, 0.2, 1),
        useNativeDriver: true,
        isInteraction: false,
      }).start();
      return;
    }

    progress.stopAnimation();
    progress.setValue(0);
    setMounted(false);
  }, [progress, visible]);

  if (!mounted) return null;

  const pickup = addressParts(pickupText, "Current pickup location");
  const drop = addressParts(dropText, "Selected destination");
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [SHEET_HEIGHT + 36, 0] });
  const backdropOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.34] });

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Animated.View pointerEvents="auto" style={[styles.backdrop, { opacity: backdropOpacity }]} />
      <Animated.View
        style={[
          styles.floatingCloseWrap,
          {
            bottom: SHEET_HEIGHT + 12,
            opacity: progress,
            transform: [{
              translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
            }],
          },
        ]}
      >
        <Pressable
          accessibilityLabel="Close trip details"
          onPress={onClose}
          style={({ pressed }) => [styles.floatingCloseButton, pressed && styles.pressed]}
        >
          <MaterialIcons name="close" size={21} color="#344054" />
        </Pressable>
      </Animated.View>
      <Animated.View
        renderToHardwareTextureAndroid
        shouldRasterizeIOS
        style={[styles.sheet, { height: SHEET_HEIGHT, transform: [{ translateY }] }]}
      >
        <View style={styles.handle} />

        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Trip details</Text>
            {statusLabel ? <Text style={styles.statusText}>{statusLabel}</Text> : null}
          </View>
        </View>

        <View style={styles.rideSummary}>
          <Image source={VEHICLE_IMAGE} resizeMode="contain" style={styles.vehicleImage} />
          <View style={styles.vehicleCopy}>
            <Text style={styles.vehicleName}>{vehicle}</Text>
            <Text style={styles.vehicleMeta}>Your selected ride</Text>
          </View>
          <Text style={styles.summaryFare}>{formatFare(fare)}</Text>
        </View>
        <View style={styles.sectionDivider} />

        <View style={styles.routeSurface}>
          <LocationRow type="pickup" title={pickup.title} detail={pickup.detail} />
          <LocationRow type="drop" title={drop.title} detail={drop.detail} last />
        </View>
        <View style={styles.sectionDivider} />

        <View style={styles.paymentRow}>
          <View>
            <Text style={styles.paymentLabel}>Payment</Text>
            <Text style={styles.paymentValue}>{paymentLabel}</Text>
          </View>
          <View style={styles.fareCopy}>
            <Text style={styles.paymentLabel}>Total fare</Text>
            <Text style={styles.fareValue}>{formatFare(fare)}</Text>
          </View>
        </View>

        <Pressable style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel ride</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "#101828" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 101,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingBottom: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0,
    shadowRadius: 12,
    elevation: 0,
  },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 99, backgroundColor: "#DDE3EA", marginTop: 11 },
  floatingCloseWrap: { position: "absolute", right: 16, zIndex: 102, elevation: 0 },
  floatingCloseButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0, shadowRadius: 8, elevation: 0 },
  header: { minHeight: 62, flexDirection: "row", alignItems: "center", justifyContent: "flex-start" },
  headerTitle: { color: "#101828", fontSize: 20, lineHeight: 25, fontWeight: "700", letterSpacing: -0.35 },
  statusText: { marginTop: 1, color: "#667085", fontSize: 12, lineHeight: 16, fontWeight: "500" },
  rideSummary: { minHeight: 62, marginTop: 8, flexDirection: "row", alignItems: "center" },
  vehicleImage: { width: 62, height: 48 },
  vehicleCopy: { flex: 1, minWidth: 0, marginLeft: 8 },
  vehicleName: { color: "#101828", fontSize: 16, lineHeight: 21, fontWeight: "700" },
  vehicleMeta: { marginTop: 2, color: "#667085", fontSize: 12, lineHeight: 16, fontWeight: "500" },
  summaryFare: { color: "#101828", fontSize: 18, lineHeight: 23, fontWeight: "700" },
  sectionDivider: { height: 0, marginTop: 12, borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#D8DEE8" },
  routeSurface: { marginTop: 10, borderRadius: 16, backgroundColor: "#FFFFFF", paddingHorizontal: 12, paddingVertical: 5 },
  locationRow: { minHeight: 61, flexDirection: "row", alignItems: "flex-start", paddingTop: 9 },
  locationRail: { width: 23, alignItems: "center", alignSelf: "stretch" },
  locationDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  pickupDot: { backgroundColor: "#28A467" },
  dropDot: { backgroundColor: "#E5484D" },
  locationLine: { width: 1, flex: 1, marginTop: 5, backgroundColor: "#D5DCE5" },
  locationCopy: { flex: 1, minWidth: 0, paddingLeft: 7 },
  locationLabel: { color: "#667085", fontSize: 10.5, lineHeight: 14, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  locationTitle: { marginTop: 1, color: "#101828", fontSize: 14, lineHeight: 18, fontWeight: "700" },
  locationDetail: { marginTop: 1, color: "#667085", fontSize: 11.5, lineHeight: 15, fontWeight: "500" },
  paymentRow: { minHeight: 58, marginTop: 10, paddingHorizontal: 3, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  paymentLabel: { color: "#667085", fontSize: 11, lineHeight: 14, fontWeight: "600" },
  paymentValue: { marginTop: 2, color: "#344054", fontSize: 14, lineHeight: 18, fontWeight: "700", textTransform: "capitalize" },
  fareCopy: { alignItems: "flex-end" },
  fareValue: { marginTop: 2, color: "#101828", fontSize: 16, lineHeight: 20, fontWeight: "700" },
  cancelButton: { height: 43, marginTop: 10, borderRadius: 13, backgroundColor: "#FFF3F2", alignItems: "center", justifyContent: "center" },
  cancelText: { color: "#B42318", fontSize: 14, lineHeight: 18, fontWeight: "700" },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
});
