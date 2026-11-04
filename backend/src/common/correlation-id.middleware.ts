import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const SAFE_CORRELATION_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

export function correlationIdMiddleware(request: Request, response: Response, next: NextFunction): void {
  const supplied = request.header("x-correlation-id");
  request.correlationId = supplied && SAFE_CORRELATION_ID.test(supplied) ? supplied : randomUUID();
  response.setHeader("x-correlation-id", request.correlationId);
  next();
}
