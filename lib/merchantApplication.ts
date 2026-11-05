import { normalizeSyrianWhatsAppNumber } from "@/lib/phone";

export const COMMERCIAL_RECORD_MAX_BYTES = 700 * 1024;
export const COMMERCIAL_RECORD_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const merchantDocumentPath = (uid: string) => `merchantDocuments/${uid}`;

export type MerchantApplicationStatus = "pending" | "approved" | "rejected";
export type MerchantShop = { name: string; area: string; address: string; whatsapp: string };
export type MerchantApplication = {
  ownerId: string;
  shop: MerchantShop;
  status: MerchantApplicationStatus;
  submittedAt: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string;
  version: number;
};
export type MerchantApplicationInput = { name: string; area: string; address: string; whatsapp: string };
export type MerchantFile = { name: string; type: string; size: number };
export type MerchantValidationErrors = Partial<Record<"name" | "area" | "address" | "whatsapp" | "file", string>>;

export function validateMerchantApplication(input: MerchantApplicationInput, file: MerchantFile | null): MerchantValidationErrors {
  const errors: MerchantValidationErrors = {};
  const name = input.name.trim();
  const area = input.area.trim();
  const address = input.address.trim();
  if (!name) errors.name = "أدخل اسم المحل.";
  else if (name.length > 80) errors.name = "اسم المحل يجب ألا يتجاوز 80 حرفاً.";
  if (!area) errors.area = "أدخل المنطقة أو الحي.";
  else if (area.length > 80) errors.area = "المنطقة يجب ألا تتجاوز 80 حرفاً.";
  if (!address) errors.address = "أدخل العنوان التفصيلي.";
  else if (address.length > 160) errors.address = "العنوان يجب ألا يتجاوز 160 حرفاً.";
  if (!normalizeSyrianWhatsAppNumber(input.whatsapp)) errors.whatsapp = "أدخل رقم واتساب سوري صحيحاً.";
  if (!file) errors.file = "أرفق صورة السجل التجاري.";
  else if (!(COMMERCIAL_RECORD_CONTENT_TYPES as readonly string[]).includes(file.type)) errors.file = "الملف يجب أن يكون صورة JPG أو PNG أو WebP.";
  else if (file.size <= 0 || file.size > COMMERCIAL_RECORD_MAX_BYTES) errors.file = "حجم الصورة يجب ألا يتجاوز 700 كيلوبايت.";
  return errors;
}

export function normalizeMerchantInput(input: MerchantApplicationInput): MerchantShop | null {
  const whatsapp = normalizeSyrianWhatsAppNumber(input.whatsapp);
  if (!whatsapp) return null;
  return { name: input.name.trim(), area: input.area.trim(), address: input.address.trim(), whatsapp };
}

export function hasMerchantValidationErrors(errors: MerchantValidationErrors) {
  return Object.values(errors).some(Boolean);
}

function dateFrom(value: unknown): string | null {
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? null : date.toISOString();
  }
  if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.valueOf()) ? date.toISOString() : null;
  }
  return null;
}

export function parseMerchantApplication(value: unknown, ownerId: string): MerchantApplication | null {
  if (typeof value !== "object" || value === null) return null;
  const data = value as Record<string, unknown>;
  const shop = data.shop;
  if (data.ownerId !== ownerId || !["pending", "approved", "rejected"].includes(String(data.status))) return null;
  if (typeof shop !== "object" || shop === null) return null;
  const candidate = shop as Record<string, unknown>;
  if (![candidate.name, candidate.area, candidate.address, candidate.whatsapp].every((item) => typeof item === "string")) return null;
  const application: MerchantApplication = {
    ownerId,
    shop: candidate as MerchantShop,
    status: data.status as MerchantApplicationStatus,
    submittedAt: dateFrom(data.submittedAt),
    version: typeof data.version === "number" && Number.isInteger(data.version) && data.version > 0 ? data.version : 1,
  };
  if (typeof data.rejectionReason === "string") application.rejectionReason = data.rejectionReason;
  if (data.reviewedAt !== undefined) application.reviewedAt = dateFrom(data.reviewedAt);
  return application;
}

export function safeMerchantFileName(contentType: string): string {
  if (contentType === "image/jpeg") return "commercial-record.jpg";
  if (contentType === "image/png") return "commercial-record.png";
  return "commercial-record.webp";
}

export function buildMerchantApplicationRecords<TBytes, TTimestamp>(uid: string, shop: MerchantShop, bytes: TBytes, file: MerchantFile, timestamp: TTimestamp) {
  return {
    application: { ownerId: uid, shop, status: "pending" as const, submittedAt: timestamp },
    document: { bytes, fileName: safeMerchantFileName(file.type), contentType: file.type, size: file.size, createdAt: timestamp },
  };
}

export type MerchantErrorCode = "merchant/unavailable" | "merchant/duplicate" | "merchant/permission-denied" | "merchant/document-failed" | "merchant/write-failed" | "merchant/unknown";
export class SafeMerchantError extends Error {
  constructor(public readonly code: MerchantErrorCode) {
    super(code);
    this.name = "SafeMerchantError";
  }
}
export function mapMerchantError(error: unknown): string {
  const code = error instanceof SafeMerchantError
    ? error.code
    : typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "merchant/unknown";
  if (code === "merchant/duplicate" || code === "permission-denied" || code === "firestore/permission-denied") return "يوجد طلب اعتماد سابق لهذا الحساب ولا يمكن إنشاء طلب مكرر.";
  if (code === "merchant/document-failed") return "تعذر تجهيز صورة السجل التجاري بأمان. تحقق من الملف وحاول مجدداً.";
  if (code === "merchant/unavailable") return "خدمة طلبات اعتماد المحلات غير متاحة حالياً.";
  return "تعذر إرسال طلب الاعتماد. لم تُحفظ صلاحية أو موافقة وهمية؛ حاول مجدداً.";
}
