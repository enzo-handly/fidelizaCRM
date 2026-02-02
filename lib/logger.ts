type LogLevel = "info" | "warn" | "error" | "debug"

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development"

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.isDevelopment && level === "debug") {
      return // Skip debug logs in production
    }

    const timestamp = new Date().toISOString()
    const logData = {
      timestamp,
      level,
      message,
      ...context,
    }

    // In production, you would send this to a logging service like Sentry, LogRocket, etc.
    // For now, we'll use console but format it nicely
    switch (level) {
      case "error":
        console.error(`[${timestamp}] ERROR:`, message, context || "")
        break
      case "warn":
        console.warn(`[${timestamp}] WARN:`, message, context || "")
        break
      case "info":
        console.info(`[${timestamp}] INFO:`, message, context || "")
        break
      case "debug":
        console.debug(`[${timestamp}] DEBUG:`, message, context || "")
        break
    }

    // TODO: In production, send to external logging service
    // if (!this.isDevelopment) {
    //   sendToLoggingService(logData)
    // }
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context)
  }

  error(message: string, context?: LogContext) {
    this.log("error", message, context)
  }

  debug(message: string, context?: LogContext) {
    this.log("debug", message, context)
  }
}

export const logger = new Logger()
