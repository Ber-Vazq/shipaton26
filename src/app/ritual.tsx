import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { COLORS } from "../ui/theme";
import { TerminalText } from "../ui/components/TerminalText";
import { useSession } from "../state/SessionContext";
import { usePurchases } from "../state/PurchasesContext";

// Premium ritual sounds live in assets/audio/. Drop .mp3 files there and wire
// them up with expo-audio's useAudioPlayer(require("../../assets/audio/xyz.mp3"))
// once the assets exist — intentionally left unwired so an empty folder doesn't
// break the Metro bundle.

const ASCII_BANNER = String.raw`
   _____ ______  _____ ______ _____
  |  __ \|  ____|/ ____|  ____|_   _|
  | |__) | |__  | (___ | |__    | |
  |  _  /|  __|  \___ \|  __|   | |
  | | \ \| |____ ____) | |____ _| |_
  |_|  \_\______|_____/|______|_____|
`;

export default function RitualScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { isPro: premium } = usePurchases();

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <View style={styles.screen}>
      <TerminalText variant="accent" style={styles.banner}>
        {ASCII_BANNER}
      </TerminalText>

      <TerminalText variant="bright" style={styles.message}>
        reset complete_
      </TerminalText>

      <TerminalText variant="muted" style={styles.sub}>
        momentum: {session.momentum}
      </TerminalText>

      {!premium && (
        <TerminalText variant="muted" style={styles.upsell}>
          premium unlocks extra ritual sounds + animations
        </TerminalText>
      )}

      <Pressable style={styles.button} onPress={() => router.replace("/")}>
        <TerminalText variant="bright">{"> "}back_to_board</TerminalText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  banner: {
    fontSize: 10,
    lineHeight: 12,
    marginBottom: 12,
  },
  message: {
    fontSize: 20,
  },
  sub: {
    marginBottom: 8,
  },
  upsell: {
    textAlign: "center",
    marginBottom: 8,
  },
  button: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 20,
  },
});
