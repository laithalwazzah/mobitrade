"use client";

import { catalog, getModelsByBrand } from "@/data/catalog";
import type {
  OfferCondition,
  OfferCurrency,
} from "@/lib/submitOffer";

export const OTHER_MODEL_VALUE = "__other__";

export type OfferFormRowValue = {
  id: string;
  brand: string;
  modelId: string;
  customModel: string;
  storage: string;
  condition: OfferCondition | "";
  network: "4G" | "5G" | "";
  price: string;
  currency: OfferCurrency;
};

export type OfferField =
  | "brand"
  | "model"
  | "customModel"
  | "storage"
  | "condition"
  | "network"
  | "price";

type Props = {
  index: number;
  value: OfferFormRowValue;
  errors: Partial<Record<OfferField, string>>;
  onChange: (updates: Partial<OfferFormRowValue>) => void;
  onRemove?: () => void;
};

const fieldClassName =
  "mt-1 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

export default function OfferFormRow({
  index,
  value,
  errors,
  onChange,
  onRemove,
}: Props) {
  const models = getModelsByBrand(value.brand);
  const selectedModel =
    value.modelId === OTHER_MODEL_VALUE
      ? undefined
      : catalog.find((model) => model.id === value.modelId);
  const networks =
    value.modelId === OTHER_MODEL_VALUE
      ? (["4G", "5G"] as const)
      : selectedModel?.network ?? [];
  const customModel = value.modelId === OTHER_MODEL_VALUE;

  function showError(field: OfferField) {
    const error = errors[field];
    return error ? (
      <p id={`${value.id}-${field}-error`} className="mt-1 text-sm text-red-600">
        {error}
      </p>
    ) : null;
  }

  return (
    <fieldset className="rounded-2xl border border-slate-200 p-4 sm:p-5">
      <legend className="px-2 text-lg font-extrabold text-slate-900">
        الموديل {index + 1}
      </legend>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold text-slate-700">
          الشركة
          <select
            required
            value={value.brand}
            onChange={(event) =>
              onChange({
                brand: event.target.value,
                modelId: "",
                customModel: "",
                storage: "",
                network: "",
              })
            }
            aria-invalid={Boolean(errors.brand)}
            aria-describedby={errors.brand ? `${value.id}-brand-error` : undefined}
            className={fieldClassName}
          >
            <option value="">اختر الشركة</option>
            {Array.from(new Set(catalog.map((model) => model.brand))).map(
              (brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ),
            )}
          </select>
          {showError("brand")}
        </label>

        <label className="block text-sm font-bold text-slate-700">
          الموديل
          <select
            required
            value={value.modelId}
            disabled={!value.brand}
            onChange={(event) => {
              const modelId = event.target.value;
              if (modelId === OTHER_MODEL_VALUE) {
                onChange({
                  modelId,
                  customModel: "",
                  storage: "",
                  network: "",
                });
                return;
              }

              const model = models.find((item) => item.id === modelId);
              onChange({
                modelId,
                customModel: "",
                storage: "",
                network: model?.network.length === 1 ? model.network[0] : "",
              });
            }}
            aria-invalid={Boolean(errors.model)}
            aria-describedby={errors.model ? `${value.id}-model-error` : undefined}
            className={fieldClassName}
          >
            <option value="">اختر الموديل</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
            <option value={OTHER_MODEL_VALUE}>موديل غير موجود بالقائمة</option>
          </select>
          {showError("model")}
        </label>

        {customModel && (
          <label className="block text-sm font-bold text-slate-700 sm:col-span-2">
            اسم الموديل
            <input
              required
              value={value.customModel}
              onChange={(event) => onChange({ customModel: event.target.value })}
              placeholder="اكتب اسم الموديل"
              aria-invalid={Boolean(errors.customModel)}
              aria-describedby={
                errors.customModel ? `${value.id}-customModel-error` : undefined
              }
              className={fieldClassName}
            />
            {showError("customModel")}
          </label>
        )}

        <label className="block text-sm font-bold text-slate-700">
          السعة
          {selectedModel ? (
            <select
              required
              value={value.storage}
              onChange={(event) => onChange({ storage: event.target.value })}
              aria-invalid={Boolean(errors.storage)}
              aria-describedby={
                errors.storage ? `${value.id}-storage-error` : undefined
              }
              className={fieldClassName}
            >
              <option value="">اختر السعة</option>
              {selectedModel.storages.map((storage) => (
                <option key={storage} value={storage}>
                  {storage}
                </option>
              ))}
            </select>
          ) : (
            <input
              required
              value={value.storage}
              onChange={(event) => onChange({ storage: event.target.value })}
              placeholder="مثال: 128GB"
              aria-invalid={Boolean(errors.storage)}
              aria-describedby={
                errors.storage ? `${value.id}-storage-error` : undefined
              }
              className={fieldClassName}
            />
          )}
          {showError("storage")}
        </label>

        <div>
          <span className="block text-sm font-bold text-slate-700">الحالة</span>
          <div
            className="mt-1 flex min-h-12 gap-2"
            role="group"
            aria-label="حالة الموبايل"
          >
            {(
              [
                { value: "new", label: "جديد" },
                { value: "used", label: "مستعمل" },
              ] as const
            ).map(({ value: condition, label }) => (
              <button
                key={condition}
                type="button"
                aria-pressed={value.condition === condition}
                onClick={() => onChange({ condition })}
                className={`flex-1 rounded-xl border px-4 py-3 font-bold transition ${
                  value.condition === condition
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {showError("condition")}
        </div>

        {networks.length > 1 && (
          <label className="block text-sm font-bold text-slate-700">
            الشبكة
            <select
              required
              value={value.network}
              onChange={(event) =>
                onChange({
                  network:
                    networks.find((network) => network === event.target.value) ??
                    "",
                })
              }
              aria-invalid={Boolean(errors.network)}
              aria-describedby={
                errors.network ? `${value.id}-network-error` : undefined
              }
              className={fieldClassName}
            >
              <option value="">اختر الشبكة</option>
              {networks.map((network) => (
                <option key={network} value={network}>
                  {network}
                </option>
              ))}
            </select>
            {showError("network")}
          </label>
        )}

        <div>
          <label
            htmlFor={`${value.id}-price`}
            className="block text-sm font-bold text-slate-700"
          >
            السعر
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id={`${value.id}-price`}
              required
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={value.price}
              onChange={(event) => onChange({ price: event.target.value })}
              placeholder="أدخل السعر"
              aria-invalid={Boolean(errors.price)}
              aria-describedby={errors.price ? `${value.id}-price-error` : undefined}
              className={`${fieldClassName} mt-0 min-w-0 flex-1`}
            />
            <div className="flex shrink-0 rounded-xl bg-slate-100 p-1">
              {(["USD", "SYP"] as const).map((currency) => (
                <button
                  key={currency}
                  type="button"
                  aria-pressed={value.currency === currency}
                  onClick={() => onChange({ currency })}
                  className={`rounded-lg px-3 text-sm font-bold transition ${
                    value.currency === currency
                      ? "bg-slate-900 text-white"
                      : "text-slate-600"
                  }`}
                >
                  {currency === "USD" ? "دولار" : "ليرة"}
                </button>
              ))}
            </div>
          </div>
          {showError("price")}
        </div>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-4 text-sm font-bold text-red-600 hover:underline"
        >
          حذف هذا الموديل
        </button>
      )}
    </fieldset>
  );
}
