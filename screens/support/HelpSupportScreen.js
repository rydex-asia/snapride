import React, { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import UnifiedPageHeader from "../../components/UnifiedPageHeader";

const SUPPORT_PHONE = "+919876543210";

const TOPICS = [
  { key: "ride", icon: "car-outline", title: "Ride help", detail: "Fare, route, cancellation or captain", action: "chat" },
  { key: "parcel", icon: "package-variant-closed", title: "Parcel help", detail: "Pickup, delivery or damaged parcel", action: "chat" },
  { key: "payment", icon: "credit-card-outline", title: "Payments and refunds", detail: "Charges, wallet and refund status", action: "ticket" },
  { key: "account", icon: "account-outline", title: "Account and app", detail: "Login, profile and app settings", action: "chat" },
  { key: "safety", icon: "shield-check-outline", title: "Safety concern", detail: "Report an incident or get urgent help", action: "chat" },
];

const FAQS = [
  {
    key: "refund",
    question: "When will I receive my refund?",
    answer: "Most refunds reach the original payment method within 3–5 business days. Wallet refunds may arrive sooner.",
  },
  {
    key: "fare",
    question: "Why did my final fare change?",
    answer: "Waiting time, route changes, tolls, or additional stops can change the final amount.",
  },
  {
    key: "lost",
    question: "I left something in a vehicle",
    answer: "Open the completed ride from your activity and contact the captain. Support can help if you cannot connect.",
  },
];

function ContactAction({ icon, label, detail, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.contactAction, pressed && styles.pressed]}
    >
      <View style={styles.contactIcon}>
        <MaterialCommunityIcons name={icon} size={22} color="#202124" />
      </View>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactDetail}>{detail}</Text>
    </Pressable>
  );
}

function TopicRow({ item, isLast, onPress }) {
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.topicRow, pressed && styles.rowPressed]}
      >
        <View style={styles.topicIcon}>
          <MaterialCommunityIcons name={item.icon} size={21} color="#394150" />
        </View>
        <View style={styles.topicCopy}>
          <Text style={styles.topicTitle}>{item.title}</Text>
          <Text style={styles.topicDetail} numberOfLines={1}>{item.detail}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={21} color="#92959B" />
      </Pressable>
      {!isLast ? <View style={styles.divider} /> : null}
    </View>
  );
}

function FaqRow({ item, open, isLast, onPress }) {
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onPress}
        style={({ pressed }) => [styles.faqQuestionRow, pressed && styles.rowPressed]}
      >
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <MaterialCommunityIcons name={open ? "chevron-up" : "chevron-down"} size={20} color="#747780" />
      </Pressable>
      {open ? <Text style={styles.faqAnswer}>{item.answer}</Text> : null}
      {!isLast ? <View style={styles.faqDivider} /> : null}
    </View>
  );
}

