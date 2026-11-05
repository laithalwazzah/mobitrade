import { Injectable } from "@nestjs/common";
import { FieldPath, Timestamp, type DocumentData, type Query } from "firebase-admin/firestore";
import { FirebaseAdminService } from "../firebase/firebase-admin.service";
import {
  MerchantDomainError,
  type MerchantApplication,
  type MerchantApplicationList,
  type MerchantApplicationStatus,
  type MerchantDocument,
} from "./merchant.types";
import type {
  CreateMerchantRecord,
  ListMerchantApplicationsQuery,
  MerchantApplicationsRepository,
} from "./merchant.repository";
import { decodePageToken, encodePageToken } from "./merchant.validation";

function iso(value: unknown): string | null {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

function applicationFrom(ownerId: string, value: DocumentData | undefined): MerchantApplication | null {
  if (!value || value.ownerId !== ownerId || !["pending", "approved", "rejected"].includes(value.status)) return null;
  const submittedAt = iso(value.submittedAt);
  if (!submittedAt || !Number.isInteger(value.version) || value.version < 1) return null;
  const shop = value.shop;
  if (!shop || [shop.name, shop.area, shop.address, shop.whatsapp].some((item) => typeof item !== "string")) return null;
  return {
    ownerId,
    shop: { name: shop.name, area: shop.area, address: shop.address, whatsapp: shop.whatsapp },
    status: value.status as MerchantApplicationStatus,
    submittedAt,
    version: value.version,
    ...(iso(value.reviewedAt) ? { reviewedAt: iso(value.reviewedAt)! } : {}),
    ...(typeof value.reviewerId === "string" ? { reviewerId: value.reviewerId } : {}),
    ...(typeof value.rejectionReason === "string" ? { rejectionReason: value.rejectionReason } : {}),
  };
}

@Injectable()
export class FirestoreMerchantApplicationsRepository implements MerchantApplicationsRepository {
  constructor(private readonly firebase: FirebaseAdminService) {}

  async create(ownerId: string, record: CreateMerchantRecord): Promise<MerchantApplication> {
    const applications = this.firebase.firestore.collection("merchantApplications");
    const documents = this.firebase.firestore.collection("merchantDocuments");
    const applicationRef = applications.doc(ownerId);
    const documentRef = documents.doc(ownerId);
    const timestamp = Timestamp.now();
    await this.firebase.firestore.runTransaction(async (transaction) => {
      const [application, document] = await transaction.getAll(applicationRef, documentRef);
      if (!application || !document) throw new MerchantDomainError("inconsistent-record");
      if (application.exists && document.exists) throw new MerchantDomainError("duplicate");
      if (application.exists || document.exists) throw new MerchantDomainError("inconsistent-record");
      transaction.create(applicationRef, {
        ownerId,
        shop: record.shop,
        status: "pending",
        submittedAt: timestamp,
        version: 1,
      });
      transaction.create(documentRef, {
        bytes: record.document.bytes,
        fileName: record.document.fileName,
        contentType: record.document.contentType,
        size: record.document.size,
        createdAt: timestamp,
      });
    });
    return { ownerId, shop: record.shop, status: "pending", submittedAt: timestamp.toDate().toISOString(), version: 1 };
  }

  async findByOwner(ownerId: string): Promise<MerchantApplication | null> {
    return this.findById(ownerId);
  }

  async findById(ownerId: string): Promise<MerchantApplication | null> {
    const snapshot = await this.firebase.firestore.collection("merchantApplications").doc(ownerId).get();
    return snapshot.exists ? applicationFrom(ownerId, snapshot.data()) : null;
  }

  async list(input: ListMerchantApplicationsQuery): Promise<MerchantApplicationList> {
    let query: Query = this.firebase.firestore.collection("merchantApplications");
    if (input.status) query = query.where("status", "==", input.status);
    query = query.orderBy("submittedAt", "desc").orderBy(FieldPath.documentId(), "desc");
    const cursor = decodePageToken(input.pageToken);
    if (input.pageToken && !cursor) throw new MerchantDomainError("invalid-page-token");
    if (cursor) query = query.startAfter(Timestamp.fromDate(new Date(cursor.submittedAt)), cursor.uid);
    const snapshot = await query.limit(input.limit + 1).get();
    const mapped = snapshot.docs
      .map((document) => applicationFrom(document.id, document.data()))
      .filter((item): item is MerchantApplication => item !== null);
    const hasMore = mapped.length > input.limit;
    const items = mapped.slice(0, input.limit);
    const last = items.at(-1);
    return {
      items,
      nextPageToken: hasMore && last ? encodePageToken({ submittedAt: last.submittedAt, uid: last.ownerId }) : null,
    };
  }

  async getDocument(ownerId: string): Promise<MerchantDocument | null> {
    const snapshot = await this.firebase.firestore.collection("merchantDocuments").doc(ownerId).get();
    if (!snapshot.exists) return null;
    const data = snapshot.data();
    const createdAt = iso(data?.createdAt);
    if (
      !data || !Buffer.isBuffer(data.bytes) || typeof data.fileName !== "string" ||
      !["image/jpeg", "image/png", "image/webp"].includes(data.contentType) ||
      !Number.isInteger(data.size) || !createdAt
    ) return null;
    return {
      bytes: Buffer.from(data.bytes),
      fileName: data.fileName,
      contentType: data.contentType,
      size: data.size,
      createdAt,
    } as MerchantDocument;
  }

  async decide(ownerId: string, reviewerId: string, decision: import("./merchant.types").MerchantDecision): Promise<MerchantApplication> {
    const applicationRef = this.firebase.firestore.collection("merchantApplications").doc(ownerId);
    const auditRef = this.firebase.firestore.collection("merchantApplicationAudits").doc();
    return this.firebase.firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(applicationRef);
      if (!snapshot.exists) throw new MerchantDomainError("not-found");
      const current = applicationFrom(ownerId, snapshot.data());
      if (!current) throw new MerchantDomainError("inconsistent-record");
      if (current.status !== "pending") throw new MerchantDomainError("not-pending");
      if (current.version !== decision.expectedVersion) throw new MerchantDomainError("version-conflict");
      const timestamp = Timestamp.now();
      const nextVersion = current.version + 1;
      const update = {
        status: decision.decision,
        reviewedAt: timestamp,
        reviewerId,
        version: nextVersion,
        ...(decision.decision === "rejected" ? { rejectionReason: decision.reason } : {}),
      };
      transaction.update(applicationRef, update);
      transaction.create(auditRef, {
        applicationId: ownerId,
        action: "decision",
        fromStatus: "pending",
        toStatus: decision.decision,
        reviewerId,
        fromVersion: current.version,
        toVersion: nextVersion,
        occurredAt: timestamp,
        ...(decision.decision === "rejected" ? { reason: decision.reason } : {}),
      });
      return {
        ...current,
        status: decision.decision,
        reviewedAt: timestamp.toDate().toISOString(),
        reviewerId,
        version: nextVersion,
        ...(decision.decision === "rejected" ? { rejectionReason: decision.reason } : {}),
      };
    });
  }
}
