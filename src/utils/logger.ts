type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

class Logger {
  private log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>
  ) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
    };

    const logString = JSON.stringify(logEntry);

    if (level === "ERROR") {
      console.error(logString);
    } else {
      console.log(logString);
    }
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log("INFO", message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log("WARN", message, meta);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.log("ERROR", message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.log("DEBUG", message, meta);
  }
}

const logger = new Logger();
export default logger;
