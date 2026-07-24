import React from "react";
import { View, Text, StyleSheet, Pressable, ImageBackground } from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OnboardingScreen } from "./OnboardingKit";

export default function IntroScreen({ onSkip, onNext }) {
  const insets = useSafeAreaInsets();

  return (
    <OnboardingScreen style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ImageBackground
        source={require("../../assets/intro.png")}
        resizeMode="cover"
        style={styles.page}
        imageStyle={styles.imageStyle}
      >
        <View style={[styles.overlay, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 18 }]}>
          <View style={styles.topRow}>
            <Pressable onPress={onSkip} hitSlop={12} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>

          <View style={styles.spacer} />

          <View style={styles.bottomBlock}>
            <View style={styles.copyBlock}>
              <Text style={styles.title}>Your Journey.</Text>
              <Text style={styles.subtitle}>Your time. Your earnings.</Text>
            </View>

            <View style={styles.pagerWrap}>
              <View style={styles.pager}>
                <View style={[styles.pagerDot, styles.pagerDotActive]} />
                <View style={styles.pagerDot} />
                <View style={styles.pagerDot} />
              </View>
            </View>

            <View style={styles.footer}>
              <Pressable onPress={onNext} style={({ pressed }) => [styles.nextButton, pressed && styles.nextPressed]}>
                <MaterialCommunityIcons name="arrow-right" size={34} color="#0F0D12" />
              </Pressable>
            </View>
          </View>
        </View>
      </ImageBackground>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  bottomBlock: {
    paddingBottom: 2
  },
  copyBlock: {
    alignItems: "center"
  },
  footer: {
    marginTop: 22,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  imageStyle: {
    width: "100%",
    height: "100%"
  },
  nextButton: {
    width: "100%",
    height: 42,
    borderRadius: 41,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 0
  },
  nextPressed: {
    opacity: 0.94
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 22
  },
  page: {
    flex: 1
  },
  pager: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  pagerWrap: {
    marginTop: 26,
    alignItems: "center"
  },
  screen: {
    backgroundColor: "#120D18",
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0
  },
  skipButton: {
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400"
  },
  spacer: {
    flex: 1
  },
  subtitle: {
    marginTop: 10,
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "400",
    textAlign: "center"
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 48,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.8
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center"
  }
});
