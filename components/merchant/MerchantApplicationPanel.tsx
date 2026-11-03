"use client";

import { useEffect, useRef, useState } from "react";
import { createMerchantApplicationAdapter, type MerchantApplicationAdapter } from "@/lib/firebaseMerchantAdapter";
import { hasMerchantValidationErrors, mapMerchantError, validateMerchantApplication, type MerchantApplication, type MerchantApplicationInput, type MerchantValidationErrors } from "@/lib/merchantApplication";

const emptyInput: MerchantApplicationInput = { name: "", area: "", address: "", whatsapp: "" };
const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";
type ViewState = { kind: "loading" } | { kind: "unavailable" } | { kind: "error" } | { kind: "empty" } | { kind: "application"; application: MerchantApplication };

export default function MerchantApplicationPanel({ uid }: { uid: string }) {
  const adapterRef = useRef<MerchantApplicationAdapter | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [view, setView] = useState<ViewState>({ kind: "loading" });
  const [input, setInput] = useState(emptyInput);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<MerchantValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const adapter = createMerchantApplicationAdapter();
    adapterRef.current = adapter;
    if (!adapter.available) {
      queueMicrotask(() => active && setView({ kind: "unavailable" }));
      return () => { active = false; adapterRef.current = null; };
    }
    const unsubscribe = adapter.subscribe(
      uid,
      (application) => { if (active) setView(application ? { kind: "application", application } : { kind: "empty" }); },
      () => { if (active) setView({ kind: "error" }); },
    );
    return () => { active = false; adapterRef.current = null; unsubscribe(); };
  }, [uid, refresh]);

  function update(key: keyof MerchantApplicationInput, value: string) {
    setInput((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting || view.kind !== "empty") return;
    const nextErrors = validateMerchantApplication(input, file);
    setErrors(nextErrors);
    setSubmitError(null);
    if (hasMerchantValidationErrors(nextErrors) || !file) return;
    setSubmitting(true);
    try {
      await adapterRef.current?.submit(uid, input, file);
    } catch (error) {
      setSubmitError(mapMerchantError(error));
      setSubmitting(false);
    }
  }

  if (view.kind === "loading") return <div role="status" className="py-12 text-center font-bold text-slate-500">جارٍ تحميل حالة طلب الاعتماد...</div>;
  if (view.kind === "unavailable") return <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 font-bold leading-7 text-amber-900">خدمة طلبات اعتماد المحلات غير متاحة حالياً. لم تُحفظ أي موافقة محلياً.</div>;
  if (view.kind === "error") return <div className="space-y-4 text-center"><p role="alert" className="rounded-xl bg-red-50 p-4 font-bold text-red-800">تعذر تحميل حالة طلبك بأمان.</p><button type="button" onClick={() => { setView({ kind: "loading" }); setRefresh((value) => value + 1); }} className="min-h-12 rounded-xl bg-slate-900 px-5 font-bold text-white">إعادة المحاولة</button></div>;
  if (view.kind === "application") return <ApplicationStatus application={view.application} />;

  return <form onSubmit={submit} noValidate className="space-y-6">
    <div><h2 className="text-xl font-extrabold">طلب اعتماد محل</h2><p className="mt-2 text-sm leading-7 text-slate-600">أدخل بيانات محلك وأرفق صورة واضحة من السجل التجاري. الملف خاص ولا يُنشأ له رابط عام.</p></div>
    {submitError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold leading-6 text-red-800">{submitError}</p>}
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="اسم المحل" id="merchant-name" error={errors.name}><input id="merchant-name" value={input.name} onChange={(event) => update("name", event.target.value)} className={inputClass} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "merchant-name-error" : undefined} /></Field>
      <Field label="المنطقة أو الحي" id="merchant-area" error={errors.area}><input id="merchant-area" value={input.area} onChange={(event) => update("area", event.target.value)} className={inputClass} aria-invalid={Boolean(errors.area)} aria-describedby={errors.area ? "merchant-area-error" : undefined} /></Field>
      <Field label="العنوان التفصيلي" id="merchant-address" error={errors.address} wide><input id="merchant-address" value={input.address} onChange={(event) => update("address", event.target.value)} className={inputClass} aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? "merchant-address-error" : undefined} /></Field>
      <Field label="رقم واتساب المحل" id="merchant-whatsapp" error={errors.whatsapp} wide><input id="merchant-whatsapp" type="tel" inputMode="tel" dir="ltr" value={input.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} className={`${inputClass} text-left`} placeholder="0912345678" aria-invalid={Boolean(errors.whatsapp)} aria-describedby={errors.whatsapp ? "merchant-whatsapp-error" : undefined} /></Field>
      <div className="sm:col-span-2"><label htmlFor="commercial-record" className="block text-sm font-bold text-slate-700">صورة السجل التجاري</label><input id="commercial-record" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setErrors((current) => ({ ...current, file: undefined })); }} aria-invalid={Boolean(errors.file)} aria-describedby="commercial-record-hint commercial-record-error" className="mt-2 block min-h-12 w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm file:ml-3 file:min-h-10 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:font-bold file:text-white" /><p id="commercial-record-hint" className="mt-2 text-xs leading-6 text-slate-500">JPG أو PNG أو WebP فقط، وبحد أقصى 700 كيلوبايت.</p>{errors.file && <p id="commercial-record-error" role="alert" className="mt-1 text-sm font-bold text-red-700">{errors.file}</p>}</div>
    </div>
    <button type="submit" disabled={submitting} className="min-h-12 w-full rounded-xl bg-emerald-500 px-6 font-extrabold text-slate-950 hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60">{submitting ? "جارٍ حفظ السجل وإرسال الطلب..." : "إرسال طلب الاعتماد"}</button>
    <p className="text-xs leading-6 text-slate-500">لا يمكنك إنشاء طلب آخر أو إضافة الأسعار أثناء المراجعة. الموافقة لا تُحفظ على هذا الجهاز بل تُقرأ من Firebase.</p>
  </form>;
}

