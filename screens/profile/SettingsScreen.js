import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppIcon from "../../components/AppIcon";
import UnifiedPageHeader from "../../components/UnifiedPageHeader";

const GENERAL_ITEMS = [
  {
    key: "profile",
    icon: "account-outline",
    label: "Profile",
    detail: "Name, phone and personal details",
  },
  {
    key: "addresses",
    icon: "map-marker-outline",
    label: "Saved places",
    detail: "Home, work and favourite locations",
  },
  {
    key: "payments",
    icon: "credit-card-outline",
    label: "Payment methods",
    detail: "UPI, cards and cash",
  },
  {
    key: "transactions",
    icon: "receipt-text-outline",
    label: "Transactions",
    detail: "Payments, refunds and invoices",
  },
];

const OTHER_ITEMS = [
  {
    key: "language",
    icon: "translate",
    label: "Language",
    detail: "English",
    value: "EN",
  },
  {
    key: "about",
    icon: "information-outline",
    label: "About Rydex",
    detail: "Privacy, terms and app information",
    value: "0.1.0",
  },
];

function SettingsRow({ item, last, onPress, destructive = false }) {
  return (
    <View style={!last && styles.rowSpacing}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        <View style={styles.rowIcon}>
          <AppIcon name={item.icon} size={24} color={destructive ? "#C63232" : "#47586A"} />
        </View>
        <View style={styles.rowCopy}>
          <Text style={[styles.rowTitle, destructive && styles.destructive]}>{item.label}</Text>
          {item.detail ? (
            <Text style={styles.rowDetail} numberOfLines={2}>{item.detail}</Text>
          ) : null}
        </View>
        {item.value ? <Text style={styles.rowValue}>{item.value}</Text> : null}
        <AppIcon name="chevronRight" size={21} color="#737B85" />
      </Pressable>
    </View>
  );
}

function SwitchRow({ icon, label, detail, value, onValueChange, last }) {
  return (
    <View style={!last && styles.rowSpacing}>
      <View style={styles.row}>
        <View style={styles.rowIcon}>
          <AppIcon name={icon} size={24} color="#47586A" />
        </View>
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle}>{label}</Text>
          <Text style={styles.rowDetail}>{detail}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#D7DCE2", true: "#202124" }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#D7DCE2"
        />
      </View>
    </View>
  );
}

export default function SettingsScreen({
  onBack,
  onOpenHelp,
  onOpenEditProfile,
  onOpenSavedPlaces,
  onOpenTransactions,
  onOpenPayments,
  onOpenLogout,
}) {
  const insets = useSafeAreaInsets();
  const [rideUpdates, setRideUpdates] = useState(true);
  const [offerUpdates, setOfferUpdates] = useState(false);
  const [headerBorder, setHeaderBorder] = useState(false);
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const openItem = (key) => {
    if (key === "profile") return onOpenEditProfile?.();
    if (key === "addresses") return onOpenSavedPlaces?.();
    if (key === "payments") return onOpenPayments?.();
    if (key === "transactions") return onOpenTransactions?.();
    return undefined;
  };

  return (
    <View style={styles.safe}>
      <UnifiedPageHeader
        title="Settings"
        onBack={onBack}
        actionLabel="Help"
        onAction={onOpenHelp}
        elevated={headerBorder}
        backgroundColor="#FFFFFF"
        largeTitle
      />

      <Animated.ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => setHeaderBorder(event.nativeEvent.contentOffset.y > 4)}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(36, insets.bottom + 24) }]}
      >
        <Animated.View
          style={{
            opacity: entrance,
            transform: [{
              translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
            }],
          }}
        >
          <Text style={styles.sectionLabel}>GENERAL</Text>
          <View style={styles.group}>
            {GENERAL_ITEMS.map((item, index) => (
              <SettingsRow
                key={item.key}
                item={item}
                last={index === GENERAL_ITEMS.length - 1}
                onPress={() => openItem(item.key)}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>COMMUNICATION</Text>
          <View style={styles.group}>
            <SwitchRow
              icon="bell-outline"
              label="Trip updates"
              detail="Captain arrival, delivery and receipts"
              value={rideUpdates}
              onValueChange={setRideUpdates}
            />
            <SwitchRow
              icon="tag-outline"
              label="Offers and updates"
              detail="Relevant savings and recommendations"
              value={offerUpdates}
              onValueChange={setOfferUpdates}
              last
            />
          </View>

          <Text style={styles.sectionLabel}>OTHERS</Text>
          <View style={styles.group}>
            {OTHER_ITEMS.map((item, index) => (
              <SettingsRow
                key={item.key}
                item={item}
                last={index === OTHER_ITEMS.length - 1}
              />
            ))}
          </View>

          <View style={styles.accountActions}>
            <SettingsRow
              item={{ icon: "logout", label: "Log out", detail: "Sign out of this device" }}
              onPress={onOpenLogout}
              last
              destructive
            />
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 18, paddingTop: 1 },
  sectionLabel: {
    marginTop: 22,
    marginBottom: 8,
    marginLeft: 7,
    color: "#3730A3",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    letterSpacing: 0.55,
  },
  group: {
    backgroundColor: "transparent",
  },
  row: {
    minHeight: 82,
    paddingHorizontal: 0,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  rowPressed: { opacity: 0.68 },
  rowSpacing: { marginBottom: 0 },
  rowIcon: {
    width: 38,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  rowCopy: { flex: 1, minWidth: 0, paddingRight: 10 },
  rowTitle: {
    color: "#16191D",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
  rowDetail: {
    marginTop: 3,
    color: "#66717F",
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "400",
  },
  rowValue: {
    marginRight: 10,
    color: "#7C838D",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },
  accountActions: {
    marginTop: 2,
    backgroundColor: "transparent",
  },
  destructive: { color: "#B82A2A" },
});
