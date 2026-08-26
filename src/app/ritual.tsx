import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAudioPlayer } from "expo-audio";
import { COLORS } from "../ui/theme";
import { TerminalText } from "../ui/components/TerminalText";
import { useSession } from "../state/SessionContext";
import { usePurchases } from "../state/PurchasesContext";
import { DEFAULT_RITUAL_SOUND_ID, RITUAL_SOUNDS, getRitualSound } from "../model/sounds";

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
  const { session, setSession } = useSession();
  const { isPro: premium } = usePurchases();

  // Free users always hear the default sound, regardless of what's stored
  // in session.ritualSoundId (e.g. from a lapsed subscription) — the sound
  // picker below is only rendered for premium users, so this is the only
  // gate that matters for playback.
  const activeSoundId = premium ? session.ritualSoundId : DEFAULT_RITUAL_SOUND_ID;
  const activeSound = getRitualSound(activeSoundId);
  const player = useAudioPlayer(activeSound.file);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    player.seekTo(0);
    player.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewSound = (id: typeof activeSoundId) => {
    setSession((prev) => ({ ...prev, ritualSoundId: id }));
    const sound = getRitualSound(id);
    player.replace(sound.file);
    player.seekTo(0);
    player.play();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

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

      {premium ? (
        <View style={styles.soundPicker}>
          <TerminalText variant="muted" style={styles.soundPickerLabel}>
            // ritual sound
          </TerminalText>
          {RITUAL_SOUNDS.map((sound) => (
            <Pressable
              key={sound.id}
              onPress={() => previewSound(sound.id)}
              hitSlop={8}
              style={styles.soundRow}
              accessibilityRole="radio"
              accessibilityState={{ checked: sound.id === activeSoundId }}
              accessibilityLabel={`${sound.label.replace(/_/g, " ")} ritual sound`}
            >
              <TerminalText variant={sound.id === activeSoundId ? "accent" : "muted"}>
                [{sound.id === activeSoundId ? "x" : " "}] {sound.label}
              </TerminalText>
            </Pressable>
          ))}
        </View>
      ) : (
        <TerminalText variant="muted" style={styles.upsell}>
          premium unlocks {RITUAL_SOUNDS.length - 1} extra ritual sounds + animations
        </TerminalText>
      )}

      <Pressable
        style={styles.button}
        onPress={() => router.replace("/")}
        accessibilityRole="button"
        accessibilityLabel="Return to task board"
      >
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
  soundPicker: {
    width: "100%",
    maxWidth: 260,
    gap: 4,
    marginBottom: 8,
  },
  soundPickerLabel: {
    marginBottom: 4,
  },
  soundRow: {
    paddingVertical: 4,
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