function Field({ label, id, error, wide, children }: { label: string; id: string; error?: string; wide?: boolean; children: React.ReactNode }) {
  return <div className={wide ? "sm:col-span-2" : undefined}><label htmlFor={id} className="block text-sm font-bold text-slate-700">{label}</label>{children}{error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-bold text-red-700">{error}</p>}</div>;
}

function ApplicationStatus({ application }: { application: MerchantApplication }) {
  if (application.status === "pending") return <section aria-labelledby="merchant-status" className="space-y-4 text-center"><span aria-hidden="true" className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">⏳</span><h2 id="merchant-status" className="text-xl font-extrabold">طلبك قيد المراجعة</h2><p className="leading-8 text-slate-600">استلمنا طلب اعتماد <strong>{application.shop.name}</strong>. لا يمكن إرسال طلب مكرر أو نشر أسعار قبل صدور القرار.</p></section>;
  if (application.status === "approved") return <section aria-labelledby="merchant-status" className="space-y-4 text-center"><span aria-hidden="true" className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">✓</span><h2 id="merchant-status" className="text-xl font-extrabold text-emerald-800">تم اعتماد محلك</h2><p className="leading-8 text-slate-600">صلاحية الاعتماد مثبتة في Firebase. نشر الأسعار سيُفعّل في السبرنت المخصص له، لذلك لا يظهر نموذج النشر الآن.</p></section>;
  return <section aria-labelledby="merchant-status" className="space-y-4 text-center"><span aria-hidden="true" className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">×</span><h2 id="merchant-status" className="text-xl font-extrabold text-red-800">لم يُقبل طلب الاعتماد</h2>{application.rejectionReason && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-800">السبب: {application.rejectionReason}</p>}<p className="leading-8 text-slate-600">لا يمكنك نشر الأسعار أو إنشاء طلب مكرر. تواصل مع الإدارة لتصحيح الطلب.</p></section>;
}
