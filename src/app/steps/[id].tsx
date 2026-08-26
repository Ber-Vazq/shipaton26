import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "../../ui/theme";
import { TerminalText } from "../../ui/components/TerminalText";
import { AsciiCheckbox } from "../../ui/components/AsciiCheckbox";
import { HashProgressBar } from "../../ui/components/HashProgressBar";
import { useSession } from "../../state/SessionContext";
import { completeStep, isTaskComplete } from "../../engine/resetLoop";

export default function StepsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks, setTasks } = useSession();

  const task = useMemo(() => tasks.find((t) => t.id === id) ?? null, [tasks, id]);

  const toggleStep = useCallback(
    (stepId: string) => {
      if (!task) return;
      const updated = completeStep(task, stepId);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    },
    [task, setTasks]
  );

  if (!task) {
    return (
      <View style={styles.center}>
        <TerminalText variant="muted">task not found_</TerminalText>
      </View>
    );
  }

  const done = task.steps.filter((s) => s.done).length;
  const progress = task.steps.length > 0 ? done / task.steps.length : 0;
  const allDone = isTaskComplete(task);

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
        {task.title}
      </TerminalText>

      <HashProgressBar progress={progress} />

      <View style={styles.stepsWrap}>
        {task.steps.map((step) => (
          <AsciiCheckbox
            key={step.id}
            label={step.label}
            done={step.done}
            onToggle={() => toggleStep(step.id)}
          />
        ))}
      </View>

      <Pressable
        style={[styles.actionButton, allDone && styles.actionButtonDisabled]}
        disabled={allDone}
        onPress={() => router.push(`/timer/${task.id}`)}
        accessibilityRole="button"
        accessibilityState={{ disabled: allDone }}
        accessibilityLabel={allDone ? "All steps done" : "Start timer"}
      >
        <TerminalText variant={allDone ? "muted" : "bright"}>
          {allDone ? "all steps done" : "> start_timer"}
        </TerminalText>
      </Pressable>

      {allDone && (
        <Pressable
          style={styles.ritualButton}
          onPress={() => router.push("/ritual")}
          accessibilityRole="button"
          accessibilityLabel="Complete reset ritual"
        >
          <TerminalText variant="accent">{"> "}complete_reset</TerminalText>
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
    gap: 16,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 8,
  },
  stepsWrap: {
    marginTop: 8,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  actionButtonDisabled: {
    borderColor: COLORS.muted,
  },
  ritualButton: {
    alignItems: "center",
    marginTop: 4,
  },
});
