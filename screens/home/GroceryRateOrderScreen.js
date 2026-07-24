import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GroceryItemIssueFlow from "./GroceryItemIssueFlow";

const BLUE = "#0F9D4A";
const BLUE_DARK = "#087238";
const GREEN = "#0FA63C";
const INK = "#171A20";
const MUTED = "#737983";

const ORDER_TAGS = ["Fresh items", "Packed well", "Good quality", "Correct items", "Worth the price"];
const PARTNER_TAGS = ["Polite", "On time", "Handled with care", "Easy handoff"];

function imageSource(value) {
  if (!value) return null;
  return typeof value === "string" ? { uri: value } : value;
}

function Stars({ value, onChange, size }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} hitSlop={7} onPress={() => onChange(star)} style={({ pressed }) => [styles.starButton, pressed && styles.starPressed]}>
          <MaterialCommunityIcons name={star <= value ? "star" : "star"} size={size} color={star <= value ? "#FFB516" : "#E3E5EA"} />
        </Pressable>
      ))}
    </View>
  );
}

function Chips({ options, selected, onToggle, blue = false }) {
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <Pressable key={option} onPress={() => onToggle(option)} style={[styles.chip, active && (blue ? styles.chipBlue : styles.chipGreen)]}>
            {active ? <MaterialCommunityIcons name="check" size={13} color={blue ? BLUE : GREEN} /> : null}
            <Text style={[styles.chipText, active && { color: blue ? BLUE_DARK : "#14742F" }]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function GroceryRateOrderScreen({ order = {}, items = [], partnerName = "Your delivery partner", onBack, onDone, onReportIssue }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [partnerRating, setPartnerRating] = useState(0);
  const [orderRating, setOrderRating] = useState(0);
  const [partnerTags, setPartnerTags] = useState([]);
  const [orderTags, setOrderTags] = useState([]);
  const [showItemsRating, setShowItemsRating] = useState(false);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [itemIssueOpen, setItemIssueOpen] = useState(false);
  const heroReveal = useRef(new Animated.Value(0)).current;
  const sheetReveal = useRef(new Animated.Value(0)).current;
  const successReveal = useRef(new Animated.Value(0)).current;
  const horizontal = Math.max(16, Math.min(28, width * 0.045));
  const starSize = Math.max(33, Math.min(40, width * 0.09));

  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || item.qty || 1), 0) || order?.itemCount || 1;
  const orderTime = order?.deliveredAtLabel || order?.orderTime || "09:57 AM";
  const deliveryDuration = order?.deliveryDurationLabel || "05 mins 29 secs";
  const canSubmit = partnerRating > 0 && orderRating > 0;
  const ratingWord = (value) => ["", "Poor", "Could be better", "Good", "Very good", "Excellent!"][value];

  const thumbnails = useMemo(() => items.slice(0, 3), [items]);

  useEffect(() => {
    const animation = Animated.stagger(120, [
      Animated.timing(heroReveal, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(sheetReveal, { toValue: 1, damping: 17, stiffness: 105, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [heroReveal, sheetReveal]);

  const toggle = (value, setter) => setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const submit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    Animated.spring(successReveal, { toValue: 1, damping: 12, stiffness: 130, useNativeDriver: true }).start();
  };

  if (submitted) {
    return (
      <View style={[styles.successScreen, { paddingTop: insets.top, paddingBottom: Math.max(18, insets.bottom) }]}>
        <StatusBar style="dark" translucent backgroundColor="transparent" />
        <Animated.View style={[styles.successContent, { opacity: successReveal, transform: [{ scale: successReveal.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) }] }]}>
          <View style={styles.successIcon}><MaterialCommunityIcons name="check-bold" size={48} color="#FFFFFF" /></View>
          <Text style={styles.successTitle}>Thanks for rating your order</Text>
          <Text style={styles.successSubtitle}>Your feedback helps Frezo and our delivery partners serve you better.</Text>
        </Animated.View>
        <Pressable style={styles.doneButton} onPress={() => onDone?.({ partnerRating, orderRating, partnerTags, orderTags, note })}><Text style={styles.doneText}>Done</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom + 12) }}>
        <Animated.View style={{ opacity: heroReveal, transform: [{ translateY: heroReveal.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }}>
          <LinearGradient colors={["#162A83", "#19235E", "#14131C"]} style={[styles.promoHero, { height: 270 + insets.top }]}> 
            <View style={[styles.heroHeader, { paddingTop: insets.top + 8 }]}> 
              <Pressable style={styles.heroBack} onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" /></Pressable>
              <View style={styles.heroDeliveredPill}><MaterialCommunityIcons name="check-circle" size={14} color="#D9FFE5" /><Text style={styles.heroDeliveredText}>Delivered in {deliveryDuration}</Text></View>
              <View style={styles.heroHeaderSpacer} />
            </View>
            <View style={[styles.promoShowcase, { paddingHorizontal: horizontal, paddingTop: insets.top + 38 }]}> 
              <View style={styles.promoShowcaseCopy}>
                <Text style={styles.promoShowcaseTitle}>Buy More{`\n`}Save More</Text>
                <Text style={styles.promoShowcaseSubtitle}>Fresh essentials at prices you’ll love</Text>
                <Pressable style={styles.promoShopButton} onPress={() => Alert.alert("Shop again", "Taking you to fresh recommendations.")}><Text style={styles.promoShopText}>SHOP NOW</Text><MaterialCommunityIcons name="chevron-right" size={17} color="#E64B84" /></Pressable>
              </View>
              <View style={styles.promoVisual}>
                <View style={styles.promoVisualGlow} />
                <MaterialCommunityIcons name="basket" size={66} color="#C9F6D5" />
                <View style={styles.promoThumbRow}>
                  {thumbnails.slice(0, 2).map((item, index) => (
                    <View key={item.id || index} style={styles.promoThumb}>
                      {imageSource(item.image || item.product?.image) ? <Image source={imageSource(item.image || item.product?.image)} style={styles.promoThumbImage} resizeMode="contain" /> : <MaterialCommunityIcons name="food-apple-outline" size={18} color={GREEN} />}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

          <Animated.View style={[styles.ratingSheet, { marginHorizontal: 14, opacity: sheetReveal, transform: [{ translateY: sheetReveal.interpolate({ inputRange: [0, 1], outputRange: [35, 0] }) }] }]}> 
            <LinearGradient pointerEvents="none" colors={["#DDEAFF", "#F3F7FF", "rgba(255,255,255,0)"]} locations={[0, 0.7, 1]} style={styles.ratingTopGradient} />
            <View style={styles.partnerIdentity}>
              <View style={styles.partnerAvatar}><MaterialCommunityIcons name="account" size={25} color={GREEN} /></View>
              <View style={styles.partnerIdentityCopy}><Text style={styles.partnerEyebrow}>DELIVERED BY</Text><Text style={styles.partnerName} numberOfLines={1}>{partnerName}</Text></View>
              <View style={styles.completedMark}><MaterialCommunityIcons name="check" size={16} color="#FFFFFF" /></View>
            </View>
            <Text style={styles.ratingQuestion}>How would you rate the delivery?</Text>
            <Stars value={partnerRating} onChange={setPartnerRating} size={starSize} />
            {partnerRating ? <Text style={styles.ratingWord}>{ratingWord(partnerRating)}</Text> : null}
            {partnerRating ? <Chips options={PARTNER_TAGS} selected={partnerTags} onToggle={(value) => toggle(value, setPartnerTags)} /> : null}

            <View style={styles.sheetDivider} />
            <Pressable style={styles.rateItemsRow} onPress={() => setShowItemsRating((value) => !value)}>
              <Text style={styles.rateItemsText}>{showItemsRating ? "Hide item rating" : "Rate items in this order"}</Text>
              <MaterialCommunityIcons name={showItemsRating ? "chevron-up" : "chevron-right"} size={25} color={BLUE} />
              <View style={styles.thumbStack}>
                {thumbnails.map((item, index) => (
                  <View key={item.id || index} style={[styles.thumb, { marginLeft: index ? -10 : 0, zIndex: 3 - index }]}>
                    {imageSource(item.image || item.product?.image) ? <Image source={imageSource(item.image || item.product?.image)} style={styles.thumbImage} resizeMode="contain" /> : <MaterialCommunityIcons name="food-apple-outline" size={18} color={GREEN} />}
                  </View>
                ))}
              </View>
            </Pressable>

            {showItemsRating ? (
              <View style={styles.itemsRatingArea}>
                <Text style={styles.itemsQuestion}>How were your items and packing?</Text>
                <Stars value={orderRating} onChange={setOrderRating} size={starSize - 4} />
                {orderRating ? <Text style={styles.ratingWord}>{ratingWord(orderRating)}</Text> : null}
                {orderRating ? <Chips blue options={ORDER_TAGS} selected={orderTags} onToggle={(value) => toggle(value, setOrderTags)} /> : null}
                {orderRating ? (
                  <View style={styles.noteWrap}>
                    <TextInput value={note} onChangeText={setNote} placeholder="Tell us more (optional)" placeholderTextColor="#9AA0AA" multiline maxLength={300} style={styles.noteInput} textAlignVertical="top" />
                  </View>
                ) : null}
              </View>
            ) : null}

            <View style={styles.contactRow}>
              <Text style={styles.contactText}>Order not delivered? Contact us</Text>
              <View style={styles.contactActions}>
                <Pressable style={styles.contactButton} onPress={() => Alert.alert("Call support", "Connecting you with Frezo support.")}><MaterialCommunityIcons name="phone" size={21} color={INK} /></Pressable>
                <View style={styles.contactDivider} />
                <Pressable style={styles.contactButton} onPress={() => Alert.alert("Chat support", "Opening order support chat.")}><MaterialCommunityIcons name="message-text" size={21} color={INK} /></Pressable>
              </View>
            </View>

            <Pressable style={styles.reportIssueRow} onPress={() => setItemIssueOpen(true)}>
              <View style={styles.reportIssueIcon}><MaterialCommunityIcons name="alert-circle-outline" size={20} color="#B54708" /></View>
              <View style={styles.reportIssueCopy}><Text style={styles.reportIssueTitle}>Wrong, damaged or missing item?</Text><Text style={styles.reportIssueSubtitle}>Request a refund or replacement</Text></View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#8A919C" />
            </Pressable>

            {showItemsRating ? (
              <Pressable disabled={!canSubmit} onPress={submit} style={[styles.submitButton, !canSubmit && styles.submitDisabled]}>
                <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>Submit ratings</Text>
                <MaterialCommunityIcons name="arrow-right" size={21} color={canSubmit ? "#FFFFFF" : "#A2A7AF"} />
              </Pressable>
            ) : null}
          </Animated.View>

        <View style={styles.waitSection}>
          <View style={styles.moreHeading}><View><Text style={styles.waitTitle}>More from Frezo</Text><Text style={styles.waitSubtitle}>Handpicked for your next basket</Text></View><MaterialCommunityIcons name="arrow-right" size={22} color={BLUE} /></View>
          <View style={styles.promoCard}>
            <View style={styles.promoCopy}><Text style={styles.promoEyebrow}>FREZO PREMIUM</Text><Text style={styles.promoTitle}>Fresh picks for your next order</Text><Text style={styles.promoSubtitle}>Discover handpicked grocery favourites.</Text></View>
            <MaterialCommunityIcons name="basket-outline" size={74} color="rgba(255,255,255,0.78)" />
          </View>
        </View>
      </ScrollView>

      <Modal visible={itemIssueOpen} transparent animationType="fade" onRequestClose={() => setItemIssueOpen(false)} statusBarTranslucent presentationStyle="overFullScreen">
        <GroceryItemIssueFlow
          items={items}
          paymentMethod={order?.paymentMethod || "UPI"}
          onClose={() => setItemIssueOpen(false)}
          onSubmit={async (report) => {
            await onReportIssue?.(report);
            setItemIssueOpen(false);
            Alert.alert("Report submitted", report.resolution === "REFUND" ? "We’ll review the items and update your refund shortly." : "We’ll confirm replacement availability shortly.");
          }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3F1FA" },
  promoHero: { overflow: "hidden" },
  heroHeader: { zIndex: 4, position: "absolute", left: 14, right: 14, top: 0, minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  heroDeliveredPill: { minHeight: 30, borderRadius: 16, paddingHorizontal: 11, backgroundColor: "rgba(13,135,58,0.9)", flexDirection: "row", alignItems: "center", gap: 5 },
  heroDeliveredText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#FFFFFF" },
  heroHeaderSpacer: { width: 40 },
  promoShowcase: { height: "100%", paddingBottom: 32, flexDirection: "row", overflow: "hidden" },
  promoShowcaseCopy: { width: "56%", zIndex: 2, justifyContent: "center" },
  promoShowcaseTitle: { fontFamily: "Inter_600SemiBold", fontSize: 20, lineHeight: 25, color: "#FFFFFF", letterSpacing: -0.3 },
  promoShowcaseSubtitle: { maxWidth: 175, marginTop: 6, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16, color: "rgba(255,255,255,0.76)" },
  promoShopButton: { width: 105, height: 36, marginTop: 12, borderRadius: 10, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3 },
  promoShopText: { fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 0.25, color: "#E64B84" },
  promoVisual: { flex: 1, alignItems: "center", justifyContent: "center" },
  promoVisualGlow: { position: "absolute", width: 175, height: 175, borderRadius: 88, backgroundColor: "rgba(76,219,128,0.12)" },
  promoThumbRow: { position: "absolute", bottom: 36, flexDirection: "row" },
  promoThumb: { width: 38, height: 38, marginHorizontal: -3, borderRadius: 19, backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: "#152441", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  promoThumbImage: { width: "88%", height: "88%" },
  ratingSheet: { zIndex: 3, marginTop: -18, padding: 14, borderRadius: 22, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E4E1ED", shadowColor: "#514A66", shadowOpacity: 0, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 0 },
  ratingTopGradient: { position: "absolute", left: 0, right: 0, top: 0, height: 154, borderTopLeftRadius: 21, borderTopRightRadius: 21 },
  partnerIdentity: { flexDirection: "row", alignItems: "center" },
  partnerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#EAF8EE", alignItems: "center", justifyContent: "center" },
  partnerIdentityCopy: { flex: 1, minWidth: 0, marginLeft: 10 },
  partnerEyebrow: { fontFamily: "Inter_500Medium", fontSize: 9, letterSpacing: 0.8, color: "#8A9099" },
  partnerName: { marginTop: 3, fontFamily: "Inter_600SemiBold", fontSize: 14, color: INK },
  completedMark: { width: 25, height: 25, borderRadius: 13, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" },
  ratingQuestion: { marginTop: 6, fontFamily: "Inter_600SemiBold", fontSize: 18, lineHeight: 24, color: INK, letterSpacing: -0.3 },
  starsRow: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  starButton: { flex: 1, minHeight: 43, alignItems: "center", justifyContent: "center" },
  starPressed: { transform: [{ scale: 0.9 }] },
  ratingWord: { marginTop: 2, textAlign: "center", fontFamily: "Inter_500Medium", fontSize: 12, color: "#A36B00" },
  chips: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { minHeight: 32, borderRadius: 16, paddingHorizontal: 11, backgroundColor: "#F4F5F7", flexDirection: "row", alignItems: "center", gap: 4 },
  chipGreen: { backgroundColor: "#EAF8EE", borderWidth: 1, borderColor: "#B9E3C5" },
  chipBlue: { backgroundColor: "#EDF4FF", borderWidth: 1, borderColor: "#BCD3FB" },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 10, color: "#606772" },
  sheetDivider: { height: 1, marginBottom: 7, marginTop: 15, borderTopColor: "#D9DDE4", borderTopWidth: 1, borderStyle: "dashed" },
  rateItemsRow: { minHeight: 57, borderRadius: 13, paddingHorizontal: 10, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  rateItemsText: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 15, color: BLUE },
  thumbStack: { marginLeft: 8, flexDirection: "row", alignItems: "center" },
  thumb: { width: 35, height: 35, borderRadius: 18, borderWidth: 2, borderColor: "#FFFFFF", backgroundColor: "#F5F6F8", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  thumbImage: { width: "88%", height: "88%" },
  itemsRatingArea: { marginTop: 7, borderRadius: 14, borderTopColor: "#D9DDE4", borderTopWidth: 1, borderStyle: "dashed", paddingHorizontal: 10, paddingTop: 13, paddingBottom: 10, backgroundColor: "#FFFFFF" },
  itemsQuestion: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: INK },
  noteWrap: { marginTop: 13 },
  noteInput: { minHeight: 72, borderRadius: 13, padding: 11, backgroundColor: "#F5F6F8", fontFamily: "Inter_400Regular", fontSize: 12, color: INK },
  contactRow: { minHeight: 55, marginTop: 8, borderRadius: 13, paddingHorizontal: 10, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  contactText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 12, color: "#40454D" },
  contactActions: { height: 40, borderRadius: 20, paddingHorizontal: 4, backgroundColor: "#F4F5F7", flexDirection: "row", alignItems: "center" },
  contactButton: { width: 39, height: 38, alignItems: "center", justifyContent: "center" },
  contactDivider: { width: 1, height: 22, backgroundColor: "#D5D8DD" },
  reportIssueRow: { minHeight: 56, marginTop: 4, borderRadius: 13, backgroundColor: "#FFF8ED", paddingHorizontal: 10, flexDirection: "row", alignItems: "center" },
  reportIssueIcon: { width: 36, height: 36, marginRight: 9, borderRadius: 18, backgroundColor: "#FFEBC8", alignItems: "center", justifyContent: "center" },
  reportIssueCopy: { flex: 1, minWidth: 0 },
  reportIssueTitle: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#7A2E0E" },
  reportIssueSubtitle: { marginTop: 3, fontFamily: "Inter_400Regular", fontSize: 10, color: "#8A6555" },
  submitButton: { height: 50, marginTop: 6, borderRadius: 14, paddingHorizontal: 17, backgroundColor: BLUE, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  submitDisabled: { backgroundColor: "#E5E7EA" },
  submitText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFFFFF" },
  submitTextDisabled: { color: "#A2A7AF" },
  waitSection: { paddingHorizontal: 18, paddingTop: 30, paddingBottom: 18, backgroundColor: "#FFFFFF" },
  moreHeading: { width: "100%", maxWidth: 680, alignSelf: "center", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  waitTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: INK },
  waitSubtitle: { marginTop: 3, fontFamily: "Inter_400Regular", fontSize: 12, color: MUTED },
  promoCard: { width: "100%", maxWidth: 680, minHeight: 150, marginTop: 28, borderRadius: 20, padding: 20, backgroundColor: "#09233F", flexDirection: "row", alignItems: "center", overflow: "hidden" },
  promoCopy: { flex: 1, paddingRight: 10 },
  promoEyebrow: { fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 1.4, color: "#7CC8FF" },
  promoTitle: { marginTop: 8, fontFamily: "Inter_600SemiBold", fontSize: 19, lineHeight: 25, color: "#FFFFFF" },
  promoSubtitle: { marginTop: 6, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17, color: "rgba(255,255,255,0.72)" },
  successScreen: { flex: 1, paddingHorizontal: 24, backgroundColor: "#F7FBF8", justifyContent: "center" },
  successContent: { alignItems: "center", marginBottom: 80 },
  successIcon: { width: 92, height: 92, borderRadius: 46, backgroundColor: GREEN, alignItems: "center", justifyContent: "center", shadowColor: GREEN, shadowOpacity: 0, shadowRadius: 20, shadowOffset: { width: 0, height: 9 }, elevation: 0 },
  successTitle: { marginTop: 25, fontFamily: "Inter_600SemiBold", fontSize: 22, color: INK, textAlign: "center" },
  successSubtitle: { maxWidth: 320, marginTop: 9, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, color: MUTED, textAlign: "center" },
  doneButton: { position: "absolute", left: 20, right: 20, bottom: 18, height: 52, borderRadius: 14, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" },
  doneText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFFFFF" },
});
