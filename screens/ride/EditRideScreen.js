import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker, Polyline } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { fetchStreetRoute } from "../../routeUtils";
import { SearchEndpointPinSvg, StatusBarMapScrim } from "../../components/RideRouteMap";

const PICKUP = { latitude: 12.9352, longitude: 77.6245 };
const STOP1 = { latitude: 12.9385, longitude: 77.6312 };
const STOP2 = { latitude: 12.9434, longitude: 77.6368 };
const DROP = { latitude: 12.9488, longitude: 77.6427 };
const ROUTE_BLUE = "#1754E8";

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f5f7fb" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e5e7eb" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

function FieldRow({ color, title, subtitle, dashed = false, icon }) {
  return (
    <View style={[styles.fieldRow, dashed && styles.dashedRow]}>
      <View style={[styles.dotWrap, { borderColor: color }]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
      <View style={styles.fieldCopy}>
        <Text style={styles.fieldTitle}>{title}</Text>
        <Text style={styles.fieldSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name={icon} size={18} color="#9CA3AF" />
    </View>
  );
}

export default function EditRideScreen({ onBack, onUpdateRide }) {
  const mapRef = useRef(null);
  const fallbackRoute = useMemo(() => [PICKUP, STOP1, STOP2, DROP], []);
  const [streetRoute, setStreetRoute] = useState([]);
  const [cameraRegion, setCameraRegion] = useState({
    latitude: 12.941,
    longitude: 77.635,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });
  const route = useMemo(
    () => (streetRoute.length >= 2 ? streetRoute : fallbackRoute),
    [fallbackRoute, streetRoute]
  );

  useEffect(() => {
    let cancelled = false;
    const segments = fallbackRoute.slice(0, -1).map((start, index) => (
      fetchStreetRoute(start, fallbackRoute[index + 1])
        .then((result) => (Array.isArray(result?.routeCoords) ? result.routeCoords : []))
        .catch(() => [])
    ));

    Promise.all(segments).then((parts) => {
      if (cancelled) return;
      const merged = parts.reduce((acc, part) => {
        if (!Array.isArray(part) || part.length < 2) return acc;
        return acc.length ? acc.concat(part.slice(1)) : part;
      }, []);
      setStreetRoute(merged.length >= 2 ? merged : []);
    });

    return () => {
      cancelled = true;
    };
  }, [fallbackRoute]);

  const handleZoom = useCallback((direction) => {
    const base = cameraRegion || {
      latitude: 12.941,
      longitude: 77.635,
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
  }, [cameraRegion]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" hidden={false} translucent={false} backgroundColor="#FFFFFF" />
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={10} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#111827" />
          </Pressable>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <FieldRow
              color="#1754E8"
              title="Pickup"
              subtitle="Koramangala 4th Block, Bangalore"
              icon="chevron-down"
            />

            <View style={styles.divider} />

            <FieldRow
              color="#4D7DFF"
              title="Stop 1"
              subtitle="MG Road, Bangalore"
              icon="chevron-down"
            />

            <View style={styles.divider} />

            <View style={[styles.fieldRow, styles.dashedRow]}>
              <View style={[styles.dotWrap, styles.dashedDotWrap]}>
                <View style={[styles.dot, { backgroundColor: "#8E7CFF" }]} />
              </View>
              <View style={styles.fieldCopy}>
                <Text style={styles.fieldTitle}>Stop 2</Text>
                <Text style={styles.fieldSubtitle}>Add another stop (optional)</Text>
              </View>
              <MaterialCommunityIcons name="plus" size={18} color="#8E7CFF" />
            </View>

            <View style={styles.divider} />

            <FieldRow
              color="#EF4444"
              title="Drop"
              subtitle="Hitech City, Hyderabad"
              icon="chevron-down"
            />

            <Pressable style={styles.addStop}>
              <MaterialCommunityIcons name="plus" size={16} color="#6C5CE7" />
              <Text style={styles.addStopText}>Add Stop</Text>
            </Pressable>
          </View>

          <View style={styles.mapCard}>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: 12.941,
                longitude: 77.635,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
              customMapStyle={MAP_STYLE}
              showsCompass={false}
              showsTraffic={false}
              rotateEnabled={false}
              pitchEnabled={false}
              zoomEnabled
              onRegionChangeComplete={setCameraRegion}
            >
              <Polyline coordinates={route} strokeColor={ROUTE_BLUE} strokeWidth={2.8} lineCap="round" lineJoin="round" />
              <Marker coordinate={PICKUP} anchor={{ x: 0.5, y: 1 }}>
                <SearchEndpointPinSvg color="#1754E8" />
              </Marker>
              <Marker coordinate={STOP1} anchor={{ x: 0.5, y: 1 }}>
                <View style={[styles.mapMarker, styles.stopMarker]}>
                  <MaterialCommunityIcons name="map-marker" size={28} color="#4D7DFF" />
                </View>
              </Marker>
              <Marker coordinate={STOP2} anchor={{ x: 0.5, y: 1 }}>
                <View style={[styles.mapMarker, styles.stopMarker]}>
                  <MaterialCommunityIcons name="map-marker" size={28} color="#8E7CFF" />
                </View>
              </Marker>
              <Marker coordinate={DROP} anchor={{ x: 0.5, y: 1 }}>
                <SearchEndpointPinSvg color="#E53935" />
              </Marker>
            </MapView>

            <StatusBarMapScrim />

            <View pointerEvents="box-none" style={styles.mapControls}>
              <View style={styles.zoomControlStack}>
                <Pressable style={({ pressed }) => [styles.zoomButton, pressed && styles.mapControlPressed]} onPress={() => handleZoom("in")}>
                  <MaterialCommunityIcons name="plus" size={20} color="#111827" />
                </Pressable>
                <View style={styles.zoomDivider} />
                <Pressable style={({ pressed }) => [styles.zoomButton, pressed && styles.mapControlPressed]} onPress={() => handleZoom("out")}>
                  <MaterialCommunityIcons name="minus" size={20} color="#111827" />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.fareCard}>
            <Text style={styles.fareLabel}>Updated Fare</Text>
            <Text style={styles.fareValue}>₹220</Text>
            <Text style={styles.fareNote}>Fare updated based on stops</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={onUpdateRide}>
            <LinearGradient
              colors={["#6C5CE7", "#8E7CFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>Update Ride</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addStop: {
    marginTop: 14,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#8E7CFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(142,124,255,0.05)"
  },
  addStopText: {
    color: "#6C5CE7",
    fontSize: 13.5,
    fontWeight: "800"
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0,
    marginBottom: 14
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20
  },
  cta: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6C5CE7",
    shadowOpacity: 0,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6
    },
    elevation: 0
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "800"
  },
  dashedDotWrap: {
    borderColor: "#8E7CFF"
  },
  dashedRow: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D8D5FF",
    borderRadius: 14,
    padding: 12,
    marginVertical: 10
  },
  divider: {
    height: 1,
    backgroundColor: "#EAECF0",
    marginVertical: 14,
    marginHorizontal: 8
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  dotWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center"
  },
  dropMarker: {
    width: 28,
    height: 28
  },
  fareCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0
  },
  fareLabel: {
    color: "#6B7280",
    fontSize: 12.5,
    fontWeight: "700"
  },
  fareNote: {
    marginTop: 4,
    color: "#8B8FA3",
    fontSize: 12.5,
    fontWeight: "600"
  },
  fareValue: {
    marginTop: 6,
    color: "#111827",
    fontSize: 22,
    fontWeight: "900"
  },
  fieldCopy: {
    flex: 1,
    minWidth: 0
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  fieldSubtitle: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 12.5,
    fontWeight: "600"
  },
  fieldTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800"
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 18
  },
  header: {
    height: 58,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1EDF9"
  },
  headerSpacer: {
    width: 40,
    height: 40
  },
  headerTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800"
  },
  mapCard: {
    height: 220,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0,
    marginBottom: 14
  },
  mapControlPressed: {
    opacity: 0.68,
    transform: [{ scale: 0.97 }]
  },
  mapControls: {
    position: "absolute",
    right: 10,
    bottom: 10,
    zIndex: 10,
    alignItems: "center"
  },
  mapMarker: {
    alignItems: "center",
    justifyContent: "center"
  },
  markerInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF"
  },
  pickupMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#1754E8",
    borderWidth: 3,
    borderColor: "#FFFFFF"
  },
  root: {
    flex: 1,
    backgroundColor: "#F6F4FF"
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  stopMarker: {
    width: 28,
    height: 28
  },
  zoomButton: {
    width: 38,
    height: 34,
    alignItems: "center",
    justifyContent: "center"
  },
  zoomControlStack: {
    marginTop: 8,
    width: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.98)",
    overflow: "hidden",
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0
  },
  zoomDivider: {
    height: 1,
    marginHorizontal: 8,
    backgroundColor: "#ECEEF2"
  }
});
