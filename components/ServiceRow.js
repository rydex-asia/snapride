import React from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import PremiumCard from "./PremiumCard";

import { COLORS } from "../theme/colors";
import { SHADOWS } from "../theme/shadows";
const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.42);

export default function ServiceRow({ items, data, onPressItem, onPress }) {
  const sourceItems = data || items || [];
  const handlePress = onPress || onPressItem;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {sourceItems.map((item) => (
        <PremiumCard
          key={item.key}
          onPress={() => handlePress?.(item)}
          pressScale={0.96}
          style={styles.card}
          contentStyle={styles.cardContent}
        >
          <View style={styles.imageChip}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
          </View>
          <View style={styles.copyWrap}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
            <Text style={styles.price}>{item.price}</Text>
          </View>
        </PremiumCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingRight: 16,
    gap: 12
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 92,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    ...SHADOWS.card
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  imageChip: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#F4F6F5",
    alignItems: "center",
    justifyContent: "center"
  },
  image: {
    width: 40,
    height: 40
  },
  copyWrap: {
    flex: 1,
    minWidth: 0
  },
  title: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800"
  },
  subtitle: {
    marginTop: 2,
    color: "#667085",
    fontSize: 12,
    fontWeight: "500"
  },
  price: {
    marginTop: 8,
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800"
  }
});
