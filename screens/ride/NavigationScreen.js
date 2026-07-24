import React from "react";

import TripInProgressScreen from "./TripInProgressScreen";

// Compatibility entry point for older ride states. New active trips are routed
// directly to TripInProgressScreen from App.js.
export default function NavigationScreen(props) {
  return <TripInProgressScreen {...props} />;
}
