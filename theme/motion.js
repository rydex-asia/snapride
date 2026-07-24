import { Easing } from "react-native";

export const EASING = {
  premium: Easing.bezier(0.22, 1, 0.36, 1),
  softOut: Easing.bezier(0.18, 0.9, 0.24, 1),
};

export const SHEET_PHYSICS = {
  snap: {
    stiffness: 86,
    damping: 26,
    mass: 1.28,
    overshootClamping: false,
    restDisplacementThreshold: 0.25,
    restSpeedThreshold: 0.25,
  },
  gorhom: {
    damping: 28,
    stiffness: 150,
    mass: 1.05,
    overshootClamping: false,
    restDisplacementThreshold: 0.25,
    restSpeedThreshold: 0.25,
  },
};

export const SHEET_TIMING = {
  enterDuration: 760,
  footerDuration: 620,
  handleIn: 130,
  handleOut: 280,
};
