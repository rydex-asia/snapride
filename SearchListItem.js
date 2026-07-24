import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const TITLE_HIGHLIGHT_COLOR = "#111111";

const kindToIcon = (item) => {
  const kind = String(item?.kind || item?.source || item?.type || "").toLowerCase();
  if (kind === "home") return "home-outline";
  if (kind === "work") return "briefcase-outline";
  if (kind === "recent") return "history";
  if (kind === "popular") return "star-outline";
  if (kind === "current-location" || kind === "current") return "crosshairs-gps";
  return "map-marker-outline";
};

const kindToLabel = (item) => {
  const kind = String(item?.kind || item?.source || item?.type || "").toLowerCase();
  if (kind === "home") return "Home";
  if (kind === "work") return "Work";
  if (kind === "recent") return "Recent";
  if (kind === "popular") return "Popular";
  if (kind === "current-location" || kind === "current") return "Current";
  return "Place";
};

const renderHighlightedText = (text, query, highlightStyle) => {
  const source = String(text || "");
  const needle = String(query || "").trim();
  if (!needle || needle.length < 2) {
    return source;
  }

  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "ig");
  const parts = source.split(regex).filter(Boolean);
  if (parts.length <= 1) {
    return source;
  }

  return parts.map((part, index) => (
    <Text key={`${part}-${index}`} style={part.toLowerCase() === needle.toLowerCase() ? highlightStyle : null}>
      {part}
    </Text>
  ));
};

export default function SearchListItem({
  item,
  query,
  onPress,
  onFavoritePress,
  showFavorite = true,
  showKindChip = true,
  showChevron = false,
  isLast = false,
  color = "#6B7280",
  accentColor = "#111111",
  containerStyle,
  textContainerStyle,
  titleStyle,
  subtitleStyle,
  trailingStyle
}) {
  const title = String(item?.title || item?.label || "").trim();
  const subtitle = String(item?.address || item?.secondaryText || item?.fullLabel || "").trim();
  const kindLabel = kindToLabel(item);

  return (
    <Pressable
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 13,
          paddingHorizontal: 16,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: "rgba(0,0,0,0.08)",
          backgroundColor: "transparent"
        },
        containerStyle
      ]}
      onPress={onPress}
    >
      <View style={{ width: 26, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <MaterialCommunityIcons name={kindToIcon(item)} size={20} color={accentColor} />
      </View>

      <View style={[{ flex: 1, minWidth: 0 }, textContainerStyle]}>
        <Text style={[{ fontSize: 15, lineHeight: 19, fontWeight: "700", color: "#111111" }, titleStyle]} numberOfLines={1}>
          {renderHighlightedText(title, query, { color: TITLE_HIGHLIGHT_COLOR })}
        </Text>
        <Text style={[{ fontSize: 12.5, lineHeight: 17, color: "#6B7280", marginTop: 2 }, subtitleStyle]} numberOfLines={2}>
          {renderHighlightedText(subtitle || "Tap to use this address", query, { color: "#1F2937" })}
        </Text>
      </View>

      <View style={[{ flexDirection: "row", alignItems: "center", marginLeft: 10 }, trailingStyle]}>
        {showKindChip ? (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: "rgba(0,0,0,0.05)",
              marginRight: 8
            }}
          >
            <Text style={{ fontSize: 10.5, fontWeight: "700", color: "#495767" }}>{kindLabel}</Text>
          </View>
        ) : null}

        {showFavorite ? (
          <Pressable
            onPress={onFavoritePress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ padding: 2, marginRight: showChevron ? 6 : 0 }}
          >
            <Ionicons name="heart-outline" size={21} color={color} />
          </Pressable>
        ) : null}

        {showChevron ? <Ionicons name="chevron-forward" size={18} color="#718199" /> : null}
      </View>
    </Pressable>
  );
}
