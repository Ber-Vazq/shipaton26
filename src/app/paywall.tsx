import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../ui/theme";
import { TerminalText } from "../ui/components/TerminalText";
import { usePurchases } from "../state/PurchasesContext";
import { restorePurchases } from "../revenuecat/premiumGate";
import { presentCustomerCenter, presentPaywall } from "../revenuecat/paywallUI";
import { FREE_TASK_LIMIT } from "../model/types";

const FEATURES = [
  "extra ritual sounds + animations",
  `unlimited tasks (free tier caps at ${FREE_TASK_LIMIT})`,
  "custom accent colors",
  "support an indie dev directly",
];

export default function PaywallScreen() {
  const router = useRouter();
  const { isPro, loading, refresh } = usePurchases();
  const [busy, setBusy] = useState(false);

  const handleUnlock = async () => {
    setBusy(true);
    try {
      // Presents the RevenueCat-hosted paywall configured in the dashboard
      // for the current offering (monthly / annual / lifetime packages).
      const unlocked = await presentPaywall();
      await refresh();
      if (unlocked) {
        Alert.alert("premium unlocked", "thanks for supporting the app_");
        router.back();
      }
    } catch (e: any) {
      Alert.alert("couldn't open paywall", e?.message ?? "something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    try {
      const result = await restorePurchases();
      await refresh();
      if (result.status === "restored") {
        Alert.alert("restored", "premium is active_");
        router.back();
      } else if (result.status === "nothing_to_restore") {
        Alert.alert("nothing to restore", "no previous purchase found");
      } else {
        Alert.alert("restore failed", result.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleManage = async () => {
    setBusy(true);
    try {
      await presentCustomerCenter();
      await refresh();
    } catch (e: any) {
      Alert.alert("customer center unavailable", e?.message ?? "try again later");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <TerminalText variant="muted">{"< back"}</TerminalText>
      </Pressable>

      <TerminalText variant="heading" style={styles.title}>
        premium_reset
      </TerminalText>

      {loading ? (
        <TerminalText variant="muted">checking status_</TerminalText>
      ) : isPro ? (
        <>
          <TerminalText variant="accent">[x] pro unlocked</TerminalText>
          {Platform.OS === "web" ? (
            <TerminalText variant="muted">
              subscription management (Customer Center) is native-only — use a
              real device build to manage or cancel.
            </TerminalText>
          ) : (
            <Pressable
              style={styles.subscribeButton}
              onPress={handleManage}
              disabled={busy}
              accessibilityRole="button"
              accessibilityState={{ disabled: busy, busy }}
              accessibilityLabel="Manage subscription"
            >
              <TerminalText variant="bright">
                {busy ? "opening_" : "> manage_subscription"}
              </TerminalText>
            </Pressable>
          )}
        </>
      ) : (
        <>
          <View style={styles.featureList}>
            {FEATURES.map((f) => (
              <TerminalText key={f} variant="body" style={styles.featureRow}>
                {"[+] "}
                {f}
              </TerminalText>
            ))}
          </View>

          <TerminalText variant="muted" style={styles.plansNote}>
            monthly / annual / lifetime — pick on the next screen
          </TerminalText>

          {Platform.OS === "web" ? (
            <View style={styles.webNotice}>
              <TerminalText variant="muted">
                the real RevenueCat paywall only renders on a native iOS/Android
                build — Expo web (and Expo Go) can't load the purchases SDK's
                native module, so there's nothing to show here in this preview.
              </TerminalText>
              <TerminalText variant="muted" style={styles.webNoticeSpacer}>
                run an EAS development build and open it on a device or
                simulator to see and test the actual paywall.
              </TerminalText>
            </View>
          ) : (
            <>
              <Pressable
                style={styles.subscribeButton}
                onPress={handleUnlock}
                disabled={busy}
                accessibilityRole="button"
                accessibilityState={{ disabled: busy, busy }}
                accessibilityLabel="Unlock premium"
              >
                <TerminalText variant="bright">
                  {busy ? "processing_" : "> unlock_premium"}
                </TerminalText>
              </Pressable>

              <Pressable
                style={styles.restoreButton}
                onPress={handleRestore}
                disabled={busy}
                accessibilityRole="button"
                accessibilityState={{ disabled: busy, busy }}
                accessibilityLabel="Restore purchases"
              >
                <TerminalText variant="muted">restore purchases</TerminalText>
              </Pressable>
            </>
          )}
        </>
      )}

      <View style={styles.legalRow}>
        <Pressable
          onPress={() => router.push("/privacy")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open privacy policy"
        >
          <TerminalText variant="muted" style={styles.legalLink}>
            privacy policy
          </TerminalText>
        </Pressable>
        <Pressable
          onPress={() => router.push("/terms")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open terms of service"
        >
          <TerminalText variant="muted" style={styles.legalLink}>
            terms of service
          </TerminalText>
        </Pressable>
      </View>
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
  plansNote: {
    marginTop: -8,
  },
  webNotice: {
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.muted,
    borderRadius: 4,
    padding: 14,
  },
  webNoticeSpacer: {
    marginTop: 2,
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
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: "auto",
    paddingTop: 20,
  },
  legalLink: {
    fontSize: 11,
    textDecorationLine: "underline",
  },
});
