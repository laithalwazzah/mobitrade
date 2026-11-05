import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { MERCHANT_REPOSITORY, type MerchantApplicationsRepository } from "./merchant.repository";
import { MerchantDomainError, type MerchantDecision } from "./merchant.types";
import type { CreateMerchantApplicationDto, ListMerchantApplicationsDto, MerchantDecisionDto } from "./merchant.dto";
import { normalizeShop, validateMerchantDocument } from "./merchant.validation";

function translate(error: unknown): never {
  if (!(error instanceof MerchantDomainError)) throw error;
  if (error.code === "duplicate") {
    throw new ConflictException({ code: "merchant/duplicate", message: "يوجد طلب اعتماد سابق لهذا الحساب." });
  }
  if (error.code === "inconsistent-record") {
    throw new ConflictException({ code: "merchant/inconsistent-record", message: "سجل طلب الاعتماد غير مكتمل. تواصل مع الإدارة." });
  }
  if (error.code === "not-found") {
    throw new NotFoundException({ code: "merchant/not-found", message: "طلب الاعتماد غير موجود." });
  }
  if (error.code === "document-not-found") {
    throw new NotFoundException({ code: "merchant/document-not-found", message: "وثيقة الطلب غير موجودة." });
  }
  if (error.code === "not-pending") {
    throw new ConflictException({ code: "merchant/not-pending", message: "لا يمكن تغيير قرار طلب تمت مراجعته." });
  }
  if (error.code === "invalid-page-token") {
    throw new BadRequestException({ code: "merchant/invalid-page-token", message: "رمز الصفحة غير صالح." });
  }
  throw new ConflictException({ code: "merchant/version-conflict", message: "تغيّر الطلب منذ فتحه. حدّث البيانات وحاول مجددًا." });
}

@Injectable()
export class MerchantApplicationsService {
  constructor(@Inject(MERCHANT_REPOSITORY) private readonly repository: MerchantApplicationsRepository) {}

  async create(ownerId: string, input: CreateMerchantApplicationDto, file: Express.Multer.File | undefined) {
    const shop = normalizeShop(input);
    const document = validateMerchantDocument(file);
    try {
      return await this.repository.create(ownerId, { shop, document });
    } catch (error) {
      translate(error);
    }
  }

  async mine(ownerId: string) {
    return this.repository.findByOwner(ownerId);
  }

  async list(input: ListMerchantApplicationsDto) {
    const status = input.status;
    const limit = Number(input.limit ?? 20);
    const pageToken = input.pageToken;
    if (status && !["pending", "approved", "rejected"].includes(status)) {
      throw new BadRequestException({ code: "merchant/invalid-status", message: "حالة الطلب غير صالحة." });
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new BadRequestException({ code: "merchant/invalid-limit", message: "حجم الصفحة غير صالح." });
    }
    if (pageToken && (pageToken.length > 512 || !/^[A-Za-z0-9_-]+$/.test(pageToken))) {
      throw new BadRequestException({ code: "merchant/invalid-page-token", message: "رمز الصفحة غير صالح." });
    }
    try {
      return await this.repository.list({ status, limit, pageToken });
    } catch (error) {
      translate(error);
    }
  }

  async detail(ownerId: string) {
    const application = await this.repository.findById(ownerId);
    if (!application) throw new NotFoundException({ code: "merchant/not-found", message: "طلب الاعتماد غير موجود." });
    return application;
  }

  async document(ownerId: string) {
    const document = await this.repository.getDocument(ownerId);
    if (!document) throw new NotFoundException({ code: "merchant/document-not-found", message: "وثيقة الطلب غير موجودة." });
    return document;
  }

  async decide(ownerId: string, reviewerId: string, input: MerchantDecisionDto) {
    const reason = input.reason?.trim();
    if (!['approved', 'rejected'].includes(input.decision) || !Number.isInteger(input.expectedVersion) || input.expectedVersion < 1 || (reason?.length ?? 0) > 500) {
      throw new BadRequestException({ code: "merchant/invalid-decision", message: "بيانات القرار غير صالحة." });
    }
    if (input.decision === "rejected" && !reason) {
      throw new BadRequestException({ code: "merchant/rejection-reason-required", message: "سبب الرفض مطلوب." });
    }
    if (input.decision === "approved" && reason) {
      throw new BadRequestException({ code: "merchant/approval-reason-forbidden", message: "لا يُرسل سبب رفض مع قرار الموافقة." });
    }
    const decision: MerchantDecision = {
      decision: input.decision,
      expectedVersion: input.expectedVersion,
      ...(input.decision === "rejected" ? { reason } : {}),
    };
    try {
      return await this.repository.decide(ownerId, reviewerId, decision);
    } catch (error) {
      translate(error);
    }
  }
}
