import React from "react";
import SystemStateLayout from "./SystemStateLayout";

export default function MaintenanceScreen() {
  return (
    <SystemStateLayout
      variant="maintenance"
      title="We’re under maintenance"
      description="Our app is getting better! We’ll be back online shortly."
    />
  );
}
