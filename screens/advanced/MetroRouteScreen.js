import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AppIcon from "../../components/AppIcon";
import { haversineMeters } from "../../routeUtils";
import { HYDERABAD_METRO_STATIONS } from "./hyderabadMetroStations";

const BLUE = "#1754D1";
const BLUE_DARK = "#0D3EA8";
const INK = "#111827";
const MUTED = "#6B7280";
const SURFACE = "#F5F7FB";
const SCREEN_WIDTH = Dimensions.get("window").width;
const AD_GAP = 10;
const AD_WIDTH = SCREEN_WIDTH - 38;
const AD_RADIUS = 28;
const AD_HEIGHT = Math.round(AD_WIDTH * (860 / 1774));

const PROMO_CARDS = [
  {
    key: "ride-relax",
    title: "Reserve and relax",
    subtitle: "Book up to 90 days in advance",
    image: require("../../assets/horizontal-ads/ride-relax-v3.png"),
  },
  {
    key: "ride-airport",
    title: "Reserve your airport ride",
    subtitle: "Reliable airport transfers",
    image: require("../../assets/horizontal-ads/ride-airport-v3.png"),
  },
  {
    key: "ride-city",
    title: "Ride as you like",
    subtitle: "Easy city rides, whenever you need",
    image: require("../../assets/horizontal-ads/ride-city-v3.png"),
  },
];

function cleanStationName(name) {
  return (name || "").replace(/\s*Metro Station\s*$/i, "").trim();
}

const HYDERABAD_METRO_FARE_SLABS = [
  { uptoKm: 2, fare: 11 },
  { uptoKm: 4, fare: 17 },
  { uptoKm: 6, fare: 28 },
  { uptoKm: 9, fare: 37 },
  { uptoKm: 12, fare: 47 },
  { uptoKm: 15, fare: 51 },
  { uptoKm: 18, fare: 56 },
  { uptoKm: 21, fare: 61 },
  { uptoKm: 24, fare: 65 },
  { uptoKm: Infinity, fare: 69 },
];

const METRO_LINE_SEQUENCES = [
  [
    "Miyapur",
    "JNTU College",
    "KPHB Colony",
    "Kukatpally",
    "Balanagar",
    "Moosapet",
    "Bharat Nagar",
    "Erragadda",
    "ESI Hospital",
    "S. R. Nagar",
    "Ameerpet",
    "Panjagutta",
    "Irrum Manzil",
    "Khairatabad",
    "Lakdi-ka-pul",
    "Assembly",
    "Nampally",
    "Gandhi Bhavan",
    "Osmania Medical College",
    "Mahatma Gandhi Bus Station",
    "Malakpet",
    "New Market",
    "Musarambagh",
    "Dilsukh Nagar",
    "Chaitanyapuri",
    "Victoria Memorial",
    "L. B. Nagar Metro Station",
  ],
  [
    "Nagole",
    "Uppal",
    "Stadium",
    "NGRI",
    "Habsiguda",
    "Tarnaka",
    "Mettuguda",
    "Secunderabad East",
    "Parade Grounds",
    "Paradise",
    "Prakash Nagar",
    "Begumpet",
    "Ameerpet",
    "Madhura Nagar",
    "Yusufguda",
    "Road No 5 Jubilee Hills",
    "Jubilee Hills Checkpost",
    "Peddamma Gudi",
    "Madhapur",
    "Durgam Cheruvu",
    "HITEC City",
    "Raidurg",
  ],
  [
    "JBS",
    "Secunderabad West",
    "Gandhi Hospital",
    "Musheerabad",
    "RTC Cross Roads",
    "Chikkadpally",
    "Narayanaguda",
    "Sultan Bazar",
    "Mahatma Gandhi Bus Station",
  ],
];

const STATION_ALIASES = {
  jbsparadeground: "jbs",
  jbsparadegrounds: "jbs",
  paradeground: "paradegrounds",
  paradegroundstation: "paradegrounds",
  mgbs: "mahatmagandhibusstation",
  lbnagar: "lbnagarmetrostation",
};

function normalizeStationKey(name) {
  const key = cleanStationName(name).toLowerCase().replace(/[^a-z0-9]/g, "");
  return STATION_ALIASES[key] || key;
}

const STATION_BY_KEY = HYDERABAD_METRO_STATIONS.reduce((map, station) => {
  map[normalizeStationKey(station.name)] = station;
  return map;
}, {});

function findMetroStation(name) {
  return STATION_BY_KEY[normalizeStationKey(name)] || null;
}

