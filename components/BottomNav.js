import React, { useCallback, useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";
import AppIcon from "./AppIcon";

const PREMIUM_TAB_ICON_NAMES = {
  home: "nav-ride",
  travel: "nav-travel",
  parcel: "nav-parcel",
  metro: "nav-metro",
  grocery: "nav-grocery",
  account: "nav-account",
};

function BottomNavSvgIcon({ name, active = false, size = 24, color = "#252A31" }) {
  if (name === "home") {
    if (active) {
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3.1 10.28C3.1 9.58 3.42 8.92 3.97 8.49L10.57 3.34C11.41 2.69 12.59 2.69 13.43 3.34L20.03 8.49C20.58 8.92 20.9 9.58 20.9 10.28V19.1C20.9 20.15 20.05 21 19 21H14.65V15.9C14.65 15.18 14.07 14.6 13.35 14.6H10.65C9.93 14.6 9.35 15.18 9.35 15.9V21H5C3.95 21 3.1 20.15 3.1 19.1V10.28Z"
            fill={color}
          />
        </Svg>
      );
    }
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3.1 10.28C3.1 9.58 3.42 8.92 3.97 8.49L10.57 3.34C11.41 2.69 12.59 2.69 13.43 3.34L20.03 8.49C20.58 8.92 20.9 9.58 20.9 10.28V19.1C20.9 20.15 20.05 21 19 21H5C3.95 21 3.1 20.15 3.1 19.1V10.28Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9.35 20.8V15.9C9.35 15.18 9.93 14.6 10.65 14.6H13.35C14.07 14.6 14.65 15.18 14.65 15.9V20.8"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === "travel") {
    if (active) {
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 3.25C8.03 3.25 7.25 4.03 7.25 5V6.25H5.35C3.78 6.25 2.5 7.53 2.5 9.1V18.15C2.5 19.72 3.78 21 5.35 21H18.65C20.22 21 21.5 19.72 21.5 18.15V9.1C21.5 7.53 20.22 6.25 18.65 6.25H16.75V5C16.75 4.03 15.97 3.25 15 3.25H9ZM9.15 5.15H14.85V6.25H9.15V5.15Z"
            fill={color}
          />
          <Path d="M7 9V18.25M17 9V18.25" stroke="#FFFFFF" strokeWidth={1.35} strokeLinecap="round" />
        </Svg>
      );
    }
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M7.25 6.25V5C7.25 4.03 8.03 3.25 9 3.25H15C15.97 3.25 16.75 4.03 16.75 5V6.25"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Rect x={2.5} y={6.25} width={19} height={14.75} rx={2.85} stroke={color} strokeWidth={1.8} />
        <Path
          d="M7 8.8V18.4M17 8.8V18.4"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (name === "parcel") {
    if (active) {
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3.15 7.45C3.15 6.75 3.53 6.1 4.14 5.76L11.06 1.94C11.65 1.61 12.35 1.61 12.94 1.94L19.86 5.76C20.47 6.1 20.85 6.75 20.85 7.45V16.55C20.85 17.25 20.47 17.9 19.86 18.24L12.94 22.06C12.35 22.39 11.65 22.39 11.06 22.06L4.14 18.24C3.53 17.9 3.15 17.25 3.15 16.55V7.45Z"
            fill={color}
          />
          <Path d="M3.9 6.9L12 11.35L20.1 6.9M12 11.35V21.1" stroke="#FFFFFF" strokeWidth={1.35} strokeLinejoin="round" />
          <Path d="M8.05 4.05L16.15 8.5V12.1" stroke="#FFFFFF" strokeWidth={1.35} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    }
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3.15 7.45C3.15 6.75 3.53 6.1 4.14 5.76L11.06 1.94C11.65 1.61 12.35 1.61 12.94 1.94L19.86 5.76C20.47 6.1 20.85 6.75 20.85 7.45V16.55C20.85 17.25 20.47 17.9 19.86 18.24L12.94 22.06C12.35 22.39 11.65 22.39 11.06 22.06L4.14 18.24C3.53 17.9 3.15 17.25 3.15 16.55V7.45Z"
          stroke={color}
          strokeWidth={1.75}
          strokeLinejoin="round"
        />
        <Path
          d="M3.9 6.9L12 11.35L20.1 6.9M12 11.35V21.1"
          stroke={color}
          strokeWidth={1.65}
          strokeLinejoin="round"
        />
        <Path
          d="M8.05 4.05L16.15 8.5V12.1"
          stroke={color}
          strokeWidth={1.65}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === "metro") {
    if (active) {
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M7 2.5H17C19.21 2.5 21 4.29 21 6.5V15.5C21 17.71 19.21 19.5 17 19.5H7C4.79 19.5 3 17.71 3 15.5V6.5C3 4.29 4.79 2.5 7 2.5Z"
            fill={color}
          />
          <Rect x={5.25} y={5.15} width={13.5} height={7.2} rx={1.2} fill="#FFFFFF" />
          <Path d="M7.2 22L9.35 19.5M16.8 22L14.65 19.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M7.4 15.75H7.42M16.58 15.75H16.6" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
      );
    }
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M7 2.5H17C19.21 2.5 21 4.29 21 6.5V15.5C21 17.71 19.21 19.5 17 19.5H7C4.79 19.5 3 17.71 3 15.5V6.5C3 4.29 4.79 2.5 7 2.5Z"
          stroke={color}
          strokeWidth={1.7}
        />
        <Rect x={5.25} y={5.15} width={13.5} height={7.2} rx={1.2} stroke={color} strokeWidth={1.45} />
        <Path
          d="M7.2 22L9.35 19.5M16.8 22L14.65 19.5M7.4 15.75H7.42M16.58 15.75H16.6"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (name === "grocery") {
    if (active) {
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4.25 8.5H19.75L18.2 19.1C18.05 20.15 17.15 20.92 16.1 20.92H7.9C6.85 20.92 5.95 20.15 5.8 19.1L4.25 8.5Z" fill={color} />
          <Path d="M8.2 8.5L10.05 3.9M15.8 8.5L13.95 3.9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M8.2 12.65H15.8M8.75 16.45H15.25" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" />
        </Svg>
      );
    }
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M5 9.25H19L17.7 19H6.3L5 9.25Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8.25 9.25L10.1 4.75M15.75 9.25L13.9 4.75"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Path d="M8.2 13H15.8M8.8 16.25H15.2" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "account") {
    if (active) {
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 11.15C14.57 11.15 16.65 9.07 16.65 6.5C16.65 3.93 14.57 1.85 12 1.85C9.43 1.85 7.35 3.93 7.35 6.5C7.35 9.07 9.43 11.15 12 11.15Z" fill={color} />
          <Path d="M3.15 20.23C3.15 15.98 7.11 12.85 12 12.85C16.89 12.85 20.85 15.98 20.85 20.23C20.85 21.29 19.99 22.15 18.93 22.15H5.07C4.01 22.15 3.15 21.29 3.15 20.23Z" fill={color} />
        </Svg>
      );
    }
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 11.15C14.57 11.15 16.65 9.07 16.65 6.5C16.65 3.93 14.57 1.85 12 1.85C9.43 1.85 7.35 3.93 7.35 6.5C7.35 9.07 9.43 11.15 12 11.15Z"
          stroke={color}
          strokeWidth={1.75}
        />
        <Path
          d="M3.15 20.23C3.15 15.98 7.11 12.85 12 12.85C16.89 12.85 20.85 15.98 20.85 20.23C20.85 21.29 19.99 22.15 18.93 22.15H5.07C4.01 22.15 3.15 21.29 3.15 20.23Z"
          stroke={color}
          strokeWidth={1.75}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return null;
}

