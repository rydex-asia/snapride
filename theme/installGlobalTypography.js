import { StyleSheet, Text, TextInput } from "react-native";
import { fontFamilyForWeight } from "./typography";

const UI_COLORS = {
  heading: "#171A1F",
  section: "#252A30",
  body: "#475467",
  caption: "#667085",
};

function isNeutralColor(color) {
  const match = String(color || "").trim().match(/^#([0-9a-f]{6})$/i);
  if (!match) return false;
  const value = match[1];
  const channels = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
  const average = channels.reduce((total, channel) => total + channel, 0) / channels.length;
  return average < 220 && Math.max(...channels) - Math.min(...channels) <= 34;
}

function roleKind(styleKey) {
  const key = String(styleKey || "").toLowerCase();
  if (key.includes("caption") || key.includes("subtitle") || key.includes("meta") || key.includes("helper") || key.includes("eyebrow") || key.includes("micro") || key.includes("hint") || key.includes("placeholder")) return "caption";
  if (key.includes("sectiontitle") || key.includes("sectionlabel") || key.includes("cardtitle") || key.includes("optiontitle") || key.includes("rowtitle") || key.includes("itemtitle") || key.includes("methodtitle") || key.includes("label")) return "section";
  if (key.includes("header") || key.includes("heading") || key.includes("nav") || key === "title" || key.endsWith("title")) return "heading";
  return "body";
}

function roleWeight(styleKey, value) {
  const key = String(styleKey || "").toLowerCase();
  const familyWeight = String(value.fontFamily || "").match(/_(400|500|600|700|800|900)/)?.[1];
  const currentWeight = String(value.fontWeight || familyWeight || "");

  if (key.includes("sectiontitle") || key.includes("sectionlabel") || key.includes("cardtitle") || key.includes("optiontitle") || key.includes("rowtitle") || key.includes("itemtitle") || key.includes("methodtitle") || key.includes("label")) return "500";
  if (key.includes("caption") || key.includes("subtitle") || key.includes("meta") || key.includes("helper") || key.includes("eyebrow") || key.includes("micro") || key.includes("hint") || key.includes("placeholder")) return "500";
  if (key.includes("header") || key.includes("heading") || key.includes("nav") || key.includes("button") || key === "title" || key.endsWith("title") || key.includes("action") || /(?:pay|apply|continue|save|cancel|confirm|submit|retry|track|done|add)text$/.test(key)) return "600";
  if (key.includes("body") || key.includes("description") || key.includes("message") || key.includes("copy") || key.includes("detail") || key.includes("address") || key.endsWith("text")) return "400";
  if (["600", "700", "800", "900", "bold"].includes(currentWeight.toLowerCase())) return "600";
  if (currentWeight === "500") return "500";
  return "400";
}

function applyTypographyFontFamilies(styles) {
  const mappedStyles = {};

  Object.entries(styles).forEach(([key, value]) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      mappedStyles[key] = value;
      return;
    }

    const isTextStyle = value.fontFamily || value.fontWeight || value.fontSize || value.lineHeight || value.letterSpacing || value.textAlign || value.textTransform || value.textDecorationLine;
    if (!isTextStyle) {
      mappedStyles[key] = value;
      return;
    }

    const family = String(value.fontFamily || "");
    const isLegacyUiFamily = family.startsWith("Manrope_") || family.startsWith("Poppins_") || family.startsWith("Gilroy-");
    if (family.startsWith("PlusJakartaSans_")) {
      const { fontWeight: _fontWeight, ...productStyle } = value;
      mappedStyles[key] = productStyle;
      return;
    }

    const isInterFamily = family.startsWith("Inter_");
    if (family && !isLegacyUiFamily && !isInterFamily) {
      mappedStyles[key] = value;
      return;
    }

    const nextWeight = roleWeight(key, value);
    const { fontWeight: _fontWeight, fontFamily: _fontFamily, ...baseStyle } = value;
    const kind = roleKind(key);
    const nextColor = !baseStyle.color || isNeutralColor(baseStyle.color) ? UI_COLORS[kind] : baseStyle.color;
    mappedStyles[key] = { ...baseStyle, color: nextColor, fontFamily: fontFamilyForWeight(nextWeight) };
  });

  return mappedStyles;
}

if (!globalThis.__rydexTypographyInstalled) {
  const baseCreate = StyleSheet.create.bind(StyleSheet);
  StyleSheet.create = (styles) => baseCreate(applyTypographyFontFamilies(styles));

  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.style = [{ color: UI_COLORS.body, fontFamily: "Inter_400Regular" }, Text.defaultProps.style];

  TextInput.defaultProps = TextInput.defaultProps || {};
  TextInput.defaultProps.style = [{ fontFamily: "Inter_400Regular" }, TextInput.defaultProps.style];

  globalThis.__rydexTypographyInstalled = true;
}
