import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import { COLORS } from "../../theme/colors";
import { SHADOWS } from "../../theme/shadows";
import { fetchStreetRoute } from "../../routeUtils";
import { SearchEndpointPinSvg, StatusBarMapScrim } from "../../components/RideRouteMap";

const PRIMARY = "#2563EB";
const PRIMARY_DARK = "#1D4ED8";
const PRIMARY_LIGHT = "#EFF6FF";
const BACKGROUND = COLORS.background;
const SURFACE = COLORS.surface;
const CARD = COLORS.card;
const BORDER = COLORS.border;
const TEXT = COLORS.textPrimary;
const MUTED = COLORS.textSecondary;
const SUCCESS = COLORS.success;

const AUTO_IMAGE = require("../../assets/vehicles/auto.png");

const DEFAULT_PICKUP = {
  latitude: 12.9352,
  longitude: 77.6245,
};

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f5f7fb" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#a1a1aa" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e5e7eb" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

const DRIVER = {
  name: "Rohit Sharma",
  rating: "4.8",
  vehicle: "Vento • KA 53 MA 8092",
};

const OTP = ["5", "3", "9", "1"];

function buildRoute(pickupCoord) {
  const vehicleCoord = {
    latitude: (pickupCoord?.latitude || DEFAULT_PICKUP.latitude) - 0.0018,
    longitude: (pickupCoord?.longitude || DEFAULT_PICKUP.longitude) - 0.0014,
  };

  const mid1 = {
    latitude: vehicleCoord.latitude + 0.0006,
    longitude: vehicleCoord.longitude + 0.00035,
  };

  const mid2 = {
    latitude: pickupCoord.latitude - 0.0002,
    longitude: pickupCoord.longitude - 0.0001,
  };

  return [vehicleCoord, mid1, mid2, pickupCoord || DEFAULT_PICKUP];
}

