import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import type { HistoryData, HistorySession, HistoryRequest } from "./types";

// ---------------------------------------------------------------------------
// History file path
// ---------------------------------------------------------------------------

const HISTORY_FILE_PATH = join(process.cwd(), "data", "history.json");

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

export function ensureHistoryFile(): void {
  if (!existsSync(HISTORY_FILE_PATH)) {
    const dir = dirname(HISTORY_FILE_PATH);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(HISTORY_FILE_PATH, JSON.stringify({ sessions: [] }, null, 2));
  }
}

export function readHistory(): HistoryData {
  ensureHistoryFile();
  const raw = readFileSync(HISTORY_FILE_PATH, "utf-8");
  return JSON.parse(raw) as HistoryData;
}

export function writeHistory(data: HistoryData): void {
  ensureHistoryFile();
  writeFileSync(HISTORY_FILE_PATH, JSON.stringify(data, null, 2));
}

// ---------------------------------------------------------------------------
// Session management
// ---------------------------------------------------------------------------

export function createSession(label?: string): HistorySession {
  const data = readHistory();

  const session: HistorySession = {
    id: new Date().toISOString(),
    label: label ?? `Session ${data.sessions.length + 1}`,
    createdAt: new Date().toISOString(),
    requests: [],
  };

  data.sessions.unshift(session);
  writeHistory(data);

  return session;
}

export function getOrCreateCurrentSession(): HistorySession {
  const data = readHistory();

  if (data.sessions.length > 0) {
    return data.sessions[0];
  }

  return createSession();
}

export function addRequestToSession(
  sessionId: string,
  request: HistoryRequest,
): void {
  const data = readHistory();
  const session = data.sessions.find((s) => s.id === sessionId);

  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  session.requests.unshift(request);
  writeHistory(data);
}

export function updateSessionLabel(
  sessionId: string,
  label: string,
): void {
  const data = readHistory();
  const session = data.sessions.find((s) => s.id === sessionId);

  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  session.label = label;
  writeHistory(data);
}

export function deleteSession(sessionId: string): void {
  const data = readHistory();
  data.sessions = data.sessions.filter((s) => s.id !== sessionId);
  writeHistory(data);
}

export function clearHistory(): void {
  writeHistory({ sessions: [] });
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
