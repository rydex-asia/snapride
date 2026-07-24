module.exports = {
  preset: "react-native",
  testPathIgnorePatterns: [
    "/node_modules/",
    "/android/",
    "/ios/",
    "/studio/",
  ],
  modulePathIgnorePatterns: [
    "<rootDir>/android/",
    "<rootDir>/ios/",
    "<rootDir>/studio/",
  ],
  watchPathIgnorePatterns: [
    "<rootDir>/android/",
    "<rootDir>/ios/",
    "<rootDir>/studio/",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|react-native-svg)/)",
  ],
  collectCoverageFrom: [
    "routeUtils.js",
    "trackingUtils.js",
    "platformApi.js",
    "components/BottomNav.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};
