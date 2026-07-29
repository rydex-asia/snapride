import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import UnifiedPageHeader from "../../components/UnifiedPageHeader";

function WalletRow({ icon, title, detail, trailing, onPress, last }) {
  const content = (
    <>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons name={icon} size={21} color="#343A44" />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      {trailing || <MaterialCommunityIcons name="chevron-right" size={20} color="#8C9198" />}
    </>
  );

  return (
    <>
      {onPress ? (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          {content}
        </Pressable>
      ) : (
        <View style={styles.row}>{content}</View>
      )}
      {!last ? <View style={styles.divider} /> : null}
    </>
  );
}

export default function WalletScreen({
  onBack,
  onOpenPaymentMethod,
  onOpenAddMoney,
  onOpenTransactions,
}) {
  const insets = useSafeAreaInsets();
  const [headerBorder, setHeaderBorder] = useState(false);
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  return (
    <View style={styles.safe}>
      <UnifiedPageHeader
        title="Wallet"
        onBack={onBack}
        elevated={headerBorder}
        backgroundColor="#FFFFFF"
        largeTitle
      />

      <Animated.ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => setHeaderBorder(event.nativeEvent.contentOffset.y > 4)}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(34, insets.bottom + 24) }]}
      >
        <Animated.View
          style={{
            opacity: entrance,
            transform: [{
              translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
            }],
          }}
        >
          <View style={styles.balanceSection}>
            <View style={styles.balanceTop}>
              <View>
                <Text style={styles.balanceLabel}>Rydex balance</Text>
                <Text style={styles.balanceAmount}>₹0</Text>
              </View>
              <View style={styles.protected}>
                <MaterialCommunityIcons name="shield-check-outline" size={16} color="#312E81" />
                <Text style={styles.protectedText}>Protected</Text>
              </View>
            </View>
            <Text style={styles.balanceDescription}>Pay faster for rides and parcel deliveries.</Text>

            <View style={styles.balanceActions}>
              <Pressable
                onPress={() => onOpenAddMoney?.("₹200")}
                style={({ pressed }) => [styles.addMoney, pressed && styles.primaryPressed]}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.addMoneyText}>Add money</Text>
              </Pressable>
              <Pressable
                onPress={onOpenTransactions}
                style={({ pressed }) => [styles.historyButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="history" size={19} color="#202124" />
                <Text style={styles.historyText}>History</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.activityHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recent activity</Text>
              <Text style={styles.sectionCaption}>Payments and refunds will appear here</Text>
            </View>
            <Pressable onPress={onOpenTransactions} hitSlop={8}>
              <Text style={styles.viewAll}>View all</Text>
            </Pressable>
          </View>
          <View style={styles.emptyActivity}>
            <MaterialCommunityIcons name="receipt-text-outline" size={22} color="#626872" />
            <Text style={styles.emptyText}>No wallet activity yet</Text>
          </View>

          <Text style={styles.sectionTitleStandalone}>WALLET SETTINGS</Text>
          <View style={styles.outlinedSection}>
            <WalletRow
              icon="credit-card-outline"
              title="Payment methods"
              detail="UPI, cards and cash"
              onPress={onOpenPaymentMethod}
            />
            <WalletRow
              icon="cash-refund"
              title="Refund destination"
              detail="Original payment method"
              trailing={<MaterialCommunityIcons name="check-circle-outline" size={20} color="#3730A3" />}
            />
            <WalletRow
              icon="shield-lock-outline"
              title="Wallet security"
              detail="Encrypted payment protection"
              last
              trailing={<Text style={styles.secureLabel}>Secure</Text>}
            />
          </View>

          <Text style={styles.legalNote}>Wallet balance does not expire and cannot be withdrawn as cash.</Text>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 18, paddingTop: 15 },
  balanceSection: { paddingHorizontal: 4, paddingBottom: 25 },
  balanceTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  balanceLabel: { color: "#66717F", fontSize: 13, lineHeight: 17, fontWeight: "600" },
  balanceAmount: { marginTop: 5, color: "#16191D", fontSize: 44, lineHeight: 50, fontWeight: "800", letterSpacing: -1.2 },
  balanceDescription: { marginTop: 8, color: "#747982", fontSize: 12, lineHeight: 17 },
  protected: { height: 32, paddingHorizontal: 11, borderWidth: 1, borderColor: "#DCE2E7", borderRadius: 16, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", gap: 5 },
  protectedText: { color: "#312E81", fontSize: 11, lineHeight: 14, fontWeight: "700" },
  balanceActions: { marginTop: 22, flexDirection: "row", gap: 10 },
  addMoney: { flex: 1, height: 49, borderRadius: 15, backgroundColor: "#202124", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  addMoneyText: { color: "#FFFFFF", fontSize: 14, lineHeight: 19, fontWeight: "700" },
  historyButton: { width: 112, height: 49, borderWidth: 1, borderColor: "#DDE0E3", borderRadius: 15, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  historyText: { color: "#202124", fontSize: 13, lineHeight: 17, fontWeight: "700" },
  activityHeader: { marginTop: 26, marginBottom: 11, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  sectionTitle: { color: "#16191D", fontSize: 18, lineHeight: 23, fontWeight: "700" },
  sectionCaption: { marginTop: 2, color: "#7B8088", fontSize: 11, lineHeight: 15 },
  viewAll: { color: "#3730A3", fontSize: 12, lineHeight: 16, fontWeight: "700" },
  emptyActivity: { minHeight: 72, paddingHorizontal: 16, borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 18, flexDirection: "row", alignItems: "center", gap: 11 },
  emptyText: { color: "#5F6975", fontSize: 14, lineHeight: 18, fontWeight: "500" },
  sectionTitleStandalone: { marginTop: 27, marginBottom: 11, marginLeft: 7, color: "#3730A3", fontSize: 12, lineHeight: 16, fontWeight: "800", letterSpacing: 0.55 },
  outlinedSection: { overflow: "hidden", borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 22, backgroundColor: "#FFFFFF" },
  row: { minHeight: 80, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" },
  rowIcon: { width: 42, alignItems: "flex-start", justifyContent: "center" },
  rowCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  rowTitle: { color: "#16191D", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  rowDetail: { marginTop: 3, color: "#66717F", fontSize: 12.5, lineHeight: 17 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 58, backgroundColor: "#DEE3E8" },
  secureLabel: { color: "#312E81", fontSize: 11, lineHeight: 15, fontWeight: "700" },
  legalNote: { marginTop: 17, paddingHorizontal: 2, color: "#858A92", fontSize: 11, lineHeight: 16 },
  pressed: { opacity: 0.58 },
  primaryPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
