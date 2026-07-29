const base = require("./app.json").expo;
const androidMapsKey = process.env.GOOGLE_MAPS_ANDROID_SDK_KEY || "";
const iosMapsKey = process.env.GOOGLE_MAPS_IOS_SDK_KEY || "";
const enableSentryBuildPlugin =
  process.env.EAS_BUILD === "true"
  || process.env.ENABLE_SENTRY_EXPO_PLUGIN === "1";

module.exports = ({ config }) => ({
  ...config,
  ...base,
  extra: {
    ...(base.extra || {}),
    nativeMaps: {
      androidConfigured: Boolean(androidMapsKey),
      iosConfigured: Boolean(iosMapsKey),
    },
  },
  plugins: [
    ...(base.plugins || []).filter((plugin) => {
      const name = Array.isArray(plugin) ? plugin[0] : plugin;
      return name !== "expo-location" && name !== "@sentry/react-native";
    }),
    ...(enableSentryBuildPlugin ? ["@sentry/react-native"] : []),
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Rydex uses your location while the app is open to find pickup points and track active trips.",
      },
    ],
  ],
  android: {
    ...base.android,
    permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
    config: {
      ...(base.android?.config || {}),
      googleMaps: { apiKey: androidMapsKey },
    },
  },
  ios: {
    ...base.ios,
    config: {
      ...(base.ios?.config || {}),
      googleMapsApiKey: iosMapsKey,
    },
    infoPlist: {
      ...(base.ios?.infoPlist || {}),
      LSApplicationQueriesSchemes: [
        "amazonpay",
        "upi",
        "credpay",
        "bhim",
        "paytmmp",
        "phonepe",
        "tez",
      ],
      NSLocationWhenInUseUsageDescription:
        "Rydex uses your location while the app is open to find pickup points and track active trips.",
    },
  },
});
