import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import AppIcon from "../../components/AppIcon";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { formatDistanceText, haversineMeters } from "../../routeUtils";
import { HYDERABAD_METRO_STATIONS } from "./hyderabadMetroStations";

const BLUE = "#1754D1";
const DEFAULT_STATION = HYDERABAD_METRO_STATIONS.find((station) => station.name === "Ameerpet");
const formatStationName = (name) => /metro station$/i.test(name) ? name : `${name} Metro Station`;
const ROUTES = [
  { id: "r1", from: "Ameerpet", to: "Raidurg", line: "Blue line", time: "24 min", stops: "12 stops", fare: "₹35", color: "#1769E0" },
  { id: "r2", from: "Miyapur", to: "LB Nagar", line: "Red line", time: "52 min", stops: "27 stops", fare: "₹60", color: "#DF4444" },
  { id: "r3", from: "JBS Parade Ground", to: "MGBS", line: "Green line", time: "18 min", stops: "9 stops", fare: "₹30", color: "#17945A" },
];

function StationField({ label, value, placeholder, onChangeText, onFocus }) {
  return (
    <View style={styles.stationField}>
      <Text style={styles.stationLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={placeholder}
        placeholderTextColor="#A0A6AE"
        selectionColor="#252B32"
        style={styles.stationInput}
      />
    </View>
  );
}

function RouteRow({ route, border }) {
  return (
    <Pressable style={({ pressed }) => [styles.routeRow, border && styles.routeBorder, pressed && styles.pressed]}>
      <View style={[styles.lineDot, { backgroundColor: route.color }]} />
      <View style={styles.routeCopy}>
        <Text style={styles.routeTitle} numberOfLines={1}>{route.from} → {route.to}</Text>
        <Text style={styles.routeMeta}>{route.line} · {route.stops}</Text>
      </View>
      <View style={styles.routeDetails}>
        <Text style={styles.routeTime}>{route.time}</Text>
        <Text style={styles.routeFare}>{route.fare}</Text>
      </View>
      <AppIcon name="chevronRight" size={15} color="#A1A7AF" />
    </Pressable>
  );
}

export default function MetroScreen({ onFindRoute }) {
  const [from, setFrom] = useState(DEFAULT_STATION.name);
  const [locationState, setLocationState] = useState("locating");
  const [nearestStation, setNearestStation] = useState(DEFAULT_STATION);
  const [stationDistance, setStationDistance] = useState(Infinity);
  const [to, setTo] = useState("");
  const [activeStationField, setActiveStationField] = useState(null);
  const [routeError, setRouteError] = useState("");

  const locateNearestStation = useCallback(async () => {
    setLocationState("locating");

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setLocationState("denied");
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      const currentCoordinate = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude
      };
      const closest = HYDERABAD_METRO_STATIONS.reduce((best, station) => {
        const distance = haversineMeters(currentCoordinate, station);
        return distance < best.distance ? { station, distance } : best;
      }, { station: DEFAULT_STATION, distance: Infinity });

      setNearestStation(closest.station);
      setStationDistance(closest.distance);
      setFrom(closest.station.name);
      setLocationState("ready");
    } catch {
      setLocationState("error");
    }
  }, []);

  useEffect(() => {
    locateNearestStation();
  }, [locateNearestStation]);

  const walkMinutes = useMemo(
    () => Number.isFinite(stationDistance) ? Math.max(2, Math.ceil(stationDistance / 75)) : null,
    [stationDistance]
  );
  const locationTitle =
    locationState === "locating"
      ? "Finding nearest metro"
      : locationState === "ready"
        ? `${walkMinutes} min walk`
        : "Choose nearest metro";
  const locationSubtitle =
    locationState === "locating"
      ? "Checking your current location..."
      : locationState === "ready"
        ? `Nearest: ${formatStationName(nearestStation.name)}`
        : "Location unavailable · Enter FROM manually";
  const distanceText =
    locationState === "ready" ? formatDistanceText(stationDistance) : "Refresh";
  const canFindRoute = from.trim().length > 0 && to.trim().length > 0;
  const activeQuery = activeStationField === "from" ? from : activeStationField === "to" ? to : "";
  const stationSuggestions = useMemo(() => {
    const query = activeQuery.trim().toLowerCase();
    if (!activeStationField || query.length === 0) return [];

    const oppositeStation = activeStationField === "from" ? to : from;
    return HYDERABAD_METRO_STATIONS
      .filter((station) => station.name.toLowerCase().includes(query))
      .filter((station) => station.name !== oppositeStation)
      .slice(0, 5);
  }, [activeQuery, activeStationField, from, to]);

  const selectStation = (stationName) => {
    if (activeStationField === "from") {
      setFrom(stationName);
    } else if (activeStationField === "to") {
      setTo(stationName);
    }
    setActiveStationField(null);
  };

  const swapStations = () => {
    setFrom(to);
    setTo(from);
    setActiveStationField(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" stickyHeaderIndices={[0]} contentContainerStyle={styles.content}>
        <View style={styles.stickyShell}>
          <LinearGradient
            colors={["#CCDDFC", "#CCDDFC", "#CCDDFC"]}
            locations={[0, 0.62, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.95, y: 1 }}
            style={styles.gradientHeader}
          >

            <View style={styles.header}>
              <Image
                source={require("../../assets/metro/hyderabad-metro-logo.png")}
                resizeMode="contain"
                style={styles.headerLogo}
              />
              <Text style={styles.title}>Metro</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Find nearest metro station"
              onPress={locateNearestStation}
              style={({ pressed }) => [styles.etaHeader, pressed && styles.pressed]}
            >
              <View style={styles.etaLocationIcon}>
                <AppIcon name="navigation-variant" size={21} color="#1D4ED8" />
              </View>
              <View style={styles.etaCopy}>
                <View style={styles.etaTitleRow}>
                  <Text style={styles.etaTitle}>{locationTitle}</Text>
                  <AppIcon name="chevron-down" size={14} color="#2B2B2B" />
                </View>
                <Text style={styles.etaAddress} numberOfLines={1}>{locationSubtitle}</Text>
              </View>
              <View style={styles.etaDistancePill}>
                <Text style={styles.etaDistance}>{distanceText}</Text>
              </View>
            </Pressable>
          </LinearGradient>

          <View style={styles.plannerShell}>
            <View style={styles.planner}>
              <View style={styles.stationRail}>
              <View style={[styles.stationDot, styles.startDot]} />
              <View style={styles.stationLine} />
              <View style={[styles.stationDot, styles.endDot]} />
            </View>
            <View style={styles.stationFields}>
              <StationField
                label="FROM"
                value={from}
                onChangeText={(text) => {
                  setFrom(text);
                  setRouteError("");
                  setActiveStationField("from");
                }}
                onFocus={() => setActiveStationField("from")}
                active={activeStationField === "from"}
                placeholder="Select station"
              />
              <View style={styles.divider} />
              <StationField
                label="TO"
                value={to}
                onChangeText={(text) => {
                  setTo(text);
                  setRouteError("");
                  setActiveStationField("to");
                }}
                onFocus={() => setActiveStationField("to")}
                active={activeStationField === "to"}
                placeholder="Select destination"
              />
            </View>
            <Pressable style={styles.swapButton} onPress={swapStations}>
              <AppIcon name="swap-vertical" size={18} color={BLUE} />
            </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => {
              if (!canFindRoute) {
                setRouteError("Enter destination station to find a route");
                setActiveStationField(!from.trim() ? "from" : "to");
                return;
              }
              setRouteError("");
              setActiveStationField(null);
              onFindRoute?.({
                from: from.trim(),
                to: to.trim(),
                nearestStation: nearestStation?.name,
                distanceText,
                walkMinutes,
              });
            }}
            style={({ pressed }) => [styles.findButton, !canFindRoute && styles.findButtonDisabled, pressed && canFindRoute && styles.findButtonPressed]}
          >
            <Text style={styles.findButtonText}>Find route</Text>
            <AppIcon name="forward" size={16} color="#FFFFFF" />
          </Pressable>
          {routeError ? <Text style={styles.routeError}>{routeError}</Text> : null}

          {activeStationField && stationSuggestions.length > 0 && (
            <View style={styles.suggestionsCard}>
              <View style={styles.suggestionsHeader}>
                <Text style={styles.suggestionsTitle}>{activeStationField === "from" ? "FROM station" : "TO station"}</Text>
                <Pressable onPress={() => setActiveStationField(null)} hitSlop={10}>
                  <Text style={styles.suggestionsClose}>Close</Text>
                </Pressable>
              </View>
              {stationSuggestions.map((station, index) => (
                <Pressable
                  key={station.name}
                  onPress={() => selectStation(station.name)}
                  style={({ pressed }) => [
                    styles.suggestionRow,
                    index > 0 && styles.suggestionBorder,
                    pressed && styles.pressed
                  ]}
                >
                  <View style={styles.suggestionIcon}>
                    <AppIcon name="metro" active size={15} color={BLUE} />
                  </View>
                  <View style={styles.suggestionCopy}>
                    <Text style={styles.suggestionName} numberOfLines={1}>{station.name}</Text>
                    <Text style={styles.suggestionMeta} numberOfLines={1}>Hyderabad Metro Station</Text>
                  </View>
                  <AppIcon name="chevronRight" size={15} color="#A1A7AF" />
                </Pressable>
              ))}
            </View>
          )}
        </View>


      </ScrollView>
      <View pointerEvents="none" style={styles.bottomSceneWrap}>
        <Image
          source={require("../../assets/metro/metro-bottom-scene.png")}
          resizeMode="cover"
          style={styles.bottomSceneImage}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomSceneImage: {
    width: "100%",
    height: 164
  },
  bottomSceneWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 88,
    height: 164,
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 1
  },
  content: {
    paddingBottom: 348
  },
  divider: {
    height: 1,
    marginVertical: 3,
    backgroundColor: "#E2E4E8"
  },
  endDot: {
    backgroundColor: "#E04444"
  },
  etaAddress: {
    marginTop: 4,
    color: "#6E7785",
    fontSize: 12,
    lineHeight: 22,
    fontWeight: "600"
  },
  etaCopy: {
    flex: 1,
    marginLeft: 2
  },
  etaDistance: {
    color: "#526071",
    fontSize: 14,
    lineHeight: 10,
    fontWeight: "800"
  },
  etaDistancePill: {
    paddingHorizontal: 8,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.76)"
  },
  etaHeader: {
    minHeight: 84,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center"
  },
  etaLocationIcon: {
    width: 40,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  etaTitle: {
    color: "#111111",
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "700"
  },
  etaTitleRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  findButton: {
    height: 46,
    marginHorizontal: 14,
    marginTop: 14,
    marginBottom: 2,
    borderRadius: 28,
    backgroundColor: BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7
  },
  findButtonDisabled: {
    opacity: 0.62
  },
  findButtonPressed: {
    opacity: 0.78
  },
  findButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900"
  },
  gradientCurveA: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -80,
    top: -112,
    backgroundColor: "rgba(57,111,227,0.10)"
  },
  gradientCurveB: {
    position: "absolute",
    width: 240,
    height: 120,
    borderRadius: 120,
    left: -104,
    bottom: -88,
    backgroundColor: "rgba(255,255,255,0.44)",
    transform: [{
      rotate: "-8deg"
    }]
  },
  gradientHeader: {
    position: "relative",
    overflow: "hidden",
    minHeight: 112,
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",bottom:-5,
    gap: 9
  },
  headerLogo: {
    width: 38,
    height: 38,
    bottom: -20
  },
  lineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginHorizontal: 5
  },

  nearby: {
    height: 66,
    marginHorizontal: 14,
    marginTop: 10,
    paddingHorizontal: 10,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#EAEBEE",
    flexDirection: "row",
    alignItems: "center"
  },
  nearbyCopy: {
    flex: 1,
    marginLeft: 2
  },
  nearbyDistance: {
    marginRight: 6,
    color: "#747B84",
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "800"
  },
  nearbyIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center"
  },
  nearbyLabel: {
    color: "#9399A1",
    fontSize: 7,
    lineHeight: 19,
    fontWeight: "700"
  },
  nearbyTitle: {
    marginTop: 0,
    color: "#2B3138",
    fontSize: 10,
    lineHeight: 23,
    fontWeight: "900"
  },


  planner: {
    minHeight: 108,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F7F9FC",
    flexDirection: "row",
    alignItems: "center"
  },
  plannerShell: {
    marginHorizontal: 14,
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: "#dbdbdbff",
    overflow: "hidden",
    shadowColor: "#b3b3b3ff",
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5
    },
    elevation: 0
  },
  pressed: {
    opacity: 0.62
  },
  routeError: {
    marginTop: 8,
    marginHorizontal: 16,
    color: "#7A4B00",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700"
  },
  routeBorder: {
    borderTopWidth: 1,
    borderTopColor: "#ECEDEF"
  },
  routeCopy: {
    flex: 1,
    marginLeft: 7
  },
  routeDetails: {
    alignItems: "flex-end",
    marginRight: 8
  },
  routeFare: {
    marginTop: 3,
    color: "#8A9199",
    fontSize: 7,
    lineHeight: 9,
    fontWeight: "700"
  },
  routeList: {
    marginHorizontal: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ECEDEF"
  },
  routeMeta: {
    marginTop: 3,
    color: "#9198A0",
    fontSize: 7.5,
    lineHeight: 10,
    fontWeight: "600"
  },
  routeRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center"
  },
  routeTime: {
    color: "#39414A",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "900"
  },
  routeTitle: {
    color: "#2A3037",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900"
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  sectionHeader: {
    marginTop: 24,
    marginHorizontal: 14,
    marginBottom: 8,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: "#20252B",
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
    letterSpacing: -0.25
  },
  shortcut: {
    flex: 1,
    height: 52,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EAEBEE",
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  shortcutRow: {
    flexDirection: "row",
    marginHorizontal: 14,
    gap: 8,
    marginTop: 18
  },
  shortcutText: {
    flex: 1,
    color: "#343A42",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800"
  },
  startDot: {
    backgroundColor: "#1B9A5A"
  },
  stationDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  stationField: {
    minHeight: 32,
    justifyContent: "center",
    borderRadius: 10,
    paddingHorizontal: 3
  },

  stationFields: {
    flex: 1
  },
  stationInput: {
    height: 23,
    padding: 0,
    color: "#252B32",
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "700"
  },
  stationLabel: {
    color: "#969DA6",
    fontSize: 7,
    lineHeight: 9,
    fontWeight: "900",
    letterSpacing: 0.7
  },

  stationLine: {
    width: 1,
    height: 35,
    marginVertical: 3,
    borderLeftWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ADB4BE"
  },
  stationRail: {
    width: 18,
    alignItems: "center",
    marginRight: 8
  },
  suggestionBorder: {
    borderTopWidth: 1,
    borderTopColor: "#ECEEF2"
  },
  suggestionCopy: {
    flex: 1,
    marginLeft: 9,
    minWidth: 0
  },
  suggestionIcon: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center"
  },
  suggestionMeta: {
    marginTop: 1,
    color: "#87909C",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600"
  },
  suggestionName: {
    color: "#252B32",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800"
  },
  suggestionRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center"
  },
  suggestionsCard: {
    marginHorizontal: 14,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 8,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF4",
    shadowColor: "#24334D",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5
    },
    elevation: 0
  },
  suggestionsClose: {
    color: BLUE,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800"
  },
  suggestionsHeader: {
    marginBottom: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  suggestionsTitle: {
    color: "#20252B",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900"
  },
  stickyShell: {
    zIndex: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 22,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ECEEF2",
    shadowColor: "#24334D",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5
    },
    elevation: 0
  },
  swapButton: {
    width: 38,
    height: 38,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  title: {
    color: "#202124",
    fontSize: 28,
    lineHeight: 22,
    fontWeight: "800",
    bottom: -20
  },
  viewAll: {
    color: BLUE,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800"
  }
});
