type LogLevel = "info" | "warn" | "error";

const emit = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const payload = { level, message, meta, timestamp: new Date().toISOString() };
  console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](payload);
};

export const logInfo = (message: string, meta?: Record<string, unknown>) => emit("info", message, meta);
export const logWarn = (message: string, meta?: Record<string, unknown>) => emit("warn", message, meta);
export const logError = (message: string, meta?: Record<string, unknown>) => emit("error", message, meta);
