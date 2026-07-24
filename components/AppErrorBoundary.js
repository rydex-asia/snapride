import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { captureOperationalError } from "../monitoring";

export default class AppErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    captureOperationalError(error, {
      feature: "app_shell",
      operation: "react_render",
      componentStack: info?.componentStack,
    });
  }

  retry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.screen}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>!</Text>
        </View>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          We’ve recorded the problem. Please try opening this screen again.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Try again"
          onPress={this.retry}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#FFFFFF",
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3D1",
  },
  badgeText: {
    color: "#9A6500",
    fontSize: 26,
    fontWeight: "700",
  },
  title: {
    marginTop: 18,
    color: "#15181D",
    fontSize: 22,
    fontWeight: "600",
  },
  message: {
    marginTop: 8,
    maxWidth: 320,
    color: "#667085",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    marginTop: 22,
    minWidth: 150,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#15181D",
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
