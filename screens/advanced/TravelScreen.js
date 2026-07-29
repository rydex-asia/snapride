import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SimplePageHeader from "../../components/SimplePageHeader";

const BOOKING_OPTIONS = [
  {
    key: "flights",
    title: "Flights",
    subtitle: "Domestic & international",
    offer: "Save up to ₹4,000",
    icon: "airplane",
    image: require("../../assets/travel-flight-v2.png"),
  },
  {
    key: "trains",
    title: "Trains",
    subtitle: "Fast rail bookings",
    offer: "Zero service fee",
    icon: "train",
    image: require("../../assets/travel-train-v2.png"),
  },
  {
    key: "bus",
    title: "Bus",
    subtitle: "Routes across India",
    offer: "Up to 25% off",
    icon: "bus",
    image: require("../../assets/travel-bus-v2.png"),
  },
  {
    key: "hotels",
    title: "Hotels",
    subtitle: "Stays for every trip",
    offer: "Up to 55% off",
    icon: "bed-king-outline",
    image: require("../../assets/travel-hotel-v2.png"),
  },
];

const TRIP_TOOLS = [
  {
    key: "reserve",
    title: "Schedule a ride",
    subtitle: "Reserve up to 90 days ahead",
    icon: "calendar-clock-outline",
  },
  {
    key: "airport",
    title: "Airport pickup",
    subtitle: "Add your flight for a reliable pickup",
    icon: "airplane-clock",
  },
  {
    key: "hourly",
    title: "Short hotel stays",
    subtitle: "Book rooms for 3, 6 or 9 hours",
    icon: "clock-time-four-outline",
  },
];

const TRAVEL_IDEAS = [
  {
    key: "reserve",
    eyebrow: "SCHEDULED RIDES",
    title: "Reserve and relax",
    image: require("../../assets/horizontal-ads/rentals.png"),
  },
  {
    key: "airport",
    eyebrow: "AIRPORT",
    title: "Reach every flight",
    image: require("../../assets/horizontal-ads/airport-ride.png"),
  },
  {
    key: "hourly",
    eyebrow: "SHORT STAYS",
    title: "Pause between trips",
    image: require("../../assets/travel-hourly-v2.png"),
  },
];

function BookingCard({ item, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(item.key)}
      style={({ pressed }) => [styles.bookingCard, pressed && styles.pressed]}
    >
      <View style={styles.bookingImageWrap}>
        <Image source={item.image} resizeMode="cover" style={styles.bookingImage} />
        <View style={styles.bookingIcon}>
          <MaterialCommunityIcons name={item.icon} size={18} color="#312E81" />
        </View>
      </View>
      <View style={styles.bookingCopy}>
        <Text style={styles.bookingTitle}>{item.title}</Text>
        <Text style={styles.bookingSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        <Text style={styles.bookingOffer} numberOfLines={1}>{item.offer}</Text>
      </View>
    </Pressable>
  );
}

function ToolRow({ item, last, onPress }) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => onPress?.(item.key)}
        style={({ pressed }) => [styles.toolRow, pressed && styles.rowPressed]}
      >
        <View style={styles.toolIcon}>
          <MaterialCommunityIcons name={item.icon} size={21} color="#312E81" />
        </View>
        <View style={styles.toolCopy}>
          <Text style={styles.toolTitle}>{item.title}</Text>
          <Text style={styles.toolSubtitle}>{item.subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={21} color="#9A9DA2" />
      </Pressable>
      {!last ? <View style={styles.softDivider} /> : null}
    </>
  );
}

function IdeaCard({ item, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(item.key)}
      style={({ pressed }) => [styles.ideaCard, pressed && styles.pressed]}
    >
      <Image source={item.image} resizeMode="cover" style={styles.ideaImage} />
      <View style={styles.ideaShade} />
      <View style={styles.ideaCopy}>
        <Text style={styles.ideaEyebrow}>{item.eyebrow}</Text>
        <Text style={styles.ideaTitle}>{item.title}</Text>
      </View>
      <View style={styles.ideaArrow}>
        <MaterialCommunityIcons name="arrow-right" size={17} color="#202124" />
      </View>
    </Pressable>
  );
}

