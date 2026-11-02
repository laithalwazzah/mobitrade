"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useCatalog } from "@/components/CatalogProvider";
import { catalog, getBrands } from "@/data/catalog";
import { findProduct } from "@/data/helpers";
import { getDuplicateOfferIndexes } from "@/lib/duplicateOffers";
import { createProductKey } from "@/lib/productKey";
import {
  getServerShopInfoSnapshot,
  getShopInfoSnapshot,
  isRememberingShopInfo,
  parseShopInfoSnapshot,
  saveShopInfo,
  subscribeToShopInfo,
  type ShopInfoDraft,
} from "@/lib/shopInfoStorage";
import { normalizeSyrianWhatsAppNumber } from "@/lib/phone";
import {
  createSubmissionClientId,
  submitOffer,
  type SubmissionOffer,
  type SubmissionPayload,
} from "@/lib/submitOffer";
import OfferFormRow, {
  OTHER_MODEL_VALUE,
  type OfferField,
  type OfferFormRowValue,
} from "@/components/OfferFormRow";

type RowErrors = Partial<Record<OfferField, string>>;
type FormErrors = {
  shopName?: string;
  area?: string;
  address?: string;
  whatsapp?: string;
  rows: Record<string, RowErrors>;
};

const EMPTY_ERRORS: FormErrors = { rows: {} };
const EMPTY_SHOP_INFO: ShopInfoDraft = {
  name: "",
  area: "",
  address: "",
  whatsapp: "",
};
const inputClassName =
  "mt-1 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

function createRow(id: string): OfferFormRowValue {
  return {
    id,
    brand: "",
    modelId: "",
    customModel: "",
    storage: "",
    condition: "",
    network: "",
    price: "",
    currency: "USD",
  };
}

function getRowErrors(row: OfferFormRowValue): RowErrors {
  const errors: RowErrors = {};
  const model =
    row.modelId && row.modelId !== OTHER_MODEL_VALUE
      ? catalog.find((item) => item.id === row.modelId)
      : undefined;
  const isOther = row.modelId === OTHER_MODEL_VALUE;

  if (!getBrands().includes(row.brand)) errors.brand = "اختر الشركة.";
  if (!model && !isOther) errors.model = "اختر الموديل.";
  if (isOther && !row.customModel.trim()) {
    errors.customModel = "اكتب اسم الموديل.";
  } else if (isOther && row.customModel.trim().length > 60) {
    errors.customModel = "اسم الموديل يجب ألا يتجاوز 60 حرفاً.";
  }
  if (!row.storage.trim()) {
    errors.storage = "اختر أو اكتب سعة التخزين.";
  } else if (row.storage.trim().length > 20) {
    errors.storage = "سعة التخزين يجب ألا تتجاوز 20 حرفاً.";
  } else if (model && !model.storages.includes(row.storage)) {
    errors.storage = "اختر سعة من القائمة.";
  }
  if (!row.condition) errors.condition = "اختر حالة الموبايل.";
  if (
    model &&
    row.network &&
    !model.network.includes(row.network)
  ) {
    errors.network = "اختر شبكة يدعمها هذا الموديل.";
  } else if (
    (model?.network.length ?? (isOther ? 2 : 0)) > 1 &&
    !row.network
  ) {
    errors.network = "اختر الشبكة.";
  }

  const price = Number(row.price);
  if (
    !row.price.trim() ||
    !Number.isFinite(price) ||
    price <= 0 ||
    price >= 1_000_000_000
  ) {
    errors.price = "أدخل سعراً أكبر من صفر وأقل من مليار.";
  }

  return errors;
}