export default function HelpSupportScreen({ onBack, onOpenTicketDetails, onOpenChatSupport }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [headerElevated, setHeaderElevated] = useState(false);

  const visibleTopics = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return TOPICS;
    return TOPICS.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(normalized));
  }, [query]);

  const openTopic = (item) => {
    if (item.action === "ticket") onOpenTicketDetails?.();
    else onOpenChatSupport?.();
  };

  return (
    <View style={styles.safe}>
      <UnifiedPageHeader
        title="Help"
        onBack={onBack}
        elevated={headerElevated}
        backgroundColor="#FFFFFF"
        largeTitle
      />

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={(event) => setHeaderElevated(event.nativeEvent.contentOffset.y > 4)}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(34, insets.bottom + 24) }]}
      >
        <View style={styles.search}>
          <MaterialCommunityIcons name="magnify" size={22} color="#656970" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="What do you need help with?"
            placeholderTextColor="#92959B"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <MaterialCommunityIcons name="close-circle" size={19} color="#92959B" />
            </Pressable>
          ) : null}
        </View>

        {!query ? (
          <>
            <Text style={styles.sectionTitle}>Get help now</Text>
            <View style={styles.contactRow}>
              <ContactAction icon="message-text-outline" label="Chat" detail="Usually replies quickly" onPress={onOpenChatSupport} />
              <ContactAction icon="phone-outline" label="Call" detail="Speak with support" onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => {})} />
            </View>

            <Text style={styles.sectionTitle}>Recent support</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onOpenTicketDetails}
              style={({ pressed }) => [styles.recentCase, pressed && styles.rowPressed]}
            >
              <View style={styles.caseIcon}>
                <MaterialCommunityIcons name="receipt-text-outline" size={21} color="#3730A3" />
              </View>
              <View style={styles.caseCopy}>
                <Text style={styles.caseTitle}>Payment refund</Text>
                <Text style={styles.caseDetail}>Ticket #123456 · Resolved</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={21} color="#92959B" />
            </Pressable>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>{query ? "Search results" : "Browse help topics"}</Text>
        {visibleTopics.length ? (
          <View style={styles.topicList}>
            {visibleTopics.map((item, index) => (
              <TopicRow key={item.key} item={item} isLast={index === visibleTopics.length - 1} onPress={() => openTopic(item)} />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="headset" size={27} color="#92959B" />
            <Text style={styles.emptyTitle}>No matching topic</Text>
            <Text style={styles.emptyText}>Try another search or start a chat with support.</Text>
            <Pressable onPress={onOpenChatSupport} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Start chat</Text>
            </Pressable>
          </View>
        )}

        {!query ? (
          <>
            <Text style={styles.sectionTitle}>Common questions</Text>
            <View style={styles.faqList}>
              {FAQS.map((item, index) => (
                <FaqRow
                  key={item.key}
                  item={item}
                  open={openFaq === item.key}
                  isLast={index === FAQS.length - 1}
                  onPress={() => setOpenFaq((current) => current === item.key ? null : item.key)}
                />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  caseCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  caseDetail: { marginTop: 3, color: "#747780", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  caseIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  caseTitle: { color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "600" },
  contactAction: { flex: 1, minHeight: 116, borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 18, padding: 14, backgroundColor: "#FFFFFF" },
  contactDetail: { marginTop: 4, color: "#747780", fontSize: 11, lineHeight: 15, fontWeight: "400" },
  contactIcon: { width: 40, height: 40, marginBottom: 12, borderRadius: 14, backgroundColor: "#F0F1F3", alignItems: "center", justifyContent: "center" },
  contactLabel: { color: "#202124", fontSize: 15, lineHeight: 20, fontWeight: "600" },
  contactRow: { flexDirection: "row", gap: 10 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 70, backgroundColor: "#E2E4E7" },
  empty: { minHeight: 200, borderRadius: 18, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  emptyButton: { marginTop: 14, height: 38, paddingHorizontal: 18, borderRadius: 12, backgroundColor: "#202124", alignItems: "center", justifyContent: "center" },
  emptyButtonText: { color: "#FFFFFF", fontSize: 13, lineHeight: 17, fontWeight: "700" },
  emptyText: { marginTop: 4, color: "#747780", fontSize: 12, lineHeight: 17, textAlign: "center" },
  emptyTitle: { marginTop: 10, color: "#202124", fontSize: 15, lineHeight: 20, fontWeight: "600" },
  faqAnswer: { paddingHorizontal: 14, paddingBottom: 15, color: "#656970", fontSize: 12, lineHeight: 18, fontWeight: "400" },
  faqDivider: { height: StyleSheet.hairlineWidth, marginLeft: 14, backgroundColor: "#E2E4E7" },
  faqList: { borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFFFF" },
  faqQuestion: { flex: 1, marginRight: 12, color: "#303238", fontSize: 13, lineHeight: 18, fontWeight: "600" },
  faqQuestionRow: { minHeight: 62, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
  pressed: { opacity: 0.65, transform: [{ scale: 0.99 }] },
  recentCase: { minHeight: 74, borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 18, paddingHorizontal: 14, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  rowPressed: { backgroundColor: "#F7F8F9" },
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  search: { height: 52, paddingHorizontal: 14, borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 16, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  searchInput: { flex: 1, marginLeft: 10, paddingVertical: 0, color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "400" },
  sectionTitle: { marginTop: 25, marginBottom: 10, color: "#202124", fontSize: 17, lineHeight: 22, fontWeight: "600" },
  topicCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  topicDetail: { marginTop: 3, color: "#747780", fontSize: 12, lineHeight: 16, fontWeight: "400" },
  topicIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F0F1F3", alignItems: "center", justifyContent: "center" },
  topicList: { borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFFFF" },
  topicRow: { minHeight: 74, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
  topicTitle: { color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "600" },
});