export default function TravelScreen({ onBack, onSelectService, scrollY: externalScrollY }) {
  const internalScrollY = useRef(new Animated.Value(0)).current;
  const scrollY = externalScrollY || internalScrollY;

  useEffect(() => {
    scrollY.setValue(0);
  }, [scrollY]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <SimplePageHeader title="Travel" eyebrow="Plan the whole journey" onBack={onBack} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={styles.content}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => onSelectService?.("reserve")}
          style={({ pressed }) => [styles.hero, pressed && styles.pressed]}
        >
          <Image source={require("../../assets/travel-hero-v2.png")} resizeMode="cover" style={styles.heroImage} />
          <View style={styles.heroShade} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>TRAVEL WITH RYDEX</Text>
            <Text style={styles.heroTitle}>Your trip starts here</Text>
            <Text style={styles.heroSubtitle}>Book the journey, stay and ride in one place.</Text>
          </View>
          <View style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Plan now</Text>
            <MaterialCommunityIcons name="arrow-right" size={17} color="#202124" />
          </View>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Book your travel</Text>
          <Text style={styles.sectionSubtitle}>Everything needed for the next trip</Text>
        </View>

        <View style={styles.bookingGrid}>
          {BOOKING_OPTIONS.map((item) => (
            <BookingCard key={item.key} item={item} onPress={onSelectService} />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trip tools</Text>
          <Text style={styles.sectionSubtitle}>Make every connection easier</Text>
        </View>

        <View style={styles.toolGroup}>
          {TRIP_TOOLS.map((item, index) => (
            <ToolRow
              key={item.key}
              item={item}
              last={index === TRIP_TOOLS.length - 1}
              onPress={onSelectService}
            />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Made for your journey</Text>
          <Text style={styles.sectionSubtitle}>Useful ideas before you leave</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ideaRail}
        >
          {TRAVEL_IDEAS.map((item) => (
            <IdeaCard key={item.key} item={item} onPress={onSelectService} />
          ))}
        </ScrollView>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 16, paddingBottom: 118, backgroundColor: "#FFFFFF" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  rowPressed: { backgroundColor: "#F8F8F8" },
  hero: {
    height: 174,
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: "#202124",
  },
  heroImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(7,11,16,0.46)" },
  heroCopy: { position: "absolute", left: 17, right: 92, bottom: 17 },
  heroEyebrow: { color: "#FFD979", fontSize: 10, lineHeight: 13, fontWeight: "800", letterSpacing: 0.7 },
  heroTitle: { marginTop: 5, color: "#FFFFFF", fontSize: 24, lineHeight: 29, fontWeight: "700" },
  heroSubtitle: { marginTop: 4, color: "rgba(255,255,255,0.84)", fontSize: 12, lineHeight: 17, fontWeight: "500" },
  heroButton: {
    position: "absolute",
    right: 13,
    bottom: 13,
    height: 38,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  heroButtonText: { color: "#202124", fontSize: 12, lineHeight: 16, fontWeight: "700" },
  sectionHeader: { marginTop: 24, marginBottom: 10, paddingHorizontal: 2 },
  sectionTitle: { color: "#202124", fontSize: 20, lineHeight: 25, fontWeight: "700" },
  sectionSubtitle: { marginTop: 2, color: "#74777D", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  bookingGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  bookingCard: {
    width: "48.5%",
    minHeight: 174,
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  bookingImageWrap: { height: 98, overflow: "hidden", backgroundColor: "#ECEDEF" },
  bookingImage: { width: "100%", height: "100%" },
  bookingIcon: {
    position: "absolute",
    left: 8,
    bottom: 8,
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  bookingCopy: { paddingHorizontal: 11, paddingTop: 9, paddingBottom: 11 },
  bookingTitle: { color: "#202124", fontSize: 15, lineHeight: 19, fontWeight: "700" },
  bookingSubtitle: { marginTop: 2, color: "#74777D", fontSize: 10, lineHeight: 13, fontWeight: "400" },
  bookingOffer: { marginTop: 5, color: "#3730A3", fontSize: 10, lineHeight: 13, fontWeight: "700" },
  toolGroup: { overflow: "hidden", borderRadius: 19, backgroundColor: "#FFFFFF" },
  toolRow: {
    minHeight: 72,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  toolIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  toolCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
  toolTitle: { color: "#25262A", fontSize: 14, lineHeight: 18, fontWeight: "700" },
  toolSubtitle: { marginTop: 3, color: "#777A80", fontSize: 11, lineHeight: 15, fontWeight: "400" },
  softDivider: { height: 1, marginLeft: 67, backgroundColor: "#F0F1F2" },
  ideaRail: { paddingRight: 14, gap: 10 },
  ideaCard: {
    width: 246,
    height: 144,
    overflow: "hidden",
    borderRadius: 19,
    backgroundColor: "#202124",
  },
  ideaImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  ideaShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(7,11,16,0.42)" },
  ideaCopy: { position: "absolute", left: 14, right: 48, bottom: 14 },
  ideaEyebrow: { color: "#FFD979", fontSize: 9, lineHeight: 12, fontWeight: "800", letterSpacing: 0.6 },
  ideaTitle: { marginTop: 4, color: "#FFFFFF", fontSize: 18, lineHeight: 22, fontWeight: "700" },
  ideaArrow: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
