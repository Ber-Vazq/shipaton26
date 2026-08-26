import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { COLORS } from "../ui/theme";
import { TerminalText } from "../ui/components/TerminalText";
import { TerminalInput } from "../ui/components/TerminalInput";
import { useSession } from "../state/SessionContext";
import { usePurchases } from "../state/PurchasesContext";
import { FREE_TASK_LIMIT } from "../model/types";
import type { Task } from "../model/types";

export default function NewTaskScreen() {
  const router = useRouter();
  const { tasks, setTasks } = useSession();
  const { isPro } = usePurchases();
  const atFreeLimit = !isPro && tasks.length >= FREE_TASK_LIMIT;
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);

  const updateStep = useCallback((index: number, value: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? value : s)));
  }, []);

  const addStep = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSteps((prev) => [...prev, ""]);
  }, []);

  const removeStep = useCallback((index: number) => {
    setSteps((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }, []);

  const handleCreate = useCallback(() => {
    if (!isPro && tasks.length >= FREE_TASK_LIMIT) {
      setError(`free tier caps at ${FREE_TASK_LIMIT} tasks — unlock premium for unlimited`);
      return;
    }

    const trimmedTitle = title.trim();
    const cleanSteps = steps.map((s) => s.trim()).filter((s) => s.length > 0);

    if (!trimmedTitle) {
      setError("give it a title first");
      return;
    }
    if (cleanSteps.length === 0) {
      setError("add at least one step");
      return;
    }

    const now = Date.now();
    const newTask: Task = {
      id: `task-${now}`,
      title: trimmedTitle,
      createdAt: now,
      steps: cleanSteps.map((label, i) => ({
        id: `step-${now}-${i}`,
        label,
        done: false,
      })),
    };

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTasks((prev) => [...prev, newTask]);
    router.back();
  }, [title, steps, setTasks, router, isPro, tasks.length]);

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

      <TerminalText variant="heading" style={styles.heading}>
        new_task
      </TerminalText>

      <View style={styles.field}>
        <TerminalText variant="muted">// task title</TerminalText>
        <TerminalInput
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            setError(null);
          }}
          placeholder="e.g. Clear the desk"
          autoFocus
          accessibilityLabel="Task title"
        />
      </View>

      <View style={styles.field}>
        <TerminalText variant="muted">// steps</TerminalText>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <TerminalInput
              value={step}
              onChangeText={(t) => {
                updateStep(index, t);
                setError(null);
              }}
              placeholder={`step ${index + 1}`}
              style={styles.stepInput}
              accessibilityLabel={`Step ${index + 1}`}
            />
            {steps.length > 1 && (
              <Pressable
                onPress={() => removeStep(index)}
                hitSlop={16}
                style={styles.removeButton}
                accessibilityRole="button"
                accessibilityLabel={`Remove step ${index + 1}`}
              >
                <TerminalText variant="danger">[x]</TerminalText>
              </Pressable>
            )}
          </View>
        ))}

        <Pressable
          onPress={addStep}
          style={styles.addStepButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Add another step"
        >
          <TerminalText variant="accent">{"+ "}add_step</TerminalText>
        </Pressable>
      </View>

      {error && <TerminalText variant="danger">{error}</TerminalText>}

      {atFreeLimit ? (
        <Pressable
          style={styles.createButton}
          onPress={() => router.push("/paywall")}
          accessibilityRole="button"
          accessibilityLabel={`Free tier task limit reached, ${FREE_TASK_LIMIT} tasks maximum. Tap to view premium options.`}
        >
          <TerminalText variant="bright">{"> "}unlock_premium ({tasks.length}/{FREE_TASK_LIMIT} used)</TerminalText>
        </Pressable>
      ) : (
        <Pressable
          style={styles.createButton}
          onPress={handleCreate}
          accessibilityRole="button"
          accessibilityLabel="Create task"
        >
          <TerminalText variant="bright">{"> "}create_task</TerminalText>
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
  },
  heading: {
    marginTop: 8,
  },
  field: {
    gap: 10,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepInput: {
    flex: 1,
  },
  removeButton: {
    padding: 4,
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  addStepButton: {
    marginTop: 4,
    alignSelf: "flex-start",
  },
  createButton: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
});
