import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SimplePageHeader from "../../components/SimplePageHeader";

const GENDERS = ["Female", "Male", "Other"];

function ProfileField({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  editable = true,
  hint,
}) {
  return (
    <View style={styles.fieldBlock}>
      <View style={styles.fieldHeading}>
        <MaterialCommunityIcons name={icon} size={17} color="#777C84" />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <View style={[styles.fieldControl, !editable && styles.fieldControlDisabled]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A1A4AA"
          keyboardType={keyboardType}
          editable={editable}
          autoCorrect={false}
          autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
          selectionColor="#F5A800"
          style={[styles.input, !editable && styles.inputDisabled]}
        />
        {!editable ? (
          <MaterialCommunityIcons name="lock-outline" size={17} color="#93969C" />
        ) : null}
      </View>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
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

  useEffect(() => {
    setName(initialProfile?.name || "Karna");
    setPhone(initialProfile?.phone || "9954839220");
    setEmail(initialProfile?.email || "ksjiiskmki@gmail.com");
    setDob(initialProfile?.dob || "01/01/1994");
    setGender(initialProfile?.gender || "Male");
    setEmergency(initialProfile?.emergency || "Bunny");
  }, [initialProfile]);

  const canSave = useMemo(
    () => Boolean(name.trim() && phone.trim() && !saving),
    [name, phone, saving]
  );

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
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SimplePageHeader title="Edit profile" eyebrow="Account details" onBack={onBack} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.screen}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(128, insets.bottom + 112) },
          ]}
        >
          <View style={styles.identityCard}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.verifiedMark}>
                <MaterialCommunityIcons name="check" size={11} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.identityCopy}>
              <Text style={styles.identityName} numberOfLines={1}>{name || "Your name"}</Text>
              <Text style={styles.identityMeta}>Verified Rydex account</Text>
            </View>
            <View style={styles.profileStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.profileStatusText}>Active</Text>
            </View>
          </View>

          <SectionHeader
            title="Profile information"
            subtitle="Details used for bookings and receipts"
          />
          <View style={styles.formCard}>
            <ProfileField
              icon="account-outline"
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
            />
            <ProfileField
              icon="phone-outline"
              label="Verified phone"
              value={phone}
              onChangeText={setPhone}
              editable={false}
              keyboardType="phone-pad"
              hint="Contact support if this number needs to be changed."
            />
            <ProfileField
              icon="email-outline"
              label="Email address"
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
            />
          </View>

          <SectionHeader title="Personal details" subtitle="Optional profile information" />
          <View style={styles.formCard}>
            <ProfileField
              icon="calendar-blank-outline"
              label="Date of birth"
              value={dob}
              onChangeText={setDob}
              placeholder="DD/MM/YYYY"
              keyboardType="numbers-and-punctuation"
            />
            <View style={styles.fieldBlock}>
              <View style={styles.fieldHeading}>
                <MaterialCommunityIcons name="account-details-outline" size={17} color="#777C84" />
                <Text style={styles.fieldLabel}>Gender</Text>
              </View>
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
                        styles.genderOption,
                        selected && styles.genderOptionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      {selected ? <View style={styles.genderDot} /> : null}
                      <Text style={[styles.genderText, selected && styles.genderTextSelected]}>
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <SectionHeader
            title="Emergency contact"
            subtitle="Used only when you request safety assistance"
          />
          <View style={styles.formCard}>
            <ProfileField
              icon="shield-account-outline"
              label="Contact name or number"
              value={emergency}
              onChangeText={setEmergency}
              placeholder="Add an emergency contact"
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(12, insets.bottom + 6) }]}>
          <Pressable
            accessibilityRole="button"
            disabled={!canSave}
            onPress={saveProfile}
            style={({ pressed }) => [
              styles.saveButton,
              !canSave && styles.saveButtonDisabled,
              pressed && canSave && styles.saveButtonPressed,
            ]}
          >
            <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
              {saving ? "Saving changes…" : "Save changes"}
            </Text>
            {!saving ? (
              <MaterialCommunityIcons name="arrow-right" size={19} color="#FFFFFF" />
            ) : null}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  keyboardView: { flex: 1, backgroundColor: "#F1F0F5" },
  screen: { flex: 1, backgroundColor: "#F1F0F5" },
  content: { paddingHorizontal: 16, paddingTop: 14 },
  identityCard: {
    minHeight: 88,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: "#FFF2CC",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Inter_600SemiBold",
    color: "#8C5900",
    fontSize: 23,
    lineHeight: 28,
  },
  verifiedMark: {
    position: "absolute",
    right: -3,
    bottom: -2,
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#202124",
    alignItems: "center",
    justifyContent: "center",
  },
  identityCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  identityName: {
    fontFamily: "Inter_600SemiBold",
    color: "#202124",
    fontSize: 17,
    lineHeight: 22,
  },
  identityMeta: {
    marginTop: 3,
    fontFamily: "Inter_400Regular",
    color: "#777B82",
    fontSize: 11,
    lineHeight: 15,
  },
  profileStatus: {
    height: 28,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: "#EEF8F3",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#157457" },
  profileStatusText: {
    fontFamily: "Inter_500Medium",
    color: "#157457",
    fontSize: 10,
    lineHeight: 13,
  },
  sectionHeader: { marginTop: 23, marginBottom: 9, paddingHorizontal: 2 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    color: "#202124",
    fontSize: 16,
    lineHeight: 21,
  },
  sectionSubtitle: {
    marginTop: 2,
    fontFamily: "Inter_400Regular",
    color: "#7C8087",
    fontSize: 11,
    lineHeight: 15,
  },
  formCard: {
    paddingHorizontal: 13,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  fieldBlock: { paddingVertical: 10 },
  fieldHeading: {
    marginBottom: 7,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  fieldLabel: {
    fontFamily: "Inter_500Medium",
    color: "#555A62",
    fontSize: 11,
    lineHeight: 15,
  },
  fieldControl: {
    minHeight: 47,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: "#F6F7F8",
    flexDirection: "row",
    alignItems: "center",
  },
  fieldControlDisabled: { backgroundColor: "#F0F1F3" },
  input: {
    flex: 1,
    minWidth: 0,
    height: 47,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontFamily: "Inter_400Regular",
    color: "#202124",
    fontSize: 14,
    lineHeight: 19,
  },
  inputDisabled: { color: "#777B82" },
  fieldHint: {
    marginTop: 6,
    paddingHorizontal: 2,
    fontFamily: "Inter_400Regular",
    color: "#92959B",
    fontSize: 9.5,
    lineHeight: 14,
  },
  genderRow: { flexDirection: "row", gap: 8 },
  genderOption: {
    flex: 1,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#F3F4F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  genderOptionSelected: { backgroundColor: "#FFF2CC" },
  genderDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#A96700" },
  genderText: {
    fontFamily: "Inter_500Medium",
    color: "#686C73",
    fontSize: 11,
    lineHeight: 15,
  },
  genderTextSelected: { color: "#7C4C00" },
  pressed: { opacity: 0.68 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
  },
  saveButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#202124",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonDisabled: { backgroundColor: "#E1E3E6" },
  saveButtonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  saveText: {
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
  },
  saveTextDisabled: { color: "#92959B" },
});
