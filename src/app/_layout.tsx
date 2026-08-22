import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as Font from "expo-font";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../ui/theme";
import { ScanlineOverlay } from "../ui/components/ScanlineOverlay";
import { SessionProvider } from "../state/SessionContext";
import { initPurchases } from "../revenuecat/premiumGate";

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      JetBrainsMono: require("../../assets/fonts/JetBrainsMono-Regular.ttf"),
      JetBrainsMonoBold: require("../../assets/fonts/JetBrainsMono-Bold.ttf"),
    })
      .then(() => setFontsLoaded(true))
      .catch(() => setFontsLoaded(true)); // fail open — don't block the app on a font load error

    initPurchases();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SessionProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
        }}
      />
      <ScanlineOverlay />
    </SessionProvider>
  );
}
