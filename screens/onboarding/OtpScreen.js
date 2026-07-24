import React from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { OnboardingScreen } from "./OnboardingKit";
import { COLORS } from "../../theme/colors";

const OTP_LENGTH = 6;
const DEFAULT_TIMER = 28;

export default function OtpScreen({
  onBack,
  onVerify,
  onResend,
  mobileNumber = "+91 98765 43210",
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = height < 740;
  const sheetAnim = React.useRef(new Animated.Value(0)).current;
  const [otp, setOtp] = React.useState("");
  const [resendIn, setResendIn] = React.useState(DEFAULT_TIMER);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [sheetAnim]);

  React.useEffect(() => {
    if (resendIn <= 0) return undefined;

    const timer = setTimeout(() => {
      setResendIn((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendIn]);

  React.useEffect(() => {
    if (otp.length === OTP_LENGTH) {
      onVerify?.(otp);
    }
  }, [otp, onVerify]);

  const updateOtp = (value) => {
    const next = value.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
    setOtp(next);
  };

  const handleResend = () => {
    if (resendIn > 0) return;
    onResend?.();
    setResendIn(DEFAULT_TIMER);
    setOtp("");
    inputRef.current?.focus?.();
  };

  const timerLabel = String(resendIn).padStart(2, "0");
  const canResend = resendIn === 0;

  return (
    <OnboardingScreen style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.page}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark, "#075A24"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.hero,
              compact && styles.heroCompact,
              { paddingTop: insets.top + 8 },
            ]}
          >
            <View style={styles.heroTop}>
              <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.heroCenter} />

            <LinearGradient
              colors={["rgba(99,102,241,0)", "rgba(255,255,255,1)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.heroFade}
            />
          </LinearGradient>

          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + 16 },
              {
                opacity: sheetAnim,
                transform: [
                  {
                    translateY: sheetAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>Enter code</Text>

            <View style={styles.sentRow}>
              <Text style={styles.sentText}>Sent to {mobileNumber}</Text>
              <Text style={styles.changeText}>Change</Text>
            </View>

            <Pressable onPress={() => inputRef.current?.focus?.()} style={styles.otpRow}>
              {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                const digit = otp[index] || "";
                const filled = Boolean(digit);
                const active = index === otp.length && otp.length < OTP_LENGTH;

                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      active && styles.otpBoxActive,
                      filled && styles.otpBoxFilled,
                    ]}
                  >
                    <Text style={[styles.otpDigit, !filled && styles.otpDigitPlaceholder]}>
                      {digit}
                    </Text>
                  </View>
                );
              })}
            </Pressable>

            <View style={styles.otpActionsRow}>
              <Pressable
                onPress={handleResend}
                disabled={!canResend}
                style={({ pressed }) => [
                  styles.resendToggle,
                  canResend ? styles.resendToggleActive : styles.resendToggleWaiting,
                  pressed && canResend && styles.resendTogglePressed,
                ]}
              >
                <Text style={[styles.resendToggleText, !canResend && styles.resendToggleTextWaiting]}>
                  {canResend ? "Resend code" : `Resend in ${timerLabel}`}
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={updateOtp}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            style={styles.hiddenInput}
            autoFocus
            selectionColor={COLORS.primary}
          />
        </View>
      </KeyboardAvoidingView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center"
  },
  changeText: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800"
  },
  flex: {
    flex: 1
  },
  hero: {
    minHeight: 104,
    paddingHorizontal: 16,
    paddingBottom: 12,
    position: "relative"
  },
  heroCenter: {
    height: 0,
    opacity: 0
  },
  heroCompact: {
    minHeight: 96
  },
  heroFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 40
  },
  heroTitle: {
    marginTop: 0,
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    textAlign: "center"
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0
  },
  otpActionsRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end"
  },
  otpBox: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center"
  },
  otpBoxActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFFFFF"
  },
  otpDigit: {
    color: "#111827",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800"
  },
  otpDigitPlaceholder: {
    color: "transparent"
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 18
  },
  page: {
    flex: 1
  },
  resendToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 112,
    alignItems: "center",
    justifyContent: "center"
  },
  resendToggleActive: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary
  },
  resendTogglePressed: {
    opacity: 0.92
  },
  resendToggleText: {
    color: COLORS.primary,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "800"
  },
  resendToggleTextWaiting: {
    color: "#9CA3AF"
  },
  resendToggleWaiting: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  screen: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0
  },
  sentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10
  },
  sentText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    flex: 1,
    paddingRight: 10
  },
  sheet: {
    flex: 1,
    marginTop: -20,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14
  },
  sheetHandle: {
    width: 46,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    alignSelf: "center"
  },
  sheetTitle: {
    marginTop: 14,
    color: "#111827",
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900"
  }
});
