import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import SimplePageHeader from "../../components/SimplePageHeader";

const INITIAL_MESSAGES = [
  { id: "support-1", side: "support", time: "2:34 PM", text: "Hi Ravi, I’m Priya from support. How can I help with trip #RK29481?" },
  { id: "user-1", side: "user", time: "2:35 PM", text: "I was charged ₹349 instead of the ₹249 shown before the ride.", seen: true },
  { id: "support-2", side: "support", time: "2:36 PM", text: "I checked the fare. An extra toll was added after the trip. I can help review the refund.", },
];

const QUICK_REPLIES = ["Track my refund", "Share receipt"];

function formatCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getSupportReply(text) {
  const normalized = String(text || "").toLowerCase();
  if (normalized.includes("refund")) return "Your refund review is active. I’ll share the latest status here shortly.";
  if (normalized.includes("receipt")) return "You can attach the receipt using the paperclip button below.";
  return "Thanks, I’m checking that for you now.";
}

function Message({ item }) {
  const isUser = item.side === "user";
  return (
    <View style={[styles.messageWrap, isUser ? styles.messageUser : styles.messageSupport]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.supportBubble]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>{item.text}</Text>
      </View>
      <View style={styles.messageMeta}>
        <Text style={styles.messageTime}>{item.time}</Text>
        {isUser && item.seen ? <MaterialCommunityIcons name="check-all" size={14} color="#8A8D93" /> : null}
      </View>
    </View>
  );
}

function TypingMessage() {
  return (
    <View style={[styles.messageWrap, styles.messageSupport]}>
      <View style={[styles.bubble, styles.supportBubble, styles.typingBubble]}>
        <View style={styles.typingDot} />
        <View style={[styles.typingDot, styles.typingDotMuted]} />
        <View style={styles.typingDot} />
      </View>
    </View>
  );
}

export default function ChatSupportScreen({ onBack }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const replyTimerRef = useRef(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [typing, setTyping] = useState(false);

  useEffect(() => () => {
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd?.({ animated: true }));
  }, [messages, typing]);

  const send = (value = draft) => {
    const text = String(value || "").trim();
    if (!text) return;

    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, side: "user", time: formatCurrentTime(), text, seen: true },
    ]);
    setDraft("");
    setTyping(true);

    replyTimerRef.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: `support-${Date.now()}`, side: "support", time: formatCurrentTime(), text: getSupportReply(text) },
      ]);
      setTyping(false);
      replyTimerRef.current = null;
    }, 850);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <SimplePageHeader title="Chat support" eyebrow="Priya · Online" onBack={onBack} />

        <View style={styles.contextBar}>
          <View style={styles.contextIcon}>
            <MaterialCommunityIcons name="car-outline" size={20} color="#8C5900" />
          </View>
          <View style={styles.contextCopy}>
            <Text style={styles.contextLabel}>Regarding trip #RK29481</Text>
            <Text style={styles.contextDetail}>Airport ride · ₹349</Text>
          </View>
          <View style={styles.onlineDot} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.messageContent}
        >
          <Text style={styles.dateLabel}>Today</Text>
          {messages.map((item) => <Message key={item.id} item={item} />)}
          {typing ? <TypingMessage /> : null}
        </ScrollView>

        <View style={styles.quickReplies}>
          {QUICK_REPLIES.map((label) => (
            <Pressable key={label} onPress={() => send(label)} style={({ pressed }) => [styles.quickReply, pressed && styles.pressed]}>
              <Text style={styles.quickReplyText}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.composer, { paddingBottom: Math.max(10, insets.bottom) }]}>
          <Pressable accessibilityLabel="Attach file" style={({ pressed }) => [styles.attach, pressed && styles.pressed]}>
            <MaterialCommunityIcons name="paperclip" size={22} color="#555960" />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => send()}
            placeholder="Write a message"
            placeholderTextColor="#92959B"
            returnKeyType="send"
            style={styles.input}
          />
          <Pressable
            accessibilityLabel="Send message"
            disabled={!draft.trim()}
            onPress={() => send()}
            style={({ pressed }) => [styles.send, !draft.trim() && styles.sendDisabled, pressed && draft.trim() && styles.pressed]}
          >
            <MaterialCommunityIcons name="send" size={19} color={draft.trim() ? "#FFFFFF" : "#92959B"} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  attach: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F0F1F3", alignItems: "center", justifyContent: "center" },
  bubble: { maxWidth: "82%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  composer: { paddingHorizontal: 12, paddingTop: 10, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", gap: 8 },
  contextBar: { minHeight: 64, paddingHorizontal: 16, backgroundColor: "#FFFFFF", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E2E4E7", flexDirection: "row", alignItems: "center" },
  contextCopy: { flex: 1, minWidth: 0, marginLeft: 10 },
  contextDetail: { marginTop: 2, color: "#747780", fontSize: 11, lineHeight: 15, fontWeight: "400" },
  contextIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#FFF2CC", alignItems: "center", justifyContent: "center" },
  contextLabel: { color: "#303238", fontSize: 13, lineHeight: 17, fontWeight: "600" },
  dateLabel: { alignSelf: "center", marginBottom: 18, color: "#8A8D93", fontSize: 11, lineHeight: 15, fontWeight: "500" },
  input: { flex: 1, height: 46, borderRadius: 15, paddingHorizontal: 14, paddingVertical: 0, backgroundColor: "#F0F1F3", color: "#202124", fontSize: 14, lineHeight: 19, fontWeight: "400" },
  keyboardView: { flex: 1 },
  messageContent: { flexGrow: 1, paddingHorizontal: 14, paddingTop: 18, paddingBottom: 12 },
  messageMeta: { marginTop: 4, flexDirection: "row", alignItems: "center", gap: 3 },
  messageSupport: { alignItems: "flex-start" },
  messageText: { color: "#303238", fontSize: 14, lineHeight: 20, fontWeight: "400" },
  messageTime: { color: "#8A8D93", fontSize: 10, lineHeight: 14, fontWeight: "400" },
  messageUser: { alignItems: "flex-end" },
  messageWrap: { width: "100%", marginBottom: 14 },
  messages: { flex: 1, backgroundColor: "#F1F0F5" },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#157457" },
  pressed: { opacity: 0.65, transform: [{ scale: 0.98 }] },
  quickReplies: { paddingHorizontal: 12, paddingTop: 8, backgroundColor: "#FFFFFF", flexDirection: "row", gap: 8 },
  quickReply: { height: 36, paddingHorizontal: 13, borderRadius: 18, backgroundColor: "#F0F1F3", alignItems: "center", justifyContent: "center" },
  quickReplyText: { color: "#303238", fontSize: 11, lineHeight: 15, fontWeight: "600" },
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  send: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#202124", alignItems: "center", justifyContent: "center" },
  sendDisabled: { backgroundColor: "#E1E3E6" },
  supportBubble: { backgroundColor: "#FFFFFF", borderBottomLeftRadius: 5 },
  typingBubble: { minWidth: 64, flexDirection: "row", justifyContent: "center", gap: 6 },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#8A8D93" },
  typingDotMuted: { opacity: 0.45 },
  userBubble: { backgroundColor: "#202124", borderBottomRightRadius: 5 },
  userMessageText: { color: "#FFFFFF" },
});
