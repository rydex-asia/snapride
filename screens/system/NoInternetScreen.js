import React from "react";
import SystemStateLayout from "./SystemStateLayout";

export default function NoInternetScreen({ onRetry, onSettings }) {
  return (
    <SystemStateLayout
      variant="offline"
      title="No Internet Connection"
      description="Looks like you’re offline. Please check your connection and try again."
      primaryLabel="Try Again"
      primaryIcon="refresh"
      secondaryLabel="Open Settings"
      secondaryIcon="settings"
      onPrimary={onRetry}
      onSecondary={onSettings}
    />
  );
}
