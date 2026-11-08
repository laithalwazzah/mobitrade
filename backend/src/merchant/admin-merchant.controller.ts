import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Inject,
  Param,
  Patch,
  Query,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiProduces, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { AdminGuard } from "../auth/admin.guard";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { VerifiedEmailGuard } from "../auth/verified-email.guard";
import { ListMerchantApplicationsDto, MerchantDecisionDto } from "./merchant.dto";
import { MerchantApplicationsService } from "./merchant.service";

const listItemSchema: SchemaObject = {
  type: "object",
  additionalProperties: false,
  required: ["ownerId", "shop", "status", "submittedAt", "version"],
  properties: {
    ownerId: { type: "string" },
    shop: { type: "object", additionalProperties: false, required: ["name", "area"], properties: { name: { type: "string" }, area: { type: "string" } } },
    status: { type: "string", enum: ["pending", "approved", "rejected"] },
    submittedAt: { type: "string", format: "date-time" },
    version: { type: "integer", minimum: 1 },
  },
};

const detailSchema: SchemaObject = {
  type: "object",
  additionalProperties: false,
  required: ["ownerId", "shop", "status", "submittedAt", "version"],
  properties: {
    ...listItemSchema.properties,
    shop: { type: "object", additionalProperties: false, required: ["name", "area", "address", "whatsapp"], properties: { name: { type: "string" }, area: { type: "string" }, address: { type: "string" }, whatsapp: { type: "string" } } },
    reviewedAt: { type: "string", format: "date-time" },
    reviewerId: { type: "string" },
    rejectionReason: { type: "string" },
  },
};

function assertUid(uid: string): string {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(uid)) throw new BadRequestException({ code: "merchant/invalid-owner-id", message: "معرّف صاحب الطلب غير صالح." });
  return uid;
}

@ApiTags("admin merchant applications")
@ApiBearerAuth()
@Controller("admin/merchant-applications")
@UseGuards(FirebaseAuthGuard, VerifiedEmailGuard, AdminGuard)
export class AdminMerchantApplicationsController {
  constructor(@Inject(MerchantApplicationsService) private readonly service: MerchantApplicationsService) {}

  @Get("summary")
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOkResponse({
    description: "Trusted global merchant-application counts. Never derived from a paginated list.",
    schema: {
      type: "object",
      required: ["summary"],
      properties: {
        summary: {
          type: "object",
          additionalProperties: false,
          required: ["total", "pending", "approved", "rejected", "version", "updatedAt"],
          properties: {
            total: { type: "integer", minimum: 0 },
            pending: { type: "integer", minimum: 0 },
            approved: { type: "integer", minimum: 0 },
            rejected: { type: "integer", minimum: 0 },
            version: { type: "integer", minimum: 1 },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 503, description: "Summary is missing, unreadable, corrupt, or inconsistent." })
  async summary() {
    return { summary: await this.service.summary() };
  }

  @Get()
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["pending", "approved", "rejected"],
    description: "Optional merchant-application status filter.",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
    description: "Maximum records returned per page. Defaults to 20.",
  })
  @ApiQuery({
    name: "pageToken",
    required: false,
    schema: { type: "string", maxLength: 512 },
    description: "Opaque continuation token returned by the previous page.",
  })
  @ApiOkResponse({
    description: "Paginated minimized projection: ownerId, shop name/area, status, submittedAt, version only",
    schema: { type: "object", additionalProperties: false, required: ["items", "nextPageToken"], properties: { items: { type: "array", items: listItemSchema }, nextPageToken: { type: "string", nullable: true } } },
  })
  list(@Query() query: ListMerchantApplicationsDto) {
    return this.service.list(query);
  }

  @Get(":uid")
  @ApiOkResponse({ description: "Authorized application metadata; document bytes are never included", schema: { type: "object", required: ["application"], properties: { application: detailSchema } } })
  async detail(@Param("uid") uid: string) {
    return { application: await this.service.detail(assertUid(uid)) };
  }

  @Get(":uid/document")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Header("Cache-Control", "private, no-store, max-age=0")
  @Header("Pragma", "no-cache")
  @Header("X-Content-Type-Options", "nosniff")
  @ApiProduces("image/jpeg", "image/png", "image/webp")
  async document(@Param("uid") uid: string, @Res({ passthrough: true }) response: Response) {
    const document = await this.service.document(assertUid(uid));
    response.setHeader("Content-Type", document.contentType);
    response.setHeader("Content-Length", String(document.size));
    response.setHeader("Content-Disposition", `attachment; filename="${document.fileName}"`);
    return new StreamableFile(document.bytes);
  }

  @Patch(":uid/decision")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOkResponse({ description: "Atomic pending-only decision with audit record and optimistic version check" })
  async decide(
    @Param("uid") uid: string,
    @Req() request: Request,
    @Body() body: MerchantDecisionDto,
  ) {
    return { application: await this.service.decide(assertUid(uid), request.auth!.uid, body) };
  }
}
