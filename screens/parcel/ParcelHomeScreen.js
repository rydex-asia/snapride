import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

function PlaceholderTile({ wide = false }) {
  return <View style={[styles.tile, wide && styles.tileWide]} />;
}

const PARCEL_SIZES = [
  { id: "small", title: "Small", subtitle: "Upto 10 *10*10 cm", badge: "Upto 1kg" },
  { id: "medium", title: "Medium", subtitle: "Upto 20 *15*10 cm", badge: "Upto 5kg" },
  { id: "large", title: "Large", subtitle: "Upto 30 *20*15 cm", badge: "Upto 10kg" },
  { id: "xl", title: "Extra large", subtitle: "Upto 40 *30*20 cm", badge: "Upto 15kg" },
];

const MODE_TABS = [
  { key: "ride", label: "Ride", icon: "car" },
  { key: "grocery", label: "Grocery", icon: "shopping-outline" },
  { key: "parcel", label: "Parcel", icon: "package-variant-closed" },
];

export default function ParcelHomeScreen({
  onOpenPickup = () => {},
  onOpenDrop = () => {},
  onOpenHelp = () => {},
  onOpenNow = () => {},
  onOpenRideMode = () => {},
  onOpenGroceryMode = () => {},
}) {
  const [showSizeSheet, setShowSizeSheet] = useState(true);
  const [selectedSize, setSelectedSize] = useState("small");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.screen}>
        <View style={styles.stickyBlock}>
          <View style={styles.tabsWrap}>
            <View pointerEvents="none" style={styles.activeUnderline} />
            {MODE_TABS.map((item) => {
              const selected = item.key === "parcel";
              const onPress =
                item.key === "ride"
                  ? onOpenRideMode
                  : item.key === "grocery"
                    ? onOpenGroceryMode
                    : undefined;

              return (
                <Pressable
                  key={item.key}
                  onPress={onPress}
                  style={[styles.tabItem, selected && styles.tabItemActive]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={18}
                    color={selected ? "#7C77F5" : "#111111"}
                  />
                  <Text style={[styles.tabText, selected && styles.tabTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.topRow}>
            <Pressable style={styles.pickupMetaWrap} onPress={onOpenPickup}>
              <View style={styles.pickupMetaTitleRow}>
                <MaterialCommunityIcons name="navigation-variant" size={22} color="#7C77F5" />
                <Text style={styles.pickupMetaTitle}>Pickup</Text>
                <MaterialCommunityIcons name="chevron-down" size={16} color="#2B2B2B" />
              </View>

              <Text style={styles.pickupMetaSubtitle}>Home: krishnan nagar,ram enclave....</Text>
            </Pressable>

            <Pressable style={styles.helpChip} onPress={onOpenHelp}>
              <MaterialCommunityIcons name="help-box-outline" size={20} color="#222222" />
              <Text style={styles.helpText}>Help</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.searchCardWrap}>
            <Pressable style={styles.searchCard} onPress={onOpenDrop}>
              <MaterialCommunityIcons name="magnify" size={28} color="#111111" />

              <View style={styles.searchCardSpacer} />

              <Pressable style={styles.nowChip} onPress={onOpenNow}>
                <MaterialCommunityIcons name="clock-outline" size={15} color="#424242" />
                <Text style={styles.nowText}>Now</Text>
                <MaterialCommunityIcons name="chevron-down" size={15} color="#424242" />
              </Pressable>
            </Pressable>
          </View>

          <View style={styles.selectorStage}>
            <LinearGradient
              colors={["#DDE8FF", "#AEBEFF", "#D9E6FF", "#F8FBFF"]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.72, y: 1 }}
              style={styles.servicesPanel}
            >
              {!showSizeSheet ? (
                <>
                  <View style={styles.servicesTopRow}>
                    <PlaceholderTile />
                    <PlaceholderTile />
                  </View>
                  <PlaceholderTile wide />
                </>
              ) : null}
            </LinearGradient>
          </View>

          <View style={styles.promoCard} />

          <View style={styles.dotsRow}>
            <View style={styles.dotMuted} />
            <View style={styles.dotActive} />
            <View style={styles.dotActive} />
            <View style={styles.dotActive} />
          </View>
        </ScrollView>

        {showSizeSheet ? (
          <View style={styles.sizeSheetWrap} pointerEvents="box-none">
            <View style={styles.sizeSheetHalo} />
            <View style={styles.sizeSheet}>
              <View style={styles.sheetHeaderRow}>
                <View>
                  <Text style={styles.sheetTitle}>Choose Parcel Size</Text>
                  <Text style={styles.sheetSubtitle}>
                    Select the size that matches your parcel
                  </Text>
                </View>

                <Pressable hitSlop={10} onPress={() => setShowSizeSheet(false)}>
                  <MaterialCommunityIcons name="close" size={34} color="#1A1A1A" />
                </Pressable>
              </View>

              <View style={styles.sizeList}>
                {PARCEL_SIZES.map((item) => {
                  const isSelected = item.id === selectedSize;

                  return (
                    <Pressable key={item.id} onPress={() => setSelectedSize(item.id)}>
                      {isSelected ? (
                        <LinearGradient
                          colors={["#FFFFFF", "#CAC9FF", "#7C77F5"]}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={[styles.sizeCard, styles.sizeCardSelected]}
                        >
                          <View style={styles.sizeThumb} />
                          <View style={styles.sizeInfo}>
                            <Text style={styles.sizeTitle}>{item.title}</Text>
                            <Text style={styles.sizeSubtitle}>{item.subtitle}</Text>
                            <View style={styles.weightBadge}>
                              <Text style={styles.weightBadgeText}>{item.badge}</Text>
                            </View>
                          </View>
                        </LinearGradient>
                      ) : (
                        <View style={styles.sizeCard}>
                          <View style={styles.sizeThumb} />
                          <View style={styles.sizeInfo}>
                            <Text style={styles.sizeTitle}>{item.title}</Text>
                            <Text style={styles.sizeSubtitle}>{item.subtitle}</Text>
                            <View style={styles.weightBadge}>
                              <Text style={styles.weightBadgeText}>{item.badge}</Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.sheetNote}>
                <Text style={styles.sheetNoteText}>
                  Our delivery partners will ensure safe and secure delivery of your parcel
                </Text>
              </View>

              <Pressable style={styles.continueBtn} onPress={() => setShowSizeSheet(false)}>
                <Text style={styles.continueText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  activeUnderline: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "33.3333%",
    height: 4,
    backgroundColor: "#7C77F5"
  },
  content: {
    paddingTop: 132,
    paddingBottom: 120
  },
  continueBtn: {
    marginTop: 25,
    height: 52,
    borderRadius: 6,
    backgroundColor: "#7C77F5",
    alignItems: "center",
    justifyContent: "center"
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800"
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#111111",
    marginHorizontal: 4
  },
  dotMuted: {
    width: 18,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D2D2D2",
    marginHorizontal: 3
  },
  dotsRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  helpChip: {
    marginTop: 2,
    minWidth: 72,
    height: 31,
    borderRadius: 17,
    backgroundColor: "#EFEFEF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  helpText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "600"
  },
  nowChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    height: 38,
    borderRadius: 26,
    backgroundColor: "#F1F0F5"
  },
  nowText: {
    color: "#424242",
    fontSize: 12.5,
    fontWeight: "800"
  },
  pickupMetaSubtitle: {
    marginTop: 1,
    marginLeft: 10,
    color: "#7A7A7A",
    fontSize: 11,
    fontWeight: "500"
  },
  pickupMetaTitle: {
    marginLeft: 3,
    color: "#111111",
    fontSize: 15,
    fontWeight: "700"
  },
  pickupMetaTitleRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  pickupMetaWrap: {
    flex: 1,
    paddingTop: 0
  },
  promoCard: {
    height: 120,
    marginTop: 28,
    marginHorizontal: 24,
    borderRadius: 21,
    backgroundColor: "#D9D9D9"
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  searchCard: {
    minHeight: 49,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0E0E0E",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0,
    zIndex: 7
  },
  searchCardSpacer: {
    flex: 1
  },
  searchCardWrap: {
    marginTop: 12,
    marginHorizontal: 14,
    zIndex: 4,
    backgroundColor: "#FFFFFF"
  },
  selectorStage: {
    marginTop: -14,
    minHeight: 760,
    position: "relative"
  },
  servicesPanel: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 35,
    paddingHorizontal: 20,
    height: 450,
    paddingBottom: 54
  },
  servicesTopRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sheetHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 6
  },
  sheetNote: {
    marginTop: 10,
    borderRadius: 6,
    backgroundColor: "#DFE2FF",
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  sheetNoteText: {
    color: "#000000ff",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "left"
  },
  sheetSubtitle: {
    marginTop: 4,
    color: "#272727",
    fontSize: 12,
    fontWeight: "500"
  },
  sheetTitle: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "800"
  },
  sizeCard: {
    maxHeight: 86,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "transparent"
  },
  sizeCardSelected: {
    borderWidth: 2,
    borderColor: "#0F0F0F"
  },
  sizeInfo: {
    flex: 1
  },
  sizeList: {
    marginTop: 6
  },
  sizeSheet: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    backgroundColor: "rgba(255,255,255,0.99)",
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 16,
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 12
    },
    elevation: 34
  },
  sizeSheetHalo: {
    position: "absolute",
    top: 20,
    left: 10,
    right: 10,
    bottom: -12,
    borderRadius: 22,
    backgroundColor: "rgba(124, 119, 245, 0.08)",
    shadowColor: "#7C77F5",
    shadowOpacity: 0,
    shadowRadius: 26,
    shadowOffset: {
      width: 0,
      height: 14
    }
  },
  sizeSheetWrap: {
    position: "absolute",
    top: 136,
    left: 14,
    right: 14,
    zIndex: 110
  },
  sizeSubtitle: {
    marginTop: 4,
    color: "#222222",
    fontSize: 12,
    fontWeight: "300"
  },
  sizeThumb: {
    width: 70,
    height: 70,
    borderRadius: 0,
    backgroundColor: "#D9D9D9",
    marginRight: 18
  },
  sizeTitle: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "800"
  },
  stickyBlock: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    backgroundColor: "#FFFFFF",
    paddingTop: 4,
    paddingBottom: 12
  },
  tabItem: {
    flex: 1,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "transparent"
  },
  tabItemActive: {
    backgroundColor: "transparent"
  },
  tabsWrap: {
    position: "relative",
    marginHorizontal: 18,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF",
    overflow: "hidden"
  },
  tabText: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.1
  },
  tabTextActive: {
    color: "#7C77F5"
  },
  tile: {
    width: 140,
    height: 130,
    borderRadius: 19,
    backgroundColor: "#FFFFFF"
  },
  tileWide: {
    width: "100%",
    height: 120,
    marginTop: 15
  },
  topRow: {
    paddingHorizontal: 14,
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  weightBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 12,
    height: 20,
    borderRadius: 13,
    backgroundColor: "#feb47cff",
    alignItems: "center",
    justifyContent: "center"
  },
  weightBadgeText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "500"
  }
});
