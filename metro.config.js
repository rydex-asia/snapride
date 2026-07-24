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
// The repository also contains large native and backend workspaces. Metro's
// crawler applies the block list while walking, whereas Watchman returns the
// complete workspace inventory before filtering and can exhaust memory after
// a cache reset.
config.useWatchman = false;
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  /[\\/]backend(?:[\\/]|$)/,
  /[\\/]ios(?:[\\/]|$)/,
  /[\\/]android(?:[\\/]|$)/,
  /[\\/]tmp(?:[\\/]|$)/,
  /[\\/]node_modules[\\/]@shopify[\\/]react-native-skia[\\/](?:apple|cpp|libs)(?:[\\/]|$)/,
];

module.exports = withSentryConfig(config, {
  annotateReactComponents: false,
  includeWebReplay: false,
});
