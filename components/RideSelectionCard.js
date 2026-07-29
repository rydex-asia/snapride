import React, { memo, useEffect } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import PremiumCard from "./PremiumCard";

import { COLORS } from "../theme/colors";
import { SHADOWS } from "../theme/shadows";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.24;

function RideSelectionCard({
  ride,
  index,
  selected = false,
  expanded = false,
  favorite = false,
  onPress,
  onFavorite,
  onDismiss,
}) {
  const translateX = useSharedValue(0);
  const pressScale = useSharedValue(1);
  const selectedScale = useSharedValue(selected ? 1.03 : 1);
  const expandedProgress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    selectedScale.value = withSpring(selected ? 1.03 : 1, {
      damping: 16,
      stiffness: 180,
      mass: 0.8,
    });
  }, [selected, selectedScale]);

  useEffect(() => {
    expandedProgress.value = withSpring(expanded ? 1 : 0, {
      damping: 16,
      stiffness: 180,
      mass: 0.8,
    });
  }, [expanded, expandedProgress]);

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-8, 0, 8],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { rotateZ: `${rotate}deg` },
        { scale: pressScale.value * selectedScale.value },
      ],
      shadowOpacity: 0,
      shadowRadius: selected ? 22 : 16,
      shadowOffset: { width: 0, height: selected ? 10 : 6 },
      elevation: selected ? 10 : 5,
    };
  }, [selected, selectedScale, pressScale]);

  const detailsStyle = useAnimatedStyle(() => ({
    opacity: expandedProgress.value,
    maxHeight: expandedProgress.value * 118,
    transform: [{ translateY: (1 - expandedProgress.value) * -10 }],
  }));

  const handleTap = () => {
    onPress?.(ride);
  };

  const handleFavorite = () => {
    onFavorite?.(ride);
    translateX.value = withSpring(0, {
      damping: 18,
      stiffness: 210,
      mass: 0.7,
    });
  };

  const handleDismiss = () => {
    translateX.value = withTiming(-SCREEN_WIDTH * 1.05, { duration: 180 }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)?.(ride);
      }
    });
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-8, 8])
    .onUpdate((event) => {
      translateX.value = event.translationX;
      if (Math.abs(event.translationX) > 6) {
        pressScale.value = withSpring(0.985, {
          damping: 18,
          stiffness: 220,
          mass: 0.7,
        });
      }
    })
    .onEnd((event) => {
      const dragX = event.translationX;
      if (dragX > SWIPE_THRESHOLD) {
        runOnJS(handleFavorite)();
      } else if (dragX < -SWIPE_THRESHOLD) {
        runOnJS(handleDismiss)();
      } else {
        translateX.value = withSpring(0, {
          damping: 18,
          stiffness: 220,
          mass: 0.7,
        });
      }
      pressScale.value = withSpring(1, {
        damping: 18,
        stiffness: 220,
        mass: 0.7,
      });
    })
    .onFinalize(() => {
      pressScale.value = withSpring(1, {
        damping: 18,
        stiffness: 220,
        mass: 0.7,
      });
    });

  const tapGesture = Gesture.Tap()
    .maxDistance(12)
    .onBegin(() => {
      pressScale.value = withSpring(0.96, {
        damping: 18,
        stiffness: 220,
        mass: 0.7,
      });
    })
    .onFinalize(() => {
      pressScale.value = withSpring(1, {
        damping: 18,
        stiffness: 220,
        mass: 0.7,
      });
    })
    .onEnd(() => {
      runOnJS(handleTap)();
    });

  const gesture = Gesture.Simultaneous(panGesture, tapGesture);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70).springify().damping(18)}
      style={[styles.entryWrap, animatedCardStyle, selected && styles.selectedWrap]}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.card, selected && styles.selectedCard]}>
          <View style={styles.topRow}>
            <View style={styles.imageWrap}>
              <Image source={ride.image} resizeMode="contain" style={styles.image} />
            </View>

            <View style={styles.copyWrap}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {ride.title}
                </Text>
                <View style={styles.capacityChip}>
                  <MaterialCommunityIcons name="account" size={12} color="#475467" />
                  <Text style={styles.capacityText}>{ride.capacity}</Text>
                </View>
              </View>

              <Text style={styles.subtitle} numberOfLines={2}>
                {ride.subtitle}
              </Text>

              <View style={styles.tagRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{ride.badge}</Text>
                </View>
                {favorite ? (
                  <View style={styles.favoriteBadge}>
                    <MaterialCommunityIcons name="heart" size={11} color="#F04438" />
                    <Text style={styles.favoriteText}>Saved</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.rightColumn}>
              <Text style={styles.price}>{ride.price}</Text>
              <Text style={styles.oldPrice}>{ride.oldPrice}</Text>
              <Text style={styles.eta}>{ride.eta}</Text>

              <View style={styles.selectionPill}>
                {selected ? (
                  <MaterialCommunityIcons name="check-circle" size={22} color={COLORS.primary} />
                ) : (
                  <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={20} color="#D0D5DD" />
                )}
              </View>
            </View>
          </View>

          <Animated.View style={[styles.details, detailsStyle]}>
            <View style={styles.detailRow}>
              <View style={styles.detailChip}>
                <MaterialCommunityIcons name="map-marker-distance" size={14} color={COLORS.primary} />
                <Text style={styles.detailChipText}>{ride.distance}</Text>
              </View>
              <View style={styles.detailChip}>
                <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.primary} />
                <Text style={styles.detailChipText}>{ride.eta}</Text>
              </View>
              <View style={styles.detailChip}>
                <MaterialCommunityIcons name="cash" size={14} color={COLORS.primary} />
                <Text style={styles.detailChipText}>{ride.price}</Text>
              </View>
            </View>

            <View style={styles.featuresRow}>
              {(ride.features || []).map((feature) => (
                <View key={feature} style={styles.featureChip}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

export default memo(RideSelectionCard);

const styles = StyleSheet.create({
  entryWrap: {
    alignSelf: "stretch",
  },
  selectedWrap: {
    zIndex: 2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    ...SHADOWS.card,
    overflow: "hidden",
  },
  selectedCard: {
    backgroundColor: "#ECFDF3",
    borderColor: COLORS.primary,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  imageWrap: {
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  image: {
    width: 60,
    height: 46,
  },
  copyWrap: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 2,
    paddingTop: 4,
    paddingRight: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    flex: 1,
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },
  capacityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F2F4F7",
  },
  capacityText: {
    color: "#475467",
    fontSize: 11,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    color: "#667085",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "COLORS.primaryLight",
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  favoriteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#FEF3F2",
  },
  favoriteText: {
    color: "#B42318",
    fontSize: 11,
    fontWeight: "700",
  },
  rightColumn: {
    alignItems: "flex-end",
    width: 84,
    paddingTop: 2,
    flexShrink: 0,
  },
  price: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
  oldPrice: {
    marginTop: 2,
    color: "#98A2B3",
    fontSize: 11,
    fontWeight: "600",
    textDecorationLine: "line-through",
  },
  eta: {
    marginTop: 4,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  selectionPill: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    overflow: "hidden",
    marginTop: 0,
  },
  detailRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailChipText: {
    color: "#344054",
    fontSize: 11,
    fontWeight: "700",
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  featureChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#ECFDF3",
  },
  featureText: {
    color: "#027A48",
    fontSize: 11,
    fontWeight: "700",
  },
});
