import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function NavigationArrow({ heading = 0, size = 52 }) {
  const discSize = Math.round(size * 0.54);
  const haloSize = Math.round(size * 0.84);
  const iconSize = Math.round(size * 0.64);

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { width: size, height: size, transform: [{ rotate: `${heading}deg` }] }]}
    >
      <View
        style={[
          styles.halo,
          {
            width: haloSize,
            height: haloSize,
            borderRadius: haloSize / 2,
          },
        ]}
      />

      <View
        style={[
          styles.disc,
          {
            width: discSize,
            height: discSize,
            borderRadius: discSize / 2,
          },
        ]}
      >
        <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
          <Path
            d="M12 1.7L20.55 18.56C20.84 19.13 20.25 19.78 19.63 19.58L12.87 17.41C12.32 17.23 11.68 17.23 11.13 17.41L4.37 19.58C3.75 19.78 3.16 19.13 3.45 18.56L12 1.7Z"
            fill="rgba(17,24,39,0.14)"
            transform="translate(0.5 0.6)"
          />
          <Path
            d="M12 1.55L20.55 18.42C20.84 19 20.26 19.67 19.62 19.46L12.87 17.28C12.32 17.1 11.68 17.1 11.13 17.28L4.38 19.46C3.74 19.67 3.16 19 3.45 18.42L12 1.55Z"
            fill="#1A73E8"
          />
          <Path
            d="M12 4L17.08 15.35L12.84 14.2L12 24L11.16 14.2L6.92 15.35L12 4Z"
            fill="#FFFFFF"
            fillOpacity="0.16"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  disc: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#111827",
    shadowOpacity: 0,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2
    },
    elevation: 0
  },
  halo: {
    position: "absolute",
    backgroundColor: "rgba(26,115,232,0.15)"
  },
  wrap: {
    alignItems: "center",
    justifyContent: "center"
  }
});
