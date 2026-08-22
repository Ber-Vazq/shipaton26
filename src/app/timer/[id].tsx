import { useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { COLORS } from "../../ui/theme";
import { TerminalText } from "../../ui/components/TerminalText";
import { HashProgressBar } from "../../ui/components/HashProgressBar";
import { useSession } from "../../state/SessionContext";
import {
  pauseTimer,
  resetTimer,
  resumeTimer,
  startTimer,
  tick,
} from "../../engine/resetLoop";

const MIN_SECONDS = 120;
const MAX_SECONDS = 600;
const STEP_SECONDS = 60;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TimerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session, setSession } = useSession();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const task = session.activeTask?.id === id ? session.activeTask : null;

  useEffect(() => {
    if (session.timerState === "running") {
      intervalRef.current = setInterval(() => {
        setSession((prev) => tick(prev));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session.timerState, setSession]);

  useEffect(() => {
    if (session.timerState === "complete") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/ritual");
    }
  }, [session.timerState, router]);

  const progress = useMemo(() => {
    if (session.timerSeconds === 0) return 0;
    return 1 - session.remainingSeconds / session.timerSeconds;
  }, [session.remainingSeconds, session.timerSeconds]);

  const adjustDuration = (delta: number) => {
    if (session.timerState === "running") return;
    const next = Math.min(
      MAX_SECONDS,
      Math.max(MIN_SECONDS, session.timerSeconds + delta)
    );
    setSession((prev) => resetTimer({ ...prev, timerSeconds: next, remainingSeconds: next }));
  };

  const handlePrimaryAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (session.timerState === "idle" || session.timerState === "complete") {
      setSession((prev) => startTimer(prev.timerSeconds, prev));
    } else if (session.timerState === "running") {
      setSession((prev) => pauseTimer(prev));
    } else if (session.timerState === "paused") {
      setSession((prev) => resumeTimer(prev));
    }
  };

  const primaryLabel =
    session.timerState === "running"
      ? "> pause"
      : session.timerState === "paused"
        ? "> resume"
        : "> start";

  return (
    <View style={styles.screen}>
      <Pressable onPress={() => router.back()} hitSlop={8}>
        <TerminalText variant="muted">{"< back"}</TerminalText>
      </Pressable>

      {task && (
        <TerminalText variant="muted" style={styles.taskLabel}>
          {task.title}
        </TerminalText>
      )}

      <View style={styles.timerWrap}>
        <TerminalText variant="timer">{formatTime(session.remainingSeconds)}</TerminalText>
      </View>

      <HashProgressBar progress={progress} width={28} />

      {session.timerState === "idle" && (
        <View style={styles.durationRow}>
          <Pressable onPress={() => adjustDuration(-STEP_SECONDS)} style={styles.durationButton}>
            <TerminalText variant="accent">[-]</TerminalText>
          </Pressable>
          <TerminalText variant="body">{formatTime(session.timerSeconds)} duration</TerminalText>
          <Pressable onPress={() => adjustDuration(STEP_SECONDS)} style={styles.durationButton}>
            <TerminalText variant="accent">[+]</TerminalText>
          </Pressable>
        </View>
      )}

      <Pressable style={styles.actionButton} onPress={handlePrimaryAction}>
        <TerminalText variant="bright">{primaryLabel}</TerminalText>
      </Pressable>

      {session.timerState !== "idle" && (
        <Pressable
          style={styles.resetButton}
          onPress={() => setSession((prev) => resetTimer(prev))}
        >
          <TerminalText variant="muted">reset</TerminalText>
        </Pressable>
      )}
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
    alignItems: "center",
  },
  taskLabel: {
    alignSelf: "flex-start",
  },
  timerWrap: {
    marginTop: 40,
    marginBottom: 8,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  durationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 20,
  },
  resetButton: {
    marginTop: 4,
  },
});
