import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_SESSION, type ResetSession, type Task } from "../model/types";
import { loadSession, loadTasks, saveSession, saveTasks } from "../storage/store";

/** Small starter set so the app isn't empty on first launch. Users can edit/add their own. */
function seedTasks(): Task[] {
  const now = Date.now();
  return [
    {
      id: "seed-1",
      title: "Clear the desk",
      createdAt: now,
      steps: [
        { id: "s1", label: "Throw away trash", done: false },
        { id: "s2", label: "Put dishes in sink", done: false },
        { id: "s3", label: "Stack loose papers", done: false },
      ],
    },
    {
      id: "seed-2",
      title: "Reply to one email",
      createdAt: now,
      steps: [
        { id: "s1", label: "Open inbox", done: false },
        { id: "s2", label: "Pick the oldest unread", done: false },
        { id: "s3", label: "Send a reply", done: false },
      ],
    },
    {
      id: "seed-3",
      title: "Tidy the floor",
      createdAt: now,
      steps: [
        { id: "s1", label: "Pick up clothes", done: false },
        { id: "s2", label: "Put shoes away", done: false },
      ],
    },
  ];
}

type SessionContextValue = {
  ready: boolean;
  session: ResetSession;
  tasks: Task[];
  setSession: (updater: ResetSession | ((prev: ResetSession) => ResetSession)) => void;
  setTasks: (updater: Task[] | ((prev: Task[]) => Task[])) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSessionState] = useState<ResetSession>(DEFAULT_SESSION);
  const [tasks, setTasksState] = useState<Task[]>([]);

  useEffect(() => {
    (async () => {
      const [storedSession, storedTasks] = await Promise.all([
        loadSession(),
        loadTasks(),
      ]);
      // Merge over DEFAULT_SESSION rather than using storedSession as-is, so
      // fields added after a user's first install (e.g. ritualSoundId) fall
      // back to a sane default instead of coming back undefined.
      setSessionState(storedSession ? { ...DEFAULT_SESSION, ...storedSession } : DEFAULT_SESSION);
      const initialTasks = storedTasks.length > 0 ? storedTasks : seedTasks();
      setTasksState(initialTasks);
      if (storedTasks.length === 0) {
        await saveTasks(initialTasks);
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveSession(session);
  }, [ready, session]);

  useEffect(() => {
    if (!ready) return;
    saveTasks(tasks);
  }, [ready, tasks]);

  const setSession = useCallback(
    (updater: ResetSession | ((prev: ResetSession) => ResetSession)) => {
      setSessionState((prev) =>
        typeof updater === "function" ? (updater as (p: ResetSession) => ResetSession)(prev) : updater
      );
    },
    []
  );

  const setTasks = useCallback(
    (updater: Task[] | ((prev: Task[]) => Task[])) => {
      setTasksState((prev) =>
        typeof updater === "function" ? (updater as (p: Task[]) => Task[])(prev) : updater
      );
    },
    []
  );

  const value = useMemo(
    () => ({ ready, session, tasks, setSession, setTasks }),
    [ready, session, tasks, setSession, setTasks]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
