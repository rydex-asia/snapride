process.env.EXPO_NO_METRO_WORKSPACE_ROOT = "1";

const { getDefaultConfig } = require("expo/metro-config");
const { withSentryConfig } = require("@sentry/react-native/metro");

const config = getDefaultConfig(__dirname);

// App.js references many screens and asset-heavy feature modules. Defer module
// initialization until a screen actually needs them to keep cold starts light.
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

config.resolver.assetExts.push("lottie");
// Use Watchman so Metro honours the repository's `.watchmanconfig` exclusions
// before building its file map. The Node crawler can retain the large native
// and backend trees during a cold cache rebuild and exhaust the JS heap.
config.useWatchman = true;
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  /[\\/]backend(?:[\\/]|$)/,
  /[\\/]ios(?:[\\/]|$)/,
  /[\\/]android(?:[\\/]|$)/,
  /[\\/]tmp(?:[\\/]|$)/,
  /[\\/]node_modules[\\/]@shopify[\\/]react-native-skia[\\/](?:apple|cpp|libs)(?:[\\/]|$)/,
];

const hasSentryBuildCredentials = Boolean(
  process.env.SENTRY_AUTH_TOKEN
  && process.env.SENTRY_ORG
  && process.env.SENTRY_PROJECT
);

// Sentry's serializer is only needed for production source-map uploads. Using
// it without build credentials in Expo Go can fail local bundles with a
// missing Debug ID, so development keeps Expo's default Metro serializer.
module.exports = hasSentryBuildCredentials
  ? withSentryConfig(config, {
      annotateReactComponents: false,
      includeWebReplay: false,
    })
  : config;
