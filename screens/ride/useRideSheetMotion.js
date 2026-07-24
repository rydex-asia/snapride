import { useCallback, useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

import { RIDE_SHEET_EXPANDED_HEIGHT } from "./rideSheetLayout";

const DEFAULT_CLOSED_OFFSET = RIDE_SHEET_EXPANDED_HEIGHT + 36;

export default function useRideSheetMotion({
  openOffset = 0,
  closedOffset = DEFAULT_CLOSED_OFFSET,
} = {}) {
  const sheetOffset = useRef(new Animated.Value(closedOffset)).current;

  useEffect(() => {
    sheetOffset.setValue(closedOffset);
    Animated.timing(sheetOffset, {
      toValue: openOffset,
      duration: 360,
      easing: Easing.bezier(0.2, 0.76, 0.2, 1),
      useNativeDriver: true,
      isInteraction: false,
    }).start();

    return () => sheetOffset.stopAnimation();
  }, [closedOffset, openOffset, sheetOffset]);

  const closeSheet = useCallback((afterClose) => {
    sheetOffset.stopAnimation();
    afterClose?.();
  }, [sheetOffset]);

  return { sheetOffset, closeSheet };
}
