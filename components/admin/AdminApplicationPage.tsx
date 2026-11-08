"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import AdminGate from "./AdminGate";
import AdminShell from "./AdminShell";
import { AdminApiError, adminErrorMessage, type AdminApiAdapter, type AdminApplicationDetail } from "@/lib/adminApi";

type DetailState = { kind: "loading" } | { kind: "error"; message: string } | { kind: "ready"; value: AdminApplicationDetail };

export default function AdminApplicationPage() {
  const id = useSearchParams().get("id")?.trim() ?? "";
  const returnTo = id ? `/admin/application?id=${encodeURIComponent(id)}` : "/admin/application";
  return <AdminGate returnTo={returnTo}>{(adapter) => <ApplicationContent adapter={adapter} ownerId={id} />}</AdminGate>;
}

function ApplicationContent({ adapter, ownerId }: { adapter: AdminApiAdapter; ownerId: string }) {
  const [state, setState] = useState<DetailState>({ kind: "loading" });
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback((signal?: AbortSignal) => {
    if (!ownerId) { setState({ kind: "error", message: "معرّف الطلب غير موجود." }); return; }
    setState({ kind: "loading" });
    void adapter.detail(ownerId, signal).then((value) => setState({ kind: "ready", value })).catch((error) => {
      if (!signal?.aborted) setState({ kind: "error", message: adminErrorMessage(error) });
    });
  }, [adapter, ownerId]);

  useEffect(() => { const controller = new AbortController(); queueMicrotask(() => { if (!controller.signal.aborted) load(controller.signal); }); return () => controller.abort(); }, [load]);

  async function submitDecision() {
    if (busy || state.kind !== "ready" || !decision) return;
    if (decision === "rejected" && !reason.trim()) { setNotice("سبب الرفض مطلوب."); return; }
    setBusy(true); setNotice("");
    try {
      const value = await adapter.decide(ownerId, {
        decision,
        expectedVersion: state.value.version,
        ...(decision === "rejected" ? { reason: reason.trim() } : {}),
      });
      setState({ kind: "ready", value }); setDecision(null); setReason(""); setNotice("تم حفظ القرار بنجاح.");
    } catch (error) {
      setNotice(adminErrorMessage(error));
      if (error instanceof AdminApiError && (error.status === 409 || error.code === "merchant/not-pending")) load();
    } finally { setBusy(false); }
  }

  return <AdminShell title="مراجعة طلب الاعتماد" description="تفاصيل مصرح بها فقط، والوثيقة الخاصة تُجلب عند الطلب دون تخزين دائم.">
    <Link href="/admin" prefetch={false} className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 font-bold">العودة إلى الطلبات</Link>
    {state.kind === "loading" ? <p role="status" className="mt-6 rounded-xl bg-slate-50 p-6 font-bold text-slate-500">جارٍ تحميل الطلب...</p> : state.kind === "error" ? <div role="alert" className="mt-6 rounded-xl bg-red-50 p-5 text-red-900"><p className="font-bold">{state.message}</p><button type="button" onClick={() => load()} className="mt-3 min-h-11 rounded-xl border border-red-300 px-4 font-bold">إعادة المحاولة</button></div> : <div className="mt-6 space-y-6"><ApplicationDetails value={state.value} /><DocumentModal adapter={adapter} ownerId={ownerId} /><section aria-labelledby="decision-title" className="rounded-2xl border border-slate-200 p-4"><h2 id="decision-title" className="text-xl font-extrabold">القرار</h2>{state.value.status !== "pending" ? <p className="mt-3 font-bold text-slate-600">تمت مراجعة هذا الطلب ولا يقبل قراراً آخر.</p> : <><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => { setDecision("approved"); setReason(""); }} className="min-h-11 rounded-xl bg-emerald-600 px-5 font-bold text-white">موافقة</button><button type="button" onClick={() => setDecision("rejected")} className="min-h-11 rounded-xl bg-red-700 px-5 font-bold text-white">رفض</button></div>{decision && <div role="dialog" aria-modal="true" aria-labelledby="decision-dialog-title" className="mt-4 rounded-2xl border border-slate-300 bg-slate-50 p-4"><h3 id="decision-dialog-title" className="font-extrabold">تأكيد {decision === "approved" ? "الموافقة" : "الرفض"}</h3>{decision === "rejected" && <label className="mt-3 block font-bold">سبب الرفض<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-white p-3" /></label>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={submitDecision} className="min-h-11 rounded-xl bg-slate-900 px-4 font-bold text-white disabled:opacity-50">{busy ? "جارٍ الحفظ..." : "تأكيد القرار"}</button><button type="button" disabled={busy} onClick={() => { setDecision(null); setReason(""); }} className="min-h-11 rounded-xl border border-slate-300 px-4 font-bold">إلغاء</button></div></div>}</>}</section>{notice && <p role="status" aria-live="polite" className="rounded-xl bg-slate-100 p-4 font-bold">{notice}</p>}</div>}
  </AdminShell>;
}

function ApplicationDetails({ value }: { value: AdminApplicationDetail }) {
  return <section aria-labelledby="application-details-title" className="rounded-2xl border border-slate-200 p-4"><h2 id="application-details-title" className="text-xl font-extrabold">بيانات الطلب</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2"><Info label="اسم المحل" value={value.shop.name} /><Info label="المنطقة" value={value.shop.area} /><Info label="العنوان" value={value.shop.address} /><Info label="واتساب" value={value.shop.whatsapp} ltr /><Info label="الحالة" value={value.status} /><Info label="الإصدار" value={String(value.version)} /></dl>{value.status === "rejected" && value.rejectionReason && <p className="mt-4 rounded-xl bg-red-50 p-3 font-bold text-red-800">سبب الرفض: {value.rejectionReason}</p>}</section>;
}
function Info({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) { return <div className="min-w-0"><dt className="text-sm font-bold text-slate-500">{label}</dt><dd dir={ltr ? "ltr" : undefined} className={`mt-1 break-words font-bold ${ltr ? "text-left" : ""}`}>{value}</dd></div>; }

function DocumentModal({ adapter, ownerId }: { adapter: AdminApiAdapter; ownerId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("commercial-record");
  const urlRef = useRef<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const clear = useCallback(() => {
    controllerRef.current?.abort(); controllerRef.current = null;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null; setObjectUrl(null); setLoading(false);
  }, []);

  useEffect(() => clear, [clear]);
  useEffect(() => { queueMicrotask(() => { clear(); setOpen(false); setError(""); }); }, [clear, ownerId]);

  async function show() {
    clear(); setOpen(true); setLoading(true); setError("");
    const controller = new AbortController(); controllerRef.current = controller;
    try {
      const result = await adapter.document(ownerId, controller.signal);
      const url = URL.createObjectURL(result.blob); urlRef.current = url; setObjectUrl(url); setFileName(result.fileName);
    } catch (value) {
      if (!controller.signal.aborted) setError(adminErrorMessage(value));
      if (value instanceof AdminApiError && (value.status === 401 || value.status === 403)) clear();
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }
  function close() { clear(); setOpen(false); setError(""); }

    return <section aria-labelledby="document-title" className="rounded-2xl border border-slate-200 p-4"><h2 id="document-title" className="text-xl font-extrabold">السجل التجاري الخاص</h2><p className="mt-2 text-sm leading-7 text-slate-600">لا يُجلب الملف تلقائياً ولا يُحفظ على هذا الجهاز.</p><button type="button" onClick={show} className="mt-3 min-h-11 rounded-xl bg-slate-900 px-4 font-bold text-white">عرض الوثيقة</button>{open && <div role="dialog" aria-modal="true" aria-labelledby="document-dialog-title" className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-3"><div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6"><div className="flex items-center justify-between gap-3"><h3 id="document-dialog-title" className="text-xl font-extrabold">الوثيقة الخاصة</h3><button type="button" onClick={close} aria-label="إغلاق عرض الوثيقة" className="min-h-11 min-w-11 rounded-full border border-slate-300 text-xl font-bold">×</button></div>{loading && <p role="status" className="mt-6 text-center font-bold">جارٍ تحميل الوثيقة...</p>}{error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 font-bold text-red-800">{error}</p>}{objectUrl && <div className="mt-5 space-y-4"><Image unoptimized src={objectUrl} width={960} height={720} alt="صورة السجل التجاري الخاصة" className="mx-auto h-auto max-h-[60vh] w-auto max-w-full rounded-xl object-contain" /><a href={objectUrl} download={fileName} className="inline-flex min-h-11 items-center rounded-xl bg-emerald-600 px-4 font-bold text-white">تنزيل خاص</a></div>}</div></div>}</section>;
}
