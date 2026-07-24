import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { COLORS } from "../../theme/colors";

export function OnboardingScreen({ children, style }) {
  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={[styles.screen, style]}>{children}</View>
    </SafeAreaView>
  );
}

export function Header({ onBack, onSkip, skipLabel = "Skip" }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.backBtn}>
        <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.textPrimary} />
      </Pressable>
      <Pressable onPress={onSkip} hitSlop={10}>
        <Text style={styles.skip}>{skipLabel}</Text>
      </Pressable>
    </View>
  );
}

export function TopBarOnly({ onBack }) {
  return (
    <View style={styles.topOnly}>
      <Pressable onPress={onBack} style={styles.plainBackBtn} hitSlop={12}>
        <MaterialCommunityIcons name="arrow-left" size={21} color={COLORS.textPrimary} />
      </Pressable>
    </View>
  );
}

export function TitleBlock({ title, subtitle, center = true, children }) {
  return (
    <View style={[styles.titleBlock, center && styles.titleBlockCenter]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export function PrimaryButton({ label, onPress, style, children }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.buttonWrap, pressed && styles.pressed, style]}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryButton}
      >
        {children || <Text style={styles.primaryButtonText}>{label}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, icon, style }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed, style]}>
      {icon ? <MaterialCommunityIcons name={icon} size={16} color={COLORS.textPrimary} /> : null}
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress, style, textStyle, icon }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed, style]}>
      {icon ? <MaterialCommunityIcons name={icon} size={16} color={COLORS.primary} /> : null}
      <Text style={[styles.ghostButtonText, textStyle]}>{label}</Text>
    </Pressable>
  );
}

export function ChoiceRow({ label, subtitle, selected, onPress, icon }) {
  return (
    <Pressable onPress={onPress} style={styles.choiceRow}>
      <View style={styles.choiceTextWrap}>
        {icon ? (
          <MaterialCommunityIcons name={icon} size={18} color={COLORS.textPrimary} style={styles.choiceIcon} />
        ) : null}
        <View>
          <Text style={styles.choiceLabel}>{label}</Text>
          {subtitle ? <Text style={styles.choiceSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </Pressable>
  );
}

export function AuthField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, rightIcon }) {
  return (
    <View style={styles.fieldGroup}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={styles.fieldWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          style={styles.field}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {rightIcon ? <MaterialCommunityIcons name={rightIcon} size={18} color="#9CA3AF" /> : null}
      </View>
    </View>
  );
}

export function DotPager({ count, activeIndex }) {
  return (
    <View style={styles.pager}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.pagerDot, index === activeIndex && styles.pagerDotActive]} />
      ))}
    </View>
  );
}

export function PermissionBullet({ icon, text }) {
  return (
    <View style={styles.permissionBullet}>
      <View style={styles.permissionIconWrap}>
        <MaterialCommunityIcons name={icon} size={16} color={COLORS.primary} />
      </View>
      <Text style={styles.permissionBulletText}>{text}</Text>
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function IllustrationCard({ children, style }) {
  return <View style={[styles.illustrationCard, style]}>{children}</View>;
}

export function SmallLabel({ children, style }) {
  return <Text style={[styles.smallLabel, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 0
  },
  buttonWrap: {
    borderRadius: 8,
    overflow: "hidden"
  },
  card: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14
  },
  choiceIcon: {
    marginRight: 2
  },
  choiceLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "700"
  },
  choiceRow: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF"
  },
  choiceSubtitle: {
    marginTop: 2,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "500"
  },
  choiceTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1
  },
  field: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 12.5,
    fontWeight: "500",
    paddingVertical: 0
  },
  fieldGroup: {
    marginBottom: 14
  },
  fieldLabel: {
    color: COLORS.textPrimary,
    fontSize: 10.5,
    fontWeight: "700",
    marginBottom: 7
  },
  fieldWrap: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  ghostButton: {
    minHeight: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    flexDirection: "row",
    gap: 6
  },
  ghostButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  illustrationCard: {
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 0
  },
  pager: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8
  },
  pagerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#CBD5E1"
  },
  pagerDotActive: {
    width: 18,
    backgroundColor: COLORS.primary
  },
  permissionBullet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10
  },
  permissionBulletText: {
    color: COLORS.textPrimary,
    fontSize: 13.5,
    fontWeight: "600"
  },
  permissionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  plainBackBtn: {
    width: 28,
    height: 36,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  pressed: {
    opacity: 0.9
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800"
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center"
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary
  },
  radioSelected: {
    borderColor: COLORS.primary
  },
  safe: {
    flex: 1,
    backgroundColor: COLORS.primaryLight
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "700"
  },
  skip: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600"
  },
  smallLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600"
  },
  subtitle: {
    marginTop: 6,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    textAlign: "center"
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    textAlign: "center"
  },
  titleBlock: {
    marginTop: 8
  },
  titleBlockCenter: {
    alignItems: "center",
    textAlign: "center"
  },
  topOnly: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    marginBottom: 6
  }
});
