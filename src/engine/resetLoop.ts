import type { ResetSession, Task } from "../model/types";

/**
 * Pure logic for the reset loop. No React, no hooks, no side effects.
 * Everything here can be unit tested with plain jest and no simulator.
 */

export function pickRandomTask(
  pool: Task[],
  current: ResetSession
): ResetSession {
  const available = pool.filter((t) => t.steps.some((s) => !s.done));
  const choice =
    available[Math.floor(Math.random() * available.length)] ?? null;
  return { ...current, activeTask: choice };
}

export function startTimer(seconds: number, current: ResetSession): ResetSession {
  return {
    ...current,
    timerSeconds: seconds,
    remainingSeconds: seconds,
    timerState: "running",
  };
}

export function pauseTimer(current: ResetSession): ResetSession {
  if (current.timerState !== "running") return current;
  return { ...current, timerState: "paused" };
}

export function resumeTimer(current: ResetSession): ResetSession {
  if (current.timerState !== "paused") return current;
  return { ...current, timerState: "running" };
}

export function resetTimer(current: ResetSession): ResetSession {
  return {
    ...current,
    remainingSeconds: current.timerSeconds,
    timerState: "idle",
  };
}

export function tick(current: ResetSession): ResetSession {
  if (current.timerState !== "running") return current;
  const next = current.remainingSeconds - 1;
  if (next <= 0) {
    return {
      ...current,
      remainingSeconds: 0,
      timerState: "complete",
      momentum: current.momentum + 1,
    };
  }
  return { ...current, remainingSeconds: next };
}

export function completeStep(task: Task, stepId: string): Task {
  return {
    ...task,
    steps: task.steps.map((s) => (s.id === stepId ? { ...s, done: true } : s)),
  };
}

export function isTaskComplete(task: Task): boolean {
  return task.steps.every((s) => s.done);
}
