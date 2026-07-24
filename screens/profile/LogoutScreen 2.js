import React from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AccountPageHeader from "../../components/AccountPageHeader";

export default function LogoutScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8FC" />
      <View style={styles.screen}>
        <AccountPageHeader title="Logout" subtitle="Confirm sign out" onBack={onBack} />
        <View style={styles.placeholder}>
          <Text style={styles.eyebrow}>profile</Text>
          <Text style={styles.title}>Logout Confirmation</Text>
        </View>
      </View>
    </SafeAreaView>
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
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  safe: {
    flex: 1,
    backgroundColor: "#F6F8FC"
  },
  screen: {
    flex: 1,
    backgroundColor: "#F6F8FC"
  },
  title: {
    color: "#111111",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center"
  }
});
