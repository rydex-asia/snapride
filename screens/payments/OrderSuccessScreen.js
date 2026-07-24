import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

const GREEN = "#078A49";
const INK = "#15181C";
const MUTED = "#667085";
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function OrderSuccessScreen({
  orderId = "#FRZ123456",
  eta = "25–30 min",
  onTrackOrder,
  onBackHome,
}) {
  const successScale = useRef(new Animated.Value(0.82)).current;
  const checkProgress = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        damping: 15,
        stiffness: 170,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(90),
        Animated.timing(checkProgress, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.delay(180),
        Animated.timing(actionsOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);
    animation.start();
    return () => animation.stop();
  }, [actionsOpacity, checkProgress, contentOpacity, successScale]);

  const checkOffset = checkProgress.interpolate({ inputRange: [0, 1], outputRange: [76, 0] });

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
        <View style={styles.glow} />
        <Animated.View style={[styles.successCircle, { transform: [{ scale: successScale }] }]}>
          <Svg width={92} height={92} viewBox="0 0 100 100">
            <AnimatedPath
              d="M25 51 L42 67 L75 32"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={9}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="76 76"
              strokeDashoffset={checkOffset}
            />
          </Svg>
        </Animated.View>
        <Text style={styles.title}>Order confirmed!</Text>
        <Text style={styles.subtitle}>Your groceries are being prepared with care</Text>
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <View style={styles.metaIcon}><MaterialCommunityIcons name="receipt-text-outline" size={18} color={GREEN} /></View>
            <View style={styles.metaCopy}><Text style={styles.metaLabel}>Order ID</Text><Text style={styles.metaValue}>{orderId}</Text></View>
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <View style={styles.metaIcon}><MaterialCommunityIcons name="clock-outline" size={18} color={GREEN} /></View>
            <View style={styles.metaCopy}><Text style={styles.metaLabel}>Estimated delivery</Text><Text style={styles.metaValue}>{eta}</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.actions, {
        opacity: actionsOpacity,
        transform: [{ translateY: actionsOpacity.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
      }]}>
        <Pressable style={({ pressed }) => [styles.trackButton, pressed && styles.pressed]} onPress={onTrackOrder}>
          <Text style={styles.trackButtonText}>Track order</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
        </Pressable>
        <Pressable style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]} onPress={onBackHome}>
          <Text style={styles.homeButtonText}>Back to home</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  glow: { backgroundColor: "#EAF8EE", borderRadius: 94, height: 188, opacity: 0.75, position: "absolute", width: 188 },
  successCircle: { alignItems: "center", backgroundColor: GREEN, borderRadius: 58, height: 116, justifyContent: "center", shadowColor: GREEN, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0, shadowRadius: 18, width: 116 },
  title: { color: INK, fontFamily: "Inter_600SemiBold", fontSize: 26, marginTop: 24 },
  subtitle: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, marginTop: 7, textAlign: "center" },
  metaCard: { alignSelf: "stretch", backgroundColor: "#F7F8FA", borderRadius: 18, marginTop: 28, overflow: "hidden", paddingHorizontal: 15 },
  metaRow: { alignItems: "center", flexDirection: "row", minHeight: 62 },
  metaIcon: { alignItems: "center", backgroundColor: "#E8F7ED", borderRadius: 18, height: 36, justifyContent: "center", marginRight: 11, width: 36 },
  metaCopy: { flex: 1 },
  metaLabel: { color: MUTED, fontFamily: "Inter_400Regular", fontSize: 11 },
  metaValue: { color: INK, fontFamily: "Inter_600SemiBold", fontSize: 14, marginTop: 2 },
  divider: { backgroundColor: "#E7E9ED", height: StyleSheet.hairlineWidth, marginLeft: 47 },
  actions: { backgroundColor: "#FFFFFF", paddingBottom: 14, paddingHorizontal: 16, paddingTop: 10 },
  trackButton: { alignItems: "center", backgroundColor: GREEN, borderRadius: 14, flexDirection: "row", height: 52, justifyContent: "center", gap: 8 },
  trackButtonText: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 15 },
  homeButton: { alignItems: "center", height: 46, justifyContent: "center", marginTop: 3 },
  homeButtonText: { color: GREEN, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  pressed: { opacity: 0.84 },
});
