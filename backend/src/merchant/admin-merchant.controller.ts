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
import { ApiBearerAuth, ApiOkResponse, ApiProduces, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { AdminGuard } from "../auth/admin.guard";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { VerifiedEmailGuard } from "../auth/verified-email.guard";
import { ListMerchantApplicationsDto, MerchantDecisionDto } from "./merchant.dto";
import { MerchantApplicationsService } from "./merchant.service";

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
  @ApiOkResponse({ description: "Paginated application metadata; document bytes are never included" })
  list(@Query() query: ListMerchantApplicationsDto) {
    return this.service.list(query);
  }

  @Get(":uid")
  @ApiOkResponse({ description: "Application metadata; document bytes are never included" })
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
