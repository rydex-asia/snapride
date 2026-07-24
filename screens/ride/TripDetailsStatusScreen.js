import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import RideRouteMap from "../../components/RideRouteMap";

const STATUS_STEPS = [
  { key: "confirmed", label: "Confirmed", caption: "Ride booked", icon: "check" },
  { key: "arriving", label: "On the way", caption: "Captain arriving", icon: "motorbike" },
  { key: "pickup", label: "Pickup", caption: "OTP verification", icon: "map-marker-radius" },
  { key: "trip", label: "In trip", caption: "Ride started", icon: "navigation-variant" },
  { key: "completed", label: "Done", caption: "Trip completed", icon: "flag-checkered" },
];

function resolveActiveStep(status) {
  const value = String(status || "").toUpperCase();
  if (value.includes("COMPLETED")) return 4;
  if (value.includes("START") || value.includes("PROGRESS") || value.includes("TRIP")) return 3;
  if (value.includes("ARRIVED") || value.includes("PICKUP")) return 2;
  if (value.includes("ARRIVING") || value.includes("ASSIGNED") || value.includes("ACCEPTED")) return 1;
  return 0;
}

export default function TripDetailsStatusScreen({
  onBack = () => {},
  pickup = "Pickup location",
  drop = "Drop location",
  status = "ARRIVING",
  fare = "₹60",
  vehicle = "Bike",
  captainName = "Manoj Kumar",
  captainPlate = "TG08ET3421",
  pickupCoord,
  dropCoord,
  routeCoords,
  mapRegion,
  captainCoord,
}) {
  const activeStep = resolveActiveStep(status);
  const activeStatus = STATUS_STEPS[activeStep];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={10} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#101828" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Trip details</Text>
            <Text style={styles.headerSubtitle}>Live ride summary</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <LinearGradient
            colors={["#101828", "#172B4D", "#1754E8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroTopRow}>


            </View>
            <Text style={styles.heroKicker}>Current status</Text>
            <Text style={styles.heroTitle}>{activeStatus.label}</Text>
            <Text style={styles.heroSubtitle}>{activeStatus.caption}. We will keep this page updated.</Text>
          </LinearGradient>

          <View style={styles.routeCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionTitle}>Route</Text>

            </View>

            <View style={styles.routeMapPreview}>
              <RideRouteMap
                pickupCoord={pickupCoord}
                dropCoord={dropCoord}
                routeCoords={routeCoords}
                mapRegion={mapRegion}
                captainCoord={captainCoord}
                routeColor="#1754E8"
                routeWidth={2.8}
                showUserLocation={false}
                showMyLocationButton={false}
                startMarkerVariant="searchPickup"
                endMarkerVariant="searchDrop"
                showCaptainMarker={false}
                attachMarkersToRouteEnds
                animateRoute
                routeAnimationDuration={900}
                interactive={false}
                showMapControls={false}
                edgePadding={{ top: 40, right: 34, bottom: 40, left: 34 }}
              />
            </View>

            <View style={styles.routeBody}>
              <View style={styles.routeRail}>
                <View style={styles.pickupMarker} />
                <View style={styles.routeLine} />
                <View style={styles.dropMarker} />
              </View>
              <View style={styles.routeCopy}>
                <View style={styles.locationBlock}>
                  <Text style={styles.locationLabel}>Pickup</Text>
                  <Text style={styles.locationText} numberOfLines={2}>{pickup}</Text>
                </View>
                <View style={styles.locationDivider} />
                <View style={styles.locationBlock}>
                  <Text style={styles.locationLabel}>Drop</Text>
                  <Text style={styles.locationText} numberOfLines={2}>{drop}</Text>
                </View>
              </View>
            </View>
          </View>



          <View style={styles.captainCard}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={28} color="#98A2B3" />
            </View>
            <View style={styles.captainCopy}>
              <Text style={styles.captainName}>{captainName}</Text>
              <Text style={styles.captainMeta}>{captainPlate}</Text>
            </View>
            <View style={styles.verifiedPill}>
              <MaterialCommunityIcons name="check-decagram" size={15} color="#1754E8" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
        </ScrollView>
        <View pointerEvents="none" style={styles.bottomStrip} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EAECF0",
    alignItems: "center",
    justifyContent: "center"
  },
  bottomStrip: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    backgroundColor: "#FFFFFF",
    zIndex: 20
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F4F7"
  },
  captainCard: {
    marginTop: 14,
    borderRadius: 24,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAECF0",
    flexDirection: "row",
    alignItems: "center"
  },
  captainCopy: {
    flex: 1,
    marginLeft: 12
  },
  captainMeta: {
    marginTop: 2,
    color: "#667085",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "600"
  },
  captainName: {
    color: "#101828",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800"
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  content: {
    padding: 16,
    paddingBottom: 92
  },
  currentTag: {
    color: "#1754E8",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900"
  },
  dropMarker: {
    width: 11,
    height: 11,
    borderRadius: 2,
    backgroundColor: "#D92D20"
  },
  header: {
    height: 70,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F6"
  },
  headerCopy: {
    flex: 1,
    marginLeft: 12
  },
  headerSpacer: {
    width: 38
  },
  headerSubtitle: {
    marginTop: 1,
    color: "#667085",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "600"
  },
  headerTitle: {
    color: "#101828",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
    letterSpacing: -0.25
  },
  heroCard: {
    minHeight: 100,
    borderRadius: 18,
    padding: 10,
    overflow: "hidden"
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center"
  },
  heroKicker: {
    marginTop: 2,
    color: "rgba(255,255,255,0.68)",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.65
  },
  heroSubtitle: {
    marginTop: 5,
    color: "rgba(255,255,255,0.74)",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600"
  },
  heroTitle: {
    marginTop: 2,
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600",
    letterSpacing: -0.8
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  locationBlock: {
    minHeight: 48
  },
  locationDivider: {
    height: 1,
    marginVertical: 10,
    marginHorizontal: 8,
    backgroundColor: "#EAECF0"
  },
  locationLabel: {
    color: "#98A2B3",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  locationText: {
    marginTop: 3,
    color: "#344054",
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: "700"
  },
  pickupMarker: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: "#1754E8",
    backgroundColor: "#FFFFFF"
  },
  progressCaption: {
    marginTop: 1,
    color: "#667085",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600"
  },
  progressCard: {
    marginTop: 14,
    borderRadius: 24,
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAECF0"
  },
  progressCopy: {
    flex: 1,
    marginLeft: 10
  },
  progressDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAECF0"
  },
  progressDotCurrent: {
    backgroundColor: "#101828"
  },
  progressDotReached: {
    backgroundColor: "#1754E8"
  },
  progressLabel: {
    color: "#98A2B3",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800"
  },
  progressLabelReached: {
    color: "#101828"
  },
  progressList: {
    marginTop: 12,
    gap: 8
  },
  progressRow: {
    minHeight: 46,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC"
  },
  routeBody: {
    marginTop: 14,
    flexDirection: "row"
  },
  routeCard: {
    marginTop: 14,
    borderRadius: 14,
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAECF0"
  },
  routeCopy: {
    flex: 1,
    marginLeft: 9
  },
  routeMapPreview: {
    height: 142,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#EEF3F8",
    borderWidth: 1,
    borderColor: "#E7EAF0",
    marginBottom: 16
  },
  routeLine: {
    flex: 1,
    width: 2,
    minHeight: 44,
    marginVertical: 5,
    backgroundColor: "#D0D5DD"
  },
  routePill: {
    height: 27,
    borderRadius: 999,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EEF4FF"
  },
  routePillText: {
    color: "#1754E8",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "800"
  },
  routeRail: {
    width: 24,
    alignItems: "center",
    paddingVertical: 6
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FB"
  },
  sectionTitle: {
    color: "#101828",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    letterSpacing: -0.2
  },
  summaryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF4FF"
  },
  summaryLabel: {
    marginTop: 10,
    color: "#667085",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700"
  },
  summaryRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 12
  },
  summaryTile: {
    flex: 1,
    minHeight: 102,
    borderRadius: 22,
    padding: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAECF0"
  },
  summaryValue: {
    marginTop: 3,
    color: "#101828",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900"
  },
  verifiedPill: {
    height: 29,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "#ECFDF3",
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  verifiedText: {
    color: "#027A48",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "800"
  }
});
