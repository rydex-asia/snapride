import React from "react";
import { Pressable, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function PickupDropScreen({
  onBack,
  onOpenMap,
  onChooseRide,
  onRouteChange,
  pickupText = "",
  dropText = "",
}) {
  const [pickupValue, setPickupValue] = React.useState(pickupText);
  const [dropValue, setDropValue] = React.useState(dropText);
  const [stopValue, setStopValue] = React.useState("");
  const [showStopInput, setShowStopInput] = React.useState(false);

  React.useEffect(() => {
    setPickupValue(pickupText);
  }, [pickupText]);

  React.useEffect(() => {
    setDropValue(dropText);
  }, [dropText]);

  const updateRoute = (next) => {
    onRouteChange?.((current) => ({
      ...current,
      ...next,
    }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
              <MaterialCommunityIcons name="arrow-left" size={30} color="#111111" />
            </Pressable>
            <Text style={styles.headerTitle}>Select Pickup &amp; Drop Location</Text>
          </View>

          <Pressable
            style={styles.forwardBtn}
            hitSlop={10}
            onPress={() => {
              if (onChooseRide) {
                onChooseRide();
              } else if (onOpenMap) {
                onOpenMap("pickup");
              }
            }}
          >
            <MaterialCommunityIcons name="arrow-right" size={22} color="#111111" />
          </Pressable>

          <View style={styles.card}>
            <View style={styles.cardRail}>
              <View style={styles.pickupMarker}>
                <View style={styles.pickupMarkerInner} />
              </View>
              <View style={styles.railLine} />
              <View style={styles.dropMarker}>
                <View style={styles.dropMarkerInner} />
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.pickupBlock}>
                <View style={styles.pickupTopRow}>
                </View>

                <TextInput
                  value={pickupValue}
                  onChangeText={(value) => {
                    setPickupValue(value);
                    updateRoute({ pickupText: value });
                  }}
                  placeholder="Enter pickup location"
                  placeholderTextColor="#000000ff"
                  style={styles.pickupText}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.divider} />

              {showStopInput ? (
                <>
                  <View style={styles.stopRow}>
                    <TextInput
                      value={stopValue}
                      onChangeText={setStopValue}
                      placeholder="Add stop"
                      placeholderTextColor="#000000ff"
                      style={styles.stopText}
                      returnKeyType="next"
                    />
                    <Pressable
                      style={styles.removeStopBtn}
                      hitSlop={10}
                      onPress={() => {
                        setStopValue("");
                        setShowStopInput(false);
                      }}
                    >
                      <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
                    </Pressable>
                  </View>
                  <View style={styles.divider} />
                </>
              ) : null}

              <View style={styles.dropRow}>
                <TextInput
                  value={dropValue}
                  onChangeText={(value) => {
                    setDropValue(value);
                    updateRoute({ dropText: value });
                  }}
                  placeholder="Where are you going?"
                  placeholderTextColor="#000000ff"
                  style={styles.dropText}
                  returnKeyType="done"
                />

                <Pressable style={styles.plusBtn} hitSlop={10} onPress={() => setShowStopInput(true)}>
                  <MaterialCommunityIcons name="plus" size={22} color="#111111" />
                </Pressable>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.selectMapCard}
            hitSlop={8}
            onPress={() => onOpenMap?.("pickup")}
          >
            <MaterialCommunityIcons name="map-marker-radius" size={16} color="#0E7C66" />
            <Text style={styles.selectMapText}>Select on map</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 22,
    marginHorizontal: 10,
    minHeight: 92,
    paddingTop: 4,
    paddingRight: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#9f9f9fff",
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0
  },
  cardBody: {
    flex: 1
  },
  cardRail: {
    width: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 2,
    marginRight: 10
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20
  },
  divider: {
    height: 1,
    backgroundColor: "#EAECF0",
    marginTop: 5,
    marginBottom: 5,
    marginHorizontal: 8
  },
  dropMarker: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: "#F40606",
    borderWidth: 2,
    borderColor: "#C81E1E",
    alignItems: "center",
    justifyContent: "center",
    top: -6
  },
  dropMarkerInner: {
    width: 6,
    height: 6,
    borderRadius: 1,
    backgroundColor: "#FFFFFF"
  },
  dropRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dropText: {
    flex: 1,
    color: "#000000ff",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.15,
    paddingRight: 12
  },
  forwardBtn: {
    position: "absolute",
    top: 20,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.98)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    borderColor: "#E5E7EB",
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2
    },
    elevation: 0
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 6
  },
  headerTitle: {
    flex: 1,
    color: "#111111",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "800",
    letterSpacing: -0.2
  },
  pickupBlock: {
    paddingTop: 0
  },
  pickupLabel: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginLeft: 2
  },
  pickupMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#0E7C66",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    top: 5
  },
  pickupMarkerInner: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: "#FFFFFF"
  },
  pickupText: {
    marginTop: 3,
    color: "#000000ff",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.15,
    paddingRight: 6
  },
  pickupTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  plusBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center"
  },
  railLine: {
    width: 1,
    flex: 1,
    minHeight: 10,
    marginVertical: 1,
    borderLeftWidth: 1,
    borderStyle: "dashed",
    borderColor: "#BFC5CE",
    marginLeft: 2
  },
  removeStopBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  selectMapCard: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  selectMapText: {
    color: "#111827",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "700"
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  stopText: {
    flex: 1,
    color: "#111111",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.15,
    paddingRight: 12
  }
});
