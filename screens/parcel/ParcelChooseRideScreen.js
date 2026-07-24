import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import RideRouteMap from "../../components/RideRouteMap";
import BookingOptionBottomSheet from "../../components/BookingOptionBottomSheet";
import { SHADOWS } from "../../theme/shadows";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.55);
const BRAND_BLUE = "#000000ff";

const PARCEL_RIDES = [
  {
    id: "bike",
    key: "bike",
    name: "Parcel Bike",
    eta: "5 min",
    drop: "9:26 pm",
    price: "₹47.86",
    oldPrice: "₹63.82",
    image: require("../../assets/vehicles/choose-bike.png"),
  },
  {
    id: "threeWheeler",
    key: "auto",
    name: "Parcel Mini 3W",
    eta: "4 min",
    drop: "9:25 pm",
    price: "₹96.38",
    oldPrice: "₹120.47",
    image: require("../../assets/vehicles/choose-auto.png"),
  },
];

function normalizeSelectedRideKey(value) {
  if (!value) return "bike";
  const match = PARCEL_RIDES.find((ride) => ride.id === value || ride.key === value);
  return match?.id || "bike";
}

export default function ParcelChooseRideScreen({
  selectedRideKey,
  paymentLabel = "Cash",
  couponLabel = "Offers",
  pickupCoord,
  dropCoord,
  routeCoords = [],
  mapRegion,
  onBack = () => {},
  onSelectRide = () => {},
  onChooseToPay = () => {},
  onOpenCoupon = () => {},
  onPaymentSelect = () => {},
  onCouponApply = () => {},
  onConfirm = () => {},
  isConfirming = false,
}) {
  const [selected, setSelected] = useState(normalizeSelectedRideKey(selectedRideKey));
  const [payAt, setPayAt] = useState("pickup");
  const [optionSheet, setOptionSheet] = useState(null);

  useEffect(() => {
    const nextSelected = normalizeSelectedRideKey(selectedRideKey);
    if (nextSelected !== selected) setSelected(nextSelected);
  }, [selected, selectedRideKey]);

  const selectedRide = useMemo(
    () => PARCEL_RIDES.find((ride) => ride.id === selected) || PARCEL_RIDES[0],
    [selected]
  );

  const handleSelectRide = (ride) => {
    setSelected(ride.id);
    onSelectRide?.(ride);
  };

  const handleConfirm = () => {
    if (!isConfirming) onConfirm?.(selectedRide);
  };

  const renderRide = ({ item }) => {
    const isSelected = item.id === selected;

    return (
      <Pressable
        onPress={() => handleSelectRide(item)}
        style={({ pressed }) => [
          styles.rideCard,
          isSelected && styles.rideCardSelected,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.vehicleImageWrap}>
          <Image source={item.image} resizeMode="contain" style={styles.vehicleImage} />
          {isSelected ? <View style={styles.selectedDot} /> : null}
        </View>

        <View style={styles.rideCopy}>
          <Text style={styles.rideTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.rideMeta} numberOfLines={1}>
            {item.drop} <Text style={styles.metaDot}>·</Text> {item.eta}
          </Text>
        </View>

        <View style={styles.priceColumn}>
          <Text style={styles.price}>{item.price}</Text>
          <Text style={styles.oldPrice}>{item.oldPrice}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" hidden={false} translucent={false} backgroundColor="#F9FAFC" />
      <View style={styles.mapArea}>
        <RideRouteMap
          showStatusBarScrim
          pickupCoord={pickupCoord}
          dropCoord={dropCoord}
          routeCoords={routeCoords}
          mapRegion={mapRegion}
          routeColor={BRAND_BLUE}
          routeWidth={2.8}
          showUserLocation={false}
          showMyLocationButton={false}
          showMapControls={false}
          startMarkerVariant="searchPickup"
          endMarkerVariant="searchDrop"
          attachMarkersToRouteEnds
          animateRoute
          routeAnimationDuration={1050}
          interactive={false}
          edgePadding={{ top: 82, right: 40, bottom: SHEET_HEIGHT + 38, left: 40 }}
        />
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Go back" style={styles.backButton} onPress={onBack} hitSlop={10}>
        <MaterialIcons name="arrow-back" size={28} color="#101828" />
      </Pressable>

      <View style={styles.sheet}>
        <View style={styles.handle} />



        <View style={styles.promotionRow}>
          <MaterialIcons name="local-offer" size={20} color="#D92D20" />
          <Text style={styles.promotionText}>25% promotion applied</Text>
          <MaterialIcons name="info" size={17} color="#667085" />
        </View>

        <FlatList
          data={PARCEL_RIDES}
          renderItem={renderRide}
          keyExtractor={(item) => item.id}
          extraData={selected}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        />

        <View style={styles.footer}>
          <View style={styles.paymentOffersRow}>
            <Pressable style={({ pressed }) => [styles.footerOption, pressed && styles.pressed]} onPress={() => setOptionSheet("payment")}>
              <View style={styles.footerIconWrap}>
                <MaterialIcons name="payments" size={20} color="#101828" />
              </View>
              <Text style={styles.footerOptionText} numberOfLines={1}>{paymentLabel}</Text>
              <MaterialIcons name="chevron-right" size={21} color="#667085" />
            </Pressable>

            <View style={styles.footerDivider} />

            <Pressable style={({ pressed }) => [styles.footerOption, pressed && styles.pressed]} onPress={() => setOptionSheet("coupon")}>
              <View style={styles.footerIconWrap}>
                <MaterialIcons name="percent" size={20} color="#101828" />
              </View>
              <Text style={styles.footerOptionText} numberOfLines={1}>{couponLabel}</Text>
              <MaterialIcons name="chevron-right" size={21} color="#667085" />
            </Pressable>
          </View>

          <View style={styles.payTimingRow}>


          </View>

          <Pressable
            style={({ pressed }) => [styles.confirmButton, isConfirming && styles.confirmButtonDisabled, pressed && styles.confirmButtonPressed]}
            onPress={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
            <Text style={styles.confirmText} numberOfLines={1}>
              {isConfirming ? "Booking parcel" : `Book ${selectedRide.name}`}
            </Text>
          </Pressable>
        </View>
      </View>
      <BookingOptionBottomSheet
        visible={Boolean(optionSheet)}
        type={optionSheet || "payment"}
        amount={selectedRide.price}
        selectedPaymentLabel={paymentLabel}
        selectedCouponCode={couponLabel}
        onClose={() => setOptionSheet(null)}
        onSelectPayment={(option) => onPaymentSelect?.(option)}
        onApplyCoupon={(coupon) => onCouponApply?.(coupon)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 54,
    left: 18,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.97)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 8,
    ...SHADOWS.floating,
  },
  confirmButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: BRAND_BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.65,
  },
  confirmButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  container: {
    flex: 1,
    backgroundColor: "#EEF3F8",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#EAECF0",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 56,
    backgroundColor: "#FFFFFF",
  },
  footerDivider: {
    width: 1,
    height: 34,
    backgroundColor: "#E4E7EC",
  },
  footerIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  footerOption: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  footerOptionText: {
    flex: 1,
    color: "#101828",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#D7DEE8",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 9,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  mapArea: {
    flex: 1,
    backgroundColor: "#EEF3F8",
  },
  metaDot: {
    color: "#98A2B3",
  },
  oldPrice: {
    marginTop: 3,
    color: "#98A2B3",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    textDecorationLine: "line-through",
  },
  payAtLabel: {
    color: "#344054",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  payAtLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  paymentOffersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  payTimingRow: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pressed: {
    opacity: 0.72,
  },
  price: {
    color: "#101828",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
  },
  priceColumn: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 10,
  },
  promotionRow: {
    minHeight: 38,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAECF0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  promotionText: {
    color: "#B42318",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  rideCard: {
    minHeight: 94,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
  },
  rideCardSelected: {
    borderColor: "#111111",
    backgroundColor: "#FFFFFF",
  },
  rideCopy: {
    flex: 1,
    minWidth: 0,
  },
  rideMeta: {
    marginTop: 7,
    color: "#344054",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
  },
  rideTitle: {
    color: "#101828",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
  },
  segment: {
    minWidth: 70,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: {
    backgroundColor: "#234E70",
  },
  segmentedControl: {
    padding: 3,
    borderRadius: 999,
    backgroundColor: "#F2F4F7",
    flexDirection: "row",
    alignItems: "center",
  },
  segmentText: {
    color: "#667085",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  selectedDot: {
    position: "absolute",
    right: 1,
    bottom: 3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F5A800",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    zIndex: 5,
    ...SHADOWS.sheet,
  },
  sheetHeader: {
    paddingHorizontal: 18,
    paddingTop: 1,
    paddingBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: {
    color: "#101828",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.35,
  },
  vehicleImage: {
    width: 66,
    height: 58,
  },
  vehicleImageWrap: {
    position: "relative",
    width: 78,
    height: 68,
    borderRadius: 16,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
});