export default function AddPriceForm() {
  const { refresh } = useCatalog();
  const shopInfoSnapshot = useSyncExternalStore(
    subscribeToShopInfo,
    getShopInfoSnapshot,
    getServerShopInfoSnapshot,
  );
  const shopInfo = useMemo(
    () => parseShopInfoSnapshot(shopInfoSnapshot),
    [shopInfoSnapshot],
  );
  const rememberShopInfo = isRememberingShopInfo(shopInfoSnapshot);
  const [rows, setRows] = useState([createRow("model-1")]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submissionChannel, setSubmissionChannel] = useState<
    "firestore" | "whatsapp" | null
  >(null);
  const [submitError, setSubmitError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [nextRowId, setNextRowId] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProducts, setSubmittedProducts] = useState<
    { id: string; label: string }[]
  >([]);
  const submittingRef = useRef(false);
  const retryRef = useRef<{
    payloadKey: string;
    clientId: string;
  } | null>(null);

  function updateShopInfo(updates: Partial<ShopInfoDraft>) {
    saveShopInfo({ ...shopInfo, ...updates }, rememberShopInfo);
    setErrors(EMPTY_ERRORS);
  }

  function resetForm(clearShopInfo: boolean) {
    setRows([createRow("model-1")]);
    setNextRowId(2);
    setNotes("");
    setErrors(EMPTY_ERRORS);
    if (clearShopInfo) {
      saveShopInfo(EMPTY_SHOP_INFO, false);
    }
  }

  function updateRow(id: string, updates: Partial<OfferFormRowValue>) {
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, ...updates } : row)),
    );
    setErrors(EMPTY_ERRORS);
  }

  function validateShopInfo(): FormErrors {
    const nextErrors: FormErrors = { rows: {} };
    if (!shopInfo.name.trim()) nextErrors.shopName = "أدخل اسم المحل.";
    else if (shopInfo.name.trim().length > 80)
      nextErrors.shopName = "اسم المحل يجب ألا يتجاوز 80 حرفاً.";
    if (!shopInfo.area.trim()) nextErrors.area = "أدخل المنطقة أو الحي.";
    else if (shopInfo.area.trim().length > 80)
      nextErrors.area = "المنطقة يجب ألا تتجاوز 80 حرفاً.";
    if (!shopInfo.address.trim()) nextErrors.address = "أدخل العنوان التفصيلي.";
    else if (shopInfo.address.trim().length > 160)
      nextErrors.address = "العنوان يجب ألا يتجاوز 160 حرفاً.";
    if (!shopInfo.whatsapp.trim()) {
      nextErrors.whatsapp = "أدخل رقم واتساب المحل.";
    } else if (!normalizeSyrianWhatsAppNumber(shopInfo.whatsapp)) {
      nextErrors.whatsapp = "رقم واتساب غير صحيح. مثال: 0912345678";
    }

    rows.forEach((row) => {
      const rowErrors = getRowErrors(row);
      if (Object.keys(rowErrors).length > 0) nextErrors.rows[row.id] = rowErrors;
    });

    const duplicateIndexes = getDuplicateOfferIndexes(
      rows.map((row) => {
        const model = catalog.find((item) => item.id === row.modelId);
        return {
          brand: row.brand,
          name: model?.name ?? row.customModel.trim(),
          storage: row.storage.trim(),
          ...(row.network ? { network: row.network } : {}),
          condition: row.condition,
        };
      }),
    );
    duplicateIndexes.forEach((index) => {
      const row = rows[index];
      nextErrors.rows[row.id] = {
        ...nextErrors.rows[row.id],
        duplicate:
          "هذا العرض مكرر؛ احذف أحد الصفين أو غيّر الموديل أو الحالة.",
      };
    });

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    setSubmitError("");
    setCopyStatus("");

    const nextErrors = validateShopInfo();
    setErrors(nextErrors);
    if (
      nextErrors.shopName ||
      nextErrors.area ||
      nextErrors.address ||
      nextErrors.whatsapp ||
      Object.keys(nextErrors.rows).length > 0
    ) {
      return;
    }

    const whatsapp = normalizeSyrianWhatsAppNumber(shopInfo.whatsapp);
    if (!whatsapp) return;

    const offers: SubmissionOffer[] = rows.map((row) => {
      const model = catalog.find((item) => item.id === row.modelId);
      return {
        brand: row.brand,
        name: model?.name ?? row.customModel.trim(),
        storage: row.storage.trim(),
        condition: row.condition === "used" ? "used" : "new",
        ...(row.network ? { network: row.network } : {}),
        price: Number(row.price),
        currency: row.currency,
      };
    });
    const payload: SubmissionPayload = {
      shop: {
        name: shopInfo.name.trim(),
        area: shopInfo.area.trim(),
        address: shopInfo.address.trim(),
        whatsapp,
      },
      offers,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };
    const payloadKey = JSON.stringify(payload);
    const clientId =
      retryRef.current?.payloadKey === payloadKey
        ? retryRef.current.clientId
        : createSubmissionClientId();

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await submitOffer(payload, clientId);
      setMessage(result.message ?? "");
      if (!result.ok) {
        retryRef.current = { payloadKey, clientId: result.clientId };
        setSubmitError(
          "تعذّر فتح واتساب. لم تُمسح البيانات؛ يمكنك نسخ الرسالة وإرسالها يدوياً.",
        );
        return;
      }

      retryRef.current = null;
      setSubmissionChannel(result.channel);
      const links = Array.from(
        new Map(
          offers.map((offer) => {
            const staticProduct = findProduct(
              offer.brand,
              offer.name,
              offer.storage,
              offer.network,
            );
            const id =
              staticProduct?.id ?? `live-${createProductKey(offer)}`;
            return [
              id,
              {
                id,
                label: `${offer.brand} ${offer.name} ${offer.storage}`,
              },
            ] as const;
          }),
        ).values(),
      );
      setSubmittedProducts(links);
      if (result.channel === "firestore") await refresh();
      if (rememberShopInfo) {
        saveShopInfo(payload.shop, true);
      } else {
        saveShopInfo(EMPTY_SHOP_INFO, false);
      }
      resetForm(false);
      setSubmitError("");
      setSubmitted(true);
    } catch (error) {
      retryRef.current = { payloadKey, clientId };
      console.error("Failed to submit offer:", error);
      setSubmitError(
        "تعذّر إرسال الطلب. لم تُمسح البيانات؛ يمكنك المحاولة مجدداً أو نسخ الرسالة.",
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function startNewSubmission() {
    setSubmitted(false);
    setSubmissionChannel(null);
    setMessage("");
    setCopyStatus("");
    setSubmitError("");
    setSubmittedProducts([]);
    resetForm(!rememberShopInfo);
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopyStatus("تم نسخ الرسالة.");
    } catch {
      setCopyStatus("تعذّر النسخ تلقائياً؛ حدّد نص الرسالة وانسخه يدوياً.");
    }
  }

  if (submitted) {
    return (
      <section className="space-y-5" aria-live="polite">
        <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-900 ring-1 ring-emerald-200">
          <h2 className="scroll-mt-24 text-xl font-extrabold">شكراً لك!</h2>
          <p className="mt-2">
            {submissionChannel === "firestore"
              ? "تمت إضافة عرضك للموقع."
              : "تم تجهيز طلبك. سنراجع الأسعار وننشرها بالموقع قريباً."}
          </p>
          {submissionChannel === "firestore" && (
            <div className="mt-4 flex flex-wrap gap-2">
              {submittedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product?id=${encodeURIComponent(product.id)}`}
                  prefetch={false}
                  className="rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200"
                >
                  {product.label}
                </Link>
              ))}
              <Link
                href="/"
                prefetch={false}
                className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white"
              >
                الصفحة الرئيسية
              </Link>
            </div>
          )}
        </div>

        {submissionChannel === "whatsapp" && (
          <details className="rounded-2xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-bold text-slate-800">
              نسخ الرسالة
            </summary>
            <textarea
              readOnly
              value={message}
              dir="auto"
              rows={12}
              aria-label="نص رسالة واتساب"
              className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
            />
            <button
              type="button"
              onClick={copyMessage}
              className="mt-3 rounded-full bg-slate-900 px-5 py-2 font-bold text-white transition hover:bg-slate-700"
            >
              نسخ الرسالة
            </button>
            {copyStatus && (
              <p className="mt-2 text-sm text-slate-600" aria-live="polite">
                {copyStatus}
              </p>
            )}
          </details>
        )}
        <button
          type="button"
          onClick={startNewSubmission}
          className="rounded-full border border-slate-300 px-5 py-2 font-bold text-slate-700 transition hover:bg-slate-50"
        >
          إضافة أسعار جديدة
        </button>
      </section>
    );
  }

  return (
    <form className="space-y-7" onSubmit={handleSubmit} noValidate>
      <div>
        <h2 className="scroll-mt-24 text-xl font-extrabold">
          بيانات المحل
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          يمكنك تذكّر بيانات المحل على هذا الجهاز لتسهيل الإرسال لاحقاً.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold text-slate-700">
          اسم المحل
          <input
            required
            value={shopInfo.name}
            onChange={(event) => updateShopInfo({ name: event.target.value })}
            placeholder="مثال: محل الموبايلات"
            aria-invalid={Boolean(errors.shopName)}
            aria-describedby={errors.shopName ? "shop-name-error" : undefined}
            className={inputClassName}
          />
          {errors.shopName && (
            <span id="shop-name-error" className="mt-1 block text-sm text-red-700">
              {errors.shopName}
            </span>
          )}
        </label>

        <label className="block text-sm font-bold text-slate-700">
          المنطقة أو الحي
          <input
            required
            value={shopInfo.area}
            onChange={(event) => updateShopInfo({ area: event.target.value })}
            placeholder="مثال: اللاذقية - الزراعة"
            aria-invalid={Boolean(errors.area)}
            aria-describedby={errors.area ? "shop-area-error" : undefined}
            className={inputClassName}
          />
          {errors.area && (
            <span id="shop-area-error" className="mt-1 block text-sm text-red-700">{errors.area}</span>
          )}
        </label>

        <label className="block text-sm font-bold text-slate-700 sm:col-span-2">
          العنوان التفصيلي
          <input
            required
            value={shopInfo.address}
            onChange={(event) => updateShopInfo({ address: event.target.value })}
            placeholder="اسم الشارع أو أقرب معلم"
            aria-invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? "shop-address-error" : undefined}
            className={inputClassName}
          />
          {errors.address && (
            <span id="shop-address-error" className="mt-1 block text-sm text-red-700">
              {errors.address}
            </span>
          )}
        </label>

        <label className="block text-sm font-bold text-slate-700 sm:col-span-2">
          رقم واتساب المحل
          <input
            required
            type="tel"
            inputMode="tel"
            dir="ltr"
            value={shopInfo.whatsapp}
            onChange={(event) =>
              updateShopInfo({ whatsapp: event.target.value })
            }
            onBlur={() => {
              const normalized = normalizeSyrianWhatsAppNumber(
                shopInfo.whatsapp,
              );
              if (normalized) updateShopInfo({ whatsapp: normalized });
            }}
            placeholder="0912345678"
            aria-invalid={Boolean(errors.whatsapp)}
            aria-describedby={errors.whatsapp ? "shop-whatsapp-hint shop-whatsapp-error" : "shop-whatsapp-hint"}
            className={inputClassName}
          />
          <span id="shop-whatsapp-hint" className="mt-1 block text-xs font-normal text-slate-500">
            يمكنك إدخال الرقم المحلي بدءاً بـ 09، مثال: 0912345678.
          </span>
          {errors.whatsapp && (
            <span id="shop-whatsapp-error" className="mt-1 block text-sm text-red-700">
              {errors.whatsapp}
            </span>
          )}
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
          <label className="flex min-h-11 items-center gap-3 text-sm font-bold text-slate-700">
            <input
              type="checkbox"
              checked={rememberShopInfo}
              onChange={(event) =>
                saveShopInfo(shopInfo, event.target.checked)
              }
              className="h-5 w-5 rounded border-slate-300 accent-emerald-600"
            />
            تذكّر بيانات محلي على هذا الجهاز
          </label>
          <button
            type="button"
            onClick={() => {
              saveShopInfo(EMPTY_SHOP_INFO, false);
              setErrors(EMPTY_ERRORS);
            }}
            className="min-h-11 rounded px-2 text-sm font-bold text-slate-600 underline-offset-4 hover:text-red-700 hover:underline"
          >
            مسح بيانات المحل
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="scroll-mt-24 text-xl font-extrabold">
            الأسعار والموديلات
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            أضف سعراً لكل سعة تخزين، ويمكنك إرسال حتى 10 موديلات دفعة واحدة.
          </p>
        </div>

        {rows.map((row, index) => (
          <OfferFormRow
            key={row.id}
            index={index}
            value={row}
            errors={errors.rows[row.id] ?? {}}
            onChange={(updates) => updateRow(row.id, updates)}
            onRemove={
              rows.length > 1
                ? () => {
                    setRows((currentRows) =>
                      currentRows.filter((currentRow) => currentRow.id !== row.id),
                    );
                    setErrors(EMPTY_ERRORS);
                  }
                : undefined
            }
          />
        ))}

        {rows.length < 10 && (
          <button
            type="button"
            onClick={() => {
              setRows((currentRows) => [
                ...currentRows,
                createRow(`model-${nextRowId}`),
              ]);
              setNextRowId((currentId) => currentId + 1);
            }}
            className="w-full rounded-xl border border-dashed border-emerald-500 px-4 py-3 font-bold text-emerald-700 transition hover:bg-emerald-50"
          >
            أضف موديل ثاني
          </button>
        )}
      </div>

      <label className="block text-sm font-bold text-slate-700">
        ملاحظات (اختياري)
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="أي تفاصيل إضافية عن الأسعار أو التوفر"
          className={inputClassName}
        />
      </label>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-green-600 px-8 py-3.5 text-lg font-bold text-white shadow-lg shadow-green-600/20 transition hover:-translate-y-0.5 hover:bg-green-700 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 sm:w-auto"
        >
          {isSubmitting ? "جارٍ الإرسال..." : "أرسل الأسعار"}
        </button>
        <p className="mt-3 text-xs text-slate-500">
          عند نجاح الإرسال إلى Firebase تظهر الأسعار مباشرة في الموقع.
        </p>
        {submitError && (
          <div role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            <p>{submitError}</p>
            {message && (
              <details className="mt-3">
                <summary className="cursor-pointer font-bold">
                  نسخ الرسالة
                </summary>
                <textarea
                  readOnly
                  value={message}
                  dir="auto"
                  rows={8}
                  aria-label="نص رسالة واتساب"
                  className="mt-3 w-full rounded-xl border border-amber-200 bg-white p-3"
                />
                <button
                  type="button"
                  onClick={copyMessage}
                  className="mt-3 rounded-full bg-slate-900 px-5 py-2 font-bold text-white"
                >
                  نسخ الرسالة
                </button>
              </details>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
