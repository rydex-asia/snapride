import React, { useMemo, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

import PremiumCard from "../../components/PremiumCard";
import RideBottomSheet from "../../components/RideBottomSheet";
import { SearchEndpointPinSvg } from "../../components/RideRouteMap";

import { COLORS } from "../../theme/colors";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAP_HEIGHT = Math.round(Math.min(Math.max(SCREEN_HEIGHT * 0.4, 300), 360));

const DEFAULT_RIDES = [
  {
    key: "bike",
    title: "Bike",
    subtitle: "Quick rides for short distance",
    capacity: 1,
    eta: "5 mins away",
    price: "₹68",
    oldPrice: "₹85",
    image: require("../../assets/vehicles/bike.png"),
  },
  {
    key: "auto",
    title: "Auto",
    subtitle: "Affordable & Convenient Auto rides",
    capacity: 3,
    eta: "6 mins away",
    price: "₹102",
    oldPrice: "₹125",
    image: require("../../assets/vehicles/auto.png"),
  },
  {
    key: "mini",
    title: "Mini",
    subtitle: "Cars for a comfortable ride",
    capacity: 4,
    eta: "7 mins away",
    price: "₹188",
    oldPrice: "₹230",
    image: require("../../assets/vehicles/cab.png"),
  },
  {
    key: "prime",
    title: "Prime Sedan",
    subtitle: "Spacious sedans for a premium experience",
    capacity: 4,
    eta: "8 mins away",
    price: "₹265",
    oldPrice: "₹320",
    image: require("../../assets/vehicles/cab.png"),
  },
  {
    key: "xl",
    title: "XL",
    subtitle: "Best for group rides and more space",
    capacity: 6,
    eta: "9 mins away",
    price: "₹325",
    oldPrice: "₹395",
    image: require("../../assets/vehicles/bus.png"),
  },
];

const PICKUP_COORDINATE = {
  latitude: 12.9352,
  longitude: 77.6245,
};

const DROP_COORDINATE = {
  latitude: 12.9755,
  longitude: 77.6068,
};

const ROUTE_COORDINATES = [
  PICKUP_COORDINATE,
  { latitude: 12.9418, longitude: 77.6238 },
  { latitude: 12.9532, longitude: 77.6205 },
  { latitude: 12.9648, longitude: 77.6141 },
  DROP_COORDINATE,
];

const normalizeRideKey = (key) => {
  const map = { cab: "prime", truck: "xl", parcel: "xl" };
  return map[key] || key || "bike";
};

function MapPin({ color }) {
  return (
    <View style={styles.pinWrap}>
      <View style={[styles.pinOuter, { borderColor: color }]}>
        <View style={[styles.pinInner, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function ImageStub({ item }) {
  const imageStyle =
    item.key === "bike"
      ? styles.rideImageBike
      : item.key === "auto"
      ? styles.rideImageAuto
      : item.key === "mini"
      ? styles.rideImageMini
      : item.key === "prime"
      ? styles.rideImagePrime
      : styles.rideImageXl;

  return <View style={[styles.rideImage, imageStyle]} />;
}

function CompactRideCard({ item, selected, onPress }) {
  return (
    <PremiumCard selected={selected} onPress={onPress} style={[styles.rideCard, selected && styles.rideCardSelected]}>
      <ImageStub item={item} />
      <View style={styles.rideCopy}>
        <View style={styles.rideTitleRow}>
          <Text style={styles.rideTitle}>{item.title}</Text>
          <View style={styles.capacityChip}>
            <MaterialCommunityIcons name="account" size={12} color="#667085" />
            <Text style={styles.capacityText}>{item.capacity}</Text>
          </View>
        </View>
        <Text style={styles.rideSubtitle} numberOfLines={2}>
          {item.subtitle}
        </Text>
      </View>
      <View style={styles.rideRight}>
        <Text style={styles.ridePrice}>{item.price}</Text>
        <Text style={styles.rideOldPrice}>{item.oldPrice}</Text>
        <Text style={styles.rideEta}>{item.eta}</Text>
      </View>
      <View style={styles.selectionArea}>
        {selected ? (
          <MaterialCommunityIcons name="check-circle" size={22} color={COLORS.primary} />
        ) : (
          <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={21} color="#D0D5DD" />
        )}
      </View>
    </PremiumCard>
  );
}

export default function MapScreen({
  rideOptions,
  options,
  selectedRideKey,
  onBack,
  onSelectRide,
  onSeePrices,
  pickupLabel = "Koramangala 4th Block",
  dropLabel = "Hitech City, Hyderabad",
}) {
  const rides = useMemo(() => (rideOptions?.length ? rideOptions : options?.length ? options : DEFAULT_RIDES), [rideOptions, options]);
  const [localSelectedKey, setLocalSelectedKey] = useState(normalizeRideKey(selectedRideKey || rides[0]?.key));

  const mapRef = useRef(null);
  const selectedKey = normalizeRideKey(selectedRideKey || localSelectedKey);
  const selectedRide = rides.find((ride) => ride.key === selectedKey) || rides[0];

  const handleRecenter = () => {
    mapRef.current?.animateToRegion(mapRegion, 300);
  };

  const mapRegion = useMemo(
    () => ({
      latitude: (PICKUP_COORDINATE.latitude + DROP_COORDINATE.latitude) / 2,
      longitude: (PICKUP_COORDINATE.longitude + DROP_COORDINATE.longitude) / 2,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    }),
    []
  );

  const handleSelectRide = (ride) => {
    setLocalSelectedKey(ride.key);
    onSelectRide?.(ride);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={mapRegion}
          scrollEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
        >
          <Polyline coordinates={ROUTE_COORDINATES} strokeColor="#1754E8" strokeWidth={2.8} lineCap="round" lineJoin="round" />
          <Marker coordinate={PICKUP_COORDINATE} anchor={{ x: 0.5, y: 1 }} tracksViewChanges>
            <SearchEndpointPinSvg color="#1754E8" />
          </Marker>
          <Marker coordinate={DROP_COORDINATE} anchor={{ x: 0.5, y: 1 }} tracksViewChanges>
            <SearchEndpointPinSvg color="#E53935" />
          </Marker>
        </MapView>

        <Pressable onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#111827" />
        </Pressable>

        <View style={styles.locationPillLeft}>
          <View style={styles.locationPillDot} />
          <Text style={styles.locationPillText}>{pickupLabel}</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color="#667085" />
        </View>

        <View style={styles.locationPillRight}>
          <View style={styles.locationPillDotOrange} />
          <Text style={styles.locationPillText}>{dropLabel}</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color="#667085" />
        </View>

        <Pressable style={styles.gpsButton} onPress={handleRecenter}>
          <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#111827" />
        </Pressable>

        <RideBottomSheet snapPoints={["25%", "50%", "90%"]} initialIndex={1}>
          <BottomSheetFlatList
            data={rides}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
            ListHeaderComponent={
              <>
                <View style={styles.tripCard}>
                  <View style={styles.tripRail}>
                    <View style={styles.tripPickupDot} />
                    <View style={styles.tripRailLine} />
                    <View style={styles.tripDropDot} />
                  </View>

                  <View style={styles.tripLocations}>
                    <Text style={styles.tripLocationTitle}>{pickupLabel}</Text>
                    <Text style={styles.tripLocationSub}>Koramangala, Bengaluru</Text>
                    <View style={styles.tripGap} />
                    <Text style={styles.tripLocationTitle}>Hitech City, Hyderabad</Text>
                    <Text style={styles.tripLocationSub}>Telangana, India</Text>
                  </View>

                  <View style={styles.tripMeta}>
                    <Text style={styles.tripDistance}>18.6 km</Text>
                    <Text style={styles.tripTime}>35 mins</Text>
                    <Text style={styles.tripRoute}>via Outer Ring Road</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Recommended rides</Text>
              </>
            }
            renderItem={({ item }) => (
              <CompactRideCard
                item={item}
                selected={item.key === selectedKey}
                onPress={() => handleSelectRide(item)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.rideGap} />}
            ListFooterComponent={
              <View style={styles.footerWrap}>
                <PremiumCard onPress={() => onSeePrices?.(selectedRide)} style={styles.seePricesButton}>
                  <View style={styles.seePricesButtonInner}>
                    <Text style={styles.seePricesButtonText}>See Prices</Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
                  </View>
                </PremiumCard>
              </View>
            }
          />
        </RideBottomSheet>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0,
    zIndex: 20
  },
  capacityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  capacityText: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "700"
  },
  footerWrap: {
    marginTop: 10,
    paddingBottom: 16
  },
  gpsButton: {
    position: "absolute",
    right: 16,
    bottom: MAP_HEIGHT - 58,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0,
    zIndex: 15
  },
  locationPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A34A"
  },
  locationPillDotOrange: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F97316"
  },
  locationPillLeft: {
    position: "absolute",
    top: 86,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0,
    zIndex: 15
  },
  locationPillRight: {
    position: "absolute",
    top: 136,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0,
    zIndex: 15
  },
  locationPillText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "700"
  },
  mapSection: {
    height: MAP_HEIGHT,
    position: "relative"
  },
  pinInner: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  pinOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  pinWrap: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center"
  },
  rideCard: {
    minHeight: 96,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3
    },
    elevation: 0
  },
  rideCardSelected: {
    backgroundColor: "COLORS.primaryLight",
    borderColor: COLORS.primary,
    elevation: 0
  },
  rideCopy: {
    flex: 1,
    paddingRight: 8,
    paddingLeft: 10
  },
  rideEta: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6
  },
  rideGap: {
    height: 10
  },
  rideImage: {
    backgroundColor: "#EEF1F5",
    borderRadius: 12
  },
  rideImageAuto: {
    width: 62,
    height: 46
  },
  rideImageBike: {
    width: 68,
    height: 46
  },
  rideImageMini: {
    width: 68,
    height: 44
  },
  rideImagePrime: {
    width: 70,
    height: 44
  },
  rideImageXl: {
    width: 74,
    height: 46
  },
  rideOldPrice: {
    color: "#98A2B3",
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "line-through",
    marginTop: 2
  },
  ridePrice: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800"
  },
  rideRight: {
    alignItems: "flex-end",
    marginRight: 10
  },
  rideSubtitle: {
    color: "#667085",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
    lineHeight: 15
  },
  rideTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800"
  },
  rideTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  safe: {
    flex: 1,
    backgroundColor: "#F7F8FA"
  },
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FA"
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 10
  },
  seePricesButton: {
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    minHeight: 56
  },
  seePricesButtonInner: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  seePricesButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800"
  },
  selectionArea: {
    width: 22,
    alignItems: "flex-end",
    justifyContent: "center"
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 26
  },
  tripCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0
  },
  tripDistance: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800"
  },
  tripDropDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F97316"
  },
  tripGap: {
    height: 12
  },
  tripLocations: {
    flex: 1,
    paddingRight: 10
  },
  tripLocationSub: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2
  },
  tripLocationTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800"
  },
  tripMeta: {
    alignItems: "flex-end",
    justifyContent: "center"
  },
  tripPickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A34A"
  },
  tripRail: {
    width: 14,
    alignItems: "center",
    marginRight: 10
  },
  tripRailLine: {
    width: 1,
    flex: 1,
    minHeight: 30,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 1,
    marginVertical: 4
  },
  tripRoute: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 3
  },
  tripTime: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 3
  }
});
