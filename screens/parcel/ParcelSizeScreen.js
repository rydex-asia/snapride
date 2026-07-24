import React, { useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const PARCEL_SIZES = [
  { id: "small", title: "Small", subtitle: "Upto 10 *10*10 cm", badge: "Upto 1kg" },
  { id: "medium", title: "Medium", subtitle: "Upto 20 *15*10 cm", badge: "Upto 5kg" },
  { id: "large", title: "Large", subtitle: "Upto 30 *20*15 cm", badge: "Upto 10kg" },
  { id: "xl", title: "Extra large", subtitle: "Upto 40 *30*20 cm", badge: "Upto 15kg" },
];

export default function ParcelSizeScreen({
  onBack = () => {},
  onContinue = () => {},
  onHelp = () => {},
  onOpenPickup = () => {},
}) {
  const [selectedSize, setSelectedSize] = useState("small");
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const headerTransitionStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 18, 42],
          outputRange: [0, -6, -18],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  const belowHeaderStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [0, -2],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.screen}>
        <LinearGradient
          pointerEvents="none"
          colors={["#FFFFFF", "#F6F7FF", "#ECEFFF", "#DCDDFF"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.headerGradient}
        />

        <Animated.View style={styles.topShell}>
          <Animated.View style={[styles.headerMotionWrap, headerTransitionStyle]}>
            <View style={styles.topRow}>
              <Pressable onPress={onBack} style={styles.topBackBtn} hitSlop={10}>
                <MaterialCommunityIcons name="arrow-left" size={28} color="#111111" />
              </Pressable>

              <Pressable style={styles.pickupMetaWrap} onPress={onOpenPickup}>
                <View style={styles.pickupMetaTitleRow}>
                  <MaterialCommunityIcons name="navigation-variant" size={28} color="#7C77F5" />
                  <Text style={styles.pickupMetaTitle}>Pickup</Text>
                  <MaterialCommunityIcons name="chevron-down" size={18} color="#2B2B2B" />
                </View>
                <Text style={styles.pickupMetaSubtitle}>Home: krishnan nagar,ram enclave....</Text>
              </Pressable>


            </View>

            <View style={styles.headerBlock}>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>Choose Parcel Size</Text>
                <Text style={styles.subtitle}>Select the size that matches your parcel</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
        >
          <Animated.View style={belowHeaderStyle}>
            <View style={styles.sizesGradientPanel}>
              <LinearGradient
                pointerEvents="none"
                colors={["rgba(72, 0, 0, 0)", "#7e0000ff", "#650000ff", "#540000ff"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.sizesGradientBg}
              />
              <View style={styles.listWrap}>
                {PARCEL_SIZES.map((item) => {
                  const isSelected = item.id === selectedSize;

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setSelectedSize(item.id)}
                      style={styles.cardTap}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={["#FFFFFF", "#E7E6FF", "#ffffffff"]}
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

              <View style={styles.noteCard}>
                <Text style={styles.noteText}>
                  Our delivery partners will ensure safe and secure delivery of your parcel
                </Text>
              </View>
            </View>
          </Animated.View>
        </Animated.ScrollView>

        <View style={styles.footerShell}>
          <Pressable style={styles.continueBtn} onPress={() => onContinue(selectedSize)}>
            <Text style={styles.continueText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardTap: {
    marginBottom: 6
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 126,
    paddingBottom: 120
  },
  continueBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#7C77F5",
    alignItems: "center",
    justifyContent: "center"
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800"
  },
  footerShell: {
    height: 150,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -70,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#d3d3d3ff",
    paddingTop: 15,
    paddingHorizontal: 16,
    paddingBottom: 30,
    shadowColor: "#929292ff",
    shadowOpacity: 0,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: -2
    },
    elevation: 0
  },
  headerBlock: {
    marginTop: 22
  },
  headerCopy: {
    flex: 1
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 430
  },
  headerMotionWrap: {
    backgroundColor: "transparent"
  },
  listWrap: {
    marginTop: 12
  },
  noteCard: {
    marginHorizontal: 1,
    borderRadius: 6,
    backgroundColor: "#D8D8FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    bottom: -95
  },
  noteText: {
    color: "#1F1F1F",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 20
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
    flex: 1
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
    backgroundColor: "transparent"
  },
  sizeCard: {
    maxHeight: 98,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "transparent"
  },
  sizeCardSelected: {
    borderWidth: 2,
    borderColor: "#111111"
  },
  sizeInfo: {
    flex: 1
  },
  sizesGradientBg: {
    ...StyleSheet.absoluteFillObject
  },
  sizesGradientPanel: {
    marginTop: 18,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: "hidden"
  },
  sizeSubtitle: {
    marginTop: 6,
    color: "#222222",
    fontSize: 10,
    fontWeight: "400"
  },
  sizeThumb: {
    width: 58,
    height: 46,
    backgroundColor: "#D9D9D9",
    marginRight: 22
  },
  sizeTitle: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "800"
  },
  subtitle: {
    marginTop: 3,
    color: "#252525",
    fontSize: 10,
    fontWeight: "500"
  },
  title: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 30
  },
  topBackBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    marginRight: 8
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  topShell: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8
  },
  weightBadge: {
    alignSelf: "flex-start",
    marginTop: 5,
    paddingHorizontal: 14,
    height: 20,
    borderRadius: 18,
    backgroundColor: "#fddd9cff",
    alignItems: "center",
    justifyContent: "center"
  },
  weightBadgeText: {
    color: "#111111",
    fontSize: 8,
    fontWeight: "800"
  }
});
