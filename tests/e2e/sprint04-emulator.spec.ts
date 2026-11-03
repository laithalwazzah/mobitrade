import { expect, test, type Browser, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  Bytes,
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Firestore,
} from "firebase/firestore";
import {
  AUTH_EMULATOR_URL,
  FIREBASE_EMULATOR_PROJECT_ID,
  FIRESTORE_EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../../lib/firebaseEmulatorMode";

const PASSWORD = "Sprint04-QA-Only!123";
const emails = {
  unverified: "qa-unverified@sprint04.example.test",
  pending: "qa-pending@sprint04.example.test",
  approved: "qa-approved@sprint04.example.test",
  rejected: "qa-rejected@sprint04.example.test",
  second: "qa-second-owner@sprint04.example.test",
  admin: "qa-admin@sprint04.example.test",
} as const;
const artifactRoot = resolve("test-artifacts", "sprint04-qa");
const screenshotRoot = join(artifactRoot, "screenshots");
const results: Array<{ case: string; status: string; error?: string }> = [];
const evidence: Record<string, unknown> = {};
let appCounter = 0;

mkdirSync(screenshotRoot, { recursive: true });

test.afterEach(async ({}, testInfo) => {
  results.push({
    case: testInfo.title,
    status: testInfo.status ?? "unknown",
    ...(testInfo.error?.message ? { error: testInfo.error.message } : {}),
  });
});

test.afterAll(async () => {
  writeFileSync(join(artifactRoot, "qa-results.json"), JSON.stringify({
    project: FIREBASE_EMULATOR_PROJECT_ID,
    liveFirebaseUsed: false,
    generatedAt: new Date().toISOString(),
    results,
    evidence,
  }, null, 2));
});

function reseed(scenario: "status" | "duplicate" | "failure" | "privacy" = "status") {
  execFileSync(process.execPath, ["--import", "tsx", "tests/qa/sprint04-seed.ts", scenario], {
    cwd: process.cwd(),
    stdio: "pipe",
  });
}

function watchBrowser(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  return () => expect(errors, errors.join("\n")).toEqual([]);
}

async function contextPage(browser: Browser, viewport = { width: 1280, height: 800 }) {
  const context = await browser.newContext({ locale: "ar-SY", viewport });
  const page = await context.newPage();
  const clean = watchBrowser(page);
  return { context, page, clean };
}

async function login(page: Page, email: string) {
  await page.goto("/login?returnTo=%2Fadd");
  const form = page.locator("form");
  await form.getByLabel("البريد الإلكتروني").fill(email);
  await form.getByLabel("كلمة المرور").fill(PASSWORD);
  await form.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
}

async function loginToApplication(page: Page, email = emails.second) {
  await login(page, email);
  await expect(page).toHaveURL(/\/add$/);
  await expect(page.getByRole("heading", { name: "طلب اعتماد محل" })).toBeVisible();
}

async function fillValid(page: Page, suffix = "") {
  await page.getByLabel("اسم المحل").fill(`TEST QA Shop${suffix}`);
  await page.getByLabel("المنطقة أو الحي").fill("TEST Area");
  await page.getByLabel("العنوان التفصيلي").fill("TEST Address");
  await page.getByLabel("رقم واتساب المحل").fill("0944444444");
}

function imageBuffer(type: "jpeg" | "png" | "webp", size: number) {
  const signatures = {
    jpeg: Buffer.from("ffd8ffe000104a4649460001ffd9", "hex"),
    png: Buffer.from("89504e470d0a1a0a0000000049454e44ae426082", "hex"),
    webp: Buffer.from("524946460c000000574542505650382000000000", "hex"),
  };
  const output = Buffer.alloc(size);
  signatures[type].copy(output, 0, 0, Math.min(size, signatures[type].length));
  return output;
}

async function setImage(page: Page, type: "jpeg" | "png" | "webp", size: number) {
  const extension = type === "jpeg" ? "jpg" : type;
  await page.getByLabel("صورة السجل التجاري").setInputFiles({
    name: `dummy-commercial-record.${extension}`,
    mimeType: `image/${type}`,
    buffer: imageBuffer(type, size),
  });
}

async function screenshot(page: Page, name: string) {
  const path = join(screenshotRoot, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function authenticatedDb(email: string) {
  const app = initializeApp({
    apiKey: "demo-api-key",
    authDomain: `${FIREBASE_EMULATOR_PROJECT_ID}.localhost`,
    projectId: FIREBASE_EMULATOR_PROJECT_ID,
    appId: "demo-app-id",
  }, `sprint04-qa-${appCounter++}`);
  const auth = getAuth(app);
  connectAuthEmulator(auth, AUTH_EMULATOR_URL, { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, FIRESTORE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
  const credential = await signInWithEmailAndPassword(auth, email, PASSWORD);
  return { app, db, uid: credential.user.uid };
}

function anonymousDb() {
  const app = initializeApp({ projectId: FIREBASE_EMULATOR_PROJECT_ID }, `sprint04-qa-anon-${appCounter++}`);
  const db = getFirestore(app);
  connectFirestoreEmulator(db, FIRESTORE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
  return { app, db };
}

async function closeApp(app: FirebaseApp) {
  await deleteApp(app);
}

async function expectDenied(operation: Promise<unknown>) {
  try {
    await operation;
    throw new Error("Expected Firestore operation to be denied.");
  } catch (error) {
    expect(String(error)).toContain("permission-denied");
  }
}

async function assertNoMerchantRecords(db: Firestore, uid: string) {
  expect((await getDoc(doc(db, "merchantApplications", uid))).exists()).toBe(false);
  expect((await getDoc(doc(db, "merchantDocuments", uid))).exists()).toBe(false);
}

test("01 account gates use signed-out, unverified, and verified emulator accounts", async ({ browser }) => {
  reseed();
  const signedOut = await contextPage(browser, { width: 375, height: 812 });
  await signedOut.page.goto("/add");
  await expect(signedOut.page).toHaveURL(/\/login\?returnTo=%2Fadd$/);
  await screenshot(signedOut.page, "01-signed-out-gate-375");
  signedOut.clean(); await signedOut.context.close();

  const unverified = await contextPage(browser, { width: 375, height: 812 });
  await login(unverified.page, emails.unverified);
  await expect(unverified.page).toHaveURL(/\/verify-email\?returnTo=%2Fadd$/);
  await screenshot(unverified.page, "01-unverified-gate-375");
  unverified.clean(); await unverified.context.close();

  const verified = await contextPage(browser, { width: 1280, height: 800 });
  await loginToApplication(verified.page);
  await screenshot(verified.page, "01-verified-form-1280");
  verified.clean(); await verified.context.close();
  evidence.case01 = { signedOut: "login", unverified: "verify-email", verified: "application form" };
});

test("02 required fields show Arabic errors and preserve entered values", async ({ browser }) => {
  reseed();
  const view = await contextPage(browser, { width: 375, height: 812 });
  await loginToApplication(view.page);
  await view.page.getByLabel("اسم المحل").fill("TEST قيمة محفوظة");
  await view.page.getByRole("button", { name: "إرسال طلب الاعتماد" }).click();
  await expect(view.page.getByLabel("اسم المحل")).toHaveValue("TEST قيمة محفوظة");
  await expect(view.page.locator("[aria-invalid=true]")).toHaveCount(4);
  await expect(view.page.getByText("أرفق صورة السجل التجاري.")).toBeVisible();
  await screenshot(view.page, "02-required-errors-preserve-values-375");
  view.clean(); await view.context.close();
  evidence.case02 = { invalidFields: 4, preservedName: true, arabicErrors: true };
});

test("03 image types and exact 700 KiB boundary are enforced by UI and Firestore", async ({ browser }) => {
  const accepted = [
    { type: "jpeg" as const, size: 24 },
    { type: "png" as const, size: 24 },
    { type: "webp" as const, size: 700 * 1024 },
  ];
  for (const variant of accepted) {
    reseed();
    const view = await contextPage(browser);
    await loginToApplication(view.page);
    await fillValid(view.page, ` ${variant.type}`);
    await setImage(view.page, variant.type, variant.size);
    await view.page.getByRole("button", { name: "إرسال طلب الاعتماد" }).click();
    await expect(view.page.getByRole("heading", { name: "طلبك قيد المراجعة" })).toBeVisible();
    const account = await authenticatedDb(emails.second);
    await expect.poll(async () => (await getDoc(doc(account.db, "merchantDocuments", account.uid))).data()?.contentType).toBe(`image/${variant.type}`);
    const documentSnapshot = await getDoc(doc(account.db, "merchantDocuments", account.uid));
    expect(documentSnapshot.data()?.size).toBe(variant.size);
    if (variant.size === 700 * 1024) await screenshot(view.page, "03-webp-exact-700k-accepted");
    await closeApp(account.app);
    view.clean(); await view.context.close();
  }

  reseed();
  const rejected = await contextPage(browser, { width: 375, height: 812 });
  await loginToApplication(rejected.page);
  await fillValid(rejected.page);
  await rejected.page.getByLabel("صورة السجل التجاري").setInputFiles({ name: "dummy.pdf", mimeType: "application/pdf", buffer: Buffer.from("dummy") });
  await rejected.page.getByRole("button", { name: "إرسال طلب الاعتماد" }).click();
  await expect(rejected.page.locator("#commercial-record-error")).toContainText("JPG أو PNG أو WebP");
  await setImage(rejected.page, "png", 700 * 1024 + 1);
  await rejected.page.getByRole("button", { name: "إرسال طلب الاعتماد" }).click();
  await expect(rejected.page.locator("#commercial-record-error")).toContainText("700 كيلوبايت");
  await screenshot(rejected.page, "03-over-700k-rejected-375");
  const second = await authenticatedDb(emails.second);
  await assertNoMerchantRecords(second.db, second.uid);
  await closeApp(second.app);
  rejected.clean(); await rejected.context.close();
  evidence.case03 = { jpeg: "accepted", png: "accepted", webp700KiB: "accepted", pdf: "rejected", over700KiB: "rejected" };
});

test("04 submit is guarded and creates one atomic private Bytes pair", async ({ browser }) => {
  reseed();
  const view = await contextPage(browser);
  await loginToApplication(view.page);
  await view.page.goto("/add?qaScenario=slow-submit");
  await expect(view.page.getByRole("heading", { name: "طلب اعتماد محل" })).toBeVisible();
  await fillValid(view.page);
  await setImage(view.page, "png", 128);
  const submit = view.page.locator('button[type="submit"]');
  await submit.click();
  await expect(submit).toBeDisabled();
  await expect(submit).toContainText("جارٍ حفظ السجل وإرسال الطلب...");
  await expect(view.page.getByRole("heading", { name: "طلبك قيد المراجعة" })).toBeVisible();
  const second = await authenticatedDb(emails.second);
  const application = await getDoc(doc(second.db, "merchantApplications", second.uid));
  const documentSnapshot = await getDoc(doc(second.db, "merchantDocuments", second.uid));
  expect(Object.keys(application.data() ?? {}).sort()).toEqual(["ownerId", "shop", "status", "submittedAt"]);
  expect(Object.keys(documentSnapshot.data() ?? {}).sort()).toEqual(["bytes", "contentType", "createdAt", "fileName", "size"]);
  expect(documentSnapshot.data()?.bytes).toBeInstanceOf(Bytes);
  expect(documentSnapshot.data()).not.toHaveProperty("url");
  expect(documentSnapshot.data()).not.toHaveProperty("base64");
  await screenshot(view.page, "04-atomic-pending-1280");
  await closeApp(second.app);
  view.clean(); await view.context.close();
  evidence.case04 = { applicationExists: true, documentExists: true, bytesType: true, publicUrl: false };
});

test("05 duplicate and partial merchant records are rejected", async ({ browser }) => {
  reseed("duplicate");
  const view = await contextPage(browser);
  await login(view.page, emails.pending);
  await expect(view.page).toHaveURL(/\/add$/);
  await view.page.goto("/add?qaScenario=duplicate");
  await expect(view.page.getByRole("heading", { name: "طلب اعتماد محل" })).toBeVisible();
  await fillValid(view.page);
  await setImage(view.page, "jpeg", 64);
  await view.page.getByRole("button", { name: "إرسال طلب الاعتماد" }).click();
  await expect(view.page.getByText("يوجد طلب اعتماد سابق لهذا الحساب ولا يمكن إنشاء طلب مكرر.")).toBeVisible();
  await screenshot(view.page, "05-duplicate-rejected");

  const second = await authenticatedDb(emails.second);
  const applicationOnly = setDoc(doc(second.db, "merchantApplications", second.uid), {
    ownerId: second.uid,
    shop: { name: "TEST Partial", area: "TEST", address: "TEST", whatsapp: "963944444444" },
    status: "pending",
    submittedAt: serverTimestamp(),
  });
  await expectDenied(applicationOnly);
  const documentOnly = setDoc(doc(second.db, "merchantDocuments", second.uid), {
    bytes: Bytes.fromUint8Array(new Uint8Array([1, 2, 3])),
    fileName: "commercial-record.png",
    contentType: "image/png",
    size: 3,
    createdAt: serverTimestamp(),
  });
  await expectDenied(documentOnly);
  await assertNoMerchantRecords(second.db, second.uid);
  await closeApp(second.app);
  view.clean(); await view.context.close();
  evidence.case05 = { duplicateDenied: true, applicationOnlyDenied: true, documentOnlyDenied: true };
});

test("06 pending approved and rejected states come from Firestore", async ({ browser }) => {
  reseed("status");
  const states = [
    { email: emails.pending, heading: "طلبك قيد المراجعة", file: "06-pending" },
    { email: emails.approved, heading: "تم اعتماد محلك", file: "06-approved" },
    { email: emails.rejected, heading: "لم يُقبل طلب الاعتماد", file: "06-rejected" },
  ];
  for (const state of states) {
    const view = await contextPage(browser, { width: 375, height: 812 });
    await login(view.page, state.email);
    await expect(view.page).toHaveURL(/\/add$/);
    await expect(view.page.getByRole("heading", { name: state.heading })).toBeVisible();
    if (state.email === emails.rejected) await expect(view.page.getByText(/السبب: TEST QA/)).toBeVisible();
    await screenshot(view.page, `${state.file}-375`);
    view.clean(); await view.context.close();
  }
  const admin = await authenticatedDb(emails.admin);
  const snapshots = await getDocs(collection(admin.db, "merchantApplications"));
  const statuses = snapshots.docs.map((snapshot) => snapshot.data().status).sort();
  expect(statuses).toEqual(["approved", "pending", "rejected"]);
  await closeApp(admin.app);
  evidence.case06 = { firestoreStatuses: statuses, rejectionReasonVisible: true };
});

test("07 price publishing UI is absent and non-approved publishing is denied", async ({ browser }) => {
  reseed();
  for (const email of [emails.pending, emails.approved, emails.rejected]) {
    const view = await contextPage(browser);
    await login(view.page, email);
    await expect(view.page).toHaveURL(/\/add$/);
    await expect(view.page.getByRole("button", { name: /أرسل الأسعار|إرسال الأسعار/ })).toHaveCount(0);
    await expect(view.page.getByText(/العلامة التجارية|اختر الهاتف/)).toHaveCount(0);
    view.clean(); await view.context.close();
  }
  const pending = await authenticatedDb(emails.pending);
  await expectDenied(setDoc(doc(pending.db, "liveOffers", "963911111111_test-phone_new"), {
    shop: { name: "TEST", area: "TEST", address: "TEST", whatsapp: "963911111111" },
    product: { brand: "TEST", name: "TEST Phone", storage: "64GB", network: "4G" },
    condition: "new", price: 1, currency: "USD", updatedAt: serverTimestamp(),
  }));
  await expectDenied(setDoc(doc(pending.db, "submissions", "test-sprint04"), {
    shop: { name: "TEST", area: "TEST", address: "TEST", whatsapp: "963911111111" },
    offers: [{ test: true }], notes: "", status: "pending", createdAt: serverTimestamp(), clientId: "test-client",
  }));
  await closeApp(pending.app);
  evidence.case07 = { priceFormPresent: false, pendingLiveOfferDenied: true, pendingSubmissionDenied: true };
});

test("08 owner second-owner anonymous and admin authorization is enforced", async () => {
  reseed("privacy");
  const owner = await authenticatedDb(emails.pending);
  const second = await authenticatedDb(emails.second);
  const admin = await authenticatedDb(emails.admin);
  const anonymous = anonymousDb();
  expect((await getDoc(doc(owner.db, "merchantApplications", owner.uid))).exists()).toBe(true);
  expect((await getDoc(doc(owner.db, "merchantDocuments", owner.uid))).exists()).toBe(true);
  await expectDenied(getDocs(collection(owner.db, "merchantApplications")));
  await expectDenied(getDoc(doc(second.db, "merchantApplications", owner.uid)));
  await expectDenied(getDoc(doc(anonymous.db, "merchantApplications", owner.uid)));
  expect((await getDocs(collection(admin.db, "merchantApplications"))).size).toBe(3);
  expect((await getDocs(collection(admin.db, "merchantDocuments"))).size).toBe(3);
  await expectDenied(updateDoc(doc(owner.db, "merchantApplications", owner.uid), { status: "approved" }));
  await expectDenied(updateDoc(doc(owner.db, "merchantDocuments", owner.uid), { size: 1 }));
  await Promise.all([owner.app, second.app, admin.app, anonymous.app].map(closeApp));
  evidence.case08 = { ownerOwnRead: true, ownerList: "denied", secondOwnerRead: "denied", anonymousRead: "denied", adminApplications: 3, adminDocuments: 3 };
});

test("09 read document and commit failures recover safely without partial data", async ({ browser }) => {
  reseed("failure");
  const read = await contextPage(browser, { width: 375, height: 812 });
  await loginToApplication(read.page);
  await read.page.goto("/add?qaScenario=read-failure");
  await expect(read.page.getByText("تعذر تحميل حالة طلبك بأمان.")).toBeVisible();
  await screenshot(read.page, "09-read-failure-375");
  await read.page.getByRole("button", { name: "إعادة المحاولة" }).click();
  await expect(read.page.getByRole("heading", { name: "طلب اعتماد محل" })).toBeVisible();
  read.clean(); await read.context.close();

  for (const scenario of ["document-failure", "write-failure"] as const) {
    const view = await contextPage(browser, { width: 375, height: 812 });
    await loginToApplication(view.page);
    await view.page.goto(`/add?qaScenario=${scenario}`);
    await fillValid(view.page, ` ${scenario}`);
    await setImage(view.page, "png", 64);
    await view.page.getByRole("button", { name: "إرسال طلب الاعتماد" }).click();
    await expect(view.page.locator("main").getByRole("alert")).toBeVisible();
    await expect(view.page.getByLabel("اسم المحل")).toHaveValue(`TEST QA Shop ${scenario}`);
    await screenshot(view.page, `09-${scenario}-375`);
    view.clean(); await view.context.close();
  }
  const second = await authenticatedDb(emails.second);
  await assertNoMerchantRecords(second.db, second.uid);
  await closeApp(second.app);
  evidence.case09 = { readRetryRecovered: true, documentFailurePreserved: true, commitFailurePreserved: true, partialRecords: false };
});

test("10 RTL keyboard accessibility alerts and overflow pass at mobile and desktop", async ({ browser }) => {
  reseed();
  for (const viewport of [{ width: 375, height: 812 }, { width: 1280, height: 800 }]) {
    const view = await contextPage(browser, viewport);
    await loginToApplication(view.page);
    expect(await view.page.locator("html").getAttribute("dir")).toBe("rtl");
    expect(await view.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    for (const label of ["اسم المحل", "المنطقة أو الحي", "العنوان التفصيلي", "رقم واتساب المحل", "صورة السجل التجاري"]) {
      await expect(view.page.getByLabel(label)).toBeVisible();
    }
    await view.page.keyboard.press("Tab");
    const focused = view.page.locator(":focus");
    await expect(focused).toBeVisible();
    await view.page.getByRole("button", { name: "إرسال طلب الاعتماد" }).click();
    expect(await view.page.getByRole("alert").count()).toBeGreaterThanOrEqual(5);
    await expect(view.page.locator('a[href*="merchantDocuments"], a[href*="firestore"]')).toHaveCount(0);
    await screenshot(view.page, `10-accessibility-${viewport.width}`);
    view.clean(); await view.context.close();
  }
  evidence.case10 = { rtl: true, keyboardFocus: true, labels: 5, alerts: 5, overflow375: false, overflow1280: false, publicDocumentLink: false };
});
