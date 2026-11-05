import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import express from "express";
import helmet from "helmet";
import { BadRequestException, PayloadTooLargeException, ValidationPipe, type INestApplication } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { AppModule } from "./app.module";
import type { TokenVerifier } from "./auth/auth.types";
import type { MerchantApplicationsRepository } from "./merchant/merchant.repository";
import type { BackendConfig } from "./config/backend-config";
import { ApiExceptionFilter } from "./common/api-exception.filter";
import { correlationIdMiddleware } from "./common/correlation-id.middleware";
import { JsonLogger } from "./common/json-logger.service";
import { requestLoggingMiddleware } from "./common/request-logging.middleware";

export async function createApplication(
  config: BackendConfig,
  verifier?: TokenVerifier,
  merchantRepository?: MerchantApplicationsRepository,
): Promise<INestApplication> {
  const logger = new JsonLogger();
  const app = await NestFactory.create(AppModule.register(config, verifier, merchantRepository), {
    bodyParser: false,
    logger,
  });

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(correlationIdMiddleware);
  app.use(express.json({ limit: config.requestBodyLimit }));
  app.use(express.urlencoded({ extended: false, limit: config.requestBodyLimit }));
  app.use((error: unknown, _request: Request, _response: Response, next: NextFunction) => {
    const type = typeof error === "object" && error !== null && "type" in error
      ? String((error as { type: unknown }).type)
      : "";
    if (type === "entity.too.large") {
      next(new PayloadTooLargeException({
        code: "request/body-too-large",
        message: "حجم الطلب أكبر من الحد المسموح.",
      }));
      return;
    }
    if (type === "entity.parse.failed") {
      next(new BadRequestException({ code: "request/invalid-json", message: "صيغة JSON غير صالحة." }));
      return;
    }
    next(error);
  });
  app.use(requestLoggingMiddleware(logger));
  app.enableCors({
    credentials: false,
    methods: ["GET", "POST", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Correlation-Id"],
    exposedHeaders: ["X-Correlation-Id"],
    origin(
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) {
      callback(null, origin === undefined || config.corsAllowlist.includes(origin));
    },
  });
  app.setGlobalPrefix(config.apiPrefix);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: true,
    exceptionFactory: () => new BadRequestException({
      code: "request/validation-failed",
      message: "بيانات الطلب غير صالحة.",
    }),
  }));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();

  const openApi = new DocumentBuilder()
    .setTitle("سعّرلي API")
    .setDescription("Trusted backend API for identity and merchant-application workflows.")
    .setVersion("1.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "Firebase ID token" })
    .build();
  const document = SwaggerModule.createDocument(app, openApi);
  SwaggerModule.setup(`${config.apiPrefix}/docs`, app, document, {
    jsonDocumentUrl: `${config.apiPrefix}/docs-json`,
  });

  await app.init();
  return app;
}
