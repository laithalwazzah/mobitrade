import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { redact } from "../../src/common/redaction";

describe("structured log redaction", () => {
  it("redacts token and PII fields recursively", () => {
    assert.deepEqual(redact({
      authorization: "Bearer secret-token",
      nested: { email: "person@example.test", password: "secret", safe: "ok" },
      whatsapp: "963911111111",
      shop: { name: "Private shop", address: "Private address" },
      document: { bytes: Buffer.from([1, 2, 3]), fileName: "private.png" },
    }), {
      authorization: "[REDACTED]",
      nested: { email: "[REDACTED]", password: "[REDACTED]", safe: "ok" },
      whatsapp: "[REDACTED]",
      shop: "[REDACTED]",
      document: "[REDACTED]",
    });
  });

  it("redacts bearer tokens embedded in messages", () => {
    assert.equal(
      redact("failed Bearer abc.def.ghi for person@example.test at +963911111111"),
      "failed Bearer [REDACTED] for [REDACTED_EMAIL] at [REDACTED_PHONE]",
    );
  });
});
