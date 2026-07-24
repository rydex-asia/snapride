import React from "react";
import SystemStateLayout from "./SystemStateLayout";

export default function EmptyStateScreen({ onPrimary, onSecondary }) {
  return (
    <SystemStateLayout
      variant="empty"
      title="Where to next?"
      description="Enter your pickup location to get started"
      onPrimary={onPrimary}
      onSecondary={onSecondary}
    />
  );
}
