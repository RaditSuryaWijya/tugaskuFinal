import React from "react";
import WelcomeCarousel from "../screens/WelcomeCarousel";

export default function WelcomeNavigator({
  onWelcomeComplete,
  onNavigateToAuth,
}) {
  return (
    <WelcomeCarousel
      onWelcomeComplete={onWelcomeComplete}
      onNavigateToAuth={onNavigateToAuth}
    />
  );
}
