import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function CorpWalletScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>payments</Text>
      <Text style={styles.title}>Corporate Wallet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: "#8A8A8A",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  title: {
    color: "#111111",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center"
  }
});
