import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SimplePageHeader from "../../components/SimplePageHeader";

const PAST_RIDES = [
  { key: "auto", month: "May 2026", type: "Auto", date: "17 May · 7:42 PM", from: "Road no 1, Krishna Nagar", to: "Ram Nagar", amount: "₹170" },
  { key: "bike", month: "May 2026", type: "Bike", date: "13 May · 9:18 AM", from: "Ameerpet", to: "Banjara Hills", amount: "₹68" },
  { key: "cab", month: "May 2026", type: "Cab", date: "09 May · 4:30 PM", from: "Secunderabad", to: "Jubilee Hills", amount: "₹286" },
];

const TABS = [
  { key: "ongoing", label: "Ongoing" },
  { key: "history", label: "History" },
];

function RideRow({ ride, isLast, onPress }) {
  const icon = ride.type === "Auto" ? "rickshaw" : ride.type === "Cab" ? "car-outline" : "motorbike";
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.rideRow, pressed && styles.rowPressed]}
      >
        <View style={styles.rideIcon}>
          <MaterialCommunityIcons name={icon} size={21} color="#394150" />
        </View>
        <View style={styles.rideCopy}>
          <View style={styles.rideTitleLine}>
            <Text style={styles.rideType}>{ride.type}</Text>
            <Text style={styles.rideDate}>{ride.date}</Text>
          </View>
          <Text style={styles.rideRoute} numberOfLines={1}>{ride.from}</Text>
          <View style={styles.destinationLine}>
            <MaterialCommunityIcons name="arrow-down" size={13} color="#92959B" />
            <Text style={styles.rideDestination} numberOfLines={1}>{ride.to}</Text>
          </View>
        </View>
        <View style={styles.rideRight}>
          <Text style={styles.rideAmount}>{ride.amount}</Text>
          <MaterialCommunityIcons name="chevron-right" size={19} color="#92959B" />
        </View>
      </Pressable>
      {!isLast ? <View style={styles.divider} /> : null}
    </View>
  );
}

