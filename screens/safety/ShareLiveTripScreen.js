import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker, Polyline } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { SearchEndpointPinSvg } from "../../components/RideRouteMap";

const ROUTE = [
  { latitude: 12.9352, longitude: 77.6245 },
  { latitude: 12.9392, longitude: 77.6298 },
  { latitude: 12.9428, longitude: 77.6351 },
  { latitude: 12.9474, longitude: 77.6408 },
];

const CONTACTS = [
  { key: "1", name: "Ameya Home", phone: "+91 9876543210", image: require("../../assets/vehicles/bike.png") },
  { key: "2", name: "Rahul", phone: "+91 8765432109", image: require("../../assets/vehicles/auto.png") },
  { key: "3", name: "Aman", phone: "+91 9123425678", image: require("../../assets/vehicles/bus.png") },
  { key: "4", name: "Priya", phone: "+91 9988776655", image: require("../../assets/vehicles/cab.png") },
];

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

function ContactRow({ item }) {
  return (
    <Pressable style={styles.contactRow}>
      <View style={styles.contactLeft}>
        <View style={styles.avatarWrap}>
          <Image source={item.image} style={styles.avatar} resizeMode="contain" />
        </View>
        <View style={styles.contactCopy}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phone}</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
    </Pressable>
  );
}

export default function ShareLiveTripScreen({ onBack, onShare }) {
  const [autoShare, setAutoShare] = useState(true);

  const route = useMemo(() => ROUTE, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={10} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Share Live Trip</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.mapCard}>
            <MapView
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: 12.9412,
                longitude: 77.6339,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
              customMapStyle={MAP_STYLE}
              showsCompass={false}
              showsTraffic={false}
              rotateEnabled={false}
              pitchEnabled={false}
              zoomEnabled={false}
            >
              <Polyline coordinates={route} strokeColor="#1754E8" strokeWidth={2.8} lineCap="round" lineJoin="round" />
              <Marker coordinate={route[0]} anchor={{ x: 0.5, y: 1 }}>
                <SearchEndpointPinSvg color="#1754E8" />
              </Marker>
              <Marker coordinate={route[route.length - 1]} anchor={{ x: 0.5, y: 1 }}>
                <SearchEndpointPinSvg color="#E53935" />
              </Marker>
              <Marker coordinate={route[2]} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.carWrap}>
                  <Image source={require("../../assets/vehicles/cab.png")} style={styles.carImage} resizeMode="contain" />
                </View>
              </Marker>
            </MapView>
          </View>

          <View style={styles.tripInfoCard}>
            <View style={styles.tripInfoItem}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#6C4EFF" />
              <Text style={styles.tripInfoText}>18 mins</Text>
            </View>
            <View style={styles.tripInfoDivider} />
            <View style={styles.tripInfoItem}>
              <MaterialCommunityIcons name="cash" size={18} color="#6C4EFF" />
              <Text style={styles.tripInfoText}>₹136.66</Text>
            </View>
          </View>

          <View style={styles.toggleCard}>
            <View>
              <Text style={styles.toggleTitle}>Auto-share trip status</Text>
              <Text style={styles.toggleSubtitle}>Update your contacts during the ride</Text>
            </View>
            <Switch
              value={autoShare}
              onValueChange={setAutoShare}
              trackColor={{ false: "#D1D5DB", true: "#C7B8FF" }}
              thumbColor={autoShare ? "#6C4EFF" : "#FFFFFF"}
              ios_backgroundColor="#D1D5DB"
            />
          </View>

          <Text style={styles.sectionTitle}>Share with</Text>
          <View style={styles.contactsCard}>
            {CONTACTS.map((item, index) => (
              <View key={item.key}>
                <ContactRow item={item} />
                {index !== CONTACTS.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={onShare}>
            <LinearGradient
              colors={["#6C4EFF", "#8E7CFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cta}
            >
              <MaterialCommunityIcons name="share-variant-outline" size={18} color="#FFFFFF" />
              <Text style={styles.ctaText}>Share Status</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 28,
    height: 28
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  carImage: {
    width: 34,
    height: 22
  },
  carWrap: {
    width: 48,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0
  },
  contactCopy: {
    flex: 1,
    minWidth: 0
  },
  contactLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0
  },
  contactName: {
    color: "#111827",
    fontSize: 15.5,
    fontWeight: "800"
  },
  contactPhone: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 12.5,
    fontWeight: "600"
  },
  contactRow: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  contactsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18
  },
  cta: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#6C4EFF",
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
  divider: {
    height: 1,
    backgroundColor: "#F1EDF9",
    marginLeft: 70
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
    height: 304,
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
    marginBottom: 12
  },
  pickupPin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#16A34A"
  },
  root: {
    flex: 1,
    backgroundColor: "#F6F7FB"
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 12
  },
  toggleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0,
    marginBottom: 14
  },
  toggleSubtitle: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 12.5,
    fontWeight: "600"
  },
  toggleTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800"
  },
  tripInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0,
    marginBottom: 12
  },
  tripInfoDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#F1EDF9"
  },
  tripInfoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  tripInfoText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800"
  }
});
