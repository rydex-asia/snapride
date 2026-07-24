import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AccountPageHeader from "../../components/AccountPageHeader";

export default function MessageCaptainScreen({ onBack = () => {} }) {
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollRef = useRef(null);
  const hasMessage = message.trim().length > 0;

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSend = () => {
    const nextMessage = message.trim();
    if (!nextMessage) return;

    setSentMessages((current) => [
      ...current,
      { id: `${Date.now()}`, text: nextMessage },
    ]);
    setMessage("");
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd?.({ animated: true }));
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <AccountPageHeader title="Message captain" subtitle="Chat with your captain" onBack={onBack} />

        <ScrollView
          ref={scrollRef}
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {sentMessages.map((item) => (
            <View key={item.id} style={styles.sentRow}>
              <View style={styles.sentBubble}>
                <Text style={styles.sentText}>{item.text}</Text>
                <View style={styles.sentMeta}>
                  <MaterialIcons name="done-all" size={14} color="#0D4BE0" />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.bottomDock} pointerEvents="box-none">
          <View style={[styles.composerDock, isKeyboardVisible && styles.composerDockKeyboard]} pointerEvents="box-none">
            <View style={styles.footerWrap}>
              <View style={styles.composerRow}>
                <View style={styles.inputPill}>
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Message"
                    placeholderTextColor="#9CA3AF"
                    style={styles.inputText}
                    returnKeyType="send"
                    onSubmitEditing={handleSend}
                    onFocus={() => setIsKeyboardVisible(true)}
                    onBlur={() => setIsKeyboardVisible(false)}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Camera"
                    style={({ pressed }) => [styles.cameraButton, pressed && styles.pressed]}
                  >
                    <MaterialIcons name="photo-camera" size={20} color="#111111" />
                  </Pressable>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={hasMessage ? "Send message" : "Voice message"}
                  onPress={hasMessage ? handleSend : undefined}
                  style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                >
                  <MaterialIcons name={hasMessage ? "send" : "mic"} size={24} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </View>
          <View pointerEvents="none" style={styles.bottomWhiteStrip} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    width: 49,
    height: 49,
    borderRadius: 32,
    backgroundColor: "#149E4A",
    alignItems: "center",
    justifyContent: "center"
  },
  body: {
    flex: 1,
    backgroundColor: "#F6F8FC"
  },
  bodyContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 130
  },
  bottomDock: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2
  },
  bottomWhiteStrip: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    backgroundColor: "#FFFFFF",
    zIndex: 3
  },
  cameraButton: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  composerDock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 46
  },
  composerDockKeyboard: {
    bottom: 300
  },
  composerRow: {
    width: "103%",
    maxWidth: 950,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC"
  },
  footerWrap: {
    paddingHorizontal: 8,
    paddingTop: 8
  },
  inputPill: {
    flex: 1,
    height: 54,
    minWidth: 0,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#ECECEC",
    paddingLeft: 20,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  inputText: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 0,
    color: "#111111",
    fontSize: 17,
    lineHeight: 22
  },
  keyboardWrap: {
    flex: 1,
    backgroundColor: "#F6F8FC"
  },
  pressed: {
    opacity: 0.72
  },
  sentBubble: {
    maxWidth: "74%",
    minWidth: 54,
    borderRadius: 24,
    borderBottomRightRadius: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 7
  },
  sentMeta: {
    alignSelf: "flex-end",
    marginTop: 2
  },
  sentRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 14
  },
  sentText: {
    color: "#111111",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "500"
  }
});
