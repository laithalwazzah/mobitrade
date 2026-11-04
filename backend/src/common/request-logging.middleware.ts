import type { NextFunction, Request, Response } from "express";
import type { JsonLogger } from "./json-logger.service";

export function requestLoggingMiddleware(logger: JsonLogger) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const startedAt = Date.now();
    response.on("finish", () => {
      logger.log("http_request", {
        correlationId: request.correlationId,
        method: request.method,
        path: request.path,
        status: response.statusCode,
        durationMs: Date.now() - startedAt,
        userAgent: request.header("user-agent") ?? null,
      });
    });
    next();
  };
}
