import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../ui/theme";
import { TerminalText } from "../ui/components/TerminalText";
import { purchasePremium, restorePurchases } from "../revenuecat/premiumGate";

const FEATURES = [
  "extra ritual sounds + animations",
  "unlimited tasks (free tier caps at 10)",
  "custom accent colors",
  "support an indie dev directly",
];

export default function PaywallScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleSubscribe = async () => {
    setBusy(true);
    try {
      const purchased = await purchasePremium();
      if (purchased) {
        Alert.alert("premium unlocked", "thanks for supporting the app_");
        router.back();
      }
    } catch (e: any) {
      Alert.alert("purchase failed", e?.message ?? "something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    try {
      const restored = await restorePurchases();
      Alert.alert(
        restored ? "restored" : "nothing to restore",
        restored ? "premium is active_" : "no previous purchase found"
      );
      if (restored) router.back();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Pressable onPress={() => router.back()} hitSlop={8}>
        <TerminalText variant="muted">{"< back"}</TerminalText>
      </Pressable>

      <TerminalText variant="heading" style={styles.title}>
        premium_reset
      </TerminalText>

      <View style={styles.featureList}>
        {FEATURES.map((f) => (
          <TerminalText key={f} variant="body" style={styles.featureRow}>
            {"[+] "}
            {f}
          </TerminalText>
        ))}
      </View>

      <TerminalText variant="accent" style={styles.price}>
        $2.99/mo
      </TerminalText>

      <Pressable style={styles.subscribeButton} onPress={handleSubscribe} disabled={busy}>
        <TerminalText variant="bright">
          {busy ? "processing_" : "> subscribe"}
        </TerminalText>
      </Pressable>

      <Pressable style={styles.restoreButton} onPress={handleRestore} disabled={busy}>
        <TerminalText variant="muted">restore purchases</TerminalText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 20,
    paddingTop: 60,
    gap: 20,
  },
  title: {
    marginTop: 12,
  },
  featureList: {
    gap: 8,
  },
  featureRow: {},
  price: {
    fontSize: 28,
    marginTop: 8,
  },
  subscribeButton: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  restoreButton: {
    alignItems: "center",
  },
});
