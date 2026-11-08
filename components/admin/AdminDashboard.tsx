"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import AdminGate from "./AdminGate";
import AdminShell from "./AdminShell";
import { adminErrorMessage, type AdminApiAdapter, type AdminApplicationListItem, type AdminApplicationStatus, type AdminSummary } from "@/lib/adminApi";

type LoadState<T> = { kind: "loading" } | { kind: "error"; message: string } | { kind: "ready"; value: T };

export default function AdminDashboard() {
  return <AdminGate returnTo="/admin">{(adapter) => <DashboardContent adapter={adapter} />}</AdminGate>;
}

function DashboardContent({ adapter }: { adapter: AdminApiAdapter }) {
  const [summary, setSummary] = useState<LoadState<AdminSummary>>({ kind: "loading" });
  const [list, setList] = useState<LoadState<{ items: AdminApplicationListItem[]; nextPageToken: string | null }>>({ kind: "loading" });
  const [status, setStatus] = useState<AdminApplicationStatus | "all">("all");
  const [limit, setLimit] = useState(20);
  const [pageToken, setPageToken] = useState<string | undefined>();
  const [history, setHistory] = useState<string[]>([]);
  const generation = useRef(0);

  const loadSummary = useCallback((signal?: AbortSignal) => {
    setSummary({ kind: "loading" });
    void adapter.summary(signal).then((value) => setSummary({ kind: "ready", value })).catch((error) => {
      if (!signal?.aborted) setSummary({ kind: "error", message: adminErrorMessage(error) });
    });
  }, [adapter]);

  const loadList = useCallback((signal?: AbortSignal) => {
    const current = ++generation.current;
    setList({ kind: "loading" });
    void adapter.list({ status: status === "all" ? undefined : status, limit, pageToken }, signal)
      .then((value) => { if (current === generation.current) setList({ kind: "ready", value }); })
      .catch((error) => { if (!signal?.aborted && current === generation.current) setList({ kind: "error", message: adminErrorMessage(error) }); });
  }, [adapter, limit, pageToken, status]);

  useEffect(() => { const controller = new AbortController(); queueMicrotask(() => { if (!controller.signal.aborted) loadSummary(controller.signal); }); return () => controller.abort(); }, [loadSummary]);
  useEffect(() => { const controller = new AbortController(); queueMicrotask(() => { if (!controller.signal.aborted) loadList(controller.signal); }); return () => controller.abort(); }, [loadList]);

  function resetPage(nextStatus: AdminApplicationStatus | "all", nextLimit = limit) {
    setStatus(nextStatus); setLimit(nextLimit); setPageToken(undefined); setHistory([]);
  }

  return <AdminShell title="طلبات اعتماد المحلات" description="مراجعة الطلبات عبر Backend الموثوق دون قراءة Firestore مباشرة من المتصفح.">
    <div className="space-y-8">
      <section aria-labelledby="admin-summary-title"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="admin-summary-title" className="text-xl font-extrabold">الملخص العالمي</h2><button type="button" onClick={() => loadSummary()} className="min-h-11 rounded-xl border border-slate-300 px-4 font-bold">تحديث الملخص</button></div><SummaryView state={summary} retry={() => loadSummary()} /></section>
      <section aria-labelledby="admin-list-title" className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="admin-list-title" className="text-xl font-extrabold">قائمة الطلبات</h2><button type="button" onClick={() => loadList()} className="min-h-11 rounded-xl border border-slate-300 px-4 font-bold">تحديث القائمة</button></div>
        <div className="grid gap-3 sm:grid-cols-2"><label className="font-bold">الحالة<select value={status} onChange={(event) => resetPage(event.target.value as AdminApplicationStatus | "all")} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3"><option value="all">الكل</option><option value="pending">قيد المراجعة</option><option value="approved">مقبول</option><option value="rejected">مرفوض</option></select></label><label className="font-bold">عدد النتائج<select value={limit} onChange={(event) => resetPage(status, Number(event.target.value))} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3"><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></label></div>
        <ListView state={list} retry={() => loadList()} />
        {list.kind === "ready" && <nav aria-label="صفحات الطلبات" className="flex flex-wrap justify-between gap-3"><button type="button" disabled={history.length === 0} onClick={() => { const previous = [...history]; setPageToken(previous.pop()); setHistory(previous); }} className="min-h-11 rounded-xl border border-slate-300 px-4 font-bold disabled:opacity-40">السابق</button><button type="button" disabled={!list.value.nextPageToken} onClick={() => { if (!list.value.nextPageToken) return; setHistory((current) => [...current, pageToken ?? ""]); setPageToken(list.value.nextPageToken); }} className="min-h-11 rounded-xl bg-slate-900 px-4 font-bold text-white disabled:opacity-40">التالي</button></nav>}
      </section>
    </div>
  </AdminShell>;
}

function SummaryView({ state, retry }: { state: LoadState<AdminSummary>; retry: () => void }) {
  if (state.kind === "loading") return <p role="status" className="mt-4 rounded-xl bg-slate-50 p-5 font-bold text-slate-500">جارٍ تحميل الملخص...</p>;
  if (state.kind === "error") return <ErrorBox message={state.message} retry={retry} />;
  const cards = [["الإجمالي", state.value.total], ["قيد المراجعة", state.value.pending], ["مقبول", state.value.approved], ["مرفوض", state.value.rejected]] as const;
  return <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-extrabold text-emerald-700">{value}</p></div>)}</div>;
}

function ListView({ state, retry }: { state: LoadState<{ items: AdminApplicationListItem[]; nextPageToken: string | null }>; retry: () => void }) {
  if (state.kind === "loading") return <p role="status" className="rounded-xl bg-slate-50 p-5 font-bold text-slate-500">جارٍ تحميل الطلبات...</p>;
  if (state.kind === "error") return <ErrorBox message={state.message} retry={retry} />;
  if (state.value.items.length === 0) return <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center font-bold text-slate-500">لا توجد طلبات مطابقة.</p>;
  return <div className="grid gap-3">{state.value.items.map((item) => <article key={item.ownerId} className="min-w-0 rounded-2xl border border-slate-200 p-4"><div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-lg font-extrabold">{item.shop.name}</h3><p className="mt-1 text-sm text-slate-500">{item.shop.area} · {statusLabel(item.status)}</p></div><Link href={`/admin/application?id=${encodeURIComponent(item.ownerId)}`} prefetch={false} className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 font-bold text-white">مراجعة الطلب</Link></div></article>)}</div>;
}

function ErrorBox({ message, retry }: { message: string; retry: () => void }) { return <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900"><p className="font-bold">{message}</p><button type="button" onClick={retry} className="mt-3 min-h-11 rounded-xl border border-red-300 px-4 font-bold">إعادة المحاولة</button></div>; }
function statusLabel(value: AdminApplicationStatus) { return value === "pending" ? "قيد المراجعة" : value === "approved" ? "مقبول" : "مرفوض"; }
