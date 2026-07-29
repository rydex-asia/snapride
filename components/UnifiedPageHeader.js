import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SimplePageHeader from "./SimplePageHeader";

export default function UnifiedPageHeader({
  elevated = false,
  backgroundColor = "#FFFFFF",
  ...headerProps
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.chrome,
        { paddingTop: insets.top, backgroundColor },
        elevated && styles.chromeElevated,
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <SimplePageHeader
        {...headerProps}
        backgroundColor={backgroundColor}
        elevated={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chrome: {
    zIndex: 30,
  },
  chromeElevated: {
    backgroundColor: "#FFFFFF",
  },
});
