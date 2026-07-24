import React from "react";
import SystemStateLayout from "./SystemStateLayout";

export default function ForceUpdateScreen({ onUpdate, onQuit }) {
  return (
    <SystemStateLayout
      variant="update"
      title="Update Required"
      description="A new version of Rydex is available. Please update to continue using the app."
      primaryLabel="Update Now"
      primaryIcon="download"
      linkLabel="Quit App"
      onPrimary={onUpdate}
      onLink={onQuit}
    />
  );
}
