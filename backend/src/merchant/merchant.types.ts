export const MERCHANT_DOCUMENT_MAX_BYTES = 700 * 1024;
export const MERCHANT_DOCUMENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type MerchantDocumentType = (typeof MERCHANT_DOCUMENT_TYPES)[number];
export type MerchantApplicationStatus = "pending" | "approved" | "rejected";

export interface MerchantShop {
  readonly name: string;
  readonly area: string;
  readonly address: string;
  readonly whatsapp: string;
}

export interface MerchantApplication {
  readonly ownerId: string;
  readonly shop: MerchantShop;
  readonly status: MerchantApplicationStatus;
  readonly submittedAt: string;
  readonly version: number;
  readonly reviewedAt?: string;
  readonly reviewerId?: string;
  readonly rejectionReason?: string;
}

export interface MerchantDocument {
  readonly bytes: Buffer;
  readonly fileName: string;
  readonly contentType: MerchantDocumentType;
  readonly size: number;
  readonly createdAt: string;
}

export interface MerchantApplicationList {
  readonly items: readonly MerchantApplication[];
  readonly nextPageToken: string | null;
}

export interface MerchantDecision {
  readonly decision: "approved" | "rejected";
  readonly reason?: string;
  readonly expectedVersion: number;
}

export type MerchantDomainErrorCode =
  | "duplicate"
  | "inconsistent-record"
  | "not-found"
  | "document-not-found"
  | "not-pending"
  | "version-conflict"
  | "invalid-page-token";

export class MerchantDomainError extends Error {
  constructor(readonly code: MerchantDomainErrorCode) {
    super(code);
    this.name = "MerchantDomainError";
  }
}
