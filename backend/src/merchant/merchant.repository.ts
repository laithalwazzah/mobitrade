import type {
  MerchantApplication,
  MerchantApplicationList,
  MerchantApplicationStatus,
  MerchantDecision,
  MerchantDocument,
  MerchantDocumentType,
  MerchantShop,
} from "./merchant.types";

export interface CreateMerchantRecord {
  readonly shop: MerchantShop;
  readonly document: {
    readonly bytes: Buffer;
    readonly fileName: string;
    readonly contentType: MerchantDocumentType;
    readonly size: number;
  };
}

export interface ListMerchantApplicationsQuery {
  readonly status?: MerchantApplicationStatus;
  readonly limit: number;
  readonly pageToken?: string;
}

export interface MerchantApplicationsRepository {
  create(ownerId: string, record: CreateMerchantRecord): Promise<MerchantApplication>;
  findByOwner(ownerId: string): Promise<MerchantApplication | null>;
  list(query: ListMerchantApplicationsQuery): Promise<MerchantApplicationList>;
  findById(ownerId: string): Promise<MerchantApplication | null>;
  getDocument(ownerId: string): Promise<MerchantDocument | null>;
  decide(ownerId: string, reviewerId: string, decision: MerchantDecision): Promise<MerchantApplication>;
}

export const MERCHANT_REPOSITORY = Symbol("MERCHANT_REPOSITORY");
