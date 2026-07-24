import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { FONT_FAMILY } from "../../theme/fonts";

export default function SplashScreen() {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Text style={styles.title}>RYDEX</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 40,
    fontFamily: FONT_FAMILY.headingExtraBold,
    fontWeight: "800",
    letterSpacing: 3,
  },
});