function BottomNavTab({ item, active, onSelect }) {
  const scale = useRef(new Animated.Value(1)).current;
  const activeProgress = useRef(new Animated.Value(active ? 1 : 0)).current;
  const iconColor = active ? "#111111" : "#5F6670";
  const iconSize = 27;
  const premiumIconName = PREMIUM_TAB_ICON_NAMES[item.icon] || item.icon;

  const animatePress = useCallback(
    (toValue) => {
      Animated.spring(scale, {
        toValue,
        stiffness: 210,
        damping: 20,
        mass: 1.05,
        useNativeDriver: true,
      }).start();
    },
    [scale]
  );

  useEffect(() => {
    Animated.spring(activeProgress, {
      toValue: active ? 1 : 0,
      stiffness: 190,
      damping: 19,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [active, activeProgress]);

  return (
    <Pressable
      onPress={() => onSelect?.(item.key)}
      onPressIn={() => animatePress(0.88)}
      onPressOut={() => animatePress(1)}
      style={styles.tabSlot}
    >
      <Animated.View
        style={[
          styles.tabMotion,
          {
            transform: [
              { scale },
              {
                translateY: activeProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -2],
                }),
              },
            ],
          },
        ]}
      >
        <View style={[styles.iconShell, active && styles.iconShellActive]}>
          <AppIcon
            name={premiumIconName}
            active={active}
            variant={active ? "filled" : "outline"}
            size={iconSize}
            color={iconColor}
          />
        </View>
        <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
          {item.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function BottomNav({ items = [], activeKey, onSelect, animatedStyle }) {
  const insets = useSafeAreaInsets();
  const devicePanelHeight = Math.max(
    insets.bottom,
    Platform.OS === "android" ? 48 : 20
  );

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.shell,
        {
          height: APP_TAB_HEIGHT + devicePanelHeight,
        },
      ]}
    >
      <View
        pointerEvents="box-none"
        style={[styles.appBarClip, { bottom: devicePanelHeight }]}
      >
        <Animated.View style={[styles.appBarLayer, animatedStyle]}>
          {items.map((item) => (
            <BottomNavTab
              key={item.key}
              item={item}
              active={item.key === activeKey}
              onSelect={onSelect}
            />
          ))}
        </Animated.View>
      </View>
      <View
        pointerEvents="none"
        style={[styles.deviceNavigationPanel, { height: devicePanelHeight }]}
      />
    </Animated.View>
  );
}

const APP_TAB_HEIGHT = 72;

const styles = StyleSheet.create({
  deviceNavigationPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 4,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6
  },
  shell: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 80,
    overflow: "visible"
  },
  appBarLayer: {
    width: "100%",
    height: APP_TAB_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: 0,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 7,
    zIndex: 2,
    shadowColor: "#111827",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8
  },
  appBarClip: {
    position: "absolute",
    left: 0,
    right: 0,
    height: APP_TAB_HEIGHT,
    overflow: "visible",
    zIndex: 2
  },
  tabSlot: {
    zIndex: 1,
    flex: 1,
    minWidth: 0,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start"
  },
  tabMotion: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 0
  },
  label: {
    color: "#5F6670",
    fontSize: 11.5,
    fontWeight: "600",
    marginTop: -1
  },
  labelActive: {
    color: "#111111",
    fontWeight: "700"
  },
  iconShell: {
    width: 44,
    height: 32,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
    overflow: "hidden",
  },
  iconShellActive: {
    backgroundColor: "transparent",
  },
});
