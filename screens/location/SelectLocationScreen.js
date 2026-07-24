import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import RideRouteMap from "../../components/RideRouteMap";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = Math.max(322, Math.round(SCREEN_HEIGHT * 0.38));

const DEFAULT_PICKUP_COORD = {
  latitude: 17.3898,
  longitude: 78.4989,
};

const DEFAULT_DROP_COORD = {
  latitude: 17.4337,
  longitude: 78.5016,
};

const LOCATION_CONFIG = {
  pickup: {
    title: "Confirm pickup",
    eyebrow: "Pickup location",
    location: "Kacheguda Railwaystation,Hyderabad",
    markerColor: "#139B48",
    confirmText: "Confirm Pickup",
    helper: "Move the pin to adjust your pickup point",
  },
  drop: {
    title: "Confirm drop",
    eyebrow: "Drop location",
    location: "Secundrabad Railwaystation,Hyderabad",
    markerColor: "#D91F2A",
    confirmText: "Confirm Drop",
    helper: "Move the pin to adjust your drop point",
  },
  address: {
    title: "Set delivery pin",
    eyebrow: "Delivery address",
    location: "Kacheguda Railway Station, Hyderabad",
    markerColor: "#138A36",
    confirmText: "Confirm delivery location",
    helper: "Place the pin at the exact delivery entrance",
  },
};

function MapBackdrop() {
  return (
    <View style={styles.mapBackdrop}>
      <View style={[styles.mapBlock, styles.mapBlockOne]} />
      <View style={[styles.mapBlock, styles.mapBlockTwo]} />
      <View style={[styles.mapBlock, styles.mapBlockThree]} />
      <View style={[styles.road, styles.roadPrimary]} />
      <View style={[styles.road, styles.roadSecondary]} />
      <View style={[styles.road, styles.roadTertiary]} />
      <View style={styles.routeLine} />
    </View>
  );
}