function getHyderabadMetroFare(distanceKm) {
  const safeDistance = Number.isFinite(distanceKm) ? Math.max(0, distanceKm) : 24.1;
  return HYDERABAD_METRO_FARE_SLABS.find((slab) => safeDistance <= slab.uptoKm)?.fare || 69;
}

function addMetroEdge(graph, fromName, toName) {
  const from = findMetroStation(fromName);
  const to = findMetroStation(toName);
  if (!from || !to) return;

  const fromKey = normalizeStationKey(from.name);
  const toKey = normalizeStationKey(to.name);
  const distanceKm = haversineMeters(from, to) / 1000;
  if (!graph[fromKey]) graph[fromKey] = [];
  if (!graph[toKey]) graph[toKey] = [];
  graph[fromKey].push({ key: toKey, distanceKm });
  graph[toKey].push({ key: fromKey, distanceKm });
}

function buildMetroGraph() {
  const graph = {};
  for (const line of METRO_LINE_SEQUENCES) {
    for (let index = 0; index < line.length - 1; index += 1) {
      addMetroEdge(graph, line[index], line[index + 1]);
    }
  }
  addMetroEdge(graph, "JBS", "Parade Grounds");
  return graph;
}

const METRO_GRAPH = buildMetroGraph();

function getMetroPathDistanceKm(from, to) {
  const origin = findMetroStation(from);
  const destination = findMetroStation(to);
  if (!origin || !destination) return null;

  const originKey = normalizeStationKey(origin.name);
  const destinationKey = normalizeStationKey(destination.name);
  const distances = { [originKey]: 0 };
  const visited = new Set();

  while (true) {
    let currentKey = null;
    let currentDistance = Infinity;

    for (const [key, distance] of Object.entries(distances)) {
      if (!visited.has(key) && distance < currentDistance) {
        currentKey = key;
        currentDistance = distance;
      }
    }

    if (!currentKey) break;
    if (currentKey === destinationKey) return currentDistance;

    visited.add(currentKey);
    for (const edge of METRO_GRAPH[currentKey] || []) {
      const nextDistance = currentDistance + edge.distanceKm;
      if (nextDistance < (distances[edge.key] ?? Infinity)) {
        distances[edge.key] = nextDistance;
      }
    }
  }

  return null;
}

function getRouteMeta(from, to) {
  const routeDistanceKm = getMetroPathDistanceKm(from, to);
  const fallbackSeed = (from + to).length || 18;
  const estimatedDistanceKm = routeDistanceKm || Math.min(30, Math.max(2, fallbackSeed * 0.48));
  const stops = Math.max(1, Math.min(30, Math.round(estimatedDistanceKm / 1.05)));
  const minutes = Math.max(6, Math.min(64, Math.round(estimatedDistanceKm * 2.3 + 4)));
  const fare = getHyderabadMetroFare(estimatedDistanceKm);

  return {
    fare,
    line: stops > 10 ? "Blue + Red" : "Blue line",
    minutes,
    nextTrain: "3 min",
    platform: stops > 10 ? "P2" : "P1",
    stops,
  };
}

function SegmentControl({ tripType, onChange }) {
  return (
    <View style={styles.segmentShell}>
      <Pressable
        onPress={() => onChange("oneWay")}
        style={({ pressed }) => [
          styles.segmentOption,
          tripType === "oneWay" && styles.segmentOptionActive,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.segmentText, tripType === "oneWay" && styles.segmentTextActive]}>One way</Text>
      </Pressable>
      <Pressable
        onPress={() => onChange("roundTrip")}
        style={({ pressed }) => [
          styles.segmentOption,
          tripType === "roundTrip" && styles.segmentOptionActive,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.segmentText, tripType === "roundTrip" && styles.segmentTextActive]}>Round trip</Text>
      </Pressable>
    </View>
  );
}

