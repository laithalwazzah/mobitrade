"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createAdminApiAdapter, type AdminApiAdapter } from "@/lib/adminApi";

type GateState =
  | { kind: "checking" }
  | { kind: "unavailable" }
  | { kind: "forbidden" }
  | { kind: "allowed"; adapter: AdminApiAdapter };

export default function AdminGate({ children, returnTo }: { children: (adapter: AdminApiAdapter) => React.ReactNode; returnTo: string }) {
  const auth = useAuth();
  const router = useRouter();
  const adapterRef = useRef<AdminApiAdapter | null>(null);
  const [gate, setGate] = useState<GateState>({ kind: "checking" });

  useEffect(() => {
    if (auth.state.status === "loading") return;
    if (auth.available === false) {
      queueMicrotask(() => setGate({ kind: "unavailable" }));
      return;
    }
    if (auth.state.status === "signed-out") {
      queueMicrotask(() => setGate({ kind: "checking" }));
      router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (auth.state.status === "signed-in-unverified") {
      queueMicrotask(() => setGate({ kind: "checking" }));
      router.replace(`/verify-email?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    const controller = new AbortController();
    const adapter = createAdminApiAdapter();
    adapterRef.current = adapter;
    if (!adapter.available) {
      queueMicrotask(() => setGate({ kind: "unavailable" }));
      return () => { controller.abort(); adapterRef.current = null; };
    }
    queueMicrotask(() => setGate({ kind: "checking" }));
    void adapter.identity(controller.signal)
      .then((identity) => setGate(identity.admin ? { kind: "allowed", adapter } : { kind: "forbidden" }))
      .catch(() => setGate({ kind: "forbidden" }));
    return () => { controller.abort(); adapterRef.current = null; };
  }, [auth.available, auth.state.status, returnTo, router]);

  if (gate.kind === "checking" || auth.state.status !== "signed-in-verified") {
    return <AdminMessage role="status" title="جارٍ التحقق من صلاحية الإدارة" text="لن تُعرض أي بيانات إدارية قبل اكتمال التحقق الموثوق." pulse />;
  }
  if (gate.kind === "unavailable") return <AdminMessage role="alert" title="الخدمة الإدارية غير متاحة" text="تحقق من إعداد Backend ثم أعد المحاولة." />;
  if (gate.kind === "forbidden") return <AdminMessage role="alert" title="غير مصرح" text="هذا الحساب لا يملك صلاحية الوصول إلى لوحة الإدارة." />;
  return <>{children(gate.adapter)}</>;
}

function AdminMessage({ title, text, role, pulse = false }: { title: string; text: string; role: "status" | "alert"; pulse?: boolean }) {
  return <main className="mx-auto w-full max-w-3xl px-4 py-16"><section role={role} className={`rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm ${pulse ? "animate-pulse" : ""}`}><h1 className="text-2xl font-extrabold">{title}</h1><p className="mt-3 leading-8 text-slate-600">{text}</p></section></main>;
}
