import React, { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AccountPageHeader from "../../components/AccountPageHeader";

const NOTIFICATION_CHANNELS = [
  {
    key: "rides",
    icon: "car-connected",
    title: "Ride updates",
    subtitle: "Driver assigned, arriving, started and completed",
    accent: "#1754E8",
  },
  {
    key: "driver",
    icon: "shield-account-outline",
    title: "Driver alerts",
    subtitle: "Driver messages, navigation and verification",
    accent: "#0F9D58",
  },
  {
    key: "offers",
    icon: "tag-outline",
    title: "Offers and rewards",
    subtitle: "Coupons, cashback and loyalty reminders",
    accent: "#7C3AED",
  },
  {
    key: "promos",
    icon: "bullhorn-outline",
    title: "Promotions",
    subtitle: "Product announcements and seasonal offers",
    accent: "#F97316",
  },
];

function ToggleRow({ item, value, onValueChange }) {
  return (
    <Pressable style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: `${item.accent}14` }]}>
        <MaterialCommunityIcons name={item.icon} size={22} color={item.accent} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
      </View>
      <Switch
        trackColor={{ false: "#D0D5DD", true: `${item.accent}66` }}
        thumbColor={value ? item.accent : "#FFFFFF"}
        ios_backgroundColor="#D0D5DD"
        onValueChange={onValueChange}
        value={value}
      />
    </Pressable>
  );
}

export default function NotificationsScreen({ onBack }) {
  const [toggles, setToggles] = useState({
    rides: true,
    driver: true,
    offers: false,
    promos: false,
  });

  const setToggle = (key) => (value) => {
    setToggles((current) => ({ ...current, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8FC" />
      <AccountPageHeader title="Notifications" subtitle="Choose what you want to hear about" onBack={onBack} />

      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <LinearGradient
            colors={["#EFF4FF", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="bell-ring-outline" size={26} color="#1754E8" />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Stay in the loop</Text>
            <Text style={styles.heroSubtitle}>
              Keep the important ride updates on, and mute the rest when you want a quieter day.
            </Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Notification categories</Text>
          <View style={styles.card}>
            {NOTIFICATION_CHANNELS.map((item, index) => (
              <View key={item.key}>
                <ToggleRow item={item} value={toggles[item.key]} onValueChange={setToggle(item.key)} />
                {index !== NOTIFICATION_CHANNELS.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.noteCard}>
          <MaterialCommunityIcons name="shield-check-outline" size={20} color="#1754E8" />
          <Text style={styles.noteText}>
            Critical safety alerts remain enabled so you can always reach support when a trip needs attention.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14
  },
  content: {
    padding: 16,
    paddingBottom: 28
  },
  divider: {
    height: 1,
    marginLeft: 54,
    backgroundColor: "#F0F2F5"
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 18,
    overflow: "hidden",
    marginBottom: 16
  },
  heroCopy: {
    marginTop: 14
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1754E8",
    shadowOpacity: 0,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 0
  },
  heroSubtitle: {
    marginTop: 6,
    color: "#667085",
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: "500"
  },
  heroTitle: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "800"
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  noteCard: {
    marginTop: 14,
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
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  rowCopy: {
    flex: 1
  },
  rowSubtitle: {
    marginTop: 3,
    color: "#667085",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "500"
  },
  rowTitle: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600"
  },
  safe: {
    flex: 1,
    backgroundColor: "#F6F8FC"
  },
  screen: {
    flex: 1,
    backgroundColor: "#F6F8FC"
  },
  sectionBlock: {
    marginBottom: 2
  },
  sectionLabel: {
    marginBottom: 8,
    color: "#475467",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  }
});
