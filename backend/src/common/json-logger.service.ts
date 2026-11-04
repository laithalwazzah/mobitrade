import { Injectable, type LoggerService } from "@nestjs/common";
import { redact } from "./redaction";

type LogLevel = "log" | "error" | "warn" | "debug" | "verbose";

@Injectable()
export class JsonLogger implements LoggerService {
  private write(level: LogLevel, message: unknown, optional: unknown[]): void {
    const record = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message: redact(message),
      context: redact(optional),
    });
    if (level === "error") console.error(record);
    else if (level === "warn") console.warn(record);
    else console.log(record);
  }

  log(message: unknown, ...optional: unknown[]): void { this.write("log", message, optional); }
  error(message: unknown, ...optional: unknown[]): void { this.write("error", message, optional); }
  warn(message: unknown, ...optional: unknown[]): void { this.write("warn", message, optional); }
  debug(message: unknown, ...optional: unknown[]): void { this.write("debug", message, optional); }
  verbose(message: unknown, ...optional: unknown[]): void { this.write("verbose", message, optional); }
}
