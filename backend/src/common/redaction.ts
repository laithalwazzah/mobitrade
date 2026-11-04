const SENSITIVE_KEYS = /^(authorization|cookie|set-cookie|password|token|idtoken|accesstoken|refreshtoken|email|phone|whatsapp)$/i;

export function redact(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === "string") {
    return value
      .replace(/bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
      .replace(/(?:\+?963|0)?9[0-9]{8}/g, "[REDACTED_PHONE]");
  }
  if (Array.isArray(value)) return value.map((item) => redact(item, seen));
  if (typeof value !== "object" || value === null) return value;
  if (seen.has(value)) return "[CIRCULAR]";
  seen.add(value);
  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    result[key] = SENSITIVE_KEYS.test(key) ? "[REDACTED]" : redact(child, seen);
  }
  return result;
}
