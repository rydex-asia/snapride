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

export default function LoginScreen({
  onBack,
  onSkip,
  onLogin,
  onCreateAccount,
  errorMessage = "",
  isLoading = false,
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = height < 740;
  const [mobile, setMobile] = React.useState("");
  const [password, setPassword] = React.useState("");
  const sheetAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [sheetAnim]);

  const digits = mobile.replace(/\D/g, "");
  const canContinue = digits.length >= 10 && password.length >= 8 && !isLoading;

  const handleContinue = () => {
    if (!canContinue) return;
    onLogin?.({ phone: `+91${digits.slice(-10)}`, password });
  };

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
            style={[styles.hero, compact && styles.heroCompact]}
          >
            <View style={styles.heroTop}>
              <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.textPrimary} />
              </Pressable>

              <Pressable onPress={onSkip} hitSlop={12} style={styles.skipPill}>
                <Text style={styles.skipText}>Skip</Text>
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

            <Text style={styles.sheetTitle}>Log in or sign up</Text>

            <View style={styles.fieldCard}>
              <View style={styles.countryCodeWrap}>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <View style={styles.fieldDivider} />
              <TextInput
                value={mobile}
                onChangeText={setMobile}
                placeholder="Enter mobile number"
                placeholderTextColor="#C7CBD1"
                keyboardType="phone-pad"
                style={styles.numberInput}
                maxLength={10}
                selectionColor={COLORS.primary}
              />
            </View>

            <View style={styles.fieldCard}>
              <MaterialCommunityIcons name="lock-outline" size={18} color={COLORS.primary} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#C7CBD1"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.passwordInput}
                selectionColor={COLORS.primary}
              />
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Pressable
              onPress={onCreateAccount}
              hitSlop={10}
              style={styles.createAccountRow}
            >
              <Text style={styles.createAccountText}>
                New here? <Text style={styles.createAccountLink}>Create account</Text>
              </Text>
            </Pressable>

            <View style={styles.sheetSpacer} />

            <Pressable
              onPress={handleContinue}
              disabled={!canContinue}
              style={({ pressed }) => [
                styles.continueButton,
                canContinue ? styles.continueButtonActive : styles.continueButtonDisabled,
                pressed && canContinue && styles.continueButtonPressed,
              ]}
            >
              <Text style={[styles.continueText, !canContinue && styles.continueTextDisabled]}>
                {isLoading ? "Logging in…" : "Continue"}
              </Text>
            </Pressable>

            <Text style={styles.footerText}>
              By continuing, you agree to our{" "}
              <Text style={styles.footerLink}>Terms of service</Text> &{" "}
              <Text style={styles.footerLink}>Privacy policy</Text>
            </Text>
          </Animated.View>
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
  continueButton: {
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14
  },
  continueButtonActive: {
    backgroundColor: COLORS.primary
  },
  continueButtonDisabled: {
    backgroundColor: "#E5E7EB"
  },
  continueButtonPressed: {
    opacity: 0.92
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: "800"
  },
  continueTextDisabled: {
    color: "#9CA3AF"
  },
  countryCode: {
    color: "#111827",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800"
  },
  countryCodeWrap: {
    paddingRight: 10
  },
  createAccountLink: {
    color: COLORS.primary,
    fontWeight: "700"
  },
  createAccountRow: {
    alignSelf: "center",
    marginTop: 12,
    paddingVertical: 4
  },
  createAccountText: {
    color: "#6B7280",
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "500"
  },
  fieldCard: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 14
  },
  fieldDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E5E7EB"
  },
  errorText: {
    marginTop: 10,
    color: "#C62828",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
  },
  flex: {
    flex: 1
  },
  footerLink: {
    color: COLORS.textPrimary,
    textDecorationLine: "underline",
    fontWeight: "700"
  },
  footerText: {
    marginTop: 12,
    color: "#9CA3AF",
    fontSize: 10.5,
    lineHeight: 15,
    textAlign: "center",
    fontWeight: "500"
  },
  hero: {
    minHeight: 112,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    position: "relative"
  },
  heroCenter: {
    height: 0,
    opacity: 0
  },
  heroCompact: {
    minHeight: 100
  },
  heroFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -2,
    height: 32
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  numberInput: {
    flex: 1,
    marginLeft: 12,
    color: "#111827",
    fontSize: 15.5,
    lineHeight: 19,
    fontWeight: "600",
    paddingVertical: 0
  },
  passwordInput: {
    flex: 1,
    marginLeft: 10,
    color: "#111827",
    fontSize: 15.5,
    lineHeight: 19,
    fontWeight: "600",
    paddingVertical: 0
  },
  page: {
    flex: 1
  },
  screen: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0
  },
  sheet: {
    flex: 1,
    marginTop: -20,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
  sheetSpacer: {
    flex: 1,
    minHeight: 24
  },
  sheetTitle: {
    marginTop: 14,
    color: "#111827",
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900"
  },
  skipPill: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center"
  },
  skipText: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700"
  }
});
