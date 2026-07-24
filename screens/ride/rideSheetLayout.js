import { Dimensions } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Shared post-booking ride sheet geometry. ChooseRideScreen intentionally keeps
// its own map/list-driven snap points.
export const RIDE_SHEET_COLLAPSED_HEIGHT = Math.min(
  Math.max(SCREEN_HEIGHT * 0.52, 420),
  Math.max(SCREEN_HEIGHT - 160, 420),
  440,
);

export const RIDE_SHEET_EXPANDED_HEIGHT = Math.min(
  Math.max(SCREEN_HEIGHT * 0.68, 520),
  Math.max(SCREEN_HEIGHT - 84, RIDE_SHEET_COLLAPSED_HEIGHT + 72),
  560,
);

export const RIDE_SHEET_DRAG_RANGE = Math.max(
  RIDE_SHEET_EXPANDED_HEIGHT - RIDE_SHEET_COLLAPSED_HEIGHT,
  0,
);
