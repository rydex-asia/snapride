import React from "react";
import SystemStateLayout from "./SystemStateLayout";

export default function LoadingScreen() {
  return (
    <SystemStateLayout
      variant="loading"
      title="Finding you the best rides..."
      description="Please wait while we find the best rides for you."
    />
  );
}
