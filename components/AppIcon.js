import React from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const ION_ICONS = {
  home: { outline: "home-outline", filled: "home" },
  travel: { outline: "briefcase-outline", filled: "briefcase" },
  parcel: { outline: "cube-outline", filled: "cube" },
  bookings: { outline: "receipt-outline", filled: "receipt" },
  metro: { outline: "subway-outline", filled: "subway" },
  account: { outline: "person-outline", filled: "person" },
  person: { outline: "person-outline", filled: "person" },
  back: { outline: "arrow-back", filled: "arrow-back" },
  forward: { outline: "arrow-forward", filled: "arrow-forward" },
  chevronRight: { outline: "chevron-forward", filled: "chevron-forward" },
  location: { outline: "location-outline", filled: "location" },
  rides: { outline: "time-outline", filled: "time" },
  wallet: { outline: "wallet-outline", filled: "wallet" },
  payments: { outline: "card-outline", filled: "card" },
  rewards: { outline: "gift-outline", filled: "gift" },
  support: { outline: "chatbubble-ellipses-outline", filled: "chatbubble-ellipses" },
  help: { outline: "headset-outline", filled: "headset" },
  safety: { outline: "shield-checkmark-outline", filled: "shield-checkmark" },
  notifications: { outline: "notifications-outline", filled: "notifications" },
  settings: { outline: "settings-outline", filled: "settings" },
  logout: { outline: "log-out-outline", filled: "log-out" },
  search: { outline: "search-outline", filled: "search" },
  calendar: { outline: "calendar-outline", filled: "calendar" },
  call: { outline: "call-outline", filled: "call" },
  message: { outline: "chatbubble-outline", filled: "chatbubble" },
  cancel: { outline: "close-circle-outline", filled: "close-circle" },
  "directions-walk": { outline: "walk-outline", filled: "walk" },
  verified: { outline: "checkmark-circle-outline", filled: "checkmark-circle" },
  shield: { outline: "shield-checkmark-outline", filled: "shield-checkmark" },
  share: { outline: "share-social-outline", filled: "share-social" },
  "support-agent": { outline: "headset-outline", filled: "headset" },
  navigation: { outline: "navigate-outline", filled: "navigate" },
  "confirmation-number": { outline: "ticket-outline", filled: "ticket" },
  clock: { outline: "time-outline", filled: "time" },
  plus: { outline: "add", filled: "add" },
  minus: { outline: "remove", filled: "remove" },
  "swap-vertical": { outline: "swap-vertical", filled: "swap-vertical" },
  "nav-ride": { outline: "car-outline", filled: "car", family: "material" },
  "nav-travel": { outline: "briefcase-outline", filled: "briefcase", family: "material" },
  "nav-parcel": { outline: "cube-outline", filled: "cube", family: "material" },
  "nav-metro": { outline: "train", filled: "train-variant", family: "material" },
  "nav-grocery": { outline: "basket-outline", filled: "basket", family: "material" },
  "nav-account": { outline: "account-circle-outline", filled: "account-circle", family: "material" },
};

const SIZES = {
  xs: 14,
  sm: 18,
  md: 21,
  lg: 24,
  xl: 28,
  tab: 24,
};

export default function AppIcon({
  name,
  active = false,
  variant,
  size = "md",
  color,
  muted = false,
  ...props
}) {
  const definition = ION_ICONS[name];
  const selectedVariant = variant || (active ? "filled" : "outline");
  const iconName = definition?.[selectedVariant] || definition?.outline || name;
  const iconSize = typeof size === "number" ? size : SIZES[size] || SIZES.md;
  const iconColor = color || (active ? "#1754E8" : muted ? "#98A2B3" : "#252A31");
  const IconFamily = definition?.family === "material"
    ? MaterialCommunityIcons
    : definition
      ? Ionicons
      : MaterialCommunityIcons;

  return <IconFamily name={iconName} size={iconSize} color={iconColor} {...props} />;
}
