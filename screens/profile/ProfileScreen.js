import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

const PRIMARY_ACTIONS = [
  { key: "wallet", icon: "wallet-outline", label: "Wallet", detail: "Balance, top-ups and wallet activity" },
  { key: "payments", icon: "credit-card-outline", label: "Payments", detail: "UPI, cards, wallets and cash" },
  { key: "support", icon: "headset", label: "Help", detail: "Support for rides, parcels and payments" },
];

const ACCOUNT_ITEMS = [
  { key: "savedPlaces", icon: "map-marker-outline", label: "Saved places", detail: "Home, work and frequent locations" },
  { key: "receipts", icon: "file-document-outline", label: "Receipts", detail: "Download invoices from completed activity" },
  { key: "safety", icon: "shield-check-outline", label: "Safety centre", detail: "Emergency tools and trusted contacts" },
  { key: "rewards", icon: "gift-outline", label: "Refer and earn", detail: "Invite friends and earn credits" },
  { key: "settings", icon: "cog-outline", label: "Settings", detail: "Account, payments and notifications" },
];

function PremiumAccountIcon({ name, size = 22, color = "#30343A" }) {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const artwork = (() => {
    switch (name) {
      case "wallet-outline":
        return (
          <>
            <Path {...common} d="M4.2 7.4h13.9a2 2 0 0 1 2 2v8.1a2 2 0 0 1-2 2H5.9a2 2 0 0 1-2-2V6.1a2 2 0 0 1 2-2h10.3" />
            <Path {...common} d="M15.7 11h4.4v4.6h-4.4a2.3 2.3 0 1 1 0-4.6Z" />
            <Circle cx="16.2" cy="13.3" r="0.75" fill={color} />
          </>
        );
      case "credit-card-outline":
        return (
          <>
            <Rect {...common} x="3.4" y="5.2" width="17.2" height="13.6" rx="2.4" />
            <Line {...common} x1="3.8" y1="9.3" x2="20.2" y2="9.3" />
            <Line {...common} x1="6.6" y1="15.3" x2="11.2" y2="15.3" />
          </>
        );
      case "headset":
        return (
          <>
            <Path {...common} d="M4.6 13.4v-2a7.4 7.4 0 0 1 14.8 0v2" />
            <Path {...common} d="M4.6 12.4h2.1a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5H5.9a1.3 1.3 0 0 1-1.3-1.3v-4.7Z" />
            <Path {...common} d="M19.4 12.4h-2.1a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h2.1M19.3 18.2c-.5 1.5-1.8 2.2-3.8 2.2" />
          </>
        );
      case "map-marker-outline":
        return (
          <>
            <Path {...common} d="M19.1 10.3c0 5.2-7.1 10.2-7.1 10.2S4.9 15.5 4.9 10.3a7.1 7.1 0 1 1 14.2 0Z" />
            <Circle {...common} cx="12" cy="10.2" r="2.4" />
          </>
        );
      case "file-document-outline":
        return (
          <>
            <Path {...common} d="M6 3.7h9l3 3v13.6l-2-1.1-2 1.1-2-1.1-2 1.1-2-1.1-2 1.1V3.7Z" />
            <Path {...common} d="M14.8 3.9v3.3h3.1M9 10.6h6M9 14h4.5" />
          </>
        );
      case "shield-check-outline":
        return (
          <>
            <Path {...common} d="M12 3.4c2.2 1.7 4.5 2.5 7 2.7v5.4c0 4.2-2.4 7.2-7 9.1-4.6-1.9-7-4.9-7-9.1V6.1c2.5-.2 4.8-1 7-2.7Z" />
            <Path {...common} d="m8.7 12 2.1 2.1 4.6-4.6" />
          </>
        );
      case "gift-outline":
        return (
          <>
            <Rect {...common} x="4" y="9.2" width="16" height="10.5" rx="1.8" />
            <Path {...common} d="M3.5 6.8h17v4.1h-17zM12 6.8v12.9" />
            <Path {...common} d="M11.8 6.7H8.4a2.1 2.1 0 1 1 2.1-2.1c0 1.2 1.3 2.1 1.3 2.1ZM12.2 6.7h3.4a2.1 2.1 0 1 0-2.1-2.1c0 1.2-1.3 2.1-1.3 2.1Z" />
          </>
        );
      case "cog-outline":
        return (
          <>
            <Line {...common} x1="4" y1="6.5" x2="20" y2="6.5" />
            <Line {...common} x1="4" y1="12" x2="20" y2="12" />
            <Line {...common} x1="4" y1="17.5" x2="20" y2="17.5" />
            <Circle cx="9" cy="6.5" r="2" fill="#FFFFFF" stroke={color} strokeWidth="1.8" />
            <Circle cx="15.5" cy="12" r="2" fill="#FFFFFF" stroke={color} strokeWidth="1.8" />
            <Circle cx="8" cy="17.5" r="2" fill="#FFFFFF" stroke={color} strokeWidth="1.8" />
          </>
        );
      case "car-clock":
        return (
          <>
            <Path {...common} d="m5.1 13.9 1.5-4.3a2 2 0 0 1 1.9-1.3h5.1M4.1 14h9.4M5.2 14v3.1M11.7 14v2" />
            <Circle {...common} cx="16.6" cy="15.2" r="4.2" />
            <Path {...common} d="M16.6 12.8v2.6l1.8 1" />
          </>
        );
      case "logout":
        return (
          <>
            <Path {...common} d="M10 4.2H5.8a2 2 0 0 0-2 2v11.6a2 2 0 0 0 2 2H10" />
            <Path {...common} d="M14.2 8.1 18.1 12l-3.9 3.9M18 12H8.5" />
          </>
        );
      case "chevron-right":
        return <Path {...common} d="m9.3 5.5 6.5 6.5-6.5 6.5" />;
      default:
        return <Circle {...common} cx="12" cy="12" r="7.5" />;
    }
  })();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {artwork}
    </Svg>
  );
}