export default function ArrivedScreen({
  pickupText = "12th Main Road, Koramangala 4th Block",
  pickupCoord = DEFAULT_PICKUP,
  onBack,
  onLocation,
  onMessage,
  onCall,
  onCancel,
  onStartTrip,
}) {
  const { height } = useWindowDimensions();
  const mapRef = useRef(null);
  const fitDone = useRef(false);
  const pulse = useRef(new Animated.Value(0)).current;

  const fallbackRoute = useMemo(() => buildRoute(pickupCoord), [pickupCoord]);
  const vehicleCoord = fallbackRoute[0] || pickupCoord || DEFAULT_PICKUP;
  const [streetRoute, setStreetRoute] = useState([]);
  const [cameraRegion, setCameraRegion] = useState({
    latitude: pickupCoord.latitude,
    longitude: pickupCoord.longitude,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });
  const route = useMemo(
    () => (streetRoute.length >= 2 ? streetRoute : fallbackRoute),
    [fallbackRoute, streetRoute]
  );

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop?.();
  }, [pulse]);

  useEffect(() => {
    fitDone.current = false;
  }, [pickupCoord.latitude, pickupCoord.longitude]);

  useEffect(() => {
    let cancelled = false;

    fetchStreetRoute(vehicleCoord, pickupCoord)
      .then((result) => {
        if (cancelled) return;
        const nextRoute = Array.isArray(result?.routeCoords) ? result.routeCoords : [];
        setStreetRoute(nextRoute.length >= 2 ? nextRoute : []);
      })
      .catch(() => {
        if (!cancelled) setStreetRoute([]);
      });

    return () => {
      cancelled = true;
    };
  }, [pickupCoord.latitude, pickupCoord.longitude, vehicleCoord.latitude, vehicleCoord.longitude]);

  useEffect(() => {
    if (!mapRef.current || route.length <= 1 || fitDone.current) return;

    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(route, {
        edgePadding: { top: 130, right: 70, bottom: 220, left: 70 },
        animated: false,
      });
      fitDone.current = true;
    }, 120);

    return () => clearTimeout(timer);
  }, [route]);

  const handleZoom = useCallback((direction) => {
    const base = cameraRegion || {
      latitude: pickupCoord.latitude,
      longitude: pickupCoord.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    };
    const factor = direction === "in" ? 0.58 : 1.58;
    const nextRegion = {
      ...base,
      latitudeDelta: Math.max(0.002, Math.min(0.18, (base.latitudeDelta || 0.03) * factor)),
      longitudeDelta: Math.max(0.002, Math.min(0.18, (base.longitudeDelta || 0.03) * factor)),
    };

    setCameraRegion(nextRegion);
    mapRef.current?.animateToRegion?.(nextRegion, 260);
  }, [cameraRegion, pickupCoord.latitude, pickupCoord.longitude]);

  useEffect(() => {
    if (!onStartTrip) return undefined;

    const timer = setTimeout(() => {
      onStartTrip();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onStartTrip]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" hidden={false} translucent={false} backgroundColor="#FFFFFF" />
      <View style={styles.screen}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: pickupCoord.latitude,
            longitude: pickupCoord.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
          customMapStyle={MAP_STYLE}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          showsPointsOfInterest={false}
          showsCompass={false}
          rotateEnabled={false}
          pitchEnabled={false}
          moveOnMarkerPress={false}
          onRegionChangeComplete={setCameraRegion}
        >
          <Polyline coordinates={route} strokeWidth={2.8} strokeColor="#1754E8" lineCap="round" lineJoin="round" />

          <Marker coordinate={pickupCoord || DEFAULT_PICKUP} anchor={{ x: 0.5, y: 1 }}>
            <SearchEndpointPinSvg color="#1754E8" />
          </Marker>

          <Marker coordinate={vehicleCoord} anchor={{ x: 0.5, y: 0.5 }}>
            <Animated.View
              style={[
                styles.vehicleWrap,
                {
                  transform: [
                    {
                      scale: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.05],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.vehicleHalo} />
              <View style={styles.vehicleBody}>
                <Image source={AUTO_IMAGE} style={styles.vehicleImage} resizeMode="contain" />
              </View>
            </Animated.View>
          </Marker>
        </MapView>

        <StatusBarMapScrim />

        <View style={styles.headerShell}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <MaterialIcons name="chevron-left" size={22} color={TEXT} />
          </Pressable>
        </View>

        <View style={styles.mapPickupChip}>
          <View style={styles.chipIcon}>
            <MaterialIcons name="place" size={13} color={PRIMARY} />
          </View>
          <View>
            <Text style={styles.chipLabel}>Pickup</Text>
            <Text style={styles.chipValue} numberOfLines={1}>
              {pickupText}
            </Text>
          </View>
        </View>

        <View pointerEvents="box-none" style={styles.mapControls}>
          <View style={styles.zoomControlStack}>
            <Pressable style={({ pressed }) => [styles.zoomButton, pressed && styles.mapControlPressed]} onPress={() => handleZoom("in")}>
              <MaterialIcons name="add" size={21} color={TEXT} />
            </Pressable>
            <View style={styles.zoomDivider} />
            <Pressable style={({ pressed }) => [styles.zoomButton, pressed && styles.mapControlPressed]} onPress={() => handleZoom("out")}>
              <MaterialIcons name="remove" size={21} color={TEXT} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.sheet, { height: Math.round(height * 0.48) }]}>
          <View style={styles.handle} />

          <View style={styles.otpBlock}>
            <Text style={styles.otpTitle}>Share this OTP with the captain to start your ride</Text>
            <View style={styles.otpRow}>
              {OTP.map((digit) => (
                <View key={digit} style={styles.otpBox}>
                  <Text style={styles.otpDigit}>{digit}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.driverCard}>
            <View style={styles.driverLeft}>
              <View style={styles.avatar}>
                <Image source={AUTO_IMAGE} style={styles.avatarImage} resizeMode="contain" />
              </View>
              <View style={styles.driverCopy}>
                <Text style={styles.driverName}>{DRIVER.name}</Text>
                <View style={styles.ratingRow}>
                  <MaterialIcons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{DRIVER.rating}</Text>
                </View>
                <Text style={styles.driverVehicle}>{DRIVER.vehicle}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton} onPress={onMessage}>
              <MaterialIcons name="chat-bubble-outline" size={20} color={PRIMARY} />
              <Text style={styles.actionText}>Message</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={onCall}>
              <MaterialIcons name="call" size={20} color={PRIMARY} />
              <Text style={styles.actionText}>Call</Text>
            </Pressable>
          </View>

          <Pressable style={styles.cancelRow} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel Ride</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: PRIMARY_LIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8FF"
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16
  },
  actionText: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY_DARK
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  avatarImage: {
    width: 40,
    height: 26
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0
  },
  cancelRow: {
    alignItems: "flex-end"
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.danger
  },
  chipIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center"
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: MUTED
  },
  chipValue: {
    marginTop: 1,
    maxWidth: 190,
    fontSize: 12.5,
    fontWeight: "800",
    color: TEXT
  },
  driverCard: {
    backgroundColor: BACKGROUND,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0
  },
  driverCopy: {
    flex: 1
  },
  driverLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1
  },
  driverName: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT
  },
  driverVehicle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "500",
    color: MUTED
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
    marginBottom: 14
  },
  headerCenter: {
    alignItems: "center"
  },
  headerShell: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 25,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0
  },
  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "500",
    color: MUTED,
    textAlign: "center"
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT,
    lineHeight: 24
  },
  mapControlPressed: {
    opacity: 0.68,
    transform: [{ scale: 0.97 }]
  },
  mapControls: {
    position: "absolute",
    right: 16,
    bottom: 168,
    zIndex: 24,
    alignItems: "center"
  },
  mapPickupChip: {
    position: "absolute",
    left: 16,
    top: 112,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5
    },
    elevation: 0
  },
  zoomButton: {
    width: 42,
    height: 39,
    alignItems: "center",
    justifyContent: "center"
  },
  zoomControlStack: {
    marginTop: 10,
    width: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.98)",
    overflow: "hidden",
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0
  },
  zoomDivider: {
    height: 1,
    marginHorizontal: 9,
    backgroundColor: "#ECEEF2"
  },
  otpBlock: {
    alignItems: "center",
    marginBottom: 16
  },
  otpBox: {
    width: 58,
    height: 62,
    borderRadius: 18,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER
  },
  otpDigit: {
    fontSize: 28,
    fontWeight: "800",
    color: PRIMARY_DARK
  },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  otpTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
    color: TEXT,
    textAlign: "center",
    paddingHorizontal: 10
  },
  pickupDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF"
  },
  pickupGlow: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(22,163,74,0.18)"
  },
  pickupHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginTop: -1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.success,
    shadowOpacity: 0,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 0
    },
    elevation: 0
  },
  pickupStem: {
    width: 10,
    height: 12,
    borderRadius: 5,
    backgroundColor: COLORS.success,
    opacity: 0.96
  },
  pickupWrap: {
    alignItems: "center",
    justifyContent: "center"
  },
  ratingRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT
  },
  safe: {
    flex: 1,
    backgroundColor: BACKGROUND
  },
  screen: {
    flex: 1,
    backgroundColor: SURFACE
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 20,
    ...SHADOWS.sheet
  },
  vehicleBody: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0
  },
  vehicleHalo: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(99,102,241,0.16)"
  },
  vehicleImage: {
    width: 36,
    height: 26
  },
  vehicleWrap: {
    alignItems: "center",
    justifyContent: "center"
  }
});
