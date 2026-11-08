import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "sprint07-emulator.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:4000", locale: "ar-SY", trace: "off", screenshot: "only-on-failure" },
  projects: [
    { name: "mobile", use: { browserName: "chromium", viewport: { width: 375, height: 812 } } },
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1280, height: 800 } } },
  ],
});
