import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STAGE_CONTENT = {
  searchingCaptain: {
    icon: "radar",
    accent: "#60A5FA",
    compact: "Finding captain",
    title: "Finding your captain",
    subtitle: "Matching you with a nearby driver",
    eta: "•••",
  },
  onTheWay: {
    icon: "motorbike",
    accent: "#60A5FA",
    compact: "Captain arriving",
    title: "Captain is on the way",
    subtitle: "Heading to your pickup point",
    eta: "2 min",
  },
  arrivedPickup: {
    icon: "map-marker-check",
    accent: "#34D399",
    compact: "Captain arrived",
    title: "Captain has arrived",
    subtitle: "Meet your captain at pickup",
    eta: "Arrived",
  },
  onTrip: {
    icon: "navigation-variant",
    accent: "#34D399",
    compact: "Ride in progress",
    title: "On the way to your destination",
    subtitle: "Your trip is progressing normally",
    eta: "12 min",
  },
  navigation: {
    icon: "navigation-variant",
    accent: "#34D399",
    compact: "Ride in progress",
    title: "On the way to your destination",
    subtitle: "Your trip is progressing normally",
    eta: "12 min",
  },
  tripCompleted: {
    icon: "check-circle",
    accent: "#34D399",
    compact: "Trip completed",
    title: "You’ve arrived",
    subtitle: "Your trip has been completed",
    eta: "Done",
  },
};

export default function RideDynamicIsland({
  visible,
  stage,
}) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const content = STAGE_CONTENT[stage] || STAGE_CONTENT.searchingCaptain;
  const expandedWidth = Math.min(screenWidth - 56, 270);

  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: expanded ? 1 : 0,
      stiffness: 220,
      damping: 25,
      mass: 0.86,
      useNativeDriver: false,
    }).start();
  }, [expandAnim, expanded]);

  useEffect(() => {
    if (!visible) return undefined;

    setExpanded(true);
    const timer = setTimeout(() => setExpanded(false), 2100);
    return () => clearTimeout(timer);
  }, [stage, visible]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  if (!visible) return null;

  const islandWidth = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [150, expandedWidth],
  });
  const islandHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [36, 64],
  });
  const compactOpacity = expandAnim.interpolate({
    inputRange: [0, 0.42, 1],
    outputRange: [1, 0, 0],
  });
  const expandedOpacity = expandAnim.interpolate({
    inputRange: [0, 0.58, 1],
    outputRange: [0, 0, 1],
  });
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1.18],
  });

  return (
    <View pointerEvents="box-none" style={[styles.overlay, { top: Math.max(insets.top - 2, 8) }]}>
      <Pressable onPress={() => setExpanded((current) => !current)}>
        <Animated.View
          style={[
            styles.island,
            {
              width: islandWidth,
              height: islandHeight,
              borderRadius: expandAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 23],
              }),
            },
          ]}
        >
          <Animated.View pointerEvents="none" style={[styles.compactContent, { opacity: compactOpacity }]}>
            <View style={styles.compactIconWrap}>
              <MaterialCommunityIcons name={content.icon} size={17} color={content.accent} />
              <Animated.View
                style={[
                  styles.pulseDot,
                  {
                    backgroundColor: content.accent,
                    opacity: pulseAnim,
                    transform: [{ scale: pulseScale }],
                  },
                ]}
              />
            </View>
            <Text style={styles.compactText} numberOfLines={1}>{content.compact}</Text>
            <Text style={[styles.compactEta, { color: content.accent }]}>{content.eta}</Text>
          </Animated.View>

          <Animated.View
            pointerEvents={expanded ? "auto" : "none"}
            style={[styles.expandedContent, { opacity: expandedOpacity }]}
          >
            <View style={styles.expandedTopRow}>
              <View style={[styles.expandedIcon, { backgroundColor: `${content.accent}20` }]}>
                <MaterialCommunityIcons name={content.icon} size={23} color={content.accent} />
              </View>
              <View style={styles.expandedCopy}>
                <Text style={styles.expandedTitle} numberOfLines={1}>{content.title}</Text>
                <Text style={styles.expandedSubtitle} numberOfLines={1}>
                  {content.subtitle}
                </Text>
              </View>
              <Text style={[styles.expandedEta, { color: content.accent }]}>{content.eta}</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 120,
    elevation: 0,
    alignItems: "center",
  },
  island: {
    overflow: "hidden",
    backgroundColor: "#050607",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0,
    shadowRadius: 16,
    elevation: 0,
  },
  compactContent: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  compactIconWrap: {
    width: 23,
    height: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseDot: {
    position: "absolute",
    right: 0,
    top: 1,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  compactText: {
    flex: 1,
    marginHorizontal: 6,
    color: "#F8FAFC",
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_600SemiBold",
  },
  compactEta: {
    fontSize: 10,
    lineHeight: 13,
    fontFamily: "Inter_700Bold",
  },
  expandedContent: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 11,
    justifyContent: "center",
  },
  expandedTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandedIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  expandedCopy: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
  },
  expandedTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "Inter_600SemiBold",
  },
  expandedSubtitle: {
    marginTop: 1,
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 12,
    fontFamily: "Inter_400Regular",
  },
  expandedEta: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_700Bold",
  },
});
