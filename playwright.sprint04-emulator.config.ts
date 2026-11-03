import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "sprint04-emulator.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  outputDir: "test-results/sprint04-emulator",
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4000",
    browserName: "chromium",
    locale: "ar-SY",
    viewport: { width: 1280, height: 800 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