export default function SelectLocationScreen({
  mode = "pickup",
  pickupCoord = DEFAULT_PICKUP_COORD,
  dropCoord = DEFAULT_DROP_COORD,
  mapRegion,
  onBack = () => {},
  onConfirm = () => {},
}) {
  const config = LOCATION_CONFIG[mode] || LOCATION_CONFIG.pickup;
  const sheetTranslateY = useRef(new Animated.Value(26)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const pinLift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pinLift, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pinLift, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, [pinLift, sheetOpacity, sheetTranslateY]);

  const pinStyle = {
    transform: [
      {
        translateY: pinLift.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -5],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.screen}>
        <View style={styles.mapBackdrop}>
          <RideRouteMap
            pickupCoord={pickupCoord}
            dropCoord={dropCoord}
            mapRegion={mapRegion}
            routeColor="#1754E8"
            routeWidth={2.8}
            showUserLocation={false}
            showMyLocationButton={false}
            interactive
            edgePadding={{ top: 112, right: 70, bottom: SHEET_HEIGHT + 112, left: 70 }}
          />
        </View>

        <View style={styles.topControls}>
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
            <MaterialCommunityIcons name="arrow-left" size={27} color="#111827" />
          </Pressable>

          <View style={styles.topCopy}>
            <Text style={styles.topTitle}>{config.title}</Text>
            <Text style={styles.topSubtitle}>Select the exact point on map</Text>
          </View>
        </View>

        <View style={styles.centerPinWrap} pointerEvents="none">
          <Animated.View style={[styles.pinBubble, pinStyle, { backgroundColor: config.markerColor }]}>
            <MaterialCommunityIcons name="map-marker" size={30} color="#FFFFFF" />
          </Animated.View>
          <View style={styles.pinShadow} />
        </View>

        <Pressable style={styles.locateButton} hitSlop={10}>
          <MaterialCommunityIcons name="crosshairs-gps" size={21} color="#111827" />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            {
              opacity: sheetOpacity,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <View style={styles.handle} />

          <Text style={styles.sheetTitle}>{config.title}</Text>
          <Text style={styles.sheetHelper}>{config.helper}</Text>

          <View style={styles.locationCard}>
            <View style={[styles.marker, { borderColor: config.markerColor }]}>
              <View style={[styles.markerInner, { backgroundColor: config.markerColor }]} />
            </View>

            <View style={styles.locationCopy}>
              <Text style={styles.locationEyebrow}>{config.eyebrow}</Text>
              <Text numberOfLines={2} style={styles.locationText}>
                {config.location}
              </Text>
            </View>

            <MaterialCommunityIcons name="pencil-outline" size={19} color="#667085" />
          </View>

          <Pressable
            style={styles.confirmBtn}
            onPress={() =>
              onConfirm({
                mode,
                ...config,
                location: config.location,
                pickupCoord: mode === "pickup" || mode === "address" ? pickupCoord : DEFAULT_PICKUP_COORD,
                dropCoord: mode === "drop" ? dropCoord : DEFAULT_DROP_COORD,
              })
            }
          >
            <Text style={styles.confirmText}>{config.confirmText}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    right: -20
  },
  centerPinWrap: {
    position: "absolute",
    top: "38%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2
  },
  confirmBtn: {
    height: 50,
    borderRadius: 28,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600"
  },
  handle: {
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D6DAE2",
    alignSelf: "center",
    marginBottom: 14
  },
  locateButton: {
    position: "absolute",
    right: 18,
    bottom: SHEET_HEIGHT + 22,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#101828",
    shadowOpacity: 0,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 0,
    zIndex: 4
  },
  locationCard: {
    marginTop: 14,
    minHeight: 86,
    borderRadius: 20,
    backgroundColor: "#F7F9FC",
    borderWidth: 1,
    borderColor: "#E4EAF2",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center"
  },
  locationCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    paddingRight: 10
  },
  locationEyebrow: {
    color: "#667085",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  locationText: {
    marginTop: 4,
    color: "#111827",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800"
  },
  mapBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#EEF3F8"
  },
  mapBlock: {
    position: "absolute",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(203,213,225,0.52)"
  },
  mapBlockOne: {
    top: 116,
    left: 18,
    width: 128,
    height: 96,
    transform: [{
      rotate: "-9deg"
    }]
  },
  mapBlockThree: {
    top: 258,
    left: 54,
    width: 188,
    height: 118,
    transform: [{
      rotate: "5deg"
    }]
  },
  mapBlockTwo: {
    top: 78,
    right: 22,
    width: 154,
    height: 118,
    transform: [{
      rotate: "7deg"
    }]
  },
  marker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  markerInner: {
    width: 5,
    height: 5,
    borderRadius: 3
  },
  pinBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#101828",
    shadowOpacity: 0,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 0
  },
  pinShadow: {
    marginTop: 7,
    width: 28,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.18)"
  },
  road: {
    position: "absolute",
    height: 32,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E2EF"
  },
  roadPrimary: {
    top: 224,
    left: -40,
    right: -40,
    transform: [{
      rotate: "-13deg"
    }]
  },
  roadSecondary: {
    top: 354,
    left: -30,
    right: 46,
    height: 24,
    transform: [{
      rotate: "19deg"
    }]
  },
  roadTertiary: {
    top: 120,
    left: 126,
    right: -44,
    height: 22,
    transform: [{
      rotate: "38deg"
    }]
  },
  routeLine: {
    position: "absolute",
    top: 238,
    left: 86,
    right: 82,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#1754E8",
    opacity: 0.9,
    transform: [{
      rotate: "-13deg"
    }]
  },
  safe: {
    flex: 1,
    backgroundColor: "#F5F7FB"
  },
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    overflow: "hidden"
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: SHEET_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 22,
    shadowColor: "#101828",
    shadowOpacity: 0,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: -8
    },
    elevation: 0,
    bottom: -30
  },
  sheetHelper: {
    marginTop: -3,
    color: "#667085",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500"
  },
  sheetTitle: {
    color: "#111827",
    fontSize: 18,
    lineHeight: 27,
    fontWeight: "800"
  },
  topCopy: {
    flex: 1,
    marginLeft: 6
  },
  topSubtitle: {
    marginTop: 1,
    color: "#667085",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "500"
  },
  topTitle: {
    color: "#111827",
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "800"
  }
});
