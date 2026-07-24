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

export default function SignupScreen({
  onBack,
  onSignup,
  onLogin,
  errorMessage = "",
  isLoading = false,
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = height < 640;
  const sheetAnim = React.useRef(new Animated.Value(0)).current;
  const [form, setForm] = React.useState({
    name: "",
    mobile: "",
    password: "",
  });
  const [accepted, setAccepted] = React.useState(true);

  React.useEffect(() => {
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [sheetAnim]);

  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const canContinue =
    accepted &&
    !isLoading &&
    form.name.trim().length > 1 &&
    form.mobile.replace(/\D/g, "").length >= 10 &&
    form.password.length >= 8;

  const handleSignup = () => {
    if (!canContinue) return;
    onSignup?.(form);
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

              <View style={styles.skipSpacer} />
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

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

            <Text style={styles.sheetTitle}>Sign up</Text>
            <Text style={styles.sheetSubtitle}>Set up your account in a few quick steps.</Text>

            <View style={styles.formPanel}>
              <View style={styles.fieldCard}>
                <View style={styles.fieldIconWrap}>
                  <MaterialCommunityIcons name="account-outline" size={18} color={COLORS.primary} />
                </View>
                <TextInput
                  value={form.name}
                  onChangeText={(value) => setValue("name", value)}
                  placeholder="Full name"
                  placeholderTextColor="#C7CBD1"
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.fieldCard}>
                <View style={styles.countryCodeWrap}>
                  <Text style={styles.countryCode}>+91</Text>
                </View>
                <View style={styles.fieldDivider} />
                <TextInput
                  value={form.mobile}
                  onChangeText={(value) => setValue("mobile", value)}
                  placeholder="Mobile number"
                  placeholderTextColor="#C7CBD1"
                  keyboardType="phone-pad"
                  style={styles.numberInput}
                  maxLength={10}
                  selectionColor={COLORS.primary}
                />
              </View>

              <View style={styles.fieldCard}>
                <View style={styles.fieldIconWrap}>
                  <MaterialCommunityIcons name="lock-outline" size={18} color={COLORS.primary} />
                </View>
                <TextInput
                  value={form.password}
                  onChangeText={(value) => setValue("password", value)}
                  placeholder="Password"
                  placeholderTextColor="#C7CBD1"
                  secureTextEntry
                  style={styles.input}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <Text style={styles.bottomText}>
              Already have an account?{" "}
              <Text style={styles.bottomLink} onPress={onLogin}>
                Login
              </Text>
            </Text>

            <View style={styles.sheetSpacer} />

            <Pressable style={styles.termsRow} onPress={() => setAccepted((value) => !value)}>
              <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
                {accepted ? <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" /> : null}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms</Text> and{" "}
                <Text style={styles.termsLink}>Privacy policy</Text>
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSignup}
              disabled={!canContinue}
              style={({ pressed }) => [
                styles.continueButton,
                canContinue ? styles.continueButtonActive : styles.continueButtonDisabled,
                pressed && canContinue && styles.continueButtonPressed,
              ]}
            >
              <Text style={[styles.continueText, !canContinue && styles.continueTextDisabled]}>
                {isLoading ? "Creating account…" : "Continue"}
              </Text>
            </Pressable>
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
  bottomLink: {
    color: COLORS.primary,
    fontWeight: "700"
  },
  bottomText: {
    marginTop: "auto",
    paddingTop: 16,
    paddingBottom: 2,
    color: "#6B7280",
    textAlign: "center",
    fontSize: 11.5,
    fontWeight: "500"
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  continueButton: {
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16
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
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "800"
  },
  countryCodeWrap: {
    paddingRight: 10
  },
  fieldCard: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1.2,
    borderColor: "#D7DCF0",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 10
  },
  fieldDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E7EAF5"
  },
  fieldIconWrap: {
    width: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
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
  hero: {
    minHeight: 112,
    paddingHorizontal: 16,
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
    bottom: -1,
    height: 42
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
  input: {
    flex: 1,
    marginLeft: 0,
    color: "#111827",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "600",
    paddingVertical: 0
  },
  numberInput: {
    flex: 1,
    marginLeft: 12,
    color: "#111827",
    fontSize: 15,
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
    paddingBottom: 14,
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: -4
    },
    elevation: 0
  },
  sheetHandle: {
    width: 54,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#DDE3F0",
    alignSelf: "center"
  },
  sheetSpacer: {
    flex: 1,
    minHeight: 24
  },
  sheetSubtitle: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "500"
  },
  sheetTitle: {
    marginTop: 12,
    color: "#111827",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900"
  },
  skipSpacer: {
    width: 36,
    height: 36
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: "700"
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 14
  },
  termsText: {
    flex: 1,
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500"
  }
});
