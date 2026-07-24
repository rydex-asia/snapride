import React from "react";
import { Dimensions, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SHADOWS } from "../../theme/shadows";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = Math.max(300, Math.round(SCREEN_HEIGHT * 0.35));

const LOCATION_CONFIG = {
  pickup: {
    title: "Select Pickup Location",
    location: "Kacheguda Railwaystation,Hyderabad",
    markerColor: "#0E7C66",
    innerColor: "#0E7C66",
    confirmText: "Confirm Pickup",
  },
  drop: {
    title: "Select Drop Location",
    location: "Secundrabad Railwaystation,Hyderabad",
    markerColor: "#E11D1D",
    innerColor: "#E11D1D",
    confirmText: "Confirm Drop",
  },
};

export default function SelectLocationScreen({ mode = "pickup", onBack = () => {}, onConfirm = () => {} }) {
  const config = LOCATION_CONFIG[mode] || LOCATION_CONFIG.pickup;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.screen}>
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
          <MaterialCommunityIcons name="arrow-left" size={30} color="#111111" />
        </Pressable>

        <View style={styles.sheet}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <Text style={styles.title}>{config.title}</Text>

          <View style={styles.locationCard}>
            <View style={styles.cardRow}>
              <View style={[styles.marker, { borderColor: config.markerColor }]}>
                <View style={[styles.markerInner, { backgroundColor: config.innerColor }]} />
              </View>
              <Text numberOfLines={1} style={styles.locationText}>
                {config.location}
              </Text>
            </View>
          </View>

          <Pressable style={styles.confirmBtn} onPress={() => onConfirm({ mode, ...config })}>
            <Text style={styles.confirmText}>{config.confirmText}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: 54,
    left: 24,
    zIndex: 4
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  confirmBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center"
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800"
  },
  handle: {
    width: 86,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#D7D1D1"
  },
  handleWrap: {
    alignItems: "center",
    marginBottom: 14
  },
  locationCard: {
    minHeight: 92,
    borderRadius: 18,
    backgroundColor: "#F1F1F1",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    justifyContent: "center"
  },
  locationText: {
    flex: 1,
    color: "#111111",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700"
  },
  marker: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  markerInner: {
    width: 4,
    height: 4,
    borderRadius: 2
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 22,
    ...SHADOWS.sheet
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 16
  }
});
