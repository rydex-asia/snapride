import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AppIcon from "./AppIcon";
import { SHADOWS } from "../theme/shadows";

const VEHICLE_IMAGE = require("../assets/vehicles/auto.png");

export default function RideFlowChrome({
  stage,
  pickupText,
  captainName,
  onBack,
  onForward,
  onMessage,
  onCall,
}) {
  const { height } = useWindowDimensions();
  const sheetHeight = Math.round(height * 0.56);
  const bannerBottom = sheetHeight - 45;
  const isCaptainAssigned = stage === "captainAssigned";
  const isOnTheWay = stage === "onTheWay";
  const isArrivedPickup = stage === "arrivedPickup";
  const showCaptainSheet = isCaptainAssigned || isOnTheWay || isArrivedPickup;
  const resolvedPickupText = pickupText || "Pickup";
  const resolvedCaptainName = captainName || "Manoj";
  const [arrivedReadyToStart, setArrivedReadyToStart] = useState(false);
  const bannerCopy = isArrivedPickup
    ? arrivedReadyToStart
      ? {
          icon: "lock",
          iconSize: 18,
          iconColor: "#2563EB",
          iconStyle: null,
          title: "Start your ride",
          subtitle: "Enter the PIN to start your ride",
        }
      : {
          icon: "check-circle",
          iconSize: 18,
          iconColor: "#2563EB",
          iconStyle: null,
          title: "Arrived at Pickup",
          subtitle: "Your captain has arrived at the pickup location",
        }
    : isOnTheWay
    ? {
        icon: "directions-walk",
        iconSize: 18,
        iconColor: "#2563EB",
        iconStyle: null,
        title: "Walk to pickup",
        subtitle: `${resolvedPickupText} • 1.2 km away`,
      }
    : isCaptainAssigned
      ? {
          icon: "check",
          iconSize: 9,
          iconColor: "#2563EB",
          iconStyle: styles.bannerIconGlyph,
          title: "Captain on the way",
          subtitle: `${resolvedCaptainName} is on the way`,
        }
      : null;
  const bannerMotion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bannerMotion, {
      toValue: showCaptainSheet ? 1 : 0,
      duration: 400,
      easing: showCaptainSheet ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [bannerMotion, showCaptainSheet]);

  useEffect(() => {
    if (!isArrivedPickup) {
      setArrivedReadyToStart(false);
      return undefined;
    }

    setArrivedReadyToStart(false);
    const timer = setTimeout(() => {
      setArrivedReadyToStart(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isArrivedPickup]);

  const bannerTranslateY = bannerMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [72, 0],
  });
  const bannerOpacity = bannerMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      {isCaptainAssigned ? (
        <View pointerEvents="box-none" style={styles.headerControls}>
          <Pressable style={styles.headerIconButton} onPress={onBack}>
            <AppIcon name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Pressable style={styles.headerIconButton} onPress={onForward}>
            <AppIcon name="arrow-forward" size={22} color="#111827" />
          </Pressable>
        </View>
      ) : null}

      <Animated.View
        style={[
          styles.bannerWrap,
          {
            bottom: bannerBottom,
            opacity: bannerOpacity,
            transform: [{ translateY: bannerTranslateY }],
          },
        ]}
      >
        <LinearGradient colors={["#2563EB", "#1D4ED8"]} style={styles.banner}>
          {bannerCopy ? (
            <View style={styles.bannerContent}>
              <View style={styles.bannerIconWrap}>
                <AppIcon
                  name={bannerCopy.icon}
                  size={bannerCopy.iconSize}
                  color={bannerCopy.iconColor}
                  style={bannerCopy.iconStyle}
                />
              </View>
              <View style={styles.bannerCopy}>
                <Text style={styles.bannerTitle}>{bannerCopy.title}</Text>
                <Text style={styles.bannerSubtitle}>{bannerCopy.subtitle}</Text>
              </View>
            </View>
          ) : null}
        </LinearGradient>
      </Animated.View>

      <View style={[styles.sheet, { height: sheetHeight }]}>
        <View style={styles.handle} />
        {showCaptainSheet ? (
          <View style={styles.sheetContent}>
            {isArrivedPickup ? (
              <View style={styles.arrivedSheetBlock}>
                <View style={styles.arrivedPinCard}>
                  <Text style={styles.arrivedPinPrompt}>Enter PIN to start your ride</Text>
                  <View style={styles.arrivedPinRow}>
                    {["1", "2", "3", "4"].map((digit) => (
                      <View key={digit} style={styles.arrivedPinBox}>
                        <Text style={styles.arrivedPinDigit}>{digit}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.arrivedDivider} />

                <View style={styles.arrivedDriverCard}>
                  <View style={styles.arrivedDriverLeft}>
                    <View style={styles.arrivedAvatarWrap}>
                      <AppIcon name="person" size={36} color="#1D4ED8" />
                    </View>
                    <View style={styles.arrivedRatingPill}>
                      <Text style={styles.arrivedRatingText}>4.9</Text>
                      <AppIcon name="star" size={13} color="#FBBF24" />
                    </View>
                  </View>

                  <View style={styles.arrivedDriverCopy}>
                    <Text style={styles.arrivedPlate}>KA 03AB 8616</Text>
                    <Text style={styles.arrivedVehicleLabel}>Bajaj Auto</Text>
                    <Text style={styles.arrivedName}>Manoj Kumar Bathre</Text>
                  </View>

                  <Pressable style={styles.arrivedCallButton} onPress={onCall}>
                    <AppIcon name="call" size={18} color="#1E293B" />
                  </Pressable>
                </View>

                <View style={styles.arrivedActionRow}>
                  <Pressable style={styles.arrivedMessagePill} onPress={onMessage}>
                    <AppIcon name="message" size={18} color="#334155" />
                    <Text style={styles.arrivedMessageText}>Message Manoj</Text>
                  </Pressable>
                  <Pressable style={styles.arrivedCancelButton}>
                    <AppIcon name="cancel" size={18} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            ) : isOnTheWay ? (
              <>
                <View style={styles.walkStatusRow}>
                  <View style={styles.walkStatusLeft}>
                    <View style={styles.walkStatusIconWrap}>
                      <AppIcon name="directions-walk" size={22} color="#2563EB" />
                    </View>
                    <View style={styles.walkStatusCopy}>
                      <Text style={styles.walkStatusTitle}>Walk to pickup</Text>
                      <Text style={styles.walkStatusSub}>1.2 km away</Text>
                    </View>
                  </View>
                  <Text style={styles.walkStatusEta}>11 min</Text>
                </View>

                <View style={styles.sectionDividerTop} />

                <View style={styles.driverCard}>
                  <View style={styles.driverTopRow}>
                    <View style={styles.avatarColumn}>
                      <View style={styles.avatarWrap}>
                        <View style={styles.avatarCore}>
                          <AppIcon name="person" size={40} color="#1D4ED8" />
                        </View>
                      </View>
                      <View style={styles.avatarRatingRow}>
                        <Text style={styles.ratingText}>4.9</Text>
                        <AppIcon name="star" size={16} color="#FBBF24" />
                      </View>
                    </View>

                    <View style={styles.driverCopy}>
                      <View style={styles.nameRow}>
                        <Text style={styles.driverName} numberOfLines={1}>
                          Manoj Kumar Bathre
                        </Text>
                        <AppIcon name="verified" size={18} color="#2563EB" />
                      </View>

                      <View style={styles.metaRow}>
                        <Text style={styles.metaText}>2,342 rides</Text>
                      </View>

                      <Text style={styles.vehicleLabel}>Bajaj Auto</Text>
                      <View style={styles.platePill}>
                        <Text style={styles.plateText}>KA 03AB 8616</Text>
                      </View>
                    </View>

                    <View style={styles.vehiclePreview}>
                      <Image source={VEHICLE_IMAGE} style={styles.vehicleImage} resizeMode="contain" />
                    </View>
                  </View>
                </View>

                <View style={styles.actionStrip}>
                  <Pressable style={styles.actionStripItem}>
                    <AppIcon name="shield" size={26} color="#1754E8" />
                    <Text style={styles.actionStripLabel}>Safety</Text>
                  </Pressable>
                  <View style={styles.actionStripDivider} />
                  <Pressable style={styles.actionStripItem}>
                    <AppIcon name="share" size={26} color="#2563EB" />
                    <Text style={styles.actionStripLabel}>Share Trip</Text>
                  </Pressable>
                  <View style={styles.actionStripDivider} />
                  <Pressable style={styles.actionStripItem}>
                    <AppIcon name="support-agent" size={26} color="#7C3AED" />
                    <Text style={styles.actionStripLabel}>Support</Text>
                  </Pressable>
                </View>

                <Pressable style={styles.navigateButton}>
                  <AppIcon name="navigation" size={18} color="#2563EB" />
                  <Text style={styles.navigateButtonText}>Navigate</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.arrivalText}>Arriving in 5 min</Text>
                <View style={styles.sectionDividerTop} />

                <View style={styles.driverCard}>
                  <View style={styles.driverTopRow}>
                    <View style={styles.avatarColumn}>
                      <View style={styles.avatarWrap}>
                        <View style={styles.avatarCore}>
                          <AppIcon name="person" size={40} color="#1D4ED8" />
                        </View>
                      </View>
                      <View style={styles.avatarRatingRow}>
                        <Text style={styles.ratingText}>4.9</Text>
                        <AppIcon name="star" size={16} color="#FBBF24" />
                      </View>
                    </View>

                    <View style={styles.driverCopy}>
                      <View style={styles.nameRow}>
                        <Text style={styles.driverName} numberOfLines={1}>
                          Manoj Kumar Bathre
                        </Text>
                        <AppIcon name="verified" size={18} color="#2563EB" />
                      </View>

                      <View style={styles.metaRow}>
                        <Text style={styles.metaText}>2,342 rides</Text>
                      </View>

                      <Text style={styles.vehicleLabel}>Bajaj Auto</Text>
                      <View style={styles.platePill}>
                        <Text style={styles.plateText}>KA 03AB 8616</Text>
                      </View>
                    </View>

                    <View style={styles.vehiclePreview}>
                      <Image source={VEHICLE_IMAGE} style={styles.vehicleImage} resizeMode="contain" />
                    </View>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <Pressable style={styles.actionButton} onPress={onMessage}>
                    <AppIcon name="message" size={18} color="#64748B" />
                    <Text style={styles.actionText}>Message</Text>
                  </Pressable>
                  <Pressable style={styles.actionIconOnlyButton} onPress={onCall}>
                    <AppIcon name="call" size={18} color="#64748B" />
                  </Pressable>
                  <Pressable style={styles.actionIconDangerButton}>
                    <AppIcon name="cancel" size={18} color="#EF4444" />
                  </Pressable>
                </View>
              </>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  headerControls: {
    position: "absolute",
    top: 54,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 3,
  },
  headerIconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerWrap: {
    position: "absolute",
    left: -10,
    right: -10,
    zIndex: 1,
  },
  banner: {
    height: 82,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 10,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 2,
    ...SHADOWS.sheetSubtle,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginTop: 12,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bannerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerIconGlyph: {
    marginTop: -2,
  },
  bannerCopy: { flex: 1 },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  bannerSubtitle: {
    marginTop: 2,
    fontSize: 12.5,
    fontWeight: "500",
    color: "rgba(255,255,255,0.92)",
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  arrivedSheetBlock: {
    marginBottom: 2,
  },
  arrivedPinCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "flex-start",
  },
  arrivedPinPrompt: {
    fontSize: 13.5,
    fontWeight: "500",
    color: "#64748B",
  },
  arrivedPinRow: {
    width: "100%",
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  arrivedPinBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  arrivedPinDigit: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  arrivedDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  arrivedDriverCard: {
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  arrivedDriverLeft: {
    width: 62,
    alignItems: "center",
    marginRight: 10,
  },
  arrivedAvatarWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  arrivedRatingPill: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  arrivedRatingText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  arrivedDriverCopy: {
    flex: 1,
    minWidth: 0,
  },
  arrivedCallButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  arrivedPlate: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  arrivedVehicleLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
  },
  arrivedName: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  arrivedActionRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  arrivedMessagePill: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  arrivedMessageText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#475569",
  },
  arrivedCancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  arrivalText: {
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  walkStatusRow: {
    marginBottom: 10,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  walkStatusLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  walkStatusIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  walkStatusCopy: {
    flex: 1,
    minWidth: 0,
  },
  walkStatusTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  walkStatusSub: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
  },
  walkStatusEta: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "800",
    color: "#1754E8",
  },
  pickupCard: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pickupIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  pickupCopy: {
    flex: 1,
    minWidth: 0,
  },
  pickupTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  pickupAddress: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  pickupEtaBox: {
    minWidth: 112,
    borderRadius: 14,
    backgroundColor: "#F4F7FF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "flex-start",
  },
  pickupEtaTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1754E8",
  },
  pickupEtaSub: {
    marginTop: 2,
    fontSize: 10.5,
    color: "#475569",
    fontWeight: "500",
  },
  sectionDividerTop: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 10,
  },
  sectionDividerBalanced: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 10,
    marginBottom: 10,
  },
  driverCard: {
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  driverTopRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  avatarColumn: {
    width: 60,
    alignItems: "center",
    marginRight: 6,
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCore: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRatingRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  driverCopy: {
    flex: 1,
    paddingRight: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  driverName: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  metaRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  metaDot: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94A3B8",
  },
  metaText: {
    fontSize: 11.5,
    fontWeight: "500",
    color: "#64748B",
  },
  vehicleLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
  },
  platePill: {
    alignSelf: "flex-start",
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },
  plateText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#334155",
  },
  vehiclePreview: {
    width: 76,
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleImage: {
    width: 72,
    height: 52,
  },
  actionRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  actionStrip: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  actionStripItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionStripLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#475569",
  },
  actionStripDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  navigateButton: {
    marginTop: 10,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  navigateButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2563EB",
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  actionIconOnlyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconDangerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  cancelText: {
    color: "#EF4444",
  },
  tripCard: {
    marginTop: 4,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 6,
  },
  tripTopRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  tripRouteCol: {
    width: 18,
    alignItems: "center",
    marginRight: 6,
    paddingTop: 1,
  },
  tripRouteTop: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0F6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  tripRouteLine: {
    width: 0,
    height: 40,
    borderLeftWidth: 2,
    borderLeftColor: "#6B7280",
    borderStyle: "dotted",
    marginVertical: 2,
  },
  tripRouteBottom: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
  tripPlacesCol: {
    flex: 1,
    minWidth: 0,
    paddingRight: 0,
  },
  tripPlaceBlock: {
    paddingTop: 2,
    paddingBottom: 2,
  },
  tripPlaceTitleStrong: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800",
    color: "#111827",
  },
  tripPlaceSubStrong: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  tripDividerHorizontal: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },
  tripSummaryStrip: {
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: "#F5F7FC",
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tripSummaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tripSummaryValue: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#111827",
  },
  tripSummaryDivider: {
    width: 1,
    height: 18,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 6,
  },
});
