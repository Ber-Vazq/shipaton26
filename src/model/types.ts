export type Step = {
  id: string;
  label: string;
  done: boolean;
};

export type Task = {
  id: string;
  title: string;
  steps: Step[];
  createdAt: number;
};

export type TimerState = "idle" | "running" | "paused" | "complete";

export type ResetSession = {
  activeTask: Task | null;
  timerSeconds: number; // 120–600, user-set
  remainingSeconds: number;
  timerState: TimerState;
  momentum: number; // goes up only, never resets — no shame mechanic
};

export const DEFAULT_SESSION: ResetSession = {
  activeTask: null,
  timerSeconds: 300,
  remainingSeconds: 300,
  timerState: "idle",
  momentum: 0,
};
