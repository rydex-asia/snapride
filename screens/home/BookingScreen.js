import React, { useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import RideBottomSheet from "../../components/RideBottomSheet";
import { SearchEndpointPinSvg } from "../../components/RideRouteMap";

import { COLORS } from "../../theme/colors";
/* ---------- MAP ---------- */
const REGION = {
  latitude: 12.9352,
  longitude: 77.6245,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

export default function PickupDropScreen({ onBack }) {
  const [sheetIndex, setSheetIndex] = useState(0);

  const isExpanded = sheetIndex === 1;

  const pickup = "Koramangala";
  const drop = "MG Road";

  const route = useMemo(() => {
    return [
      { latitude: 12.9352, longitude: 77.6245 },
      { latitude: 12.9488, longitude: 77.6404 },
    ];
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* MAP */}
      <MapView style={StyleSheet.absoluteFillObject} initialRegion={REGION}>
        <Polyline coordinates={route} strokeWidth={2.8} strokeColor="#1754E8" lineCap="round" lineJoin="round" />
        <Marker coordinate={route[0]} anchor={{ x: 0.5, y: 1 }}>
          <SearchEndpointPinSvg color="#1754E8" />
        </Marker>
        <Marker coordinate={route[1]} anchor={{ x: 0.5, y: 1 }}>
          <SearchEndpointPinSvg color="#E53935" />
        </Marker>
      </MapView>

      {/* SHEET */}
      <RideBottomSheet
        snapPoints={[260, "92%"]}
        initialIndex={0}
        onChange={setSheetIndex}
      >
        <BottomSheetScrollView contentContainerStyle={styles.content}>
          
          {/* HEADER */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="chevron-left" size={22} />
          </Pressable>
        </View>

          {/* INPUT CARD */}
          <View style={styles.inputCard}>
            <View style={styles.rail}>
              <View style={styles.greenDot} />
              <View style={styles.line} />
              <View style={styles.redDot} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.input}>{pickup}</Text>
              <View style={styles.divider} />
              <Text style={styles.input}>{drop || "Where to?"}</Text>
            </View>

            <Pressable style={styles.swapBtn}>
              <MaterialCommunityIcons name="swap-vertical" size={18} />
            </Pressable>
          </View>

          {/* ACTIONS (ALWAYS VISIBLE) */}
          <View style={styles.actions}>
            <Action icon="map-marker-radius" label="Map" />
            <Action icon="home" label="Home" />
            <Action icon="briefcase" label="Office" />
          </View>

          {/* ONLY WHEN EXPANDED */}
          {isExpanded && (
            <>
              <Text style={styles.section}>Recent searches</Text>

              <View style={styles.card}>
                {["MG Road", "Indiranagar", "Whitefield"].map((item, i) => (
                  <Pressable key={i} style={styles.row}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
                    <Text style={{ marginLeft: 10 }}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </BottomSheetScrollView>
      </RideBottomSheet>
    </SafeAreaView>
  );
}

/* ---------- COMPONENT ---------- */
const Action = ({ icon, label }) => (
  <View style={styles.actionBtn}>
    <MaterialCommunityIcons name={icon} size={16} color={COLORS.primary} />
    <Text style={styles.actionText}>{label}</Text>
  </View>
);

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  actionBtn: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  actionText: {
    fontWeight: "600"
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  content: {
    padding: 16,
    paddingBottom: 100
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 6
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14
  },
  input: {
    fontSize: 14,
    fontWeight: "700"
  },
  inputCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 0
  },
  line: {
    width: 1,
    height: 30,
    borderLeftWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    marginVertical: 4
  },
  rail: {
    alignItems: "center",
    marginRight: 10
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444"
  },
  row: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center"
  },
  safe: {
    flex: 1,
    backgroundColor: "#fff"
  },
  section: {
    marginTop: 16,
    fontWeight: "800"
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280"
  },
  swapBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6"
  },
  title: {
    fontSize: 16,
    fontWeight: "800"
  }
});
