import { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { COLORS } from "../ui/theme";
import { TerminalText } from "../ui/components/TerminalText";
import { HashProgressBar } from "../ui/components/HashProgressBar";
import { BlinkingCursor } from "../ui/components/BlinkingCursor";
import { useSession } from "../state/SessionContext";
import { pickRandomTask } from "../engine/resetLoop";
import type { Task } from "../model/types";

function taskProgress(task: Task): number {
  if (task.steps.length === 0) return 0;
  return task.steps.filter((s) => s.done).length / task.steps.length;
}

export default function Home() {
  const router = useRouter();
  const { ready, session, tasks, setSession } = useSession();

  const openTask = useCallback(
    (task: Task) => {
      setSession((prev) => ({ ...prev, activeTask: task }));
      router.push(`/steps/${task.id}`);
    },
    [router, setSession]
  );

  const handleRandomPick = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = pickRandomTask(tasks, session);
    setSession(updated);
    if (updated.activeTask) {
      router.push(`/steps/${updated.activeTask.id}`);
    }
  }, [tasks, session, setSession, router]);

  if (!ready) {
    return (
      <View style={styles.center}>
        <TerminalText variant="accent">loading_</TerminalText>
      </View>
    );
  }

  const openTasks = tasks.filter((t) => t.steps.some((s) => !s.done));
  const topThree = openTasks.slice(0, 3);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TerminalText variant="heading">RESET_BOARD</TerminalText>
        <TerminalText variant="muted">momentum: {session.momentum}</TerminalText>
      </View>

      <Pressable
        style={styles.randomButton}
        onPress={handleRandomPick}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Pick a random open task and start it"
      >
        <TerminalText variant="bright" style={styles.randomLabel}>
          {"> "}pick_something<BlinkingCursor />
        </TerminalText>
      </Pressable>

      <View style={styles.sectionHeader}>
        <TerminalText variant="muted">// open tasks</TerminalText>
        <Pressable
          onPress={() => router.push("/new-task")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Create a new task"
        >
          <TerminalText variant="accent">{"+ "}new_task</TerminalText>
        </Pressable>
      </View>

      {openTasks.length > topThree.length && (
        <TerminalText variant="muted" style={styles.hiddenTasksNote}>
          showing {topThree.length} of {openTasks.length} — pick_something surfaces the rest
        </TerminalText>
      )}

      {topThree.length === 0 ? (
        <Pressable
          onPress={() => router.push("/new-task")}
          accessibilityRole="button"
          accessibilityLabel="No tasks queued. Tap to add a task"
        >
          <TerminalText variant="muted">nothing queued — tap to add a task</TerminalText>
        </Pressable>
      ) : (
        <FlatList
          data={topThree}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <Pressable
              style={styles.card}
              onPress={() => openTask(item)}
              accessibilityRole="button"
              accessibilityLabel={`Open task: ${item.title}, ${Math.round(taskProgress(item) * 100)} percent complete`}
            >
              <TerminalText variant="accent">[{index + 1}] {item.title}</TerminalText>
              <HashProgressBar progress={taskProgress(item)} />
            </Pressable>
          )}
        />
      )}

      <Pressable
        style={styles.paywallLink}
        onPress={() => router.push("/paywall")}
        accessibilityRole="button"
        accessibilityLabel="View premium features"
      >
        <TerminalText variant="muted">premium features →</TerminalText>
      </Pressable>

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
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    marginBottom: 24,
    gap: 4,
  },
  randomButton: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 28,
  },
  randomLabel: {
    color: COLORS.accent,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.dim,
    borderRadius: 4,
    padding: 14,
    gap: 8,
  },
  paywallLink: {
    marginTop: 16,
    alignSelf: "center",
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 12,
  },
  legalLink: {
    fontSize: 11,
    textDecorationLine: "underline",
  },
  hiddenTasksNote: {
    fontSize: 11,
    marginTop: -4,
    marginBottom: 8,
  },
});
