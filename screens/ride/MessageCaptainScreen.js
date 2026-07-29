import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import UnifiedPageHeader from "../../components/UnifiedPageHeader";

const INDIGO = "#4F46E5";
const INITIAL_MESSAGES = [
  {
    id: "captain-1",
    side: "captain",
    text: "Hi, I’m Ravi. I’m on the way to your pickup point.",
    time: "Now",
  },
];
const QUICK_REPLIES = ["I’m at the pickup", "Please call me", "One minute"];

function currentTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function MessageBubble({ item }) {
  const sent = item.side === "customer";
  const motion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(motion, {
      toValue: 1,
      stiffness: 230,
      damping: 22,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [motion]);

  return (
    <Animated.View
      style={[
        styles.messageBlock,
        sent ? styles.messageBlockSent : styles.messageBlockReceived,
        {
          opacity: motion,
          transform: [
            { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
            { scale: motion.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
          ],
        },
      ]}
    >
      <View style={[styles.messageBubble, sent ? styles.sentBubble : styles.receivedBubble]}>
        <Text style={[styles.messageText, sent && styles.sentMessageText]}>{item.text}</Text>
      </View>
      <View style={[styles.messageMeta, sent && styles.messageMetaSent]}>
        <Text style={styles.messageTime}>{item.time}</Text>
        {sent ? <MaterialCommunityIcons name="check-all" size={14} color={INDIGO} /> : null}
      </View>
    </Animated.View>
  );
}

function TypingDot({ delay = 0 }) {
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 320,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 320,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.delay(Math.max(0, 360 - delay)),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, pulse]);

  return (
    <Animated.View
      style={[
        styles.typingDot,
        {
          opacity: pulse,
          transform: [{ translateY: pulse.interpolate({ inputRange: [0.35, 1], outputRange: [1, -2] }) }],
        },
      ]}
    />
  );
}

function TypingBubble() {
  return (
    <View style={[styles.messageBlock, styles.messageBlockReceived]}>
      <View style={[styles.messageBubble, styles.receivedBubble, styles.typingBubble]}>
        <TypingDot />
        <TypingDot delay={100} />
        <TypingDot delay={200} />
      </View>
    </View>
  );
}

export default function MessageCaptainScreen({
  onBack = () => {},
  onCall = () => {},
  captainName = "Ravi Kumar",
  arrivalLabel = "Arriving in 3 min",
}) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const replyTimer = useRef(null);
  const entrance = useRef(new Animated.Value(0)).current;
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [typing, setTyping] = useState(false);
  const [headerElevated, setHeaderElevated] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, [entrance]);

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd?.({ animated: true }));
  }, [messages, typing]);

  const sendMessage = (value = draft) => {
    const text = String(value || "").trim();
    if (!text) return;

    if (replyTimer.current) clearTimeout(replyTimer.current);
    setMessages((current) => [
      ...current,
      {
        id: `customer-${Date.now()}`,
        side: "customer",
        text,
        time: currentTime(),
      },
    ]);
    setDraft("");
    setTyping(true);

    replyTimer.current = setTimeout(() => {
      setTyping(false);
      setMessages((current) => [
        ...current,
        {
          id: `captain-${Date.now()}`,
          side: "captain",
          text: text.toLowerCase().includes("call")
            ? "Sure, I’ll call you in a moment."
            : "Got it. I’ll meet you at the pickup point.",
          time: currentTime(),
        },
      ]);
      replyTimer.current = null;
    }, 900);
  };

  const contentStyle = {
    opacity: entrance,
    transform: [
      {
        translateY: entrance.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <UnifiedPageHeader
          title="Message captain"
          onBack={onBack}
          elevated={headerElevated}
          backgroundColor="#FFFFFF"
        />

        <Animated.View style={[styles.captainBar, contentStyle]}>
          <LinearGradient
            pointerEvents="none"
            colors={["#EEF2FF", "#F8F7FF", "#FFFFFF"]}
            locations={[0, 0.56, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RK</Text>
            <View style={styles.onlineBadge} />
          </View>
          <View style={styles.captainCopy}>
            <Text style={styles.captainName}>{captainName}</Text>
            <Text style={styles.captainStatus}>{arrivalLabel} · Online</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Call captain"
            onPress={onCall}
            style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="phone" size={20} color={INDIGO} />
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.conversation, contentStyle]}>
          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={(event) => setHeaderElevated(event.nativeEvent.contentOffset.y > 4)}
            scrollEventThrottle={16}
          >
            <View style={styles.privacyNotice}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color="#656B75" />
              <Text style={styles.privacyText}>
                Messages are available only during this ride.
              </Text>
            </View>
            <Text style={styles.dayLabel}>Today</Text>
            {messages.map((item) => <MessageBubble key={item.id} item={item} />)}
            {typing ? <TypingBubble /> : null}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.quickReplyContent}
            style={styles.quickReplyRail}
          >
            {QUICK_REPLIES.map((reply) => (
              <Pressable
                key={reply}
                onPress={() => sendMessage(reply)}
                style={({ pressed }) => [styles.quickReply, pressed && styles.quickReplyPressed]}
              >
                <Text style={styles.quickReplyText}>{reply}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={[styles.composer, { paddingBottom: Math.max(10, insets.bottom) }]}>
            <View style={[styles.inputWrap, inputFocused && styles.inputWrapFocused]}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={() => sendMessage()}
                placeholder="Message your captain"
                placeholderTextColor="#8B9099"
                returnKeyType="send"
                maxLength={300}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                style={styles.input}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              disabled={!draft.trim()}
              onPress={() => sendMessage()}
              style={({ pressed }) => [
                styles.sendButton,
                !draft.trim() && styles.sendButtonDisabled,
                pressed && draft.trim() && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons
                name="arrow-up"
                size={22}
                color={draft.trim() ? "#FFFFFF" : "#9CA1AA"}
              />
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#3730A3", fontSize: 14, lineHeight: 18, fontWeight: "800" },
  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  captainBar: {
    minHeight: 70,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E4E6EA",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  captainCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
  captainName: { color: "#17191D", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  captainStatus: { marginTop: 2, color: "#676C75", fontSize: 12, lineHeight: 16, fontWeight: "500" },
  composer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E3E5E9",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 9,
    elevation: 5,
  },
  conversation: { flex: 1 },
  dayLabel: {
    alignSelf: "center",
    marginBottom: 18,
    color: "#80858E",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },
  input: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 15,
    paddingVertical: 0,
    color: "#17191D",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
  },
  inputWrap: {
    flex: 1,
    minWidth: 0,
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputWrapFocused: { borderColor: "#A5B4FC", backgroundColor: "#FFFFFF" },
  keyboardView: { flex: 1 },
  messageBlock: { maxWidth: "82%", marginBottom: 14 },
  messageBlockReceived: { alignSelf: "flex-start" },
  messageBlockSent: { alignSelf: "flex-end" },
  messageBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  messageContent: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20 },
  messageList: { flex: 1 },
  messageMeta: { marginTop: 4, marginHorizontal: 4, flexDirection: "row", alignItems: "center", gap: 3 },
  messageMetaSent: { justifyContent: "flex-end" },
  messageText: { color: "#24272D", fontSize: 14, lineHeight: 20, fontWeight: "400" },
  messageTime: { color: "#8B9098", fontSize: 10, lineHeight: 13, fontWeight: "500" },
  onlineBadge: {
    position: "absolute",
    right: 0,
    bottom: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#22A559",
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  privacyNotice: {
    alignSelf: "center",
    maxWidth: "92%",
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F0F1F4",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  privacyText: { flexShrink: 1, color: "#656B75", fontSize: 11, lineHeight: 15, fontWeight: "500" },
  quickReply: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D7DAE0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  quickReplyContent: { paddingHorizontal: 12, gap: 8 },
  quickReplyPressed: { backgroundColor: "#EEF2FF", borderColor: "#A5B4FC" },
  quickReplyRail: {
    flexGrow: 0,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
  },
  quickReplyText: { color: "#363A42", fontSize: 12, lineHeight: 16, fontWeight: "600" },
  receivedBubble: { backgroundColor: "#FFFFFF", borderBottomLeftRadius: 5 },
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: INDIGO,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: { backgroundColor: "#E6E8EC" },
  sentBubble: { backgroundColor: "#E8E7FF", borderBottomRightRadius: 5 },
  sentMessageText: { color: "#27235D" },
  typingBubble: { minWidth: 60, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  typingDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#777C85" },
});