export default function MyRidesScreen({ onBack, onTrackRide = () => {}, onOpenRideDetails = () => {} }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("ongoing");

  const historyGroups = useMemo(() => {
    return PAST_RIDES.reduce((groups, ride) => {
      const existing = groups.find((group) => group.title === ride.month);
      if (existing) existing.data.push(ride);
      else groups.push({ title: ride.month, data: [ride] });
      return groups;
    }, []);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SimplePageHeader title="My rides" eyebrow="Trips and ride history" onBack={onBack} />

      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={styles.tab}>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              <View style={[styles.tabIndicator, active && styles.tabIndicatorActive]} />
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(32, insets.bottom + 24) }]}
      >
        {activeTab === "ongoing" ? (
          <>
            <Text style={styles.sectionTitle}>Current ride</Text>
            <View style={styles.liveRide}>
              <View style={styles.liveHeader}>
                <View style={styles.liveState}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveStateText}>Captain arriving</Text>
                </View>
                <Text style={styles.liveEta}>4 min</Text>
              </View>

              <Text style={styles.liveVehicle}>Bike to Secunderabad</Text>

              <View style={styles.route}>
                <View style={styles.routeRail}>
                  <View style={styles.pickupDot} />
                  <View style={styles.routeLine} />
                  <View style={styles.dropDot} />
                </View>
                <View style={styles.routeCopy}>
                  <View>
                    <Text style={styles.routeLabel}>Pickup</Text>
                    <Text style={styles.routePlace} numberOfLines={1}>Kacheguda Railway Station</Text>
                  </View>
                  <View>
                    <Text style={styles.routeLabel}>Drop</Text>
                    <Text style={styles.routePlace} numberOfLines={1}>Secunderabad</Text>
                  </View>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={onTrackRide}
                style={({ pressed }) => [styles.trackButton, pressed && styles.pressed]}
              >
                <Text style={styles.trackButtonText}>Track ride</Text>
              </Pressable>
            </View>

            <View style={styles.liveNote}>
              <MaterialCommunityIcons name="information-outline" size={19} color="#656970" />
              <Text style={styles.liveNoteText}>Live location and captain details are available on the tracking screen.</Text>
            </View>
          </>
        ) : (
          <>
            {historyGroups.map((group) => (
              <View key={group.title} style={styles.historyGroup}>
                <Text style={styles.sectionTitle}>{group.title}</Text>
                <View style={styles.historyList}>
                  {group.data.map((ride, index) => (
                    <RideRow
                      key={ride.key}
                      ride={ride}
                      isLast={index === group.data.length - 1}
                      onPress={() => onOpenRideDetails(ride)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 18 },
  destinationLine: { marginTop: 3, flexDirection: "row", alignItems: "center", gap: 3 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 70, backgroundColor: "#E2E4E7" },
  dropDot: { width: 9, height: 9, borderRadius: 3, backgroundColor: "#202124" },
  historyGroup: { marginBottom: 22 },
  historyList: { marginTop: 10, borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFFFF" },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#A96700" },
  liveEta: { color: "#202124", fontSize: 22, lineHeight: 27, fontWeight: "700" },
  liveHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  liveNote: { marginTop: 12, paddingHorizontal: 4, flexDirection: "row", alignItems: "flex-start" },
  liveNoteText: { flex: 1, marginLeft: 8, color: "#747780", fontSize: 11, lineHeight: 16, fontWeight: "400" },
  liveRide: { borderRadius: 20, padding: 16, backgroundColor: "#FFFFFF" },
  liveState: { flexDirection: "row", alignItems: "center", gap: 7 },
  liveStateText: { color: "#656970", fontSize: 12, lineHeight: 16, fontWeight: "600" },
  liveVehicle: { marginTop: 12, color: "#202124", fontSize: 19, lineHeight: 24, fontWeight: "700" },
  pickupDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#F2B317" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  rideAmount: { color: "#202124", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  rideCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  rideDate: { color: "#8A8D93", fontSize: 10, lineHeight: 14, fontWeight: "500" },
  rideDestination: { flex: 1, color: "#747780", fontSize: 11, lineHeight: 15, fontWeight: "400" },
  rideIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F0F1F3", alignItems: "center", justifyContent: "center" },
  rideRight: { marginLeft: 10, alignItems: "flex-end", gap: 8 },
  rideRoute: { marginTop: 5, color: "#555960", fontSize: 12, lineHeight: 16, fontWeight: "500" },
  rideRow: { minHeight: 94, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center" },
  rideTitleLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  rideType: { color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "600" },
  route: { marginTop: 20, flexDirection: "row" },
  routeCopy: { flex: 1, minWidth: 0, height: 76, marginLeft: 10, justifyContent: "space-between" },
  routeLabel: { color: "#92959B", fontSize: 10, lineHeight: 13, fontWeight: "500" },
  routeLine: { width: 1, flex: 1, backgroundColor: "#D7D9DD" },
  routePlace: { marginTop: 1, color: "#303238", fontSize: 12, lineHeight: 16, fontWeight: "500" },
  routeRail: { width: 14, height: 76, alignItems: "center" },
  rowPressed: { backgroundColor: "#F7F8F9" },
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#F1F0F5" },
  sectionTitle: { color: "#202124", fontSize: 17, lineHeight: 22, fontWeight: "600" },
  tab: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "flex-end" },
  tabIndicator: { width: 30, height: 3, marginTop: 10, borderRadius: 2, backgroundColor: "transparent" },
  tabIndicatorActive: { backgroundColor: "#202124" },
  tabLabel: { color: "#85888E", fontSize: 13, lineHeight: 17, fontWeight: "600" },
  tabLabelActive: { color: "#202124" },
  tabs: { minHeight: 52, paddingHorizontal: 16, backgroundColor: "#FFFFFF", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E2E4E7", flexDirection: "row" },
  trackButton: { marginTop: 20, height: 48, borderRadius: 14, backgroundColor: "#202124", alignItems: "center", justifyContent: "center" },
  trackButtonText: { color: "#FFFFFF", fontSize: 14, lineHeight: 19, fontWeight: "700" },
});
