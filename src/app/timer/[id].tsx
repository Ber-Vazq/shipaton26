import { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { COLORS } from "../../ui/theme";
import { TerminalText } from "../../ui/components/TerminalText";
import { HashProgressBar } from "../../ui/components/HashProgressBar";
import { AsciiCheckbox } from "../../ui/components/AsciiCheckbox";
import { useSession } from "../../state/SessionContext";
import {
  completeStep,
  isTaskComplete,
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
  const { session, setSession, tasks, setTasks } = useSession();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const task = session.activeTask?.id === id ? session.activeTask : null;
  const liveTask = useMemo(() => tasks.find((t) => t.id === id) ?? task, [tasks, id, task]);

  // Auto-start: entering this screen with a fresh (idle) timer should start
  // counting down immediately — no manual "start" tap required. Only fires
  // once per mount, and only if the timer hasn't already been started/
  // paused/completed (e.g. navigating back into an in-progress timer won't
  // restart it from scratch).
  useEffect(() => {
    // Session/timer state is shared across the whole app rather than keyed
    // per task. Without this guard, opening Task B's timer while Task A's
    // timer is still "running"/"paused" would show Task B's title and steps
    // but keep counting down Task A's leftover time — pausing/resuming/
    // resetting "Task B's timer" would actually be operating on Task A's.
    // So: whenever the task we're viewing differs from the one the shared
    // session last tracked, force a fresh timer for *this* task. Only when
    // it's the same task do we fall back to the idle/complete check, so
    // backing out and returning to an in-progress timer for that same task
    // doesn't restart it from scratch.
    setSession((prev) => {
      const isDifferentTask = prev.activeTask?.id !== id;
      if (isDifferentTask) {
        return startTimer(prev.timerSeconds, { ...prev, activeTask: liveTask ?? prev.activeTask });
      }
      return prev.timerState === "idle" || prev.timerState === "complete"
        ? startTimer(prev.timerSeconds, prev)
        : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const toggleStep = useCallback(
    (stepId: string) => {
      if (!liveTask) return;
      const updated = completeStep(liveTask, stepId);
      setTasks((prev) => prev.map((t) => (t.id === liveTask.id ? updated : t)));
    },
    [liveTask, setTasks]
  );

  const primaryLabel =
    session.timerState === "running"
      ? "> pause"
      : session.timerState === "paused"
        ? "> resume"
        : "> start";

  const stepsDone = liveTask ? liveTask.steps.filter((s) => s.done).length : 0;
  const stepsProgress = liveTask && liveTask.steps.length > 0 ? stepsDone / liveTask.steps.length : 0;
  const allStepsDone = liveTask ? isTaskComplete(liveTask) : false;

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

      <View
        style={styles.timerWrap}
        accessible
        accessibilityLabel={`${formatTime(session.remainingSeconds)} remaining`}
      >
        <TerminalText variant="timer">{formatTime(session.remainingSeconds)}</TerminalText>
      </View>

      <HashProgressBar progress={progress} width={28} />

      {session.timerState === "idle" && (
        <View style={styles.durationRow}>
          <Pressable
            onPress={() => adjustDuration(-STEP_SECONDS)}
            style={styles.durationButton}
            accessibilityRole="button"
            accessibilityLabel="Decrease timer duration by 1 minute"
          >
            <TerminalText variant="accent">[-]</TerminalText>
          </Pressable>
          <TerminalText variant="body">{formatTime(session.timerSeconds)} duration</TerminalText>
          <Pressable
            onPress={() => adjustDuration(STEP_SECONDS)}
            style={styles.durationButton}
            accessibilityRole="button"
            accessibilityLabel="Increase timer duration by 1 minute"
          >
            <TerminalText variant="accent">[+]</TerminalText>
          </Pressable>
        </View>
      )}

      <Pressable
        style={styles.actionButton}
        onPress={handlePrimaryAction}
        accessibilityRole="button"
        accessibilityLabel={primaryLabel.replace(/^>\s*/, "")}
      >
        <TerminalText variant="bright">{primaryLabel}</TerminalText>
      </Pressable>

      {session.timerState !== "idle" && (
        <Pressable
          style={styles.resetButton}
          onPress={() => setSession((prev) => resetTimer(prev))}
          accessibilityRole="button"
          accessibilityLabel="Reset timer"
        >
          <TerminalText variant="muted">reset</TerminalText>
        </Pressable>
      )}

      {liveTask && (
        <View style={styles.taskSection}>
          <TerminalText variant="bright" style={styles.taskTitle}>
            {liveTask.title}
          </TerminalText>

          {liveTask.steps.length > 0 && <HashProgressBar progress={stepsProgress} />}

          <View style={styles.stepsWrap}>
            {liveTask.steps.map((step) => (
              <AsciiCheckbox
                key={step.id}
                label={step.label}
                done={step.done}
                onToggle={() => toggleStep(step.id)}
              />
            ))}
          </View>

          {allStepsDone && (
            <TerminalText variant="accent" style={styles.allDoneNote}>
              [x] all steps done
            </TerminalText>
          )}
        </View>
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
  timerWrap: {
    marginTop: 24,
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
  },
  resetButton: {
    marginTop: -8,
  },
  taskSection: {
    width: "100%",
    marginTop: 12,
    gap: 12,
    alignItems: "flex-start",
  },
  taskTitle: {
    alignSelf: "flex-start",
  },
  stepsWrap: {
    width: "100%",
  },
  allDoneNote: {
    alignSelf: "flex-start",
  },
});
