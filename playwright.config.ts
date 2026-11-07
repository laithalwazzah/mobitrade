import { defineConfig } from "@playwright/test";

process.env.NEXT_PUBLIC_CATALOG_LOADER_TEST_MODE = "1";
for (const name of [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
]) {
  process.env[name] = "";
}

export default defineConfig({
  testDir: "./tests/e2e",
  testIgnore: ["failure.spec.ts", "form.spec.ts", "live.spec.ts", "sprint04-emulator.spec.ts", "sprint06-emulator.spec.ts"],
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  outputDir: "test-results",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4000",
    locale: "ar-SY",
    screenshot: "only-on-failure",
    trace: "off",
  },
  projects: [
    {
      name: "mobile",
      use: { browserName: "chromium", viewport: { width: 375, height: 812 } },
    },
    {
      name: "desktop",
      use: { browserName: "chromium", viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: "npm run build && npx serve out -l 4000",
    url: "http://127.0.0.1:4000",
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