function AccountRow({ item, isLast, onPress }) {
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.accountRow, pressed && styles.rowPressed]}
      >
        <View style={styles.accountIcon}>
          <PremiumAccountIcon name={item.icon} size={22} color="#343941" />
        </View>
        <View style={styles.accountCopy}>
          <Text style={styles.accountLabel}>{item.label}</Text>
          <Text style={styles.accountDetail} numberOfLines={1}>{item.detail}</Text>
        </View>
        <PremiumAccountIcon name="chevron-right" size={19} color="#92959B" />
      </Pressable>
      {!isLast ? <View style={styles.divider} /> : null}
    </View>
  );
}

export default function ProfileScreen({
  profile,
  onOpenSupport,
  onOpenSafety,
  onOpenWallet,
  onOpenRefer,
  onOpenPaymentMethod,
  onOpenEditProfile,
  onOpenSettings,
  onOpenSavedPlaces,
  onOpenRides,
  onOpenBookings,
  onOpenTransactions,
  onOpenReceipts,
  onLogout,
}) {
  const insets = useSafeAreaInsets();
  const name = profile?.name || "Your account";
  const phone = profile?.phone || "+91 98765 43210";

  const handlePress = (key) => {
    if (key === "wallet") return onOpenWallet?.();
    if (key === "payments") return onOpenPaymentMethod?.();
    if (key === "support") return onOpenSupport?.();
    if (key === "safety") return onOpenSafety?.();
    if (key === "rewards") return onOpenRefer?.();
    if (key === "savedPlaces") return onOpenSavedPlaces?.();
    if (key === "receipts") return (onOpenReceipts || onOpenTransactions)?.();
    if (key === "settings") return onOpenSettings?.();
    return undefined;
  };

  const openActivity = () => (onOpenBookings || onOpenRides)?.();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Account</Text>
          <Text style={styles.headerSubtitle}>Your rides, payments and preferences</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={onOpenSettings}
          hitSlop={9}
          style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
        >
          <PremiumAccountIcon name="cog-outline" size={23} color="#30343A" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(140, insets.bottom + 124) }]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onOpenEditProfile}
          style={({ pressed }) => [styles.profileSection, pressed && styles.rowPressed]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{String(name).trim().charAt(0).toUpperCase() || "R"}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName} numberOfLines={1}>{name}</Text>
            <Text style={styles.profilePhone}>{phone}</Text>
          </View>
          <View style={styles.editAction}>
            <Text style={styles.editText}>Edit</Text>
          </View>
        </Pressable>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Your activity</Text>
          <Pressable onPress={openActivity} hitSlop={8}>
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={openActivity}
          style={({ pressed }) => [styles.activitySection, pressed && styles.rowPressed]}
        >
          <View style={styles.activityIcon}>
            <PremiumAccountIcon name="car-clock" size={25} color="#8C5900" />
          </View>
          <View style={styles.activityCopy}>
            <Text style={styles.activityTitle}>My rides and deliveries</Text>
            <Text style={styles.activityDetail}>Track active trips or revisit your history</Text>
          </View>
          <PremiumAccountIcon name="chevron-right" size={19} color="#92959B" />
        </Pressable>

        <Text style={styles.sectionTitleStandalone}>Account</Text>
        <View style={styles.accountGroup}>
          {[...PRIMARY_ACTIONS, ...ACCOUNT_ITEMS].map((item, index, items) => (
            <AccountRow
              key={item.key}
              item={item}
              isLast={index === items.length - 1}
              onPress={() => handlePress(item.key)}
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onLogout}
          style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
        >
          <PremiumAccountIcon name="logout" size={21} color="#B42318" />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
        <Text style={styles.version}>Rydex customer app · 0.1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  accountCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  accountDetail: { marginTop: 3, color: "#747780", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  accountGroup: { borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFFFF" },
  accountIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F5F6F8", alignItems: "center", justifyContent: "center" },
  accountLabel: { color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "600" },
  accountRow: { minHeight: 74, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
  activityCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  activityDetail: { marginTop: 3, color: "#747780", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  activityIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: "#FFF2CC", alignItems: "center", justifyContent: "center" },
  activitySection: { minHeight: 82, borderRadius: 18, paddingHorizontal: 14, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  activityTitle: { color: "#202124", fontSize: 15, lineHeight: 20, fontWeight: "600" },
  avatar: { width: 56, height: 56, borderRadius: 18, backgroundColor: "#FFF2CC", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#8C5900", fontSize: 22, lineHeight: 27, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 70, backgroundColor: "#E2E4E7" },
  editAction: { minWidth: 50, height: 34, borderRadius: 12, backgroundColor: "#F0F1F3", alignItems: "center", justifyContent: "center" },
  editText: { color: "#303238", fontSize: 12, lineHeight: 16, fontWeight: "700" },
  header: { minHeight: 72, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerSubtitle: { marginTop: 2, color: "#747780", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  headerTitle: { color: "#202124", fontSize: 23, lineHeight: 28, fontWeight: "700" },
  logout: { marginTop: 22, height: 54, borderRadius: 16, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  logoutText: { color: "#B42318", fontSize: 14, lineHeight: 19, fontWeight: "700" },
  pressed: { opacity: 0.65, transform: [{ scale: 0.99 }] },
  profileCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  profileName: { color: "#202124", fontSize: 18, lineHeight: 23, fontWeight: "700" },
  profilePhone: { marginTop: 3, color: "#747780", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  profileSection: { minHeight: 88, paddingHorizontal: 14, borderRadius: 19, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  rowPressed: { backgroundColor: "#F7F8F9" },
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#ffffffff" },
  sectionHeading: { marginTop: 25, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#202124", fontSize: 17, lineHeight: 22, fontWeight: "600" },
  sectionTitleStandalone: { marginTop: 25, marginBottom: 10, color: "#202124", fontSize: 17, lineHeight: 22, fontWeight: "600" },
  settingsButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#F0F1F3", alignItems: "center", justifyContent: "center" },
  version: { marginTop: 14, color: "#9A9DA3", fontSize: 10, lineHeight: 14, textAlign: "center" },
  viewAll: { color: "#8C5900", fontSize: 13, lineHeight: 17, fontWeight: "700" },
});
