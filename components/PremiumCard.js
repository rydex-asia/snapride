import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export default function PremiumCard({
  children,
  onPress,
  selected = false,
  style,
  contentStyle,
  disabled = false,
  pressScale = 0.96,
  selectedScale = 1.01,
}) {
  const pressed = useSharedValue(1);
  const selectedState = useSharedValue(selected ? selectedScale : 1);

  useEffect(() => {
    selectedState.value = withSpring(selected ? selectedScale : 1, {
      damping: 18,
      stiffness: 145,
      mass: 1,
    });
  }, [selected, selectedScale, selectedState]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value * selectedState.value }],
  }));

  const handlePressIn = () => {
    pressed.value = withSpring(pressScale, {
      damping: 18,
      stiffness: 190,
      mass: 0.9,
    });
  };

  const handlePressOut = () => {
    pressed.value = withSpring(1, {
      damping: 18,
      stiffness: 190,
      mass: 0.9,
    });
  };

  const Wrapper = onPress ? Pressable : View;
  const wrapperProps = onPress
    ? {
        onPress,
        onPressIn: handlePressIn,
        onPressOut: handlePressOut,
        disabled,
      }
    : {};

  return (
    <Wrapper {...wrapperProps} style={styles.wrapper}>
      <Animated.View style={[styles.card, animatedStyle, style]}>
        <View style={contentStyle}>{children}</View>
      </Animated.View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "stretch",
  },
  card: {
    alignSelf: "stretch",
  },
});
