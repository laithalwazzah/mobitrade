import { BadRequestException } from "@nestjs/common";
import {
  MERCHANT_DOCUMENT_MAX_BYTES,
  type MerchantDocumentType,
  type MerchantShop,
} from "./merchant.types";

export interface MerchantShopInput {
  readonly name: string;
  readonly area: string;
  readonly address: string;
  readonly whatsapp: string;
}

function cleanText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeSyrianWhatsApp(value: string): string | null {
  let number = value.replace(/[\s()+-]/g, "");
  if (!/^\d+$/.test(number)) return null;
  if (number.startsWith("00")) number = number.slice(2);
  if (/^09\d{8}$/.test(number)) number = `963${number.slice(1)}`;
  else if (/^9\d{8}$/.test(number)) number = `963${number}`;
  return /^9639\d{8}$/.test(number) ? number : null;
}

export function normalizeShop(input: MerchantShopInput): MerchantShop {
  const name = cleanText(input.name);
  const area = cleanText(input.area);
  const address = cleanText(input.address);
  const whatsapp = normalizeSyrianWhatsApp(input.whatsapp);
  if (!name || name.length > 80) {
    throw new BadRequestException({ code: "merchant/invalid-name", message: "اسم المحل غير صالح." });
  }
  if (!area || area.length > 80) {
    throw new BadRequestException({ code: "merchant/invalid-area", message: "المنطقة غير صالحة." });
  }
  if (!address || address.length > 160) {
    throw new BadRequestException({ code: "merchant/invalid-address", message: "العنوان غير صالح." });
  }
  if (!whatsapp) {
    throw new BadRequestException({ code: "merchant/invalid-whatsapp", message: "رقم واتساب السوري غير صالح." });
  }
  return { name, area, address, whatsapp };
}

function signatureType(bytes: Buffer): MerchantDocumentType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) return "image/png";
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) return "image/webp";
  return null;
}

export function validateMerchantDocument(file: Express.Multer.File | undefined): {
  bytes: Buffer;
  contentType: MerchantDocumentType;
  fileName: string;
  size: number;
} {
  if (!file || !Buffer.isBuffer(file.buffer)) {
    throw new BadRequestException({ code: "merchant/document-required", message: "أرفق صورة السجل التجاري." });
  }
  if (file.size < 1 || file.size > MERCHANT_DOCUMENT_MAX_BYTES) {
    throw new BadRequestException({ code: "merchant/document-size", message: "حجم صورة السجل التجاري غير صالح." });
  }
  const detected = signatureType(file.buffer);
  if (!detected || file.mimetype !== detected) {
    throw new BadRequestException({ code: "merchant/document-signature", message: "ملف السجل يجب أن يكون صورة JPEG أو PNG أو WebP حقيقية." });
  }
  const extension = detected === "image/jpeg" ? "jpg" : detected === "image/png" ? "png" : "webp";
  return {
    bytes: Buffer.from(file.buffer),
    contentType: detected,
    fileName: `commercial-record.${extension}`,
    size: file.size,
  };
}

interface CursorPayload { readonly submittedAt: string; readonly uid: string }

export function encodePageToken(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodePageToken(value: string | undefined): CursorPayload | null {
  if (!value) return null;
  try {
    if (value.length > 512) return null;
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Record<string, unknown>;
    if (typeof parsed.submittedAt !== "string" || Number.isNaN(Date.parse(parsed.submittedAt))) return null;
    if (typeof parsed.uid !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(parsed.uid)) return null;
    return { submittedAt: new Date(parsed.submittedAt).toISOString(), uid: parsed.uid };
  } catch {
    return null;
  }
}
