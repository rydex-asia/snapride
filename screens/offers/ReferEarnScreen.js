import React from "react";
import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AccountPageHeader from "../../components/AccountPageHeader";

import { COLORS } from "../../theme/colors";
const STEPS = [
  {
    key: "invite",
    title: "Invite your friends",
    subtitle: "Share your referral code or invite link in just one tap."
  },
  {
    key: "ride",
    title: "They complete their first ride",
    subtitle: "Once they finish their first trip, the referral becomes eligible."
  },
  {
    key: "earn",
    title: "You earn rewards",
    subtitle: "Your reward is credited automatically to your account."
  }
];

const REFERRALS = [
  { key: "1", name: "Aman Verma", status: "Completed", amount: "₹500" },
  { key: "2", name: "Priya Singh", status: "Pending", amount: "₹200" },
  { key: "3", name: "Karan Mehta", status: "Completed", amount: "₹500" }
];

export default function ReferEarnScreen({ onBack }) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <AccountPageHeader title="Refer & Earn" subtitle="Invite friends and earn ride rewards" onBack={onBack} />

      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#FFF4D6", "#FFE8A3"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
          <Text style={styles.heroTitle}>Earn up to ₹750</Text>
          <Text style={styles.heroSubtitle}>Invite friends & get rewards when they ride</Text>

          <View style={styles.giftWrap}>
            <View style={styles.coinLeft} />
            <View style={styles.coinRight} />
            <View style={styles.giftShadow} />
            <View style={styles.giftBox}>
              <View style={styles.giftRibbonVertical} />
              <View style={styles.giftRibbonHorizontal} />
              <View style={styles.giftBowLeft} />
              <View style={styles.giftBowRight} />
            </View>
          </View>

          <View style={styles.codeBox}>
            <Text style={styles.codeText}>RYDEX123</Text>
            <Pressable style={styles.copyButton}>
              <MaterialCommunityIcons name="content-copy" size={18} color="#111827" />
            </Pressable>
          </View>
        </LinearGradient>

        <View style={styles.shareRow}>
          <Pressable style={[styles.shareButton, styles.whatsappButton]}>
            <MaterialCommunityIcons name="whatsapp" size={18} color="#FFFFFF" />
            <Text style={styles.whatsappText}>WhatsApp</Text>
          </Pressable>
          <Pressable style={[styles.shareButton, styles.secondaryShareButton]}>
            <MaterialCommunityIcons name="link-variant" size={18} color="#111827" />
            <Text style={styles.secondaryShareText}>Copy Link</Text>
          </Pressable>
          <Pressable style={[styles.shareButton, styles.secondaryShareButton]}>
            <MaterialCommunityIcons name="share-variant-outline" size={18} color="#111827" />
            <Text style={styles.secondaryShareText}>Share More</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.stepsCard}>
            {STEPS.map((step, index) => (
              <View key={step.key}>
                <View style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepCopy}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                  </View>
                </View>
                {index !== STEPS.length - 1 ? <View style={styles.stepDivider} /> : null}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionPad}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>Total Earned</Text>
              <Text style={styles.summaryAmount}>₹1200</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={styles.summaryAmount}>₹200</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your referrals</Text>
          <View style={styles.referralsCard}>
            {REFERRALS.map((item, index) => {
              const completed = item.status === "Completed";
              return (
                <View key={item.key}>
                  <View style={styles.referralRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.referralCopy}>
                      <Text style={styles.referralName}>{item.name}</Text>
                      <View style={[styles.statusPill, completed ? styles.completedPill : styles.pendingPill]}>
                        <Text style={[styles.statusText, completed ? styles.completedText : styles.pendingText]}>{item.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.rewardAmount}>{item.amount}</Text>
                  </View>
                  {index !== REFERRALS.length - 1 ? <View style={styles.referralDivider} /> : null}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.termsWrap}>
          <Text style={styles.termLine}>Referral rewards are credited after first ride</Text>
          <Text style={styles.termLine}>Valid for limited time</Text>
        </View>
      </ScrollView>

      <View style={[styles.footerBar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.inviteButton}>
          <Text style={styles.inviteButtonText}>Invite Friends</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "COLORS.primaryLight",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800"
  },
  codeBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  codeText: {
    color: "#111111",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 1
  },
  coinLeft: {
    position: "absolute",
    left: 42,
    top: 34,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(245,158,11,0.65)"
  },
  coinRight: {
    position: "absolute",
    right: 44,
    top: 24,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(245,158,11,0.55)"
  },
  completedPill: {
    backgroundColor: "COLORS.primaryLight"
  },
  completedText: {
    color: COLORS.primary
  },
  content: {
    paddingBottom: 168
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center"
  },
  footerBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(229,231,235,0.9)",
    paddingHorizontal: 16,
    paddingTop: 12
  },
  giftBowLeft: {
    position: "absolute",
    top: -14,
    left: 18,
    width: 26,
    height: 22,
    borderWidth: 8,
    borderColor: "#EF4444",
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 18,
    transform: [{
      rotate: "-18deg"
    }]
  },
  giftBowRight: {
    position: "absolute",
    top: -14,
    right: 18,
    width: 26,
    height: 22,
    borderWidth: 8,
    borderColor: "#EF4444",
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 18,
    transform: [{
      rotate: "18deg"
    }]
  },
  giftBox: {
    width: 92,
    height: 92,
    borderRadius: 18,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  giftRibbonHorizontal: {
    position: "absolute",
    height: 14,
    left: 0,
    right: 0,
    backgroundColor: "#EF4444"
  },
  giftRibbonVertical: {
    position: "absolute",
    width: 14,
    top: 0,
    bottom: 0,
    backgroundColor: "#EF4444"
  },
  giftShadow: {
    position: "absolute",
    bottom: 18,
    width: 92,
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.08)"
  },
  giftWrap: {
    height: 122,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 10,
    position: "relative"
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  headerTitle: {
    color: "#111827",
    fontSize: 19,
    fontWeight: "800"
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 16,
    position: "relative",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3
    }
  },
  heroSubtitle: {
    marginTop: 6,
    color: "#666666",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
    maxWidth: 260
  },
  heroTitle: {
    color: "#111111",
    fontSize: 20,
    fontWeight: "800"
  },
  inviteButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    borderWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6
    },
    elevation: 0
  },
  inviteButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800"
  },
  pendingPill: {
    backgroundColor: "#FFF4E6"
  },
  pendingText: {
    color: "#D97706"
  },
  referralCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8
  },
  referralDivider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginLeft: 58
  },
  referralName: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "700"
  },
  referralRow: {
    minHeight: 54,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center"
  },
  referralsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2
    },
    overflow: "hidden"
  },
  rewardAmount: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "800"
  },
  safe: {
    flex: 1,
    backgroundColor: "#F7F8FA"
  },
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FA"
  },
  secondaryShareButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  secondaryShareText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700"
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16
  },
  sectionPad: {
    marginTop: 20,
    paddingHorizontal: 16
  },
  sectionTitle: {
    color: "#111111",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 12
  },
  shareButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 8
  },
  shareRow: {
    marginHorizontal: 16,
    marginTop: 14,
    flexDirection: "row",
    gap: 10
  },
  statusPill: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700"
  },
  stepCopy: {
    flex: 1,
    minWidth: 0
  },
  stepDivider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginLeft: 56
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "COLORS.primaryLight",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  stepNumberText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800"
  },
  stepRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "flex-start"
  },
  stepsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 2,
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2
    }
  },
  stepSubtitle: {
    marginTop: 3,
    color: "#666666",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16
  },
  stepTitle: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "700"
  },
  summaryAmount: {
    marginTop: 8,
    color: "#111111",
    fontSize: 22,
    fontWeight: "800"
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2
    }
  },
  summaryColumn: {
    flex: 1,
    alignItems: "center"
  },
  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#EEEEEE"
  },
  summaryLabel: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "500"
  },
  termLine: {
    color: "#666666",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 4
  },
  termsWrap: {
    marginTop: 18,
    paddingHorizontal: 16
  },
  whatsappButton: {
    backgroundColor: "#16A34A"
  },
  whatsappText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700"
  }
});
