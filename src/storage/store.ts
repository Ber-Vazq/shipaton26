import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ResetSession, Task } from "../model/types";

const TASKS_KEY = "tasks_v1";
const SESSION_KEY = "session_v1";

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export async function loadTasks(): Promise<Task[]> {
  const raw = await AsyncStorage.getItem(TASKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveSession(session: ResetSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<ResetSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}
