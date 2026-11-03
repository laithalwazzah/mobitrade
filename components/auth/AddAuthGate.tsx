"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AuthLoading, AuthUnavailable } from "./AuthUi";
import MerchantApplicationPanel from "@/components/merchant/MerchantApplicationPanel";

export default function AddAuthGate() {
  const auth = useAuth(); const router = useRouter();
  useEffect(() => { if (auth.available && auth.state.status === "signed-out") router.replace("/login?returnTo=%2Fadd"); if (auth.state.status === "signed-in-unverified") router.replace("/verify-email?returnTo=%2Fadd"); }, [auth.available, auth.state.status, router]);
  if (auth.state.status === "loading" || (auth.available && auth.state.status !== "signed-in-verified")) return <AuthLoading />;
  if (auth.available === false) return <AuthUnavailable />;
  if (auth.state.status !== "signed-in-verified") return <AuthLoading />;
  return <MerchantApplicationPanel uid={auth.state.user.uid} />;
}
