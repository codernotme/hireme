type LogLevel = "info" | "warn" | "error" | "debug";

type LogEntry = {
  ts: string;
  level: LogLevel;
  message: string;
};

const MAX_ENTRIES = 500;
const MAX_MESSAGE = 2000;
const buffer: LogEntry[] = [];
const listeners = new Set<(entry: LogEntry) => void>();

const clampMessage = (value: string) =>
  value.length > MAX_MESSAGE ? `${value.slice(0, MAX_MESSAGE)}...` : value;

export const logBackend = (level: LogLevel, message: string) => {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    message: clampMessage(message),
  };

  buffer.push(entry);

  if (buffer.length > MAX_ENTRIES) {
    buffer.splice(0, buffer.length - MAX_ENTRIES);
  }

  listeners.forEach((listener) => {
    listener(entry);
  });
};

export const getBackendLogBuffer = () => buffer.slice();

export const subscribeBackendLog = (listener: (entry: LogEntry) => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export type { LogEntry, LogLevel };
