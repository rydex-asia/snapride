import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import PremiumCard from "./PremiumCard";

import { COLORS } from "../theme/colors";
import { SHADOWS } from "../theme/shadows";
const SCREEN_WIDTH = Dimensions.get("window").width;
const CONTENT_WIDTH = SCREEN_WIDTH - 32;
const CARD_GAP = 12;
const SMALL_WIDTH = Math.round((CONTENT_WIDTH - CARD_GAP) * 0.38);
const LARGE_WIDTH = CONTENT_WIDTH - CARD_GAP - SMALL_WIDTH;
const FULL_WIDTH = CONTENT_WIDTH;

export default function RideCard({
  item,
  small,
  large,
  full,
  width,
  height = 140,
  title,
  subtitle,
  price,
  badge,
  image,
  imageStyle,
  onPress,
  backgroundColor = "#F2F4F3",
  rightContent
}) {
  const resolvedItem = item || {};
  const resolvedWidth = full ? FULL_WIDTH : small ? SMALL_WIDTH : large ? LARGE_WIDTH : width || FULL_WIDTH;
  const resolvedTitle = resolvedItem.title ?? title;
  const resolvedSubtitle = resolvedItem.subtitle ?? subtitle;
  const resolvedPrice = resolvedItem.price ?? price;
  const resolvedBadge = resolvedItem.badge ?? badge;
  const resolvedImage = resolvedItem.image ?? image;
  const resolvedImageStyle = resolvedItem.imageStyle ?? imageStyle;

  return (
    <PremiumCard
      onPress={onPress ? () => onPress(resolvedItem) : undefined}
      style={[styles.card, { width: resolvedWidth, height, backgroundColor }]}
      contentStyle={styles.cardContent}
      pressScale={0.97}
    >
      <View style={styles.copyWrap}>
        {resolvedBadge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{resolvedBadge}</Text>
          </View>
        ) : null}
        <Text style={styles.title} numberOfLines={2}>
          {resolvedTitle}
        </Text>
        {resolvedSubtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {resolvedSubtitle}
          </Text>
        ) : null}
        {resolvedPrice ? (
          <Text style={styles.price} numberOfLines={1}>
            {resolvedPrice}
          </Text>
        ) : null}
      </View>

      {rightContent}

      {resolvedImage ? (
        <View style={styles.imageWrap}>
          <Image source={resolvedImage} style={[styles.image, resolvedImageStyle]} resizeMode="contain" />
        </View>
      ) : null}
    </PremiumCard>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 16,
    padding: 14,
    ...SHADOWS.card
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  copyWrap: {
    flex: 1,
    minWidth: 0
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "COLORS.primaryLight",
    marginBottom: 10
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800"
  },
  title: {
    color: "#111827",
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 22,
    letterSpacing: -0.3
  },
  subtitle: {
    marginTop: 4,
    color: "#667085",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 16
  },
  price: {
    marginTop: 10,
    color: "#111827",
    fontSize: 15,
    fontWeight: "800"
  },
  imageWrap: {
    justifyContent: "center",
    alignItems: "flex-end"
  },
  image: {
    resizeMode: "contain"
  }
});
