import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadBackendConfig } from "../../src/config/backend-config";

function emulatorEnv(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "test",
    FIREBASE_PROJECT_ID: "demo-sa3erli-sprint05",
    BACKEND_EMULATOR_MODE: "1",
    FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
    CORS_ALLOWLIST: "http://localhost:4000,http://127.0.0.1:4000",
    ...overrides,
  };
}

describe("backend configuration", () => {
  it("loads a loopback-only emulator configuration", () => {
    const config = loadBackendConfig(emulatorEnv());
    assert.equal(config.emulatorMode, true);
    assert.equal(config.firebaseProjectId, "demo-sa3erli-sprint05");
    assert.deepEqual(config.corsAllowlist, ["http://localhost:4000", "http://127.0.0.1:4000"]);
  });

  it("prevents emulator mode from targeting a real project", () => {
    assert.throws(
      () => loadBackendConfig(emulatorEnv({ FIREBASE_PROJECT_ID: "production-project" })),
      /demo-\*/,
    );
  });

  it("prevents emulator mode from targeting a remote host", () => {
    assert.throws(
      () => loadBackendConfig(emulatorEnv({ FIREBASE_AUTH_EMULATOR_HOST: "firebase.example.com:9099" })),
      /loopback/,
    );
  });

  it("forbids a hidden emulator host when emulator mode is off", () => {
    assert.throws(
      () => loadBackendConfig({
        NODE_ENV: "production",
        FIREBASE_PROJECT_ID: "valid-project",
        FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
        CORS_ALLOWLIST: "https://example.test",
      }),
      /forbidden/,
    );
  });

  it("rejects wildcard or path-based CORS entries", () => {
    assert.throws(() => loadBackendConfig(emulatorEnv({ CORS_ALLOWLIST: "https://*.example.test" })), /exact/);
    assert.throws(() => loadBackendConfig(emulatorEnv({ CORS_ALLOWLIST: "https://example.test/path" })), /exact/);
  });

  it("does not read client Firebase credentials as backend credentials", () => {
    const config = loadBackendConfig(emulatorEnv({
      NEXT_PUBLIC_FIREBASE_API_KEY: "must-not-be-used",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "must-not-be-used",
    }));
    assert.equal(config.firebaseProjectId, "demo-sa3erli-sprint05");
    assert.equal("firebaseApiKey" in config, false);
  });
});
