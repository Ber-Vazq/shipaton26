import { DEFAULT_RITUAL_SOUND_ID, type RitualSoundId } from "./sounds";

/** Max total tasks a non-pro user can have. Must match the paywall copy
 * in src/app/paywall.tsx (FEATURES) and is enforced in src/app/new-task.tsx. */
export const FREE_TASK_LIMIT = 10;

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
  /** Which ritual-completion sound to play. Premium users can change this;
   * free users always hear DEFAULT_RITUAL_SOUND_ID regardless of what's
   * stored here (enforced in ritual.tsx), so a lapsed subscription simply
   * falls back to the free sound instead of losing the pick entirely. */
  ritualSoundId: RitualSoundId;
};

export const DEFAULT_SESSION: ResetSession = {
  activeTask: null,
  timerSeconds: 300,
  remainingSeconds: 300,
  timerState: "idle",
  momentum: 0,
  ritualSoundId: DEFAULT_RITUAL_SOUND_ID,
};
