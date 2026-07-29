import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import UnifiedPageHeader from "../../components/UnifiedPageHeader";

const UPDATES = [
  { key: "created", time: "15 Apr · 2:15 PM", title: "Ticket created", detail: "You reported that your payment refund had not arrived.", complete: true },
  { key: "review", time: "15 Apr · 2:27 PM", title: "Payment reviewed", detail: "Support verified the cancelled ride and refund eligibility.", complete: true },
  { key: "refund", time: "15 Apr · 3:05 PM", title: "Refund processed", detail: "₹249 was returned to the original payment method.", complete: true },
];

function UpdateRow({ item, isLast }) {
  return (
    <View style={styles.updateRow}>
      <View style={styles.timeline}>
        <View style={styles.timelineDot}>
          <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
        </View>
        {!isLast ? <View style={styles.timelineLine} /> : null}
      </View>
      <View style={styles.updateCopy}>
        <Text style={styles.updateTime}>{item.time}</Text>
        <Text style={styles.updateTitle}>{item.title}</Text>
        <Text style={styles.updateDetail}>{item.detail}</Text>
      </View>
    </View>
  );
}

export default function TicketDetailsScreen({ onBack, onOpenChat }) {
  const insets = useSafeAreaInsets();
  const [headerElevated, setHeaderElevated] = useState(false);

  return (
    <View style={styles.safe}>
      <UnifiedPageHeader
        title="Support ticket"
        onBack={onBack}
        elevated={headerElevated}
        backgroundColor="#FFFFFF"
        largeTitle
      />

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => setHeaderElevated(event.nativeEvent.contentOffset.y > 4)}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(32, insets.bottom + 24) }]}
      >
        <View style={styles.issueSection}>
          <View style={styles.issueTop}>
            <View style={styles.issueIcon}>
              <MaterialCommunityIcons name="credit-card-outline" size={22} color="#3730A3" />
            </View>
            <View style={styles.issueCopy}>
              <Text style={styles.issueLabel}>Payment and refund</Text>
              <Text style={styles.issueTitle}>Payment not refunded</Text>
            </View>
            <View style={styles.resolvedBadge}>
              <MaterialCommunityIcons name="check-circle" size={15} color="#157457" />
              <Text style={styles.resolvedText}>Resolved</Text>
            </View>
          </View>
          <View style={styles.issueDivider} />
          <View style={styles.referenceRow}>
            <Text style={styles.referenceLabel}>Ride reference</Text>
            <Text style={styles.referenceValue}>RYD-884221</Text>
          </View>
          <View style={styles.referenceRow}>
            <Text style={styles.referenceLabel}>Refund amount</Text>
            <Text style={styles.referenceValue}>₹249</Text>
          </View>
        </View>

        <View style={styles.resolution}>
          <MaterialCommunityIcons name="check-decagram" size={22} color="#157457" />
          <View style={styles.resolutionCopy}>
            <Text style={styles.resolutionTitle}>Refund completed</Text>
            <Text style={styles.resolutionText}>The amount was sent to your original payment method. Bank processing can take 3–5 business days.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Case updates</Text>
        <View style={styles.updates}>
          {UPDATES.map((item, index) => (
            <UpdateRow key={item.key} item={item} isLast={index === UPDATES.length - 1} />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onOpenChat}
          style={({ pressed }) => [styles.chatAction, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="message-text-outline" size={20} color="#202124" />
          <View style={styles.chatCopy}>
            <Text style={styles.chatTitle}>Still need help?</Text>
            <Text style={styles.chatDetail}>Continue this conversation with support</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={21} color="#92959B" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chatAction: { marginTop: 22, minHeight: 72, paddingHorizontal: 14, borderRadius: 18, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  chatCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
  chatDetail: { marginTop: 3, color: "#747780", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  chatTitle: { color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "600" },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  issueCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  issueDivider: { height: StyleSheet.hairlineWidth, marginVertical: 14, backgroundColor: "#E2E4E7" },
  issueIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  issueLabel: { color: "#8A8D93", fontSize: 10, lineHeight: 14, fontWeight: "500" },
  issueSection: { borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 19, padding: 15, backgroundColor: "#FFFFFF" },
  issueTitle: { marginTop: 3, color: "#202124", fontSize: 16, lineHeight: 21, fontWeight: "700" },
  issueTop: { flexDirection: "row", alignItems: "center" },
  pressed: { opacity: 0.65, transform: [{ scale: 0.99 }] },
  referenceLabel: { color: "#747780", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  referenceRow: { minHeight: 28, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  referenceValue: { color: "#303238", fontSize: 12, lineHeight: 16, fontWeight: "600" },
  resolution: { marginTop: 12, minHeight: 88, padding: 14, borderRadius: 18, backgroundColor: "#E9F6F0", flexDirection: "row", alignItems: "flex-start" },
  resolutionCopy: { flex: 1, marginLeft: 10 },
  resolutionText: { marginTop: 4, color: "#536B61", fontSize: 12, lineHeight: 17, fontWeight: "400" },
  resolutionTitle: { color: "#124F3D", fontSize: 14, lineHeight: 19, fontWeight: "700" },
  resolvedBadge: { height: 28, paddingHorizontal: 9, borderRadius: 14, backgroundColor: "#E7F5EF", flexDirection: "row", alignItems: "center", gap: 4 },
  resolvedText: { color: "#157457", fontSize: 10, lineHeight: 14, fontWeight: "700" },
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  sectionTitle: { marginTop: 24, marginBottom: 10, color: "#202124", fontSize: 17, lineHeight: 22, fontWeight: "600" },
  timeline: { width: 28, alignItems: "center" },
  timelineDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#202124", alignItems: "center", justifyContent: "center" },
  timelineLine: { width: 1, flex: 1, minHeight: 54, backgroundColor: "#D8DADE" },
  updateCopy: { flex: 1, paddingBottom: 18, marginLeft: 9 },
  updateDetail: { marginTop: 4, color: "#747780", fontSize: 12, lineHeight: 17, fontWeight: "400" },
  updateRow: { minHeight: 86, flexDirection: "row" },
  updateTime: { color: "#92959B", fontSize: 10, lineHeight: 14, fontWeight: "500" },
  updateTitle: { marginTop: 3, color: "#303238", fontSize: 14, lineHeight: 19, fontWeight: "600" },
  updates: { borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 18, paddingHorizontal: 14, paddingTop: 16, backgroundColor: "#FFFFFF" },
});
