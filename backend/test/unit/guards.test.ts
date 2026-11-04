import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ForbiddenException, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { AdminGuard } from "../../src/auth/admin.guard";
import { VerifiedEmailGuard } from "../../src/auth/verified-email.guard";
import { identities } from "../helpers/fakes";

function context(auth: Request["auth"]): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ auth }), getResponse: () => ({}), getNext: () => undefined }),
  } as unknown as ExecutionContext;
}

describe("authorization guards", () => {
  it("rejects an unverified email and accepts a verified user", () => {
    const guard = new VerifiedEmailGuard();
    assert.throws(() => guard.canActivate(context(identities.unverified)), ForbiddenException);
    assert.equal(guard.canActivate(context(identities.user)), true);
  });

  it("rejects a normal user and accepts an admin claim", () => {
    const guard = new AdminGuard();
    assert.throws(() => guard.canActivate(context(identities.user)), ForbiddenException);
    assert.equal(guard.canActivate(context(identities.admin)), true);
  });
});
