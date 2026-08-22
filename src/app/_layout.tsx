import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as Font from "expo-font";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../ui/theme";
import { ScanlineOverlay } from "../ui/components/ScanlineOverlay";
import { SessionProvider } from "../state/SessionContext";
import { PurchasesProvider } from "../state/PurchasesContext";
import { initPurchases } from "../revenuecat/premiumGate";

// Configure RevenueCat synchronously on module load — guarded by an internal
// "already configured" flag, so it's safe even with React StrictMode's
// double-invoke. This guarantees the SDK is configured *before* any child
// (e.g. PurchasesProvider) effect runs and calls getCustomerInfo().
initPurchases();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      JetBrainsMono: require("../../assets/fonts/JetBrainsMono-Regular.ttf"),
      JetBrainsMonoBold: require("../../assets/fonts/JetBrainsMono-Bold.ttf"),
    })
      .then(() => setFontsLoaded(true))
      .catch(() => setFontsLoaded(true)); // fail open — don't block the app on a font load error
  }, []);

  if (!fontsLoaded) return null;

  return (
    <PurchasesProvider>
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
    </PurchasesProvider>
  );
}