function MetricPill({ icon, label, value }) {
  return (
    <View style={styles.metricPill}>
      <View style={styles.metricIcon}>
        <AppIcon name={icon} size={14} color={BLUE} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function MetroTicket({ from, to, meta, tripType, onChangeRoute }) {
  return (
    <View style={styles.ticketCard}>
      <LinearGradient
        colors={["#1459DE", "#0B3EAD"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ticketHeader}
      >
        <View style={styles.ticketBrandRow}>
          <View style={styles.ticketLogoWrap}>
            <Image
              source={require("../../assets/metro/hyderabad-metro-logo.png")}
              resizeMode="contain"
              style={styles.ticketLogo}
            />
          </View>
          <View style={styles.ticketTitleWrap}>
            <Text style={styles.ticketTitle}>{tripType === "roundTrip" ? "Round trip ticket" : "Metro ticket"}</Text>
            <Text style={styles.ticketSubtitle}>Hyderabad Metro Rail</Text>
          </View>
        </View>
        <View style={styles.ticketBadge}>
          <Text style={styles.ticketBadgeText}>{meta.line}</Text>
        </View>
      </LinearGradient>

      <View style={styles.ticketBody}>
        <View style={styles.ticketRouteRow}>
          <View style={styles.timelineRail}>
            <View style={[styles.timelineDot, styles.timelineStart]} />
            <View style={styles.timelineLine} />
            <View style={[styles.timelineDot, styles.timelineEnd]} />
          </View>

          <View style={styles.timelineCopy}>
            <View style={styles.stationBlock}>
              <Text style={styles.stationLabel}>FROM</Text>
              <Text style={styles.stationName} numberOfLines={1}>{from}</Text>
            </View>
            <View style={styles.ticketDivider} />
            <View style={styles.stationBlock}>
              <Text style={styles.stationLabel}>TO</Text>
              <Text style={[styles.stationName, !to && styles.stationPlaceholder]} numberOfLines={1}>{to || "Select destination"}</Text>
            </View>
          </View>

          <Pressable onPress={onChangeRoute} style={({ pressed }) => [styles.routeAction, pressed && styles.pressed]}>
            <AppIcon name="swap-vertical" size={18} color={BLUE} />
          </Pressable>
        </View>

        <View style={styles.perforation}>
          <View style={styles.leftNotch} />
          <View style={styles.dashedLine} />
          <View style={styles.rightNotch} />
        </View>

        <View style={styles.metricsRow}>
          <MetricPill icon="clock" label="Train" value={meta.nextTrain} />
          <MetricPill icon="metro" label="Stops" value={`${meta.stops}`} />
          <MetricPill icon="directions-walk" label="Time" value={`${meta.minutes}m`} />
          <MetricPill icon="confirmation-number" label="Platform" value={meta.platform} />
        </View>
      </View>
    </View>
  );
}

function PromoRail() {
  return (
    <View style={styles.promoBlock}>
      <View style={styles.promoHeader}>
        <Text style={styles.promoTitle}>Plan your next trip</Text>
        <Text style={styles.promoSubtitle}>Useful ride options for later</Text>
      </View>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promoTrack}
      >
        {PROMO_CARDS.map((item) => (
          <Pressable key={item.key} style={({ pressed }) => [styles.promoItem, pressed && styles.pressed]}>
            <ImageBackground
              source={item.image}
              resizeMode="cover"
              style={styles.promoImage}
              imageStyle={styles.promoImageRadius}
            />
            <Text style={styles.promoCardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.promoCardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export default function MetroRouteScreen({ couponLabel, route, onBack, onChangeRoute, onOpenCoupon }) {
  const from = cleanStationName(route?.from) || "Ameerpet";
  const to = cleanStationName(route?.to) || "Raidurg";
  const [tripType, setTripType] = useState("oneWay");
  const [passengers, setPassengers] = useState(1);
  const meta = useMemo(() => getRouteMeta(from, to), [from, to]);
  const multiplier = tripType === "roundTrip" ? 2 : 1;
  const totalFare = meta.fare * passengers * multiplier;

  const decreasePassengers = () => setPassengers((value) => Math.max(1, value - 1));
  const increasePassengers = () => setPassengers((value) => Math.min(6, value + 1));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
          <AppIcon name="back" size="lg" color="#20242B" />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Metro ticket</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>Book QR ticket for {from}</Text>
        </View>
        <Pressable onPress={() => {}} hitSlop={10} style={styles.headerHelpButton}>
          <AppIcon name="help" size={20} color={BLUE_DARK} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.stickySegmentWrap}>
          <SegmentControl tripType={tripType} onChange={setTripType} />
        </View>

        <View style={styles.body}>
          <MetroTicket
            from={from}
            to={to}
            meta={meta}
            tripType={tripType}
            onChangeRoute={onChangeRoute}
          />

          <View style={styles.passengerCard}>
            <View style={styles.passengerCopy}>
              <Text style={styles.sectionTitle}>Passengers</Text>
              <Text style={styles.sectionSubtitle}>Up to 6 QR tickets per booking</Text>
            </View>
            <View style={styles.counterRow}>
              <Pressable
                onPress={decreasePassengers}
                style={({ pressed }) => [
                  styles.counterButton,
                  passengers === 1 && styles.counterDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <AppIcon name="minus" size={19} color={passengers === 1 ? "#AAB2BF" : BLUE} />
              </Pressable>
              <Text style={styles.passengerCount}>{passengers}</Text>
              <Pressable
                onPress={increasePassengers}
                style={({ pressed }) => [
                  styles.counterButton,
                  passengers === 6 && styles.counterDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <AppIcon name="plus" size={19} color={passengers === 6 ? "#AAB2BF" : BLUE} />
              </Pressable>
            </View>
          </View>

          <Pressable onPress={onOpenCoupon} style={({ pressed }) => [styles.couponRow, pressed && styles.pressed]}>
            <View style={styles.couponIcon}>
              <AppIcon name="confirmation-number" size={19} color={BLUE} />
            </View>
            <View style={styles.couponTextBlock}>
              <Text style={styles.couponTitle}>{couponLabel || "Apply coupon"}</Text>
              <Text style={styles.couponSubtitle}>Check available metro offers</Text>
            </View>
            <AppIcon name="chevronRight" size={18} color="#98A2B3" />
          </Pressable>

          <PromoRail />
        </View>
      </ScrollView>

      <View style={styles.footerDock}>
        <View style={styles.footerTopRow}>
          <View>
            <Text style={styles.footerLabel}>Total fare</Text>
            <Text style={styles.footerMeta}>{passengers} passenger{passengers > 1 ? "s" : ""} · {tripType === "roundTrip" ? "Round trip" : "One way"}</Text>
          </View>
          <Text style={styles.totalFare}>₹{totalFare}</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.payButton, pressed && styles.payButtonPressed]}>
          <Text style={styles.payButtonText}>Proceed to pay</Text>
          <AppIcon name="forward" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    height: 30,
    justifyContent: "center",
    marginRight: 8,
    width: 30,
  },
  body: {
    paddingHorizontal: 18,
  },
  content: {
    paddingBottom: 198,
  },
  couponIcon: {
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  couponRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8EDF5",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 14,
    minHeight: 72,
    paddingHorizontal: 14,
  },
  couponSubtitle: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 2,
  },
  couponTextBlock: {
    flex: 1,
    marginLeft: 12,
  },
  couponTitle: {
    color: INK,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 19,
  },
  counterButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: BLUE,
    borderRadius: 20,
    borderWidth: 1.4,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  counterDisabled: {
    backgroundColor: "#F3F5F8",
    borderColor: "#D7DDE7",
  },
  counterRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  dashedLine: {
    borderColor: "#D4DAE5",
    borderStyle: "dashed",
    borderTopWidth: 1,
    flex: 1,
  },
  footerDock: {
    backgroundColor: "#FFFFFF",
    borderColor: "#EEF1F6",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    bottom: 0,
    elevation: 0,
    left: 0,
    minHeight: 184,
    paddingBottom: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    position: "absolute",
    right: 0,
    shadowColor: "#18233A",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0,
    shadowRadius: 18,
  },
  footerLabel: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
    lineHeight: 15,
    textTransform: "uppercase",
  },
  footerMeta: {
    color: "#7A8494",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 5,
  },
  footerTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "rgba(15,23,42,0.06)",
    borderBottomWidth: 1,
    elevation: 0,
    flexDirection: "row",
    minHeight: 96,
    paddingBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0,
    shadowRadius: 14,
    zIndex: 20,
  },
  headerCopy: {
    flex: 1,
    transform: [{ translateY: 7 }],
  },
  headerHelpButton: {
    alignItems: "center",
    backgroundColor: "#F3F7FF",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  headerSubtitle: {
    color: "#777982",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 15,
    marginTop: 2,
  },
  headerTitle: {
    color: "#202124",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
  },
  leftNotch: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    height: 24,
    left: -26,
    position: "absolute",
    width: 24,
  },
  metricIcon: {
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 12,
    height: 28,
    justifyContent: "center",
    marginBottom: 7,
    width: 28,
  },
  metricLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
    marginTop: 2,
  },
  metricPill: {
    alignItems: "center",
    flex: 1,
  },
  metricValue: {
    color: INK,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 16,
  },
  metricsRow: {
    flexDirection: "row",
    paddingBottom: 2,
    paddingTop: 2,
  },
  passengerCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8EDF5",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    minHeight: 92,
    paddingHorizontal: 16,
  },
  passengerCopy: {
    flex: 1,
    paddingRight: 10,
  },
  passengerCount: {
    color: INK,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 26,
    minWidth: 20,
    textAlign: "center",
  },
  payButton: {
    alignItems: "center",
    backgroundColor: BLUE,
    borderRadius: 28,
    flexDirection: "row",
    gap: 8,
    height: 50,
    justifyContent: "center",
    marginTop: 16,
  },
  payButtonPressed: {
    opacity: 0.78,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 21,
  },
  perforation: {
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 16,
    position: "relative",
  },
  pressed: {
    opacity: 0.68,
  },
  promoBlock: {
    marginTop: 22,
  },
  promoCardSubtitle: {
    color: "#666666",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    marginTop: 2,
    paddingHorizontal: 2,
  },
  promoCardTitle: {
    color: "#111111",
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
    marginTop: 10,
    paddingHorizontal: 2,
  },
  promoHeader: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  promoImage: {
    borderRadius: AD_RADIUS,
    height: AD_HEIGHT,
    overflow: "hidden",
    width: AD_WIDTH,
  },
  promoImageRadius: {
    borderRadius: AD_RADIUS,
  },
  promoItem: {
    marginRight: AD_GAP,
    width: AD_WIDTH,
  },
  promoSubtitle: {
    color: "#777E89",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    marginTop: 2,
  },
  promoTitle: {
    color: "#111111",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.25,
    lineHeight: 24,
  },
  promoTrack: {
    paddingRight: 16,
  },
  rightNotch: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    height: 24,
    position: "absolute",
    right: -26,
    width: 24,
  },
  routeAction: {
    alignItems: "center",
    backgroundColor: "#F4F8FF",
    borderColor: "#DCE7FA",
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    marginLeft: 10,
    width: 40,
  },
  safe: {
    backgroundColor: SURFACE,
    flex: 1,
  },
  sectionSubtitle: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 3,
  },
  sectionTitle: {
    color: INK,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
  },
  segmentOption: {
    alignItems: "center",
    borderRadius: 23,
    flex: 1,
    height: 46,
    justifyContent: "center",
  },
  segmentOptionActive: {
    backgroundColor: BLUE,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0,
    shadowRadius: 12,
  },
  segmentShell: {
    backgroundColor: "#F4F8FF",
    borderColor: "#DCE7FA",
    borderRadius: 27,
    borderWidth: 1,
    flexDirection: "row",
    height: 54,
    padding: 4,
  },
  segmentText: {
    color: "#596273",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 19,
  },
  segmentTextActive: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  stationBlock: {
    justifyContent: "center",
    minHeight: 44,
  },
  stationLabel: {
    color: "#8C96A5",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    lineHeight: 12,
  },
  stationName: {
    color: INK,
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.2,
    lineHeight: 24,
    marginTop: 4,
  },
  stationPlaceholder: {
    color: "#9AA3B2",
  },
  stickySegmentWrap: {
    backgroundColor: SURFACE,
    paddingBottom: 8,
    paddingHorizontal: 18,
    paddingTop: 12,
    zIndex: 10,
  },
  ticketBadge: {
    backgroundColor: "rgba(255,255,255,0.17)",
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  ticketBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 14,
  },
  ticketBody: {
    padding: 16,
  },
  ticketBrandRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },
  ticketCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    elevation: 0,
    marginTop: 8,
    overflow: "hidden",
    shadowColor: "#17233C",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0,
    shadowRadius: 20,
  },
  ticketDivider: {
    backgroundColor: "#E7ECF4",
    height: 1,
    marginVertical: 12,
  },
  ticketHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 82,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ticketLogo: {
    height: 40,
    width: 40,
  },
  ticketLogoWrap: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginRight: 11,
    width: 48,
  },
  ticketRouteRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  ticketSubtitle: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 14,
    marginTop: 3,
  },
  ticketTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.35,
    lineHeight: 22,
  },
  ticketTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  timelineCopy: {
    flex: 1,
    marginLeft: 12,
  },
  timelineDot: {
    borderColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 3,
    height: 15,
    width: 15,
  },
  timelineEnd: {
    backgroundColor: "#E04444",
  },
  timelineLine: {
    borderColor: "#B8C2D1",
    borderLeftWidth: 2,
    borderStyle: "dotted",
    height: 54,
    marginVertical: 4,
  },
  timelineRail: {
    alignItems: "center",
    width: 22,
  },
  timelineStart: {
    backgroundColor: "#16A05D",
  },
  totalFare: {
    color: INK,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.4,
    lineHeight: 33,
  },
});
