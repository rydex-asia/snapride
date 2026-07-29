import React from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AccountPageHeader from "../../components/AccountPageHeader";

export default function LogoutScreen({ onBack, onConfirm }) {
  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AccountPageHeader title="Logout" subtitle="Confirm sign out from this device" onBack={onBack} />

      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <LinearGradient
            colors={["#FEF2F2", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="logout" size={26} color="#D92D20" />
          </View>
          <Text style={styles.heroTitle}>You’re almost out</Text>
          <Text style={styles.heroSubtitle}>
            Logging out will clear the active session on this device. Your saved trips, addresses and preferences stay in sync for the next sign in.
          </Text>
        </View>

        <View style={styles.noteCard}>
          <MaterialCommunityIcons name="shield-check-outline" size={18} color="#1754E8" />
          <Text style={styles.noteText}>
            If you are using a shared phone, signing out helps protect your payment and ride history.
          </Text>
        </View>

        <View style={styles.footer}>
          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]} onPress={onBack}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.dangerButton, pressed && styles.dangerButtonPressed]} onPress={onConfirm}>
            <Text style={styles.dangerButtonText}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 28
  },
  dangerButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#D92D20",
    alignItems: "center",
    justifyContent: "center"
  },
  dangerButtonPressed: {
    opacity: 0.84
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700"
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 18,
    overflow: "hidden",
    marginBottom: 14
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D92D20",
    shadowOpacity: 0,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 0
  },
  heroSubtitle: {
    marginTop: 8,
    color: "#667085",
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: "500"
  },
  heroTitle: {
    marginTop: 14,
    color: "#111827",
    fontSize: 22,
    fontWeight: "800"
  },
  noteCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  noteText: {
    flex: 1,
    color: "#475467",
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "500"
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D0D5DD"
  },
  secondaryButtonPressed: {
    opacity: 0.78
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700"
  }
});
