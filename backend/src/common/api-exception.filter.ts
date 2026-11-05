import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter,
} from "@nestjs/common";
import type { Request, Response } from "express";

interface ErrorResponseBody {
  readonly code?: string;
  readonly message?: string | string[];
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const exceptionCode = typeof exception === "object" && exception !== null && "code" in exception
      ? String((exception as { code: unknown }).code)
      : "";
    const httpStatus = exception instanceof HttpException ? exception.getStatus() : null;
    const httpRaw = exception instanceof HttpException ? exception.getResponse() : null;
    const httpBody = typeof httpRaw === "object" && httpRaw !== null ? httpRaw as ErrorResponseBody : {};
    const isFileTooLarge = exceptionCode === "LIMIT_FILE_SIZE" || (
      httpStatus === HttpStatus.PAYLOAD_TOO_LARGE &&
      httpBody.code === undefined &&
      httpBody.message === "File too large"
    );
    const status = isFileTooLarge
      ? HttpStatus.PAYLOAD_TOO_LARGE
      : httpStatus !== null
        ? httpStatus
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = isFileTooLarge
      ? {
          code: "merchant/document-too-large",
          message: "حجم صورة السجل التجاري يجب ألا يتجاوز 700 كيلوبايت.",
        }
      : httpRaw !== null
        ? httpRaw
        : null;
    const body = typeof raw === "object" && raw !== null ? raw as ErrorResponseBody : {};
    const message = Array.isArray(body.message) ? body.message.join("، ") : body.message;

    response.status(status).json({
      error: {
        code: body.code ?? (status === 429 ? "rate_limit/exceeded" : "request/failed"),
        message: message ?? (status >= 500 ? "تعذر إكمال الطلب الآن." : "الطلب غير صالح."),
        status,
        correlationId: request.correlationId ?? null,
        timestamp: new Date().toISOString(),
        path: request.originalUrl,
      },
    });
  }
}
