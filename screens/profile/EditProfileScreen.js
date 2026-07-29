import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import UnifiedPageHeader from "../../components/UnifiedPageHeader";

const GENDERS = ["Female", "Male", "Other"];

function FormField({ label, value, onChangeText, placeholder, keyboardType, editable = true, hint, last }) {
  return (
    <View style={[styles.field, !last && styles.fieldDivider]}>
      <View style={styles.fieldTop}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {!editable ? (
          <View style={styles.verified}>
            <MaterialCommunityIcons name="check" size={12} color="#312E81" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : null}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0A4AA"
        keyboardType={keyboardType}
        editable={editable}
        autoCorrect={false}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
        selectionColor="#3730A3"
        style={[styles.input, !editable && styles.inputLocked]}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export default function EditProfileScreen({ onBack, onSave, initialProfile }) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initialProfile?.name || "Karna");
  const [phone, setPhone] = useState(initialProfile?.phone || "9954839220");
  const [email, setEmail] = useState(initialProfile?.email || "ksjiiskmki@gmail.com");
  const [dob, setDob] = useState(initialProfile?.dob || "01/01/1994");
  const [gender, setGender] = useState(initialProfile?.gender || "Male");
  const [emergency, setEmergency] = useState(initialProfile?.emergency || "Bunny");
  const [saving, setSaving] = useState(false);
  const [headerBorder, setHeaderBorder] = useState(false);
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setName(initialProfile?.name || "Karna");
    setPhone(initialProfile?.phone || "9954839220");
    setEmail(initialProfile?.email || "ksjiiskmki@gmail.com");
    setDob(initialProfile?.dob || "01/01/1994");
    setGender(initialProfile?.gender || "Male");
    setEmergency(initialProfile?.emergency || "Bunny");
  }, [initialProfile]);

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 370,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const canSave = useMemo(() => Boolean(name.trim() && phone.trim() && !saving), [name, phone, saving]);

  const saveProfile = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave?.({
        ...(initialProfile || {}),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        dob: dob.trim(),
        gender,
        emergency: emergency.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  const initial = name.trim().charAt(0).toUpperCase() || "R";

  return (
    <View style={styles.safe}>
      <UnifiedPageHeader
        title="Edit profile"
        onBack={onBack}
        elevated={headerBorder}
        backgroundColor="#FFFFFF"
        largeTitle
      />

      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Animated.ScrollView
          style={styles.screen}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={(event) => setHeaderBorder(event.nativeEvent.contentOffset.y > 4)}
          scrollEventThrottle={16}
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(128, insets.bottom + 112) }]}
        >
          <Animated.View
            style={{
              opacity: entrance,
              transform: [{
                translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
              }],
            }}
          >
            <View style={styles.profileIntro}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.profileCopy}>
                <Text style={styles.profileName} numberOfLines={1}>{name || "Your name"}</Text>
                <Text style={styles.profileMeta}>Details used for trips, deliveries and receipts</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>CONTACT DETAILS</Text>
            <View style={styles.formSection}>
              <FormField label="Full name" value={name} onChangeText={setName} placeholder="Enter your full name" />
              <FormField
                label="Phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={false}
                hint="Contact support to change your verified number."
              />
              <FormField
                label="Email address"
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
                last
              />
            </View>

            <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>
            <View style={styles.formSection}>
              <FormField
                label="Date of birth"
                value={dob}
                onChangeText={setDob}
                placeholder="DD/MM/YYYY"
                keyboardType="numbers-and-punctuation"
              />
              <View style={[styles.field, styles.fieldDivider]}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {GENDERS.map((item) => {
                    const selected = gender === item;
                    return (
                      <Pressable
                        key={item}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        onPress={() => setGender(item)}
                        style={({ pressed }) => [
                          styles.gender,
                          selected && styles.genderSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={[styles.genderText, selected && styles.genderTextSelected]}>{item}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <FormField
                label="Emergency contact"
                value={emergency}
                onChangeText={setEmergency}
                placeholder="Name or phone number"
                hint="Used only when you request safety assistance."
                last
              />
            </View>
          </Animated.View>
        </Animated.ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(12, insets.bottom + 6) }]}>
          <Pressable
            accessibilityRole="button"
            disabled={!canSave}
            onPress={saveProfile}
            style={({ pressed }) => [
              styles.saveButton,
              !canSave && styles.saveDisabled,
              pressed && canSave && styles.savePressed,
            ]}
          >
            <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
              {saving ? "Saving…" : "Save changes"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  keyboard: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 18, paddingTop: 16 },
  profileIntro: { paddingHorizontal: 6, paddingBottom: 19, flexDirection: "row", alignItems: "center" },
  avatar: { width: 62, height: 62, borderWidth: 1.5, borderColor: "#D9E0E6", borderRadius: 31, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#3730A3", fontSize: 24, lineHeight: 29, fontWeight: "800" },
  profileCopy: { flex: 1, minWidth: 0, marginLeft: 13 },
  profileName: { color: "#16191D", fontSize: 18, lineHeight: 23, fontWeight: "700" },
  profileMeta: { marginTop: 4, maxWidth: 275, color: "#66717F", fontSize: 12, lineHeight: 17 },
  sectionTitle: { marginTop: 25, marginBottom: 11, marginLeft: 7, color: "#3730A3", fontSize: 12, lineHeight: 16, fontWeight: "800", letterSpacing: 0.55 },
  formSection: { overflow: "hidden", borderWidth: 1, borderColor: "#DEE3E8", borderRadius: 22, backgroundColor: "#FFFFFF" },
  field: { paddingHorizontal: 16, paddingVertical: 15 },
  fieldDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#DEE3E8" },
  fieldTop: { marginBottom: 7, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fieldLabel: { color: "#566270", fontSize: 11, lineHeight: 15, fontWeight: "700" },
  input: { height: 47, paddingHorizontal: 13, paddingVertical: 0, borderWidth: 1, borderColor: "#D7DDE3", borderRadius: 14, backgroundColor: "#FFFFFF", color: "#16191D", fontSize: 14, lineHeight: 19, fontWeight: "500" },
  inputLocked: { color: "#777B82" },
  hint: { marginTop: 7, color: "#7C848E", fontSize: 11, lineHeight: 15 },
  verified: { flexDirection: "row", alignItems: "center", gap: 4 },
  verifiedText: { color: "#312E81", fontSize: 10, lineHeight: 14, fontWeight: "600" },
  genderRow: { marginTop: 8, flexDirection: "row", gap: 8 },
  gender: { flex: 1, height: 44, borderWidth: 1, borderColor: "#D7DDE3", borderRadius: 14, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  genderSelected: { borderColor: "#3730A3", borderWidth: 1.5 },
  genderText: { color: "#626C77", fontSize: 12, lineHeight: 16, fontWeight: "600" },
  genderTextSelected: { color: "#3730A3" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E0E2E5", backgroundColor: "#FFFFFF" },
  saveButton: { height: 51, borderRadius: 15, backgroundColor: "#202124", alignItems: "center", justifyContent: "center" },
  saveDisabled: { borderWidth: 1, borderColor: "#D8DBDF", backgroundColor: "#FFFFFF" },
  saveText: { color: "#FFFFFF", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  saveTextDisabled: { color: "#92959B" },
  savePressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  pressed: { opacity: 0.58 },
});
