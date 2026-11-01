import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import test from "node:test";

function loadFirebaseConfig() {
  const text = readFileSync(".env.local", "utf8");
  const values = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) values.set(match[1], match[2].replace(/^['"]|['"]$/g, ""));
  }
  const projectId = values.get("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  const apiKey = values.get("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!projectId || !apiKey) throw new Error("Firebase test variables are missing");
  return { projectId, apiKey };
}

type FirestoreValue = Record<string, unknown>;

function value(input: unknown): FirestoreValue {
  if (typeof input === "string") return { stringValue: input };
  if (typeof input === "boolean") return { booleanValue: input };
  if (typeof input === "number") return Number.isInteger(input)
    ? { integerValue: String(input) }
    : { doubleValue: input };
  if (Array.isArray(input)) return { arrayValue: { values: input.map(value) } };
  if (typeof input === "object" && input !== null) return { mapValue: { fields: fields(input as Record<string, unknown>) } };
  throw new Error("Unsupported Firestore REST test value");
}

function fields(input: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(input).map(([key, item]) => [key, value(item)]));
}

function rememberCreated(collection: string, id: string) {
  mkdirSync("test-artifacts", { recursive: true });
  const path = "test-artifacts/firestore-document-ids.json";
  let current: { collection: string; id: string }[] = [];
  try { current = JSON.parse(readFileSync(path, "utf8")); } catch {}
  if (!current.some((item) => item.collection === collection && item.id === id)) {
    current.push({ collection, id });
    writeFileSync(path, `${JSON.stringify(current, null, 2)}\n`);
  }
}

test("2. published Firestore rules enforce the complete REST contract", async (t) => {
  const { projectId, apiKey } = loadFirebaseConfig();
  const root = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  const commitUrl = `${root}:commit?key=${encodeURIComponent(apiKey)}`;
  const token = `${Date.now()}`;
  const liveId = `963911111111_test-rules-${token}-64gb-4g_new`;
  const submissionId = `test-rules-${token}`;
  const documentName = (collection: string, id: string) =>
    `projects/${projectId}/databases/(default)/documents/${collection}/${id}`;
  const validLive = {
    shop: { name: "TEST - احذفني", area: "TEST Area", address: "TEST Address", whatsapp: "963911111111" },
    product: { brand: "Samsung", name: `TEST Rules ${token}`, storage: "64GB", network: "4G" },
    condition: "new",
    price: 123,
    currency: "USD",
  };

  async function commit(collection: string, id: string, data: Record<string, unknown>, timestampField?: string) {
    const body = {
      writes: [{
        update: { name: documentName(collection, id), fields: fields(data) },
        ...(timestampField ? { updateTransforms: [{ fieldPath: timestampField, setToServerValue: "REQUEST_TIME" }] } : {}),
      }],
    };
    const response = await fetch(commitUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return { status: response.status, body };
  }

  async function expectStatus(label: string, operation: () => Promise<{ status: number; body?: unknown }>, expected: number) {
    await t.test(label, async () => {
      const result = await operation();
      const request = result.body === undefined
        ? "<no request body>"
        : JSON.stringify(result.body).replaceAll(projectId, "<project>");
      assert.equal(result.status, expected, `unexpected HTTP status; request=${request}`);
    });
  }

  await expectStatus("valid liveOffers create/replace is ALLOWED", async () => {
    const result = await commit("liveOffers", liveId, validLive, "updatedAt");
    if (result.status === 200) rememberCreated("liveOffers", liveId);
    return result;
  }, 200);
  await expectStatus("public liveOffers read is ALLOWED", async () => ({ status: (await fetch(`${root}/liveOffers/${liveId}?key=${encodeURIComponent(apiKey)}`)).status }), 200);

  const denied: [string, string, Record<string, unknown>, string?][] = [
    ["extra top-level field", liveId, { ...validLive, extra: true }, "updatedAt"],
    ["extra shop field", liveId, { ...validLive, shop: { ...validLive.shop, extra: "x" } }, "updatedAt"],
    ["extra product field", liveId, { ...validLive, product: { ...validLive.product, extra: "x" } }, "updatedAt"],
    ["wrong whatsapp prefix", liveId, { ...validLive, shop: { ...validLive.shop, whatsapp: "963922222222" } }, "updatedAt"],
    ["invalid document id", `bad_${token}`, validLive, "updatedAt"],
    ["price zero", liveId, { ...validLive, price: 0 }, "updatedAt"],
    ["price negative", liveId, { ...validLive, price: -1 }, "updatedAt"],
    ["price one billion", liveId, { ...validLive, price: 1_000_000_000 }, "updatedAt"],
    ["price string", liveId, { ...validLive, price: "123" }, "updatedAt"],
    ["bad condition", liveId, { ...validLive, condition: "broken" }, "updatedAt"],
    ["bad currency", liveId, { ...validLive, currency: "EUR" }, "updatedAt"],
    ["bad network", liveId, { ...validLive, product: { ...validLive.product, network: "6G" } }, "updatedAt"],
    ["shop name too long", liveId, { ...validLive, shop: { ...validLive.shop, name: `TEST ${"x".repeat(81)}` } }, "updatedAt"],
    ["missing updatedAt", liveId, validLive],
  ];
  for (const [label, id, data, transform] of denied) {
    await expectStatus(`${label} is DENIED`, () => commit("liveOffers", id, data, transform), 403);
  }
  await expectStatus("updatedAt literal timestamp is DENIED", async () => {
    const body = { writes: [{ update: { name: documentName("liveOffers", liveId), fields: { ...fields(validLive), updatedAt: { timestampValue: new Date().toISOString() } } } }] };
    const response = await fetch(commitUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return { status: response.status, body };
  }, 403);
  await expectStatus("liveOffers delete is DENIED", async () => ({ status: (await fetch(`${root}/liveOffers/${liveId}?key=${encodeURIComponent(apiKey)}`, { method: "DELETE" })).status }), 403);

  const validSubmission = {
    shop: validLive.shop,
    offers: [{ ...validLive.product, condition: "new", price: 123, currency: "USD" }],
    status: "pending",
    clientId: submissionId,
  };
  await expectStatus("valid submissions create is ALLOWED", async () => {
    const result = await commit("submissions", submissionId, validSubmission, "createdAt");
    if (result.status === 200) rememberCreated("submissions", submissionId);
    return result;
  }, 200);
  await expectStatus("submissions document read is DENIED", async () => ({ status: (await fetch(`${root}/submissions/${submissionId}?key=${encodeURIComponent(apiKey)}`)).status }), 403);
  await expectStatus("submissions list is DENIED", async () => ({ status: (await fetch(`${root}/submissions?pageSize=1&key=${encodeURIComponent(apiKey)}`)).status }), 403);
  await expectStatus("submissions update is DENIED", () => commit("submissions", submissionId, validSubmission, "createdAt"), 403);
  await expectStatus("submissions delete is DENIED", async () => ({ status: (await fetch(`${root}/submissions/${submissionId}?key=${encodeURIComponent(apiKey)}`, { method: "DELETE" })).status }), 403);
  await expectStatus("unknown collection write is DENIED", () => commit("unknown", `test-${token}`, { name: "TEST" }, "updatedAt"), 403);
  await expectStatus("test liveOffers document is restored to a valid payload", () => commit("liveOffers", liveId, validLive, "updatedAt"), 200);
});
