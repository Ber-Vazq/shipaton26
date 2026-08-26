import { DEFAULT_SESSION, type ResetSession, type Task } from "../model/types";
import {
  completeStep,
  isTaskComplete,
  pauseTimer,
  pickRandomTask,
  resetTimer,
  resumeTimer,
  startTimer,
  tick,
} from "./resetLoop";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "Test task",
    createdAt: Date.now(),
    steps: [
      { id: "s1", label: "step one", done: false },
      { id: "s2", label: "step two", done: false },
    ],
    ...overrides,
  };
}

describe("pickRandomTask", () => {
  it("only picks tasks that have at least one undone step", () => {
    const openTask = makeTask({ id: "open" });
    const doneTask = makeTask({
      id: "done",
      steps: [{ id: "s1", label: "step", done: true }],
    });
    const result = pickRandomTask([doneTask, openTask], DEFAULT_SESSION);
    expect(result.activeTask?.id).toBe("open");
  });

  it("returns activeTask: null when there are no open tasks", () => {
    const doneTask = makeTask({
      id: "done",
      steps: [{ id: "s1", label: "step", done: true }],
    });
    const result = pickRandomTask([doneTask], DEFAULT_SESSION);
    expect(result.activeTask).toBeNull();
  });

  it("returns activeTask: null for an empty task pool", () => {
    const result = pickRandomTask([], DEFAULT_SESSION);
    expect(result.activeTask).toBeNull();
  });

  it("distributes picks across all open tasks over many draws (not always the same one)", () => {
    const tasks = [makeTask({ id: "a" }), makeTask({ id: "b" }), makeTask({ id: "c" })];
    const picked = new Set<string | undefined>();
    for (let i = 0; i < 200; i++) {
      const result = pickRandomTask(tasks, DEFAULT_SESSION);
      picked.add(result.activeTask?.id);
    }
    expect(picked.size).toBeGreaterThan(1);
  });

  it("preserves the rest of the session state, only changing activeTask", () => {
    const session: ResetSession = { ...DEFAULT_SESSION, momentum: 7 };
    const result = pickRandomTask([makeTask()], session);
    expect(result.momentum).toBe(7);
    expect(result.timerSeconds).toBe(DEFAULT_SESSION.timerSeconds);
  });
});

describe("timer state transitions", () => {
  it("startTimer sets remainingSeconds/timerSeconds and moves to running", () => {
    const result = startTimer(180, DEFAULT_SESSION);
    expect(result.timerSeconds).toBe(180);
    expect(result.remainingSeconds).toBe(180);
    expect(result.timerState).toBe("running");
  });

  it("pauseTimer only takes effect from running", () => {
    const running: ResetSession = { ...DEFAULT_SESSION, timerState: "running" };
    expect(pauseTimer(running).timerState).toBe("paused");

    const idle: ResetSession = { ...DEFAULT_SESSION, timerState: "idle" };
    expect(pauseTimer(idle).timerState).toBe("idle");
  });

  it("resumeTimer only takes effect from paused", () => {
    const paused: ResetSession = { ...DEFAULT_SESSION, timerState: "paused" };
    expect(resumeTimer(paused).timerState).toBe("running");

    const idle: ResetSession = { ...DEFAULT_SESSION, timerState: "idle" };
    expect(resumeTimer(idle).timerState).toBe("idle");
  });

  it("resetTimer restores remainingSeconds from timerSeconds and goes idle", () => {
    const midCountdown: ResetSession = {
      ...DEFAULT_SESSION,
      timerSeconds: 300,
      remainingSeconds: 42,
      timerState: "running",
    };
    const result = resetTimer(midCountdown);
    expect(result.remainingSeconds).toBe(300);
    expect(result.timerState).toBe("idle");
  });
});

describe("tick", () => {
  it("is a no-op unless the timer is running", () => {
    const idle: ResetSession = { ...DEFAULT_SESSION, timerState: "idle", remainingSeconds: 10 };
    expect(tick(idle)).toEqual(idle);

    const paused: ResetSession = { ...DEFAULT_SESSION, timerState: "paused", remainingSeconds: 10 };
    expect(tick(paused)).toEqual(paused);
  });

  it("decrements remainingSeconds by one while running", () => {
    const running: ResetSession = { ...DEFAULT_SESSION, timerState: "running", remainingSeconds: 10 };
    const result = tick(running);
    expect(result.remainingSeconds).toBe(9);
    expect(result.timerState).toBe("running");
    expect(result.momentum).toBe(DEFAULT_SESSION.momentum);
  });

  it("completes the timer and increments momentum exactly once when it reaches zero", () => {
    const aboutToFinish: ResetSession = {
      ...DEFAULT_SESSION,
      timerState: "running",
      remainingSeconds: 1,
      momentum: 3,
    };
    const result = tick(aboutToFinish);
    expect(result.remainingSeconds).toBe(0);
    expect(result.timerState).toBe("complete");
    expect(result.momentum).toBe(4);
  });

  it("never decrements remainingSeconds below zero, and momentum keeps climbing across repeated completions", () => {
    let session: ResetSession = {
      ...DEFAULT_SESSION,
      timerState: "running",
      remainingSeconds: 1,
      momentum: 0,
    };
    session = tick(session); // completes, momentum -> 1
    expect(session.remainingSeconds).toBe(0);
    expect(session.momentum).toBe(1);

    // Simulate starting a second reset session from scratch.
    session = startTimer(60, session);
    session = { ...session, remainingSeconds: 1 };
    session = tick(session); // completes again, momentum -> 2
    expect(session.momentum).toBe(2);
  });
});

describe("completeStep / isTaskComplete", () => {
  it("completeStep marks only the targeted step done, leaving others untouched", () => {
    const task = makeTask();
    const updated = completeStep(task, "s1");
    expect(updated.steps.find((s) => s.id === "s1")?.done).toBe(true);
    expect(updated.steps.find((s) => s.id === "s2")?.done).toBe(false);
  });

  it("completeStep is a no-op for an unknown step id", () => {
    const task = makeTask();
    const updated = completeStep(task, "does-not-exist");
    expect(updated.steps).toEqual(task.steps);
  });

  it("isTaskComplete is false until every step is done, true once all are", () => {
    const task = makeTask();
    expect(isTaskComplete(task)).toBe(false);

    const halfDone = completeStep(task, "s1");
    expect(isTaskComplete(halfDone)).toBe(false);

    const fullyDone = completeStep(halfDone, "s2");
    expect(isTaskComplete(fullyDone)).toBe(true);
  });

  it("isTaskComplete is true for a task with zero steps (vacuously true)", () => {
    const task = makeTask({ steps: [] });
    expect(isTaskComplete(task)).toBe(true);
  });
});
