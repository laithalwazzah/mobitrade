import { isFirebaseEmulatorModeActive } from "@/lib/firebaseEmulatorMode";

function isLoopback(hostname: string) {
  return ["localhost", "127.0.0.1", "::1"].includes(hostname);
}

export function resolveBackendApiBase(raw = process.env.NEXT_PUBLIC_API_BASE_URL): string | null {
  const localEmulator = typeof window !== "undefined" && isFirebaseEmulatorModeActive() && isLoopback(window.location.hostname);
  const candidate = raw?.trim() || (localEmulator ? "http://127.0.0.1:4100" : "");
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    if (url.username || url.password || url.search || url.hash) return null;
    if (url.pathname !== "/" && url.pathname !== "") return null;
    if (url.protocol !== "https:" && !(url.protocol === "http:" && isLoopback(url.hostname))) return null;
    return `${url.origin}/api/v1`;
  } catch {
    return null;
  }
}
