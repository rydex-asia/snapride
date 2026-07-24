import React from "react";
import ApplyCouponScreen from "../payments/ApplyCouponScreen";

export default function OffersScreen({ onBack }) {
  return (
    <ApplyCouponScreen
      onBack={onBack}
      onContinue={onBack}
      onApplyCoupon={() => {}}
    />
  );
}
