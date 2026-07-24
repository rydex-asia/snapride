import React from "react";
import SystemStateLayout from "./SystemStateLayout";

export default function ErrorScreen({ onRetry, onHome }) {
  return (
    <SystemStateLayout
      variant="error"
      title="Oops! Something went wrong"
      description="We couldn’t complete your request. Please try again."
      primaryLabel="Try Again"
      primaryIcon="refresh"
      secondaryLabel="Go to Home"
      secondaryIcon="home"
      onPrimary={onRetry}
      onSecondary={onHome}
    />
  );
}
