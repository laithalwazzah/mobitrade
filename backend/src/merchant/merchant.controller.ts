import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { memoryStorage } from "multer";
import type { Request } from "express";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { VerifiedEmailGuard } from "../auth/verified-email.guard";
import { CreateMerchantApplicationDto } from "./merchant.dto";
import { MerchantApplicationsService } from "./merchant.service";
import { MERCHANT_DOCUMENT_MAX_BYTES } from "./merchant.types";

@ApiTags("merchant applications")
@ApiBearerAuth()
@Controller("merchant-applications")
@UseGuards(FirebaseAuthGuard, VerifiedEmailGuard)
export class MerchantApplicationsController {
  constructor(@Inject(MerchantApplicationsService) private readonly service: MerchantApplicationsService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseInterceptors(FileInterceptor("document", {
    storage: memoryStorage(),
    limits: { fileSize: MERCHANT_DOCUMENT_MAX_BYTES, files: 1, fields: 4, fieldSize: 1024 },
  }))
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: {
    type: "object",
    required: ["name", "area", "address", "whatsapp", "document"],
    properties: {
      name: { type: "string", maxLength: 80 },
      area: { type: "string", maxLength: 80 },
      address: { type: "string", maxLength: 160 },
      whatsapp: { type: "string" },
      document: { type: "string", format: "binary" },
    },
  } })
  @ApiCreatedResponse({ description: "Application and private document created atomically" })
  async create(
    @Req() request: Request,
    @Body() body: CreateMerchantApplicationDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return { application: await this.service.create(request.auth!.uid, body, file) };
  }

  @Get("me")
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOkResponse({ description: "Current user's application, without document bytes" })
  async me(@Req() request: Request) {
    return { application: await this.service.mine(request.auth!.uid) };
  }
}
