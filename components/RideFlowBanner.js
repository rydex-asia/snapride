import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AppIcon from "./AppIcon";

const { height } = Dimensions.get("window");

export default function RideFlowBanner({
  text,
  icon = "confirmation-number",
  sheetRatio = 0.65,
  autoHide = false,
  hideAfterMs = 45000,
  visible = false,
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      progress.stopAnimation();
      Animated.timing(progress, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return undefined;
    }

    progress.stopAnimation();
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    if (!autoHide) return undefined;

    const timer = setTimeout(() => {
      Animated.timing(progress, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, hideAfterMs);

    return () => clearTimeout(timer);
  }, [autoHide, hideAfterMs, progress, text, visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.banner,
        {
          bottom: height * sheetRatio - 16,
          opacity: progress.interpolate({
            inputRange: [0, 0.18, 1],
            outputRange: [0, 0.65, 1],
          }),
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [78, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient colors={["#0B4EDB", "#104FDD"]} style={styles.bannerInner}>
        {text ? (
          <View style={styles.bannerTitleRow}>
            <AppIcon name={icon} size={22} color="#FFFFFF" style={styles.bannerIcon} />
            <Text style={styles.bannerText} numberOfLines={1}>
              {text}
            </Text>
          </View>
        ) : null}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1,
    elevation: 0,
  },
  bannerInner: {
    bottom: -15,
    height: 74,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  bannerTitleRow: {
    marginTop: -30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: 0,
  },
  bannerIcon: {
    marginRight: 5,
  },
  bannerText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },
});
