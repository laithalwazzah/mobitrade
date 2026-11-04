import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { TOKEN_VERIFIER, type TokenVerifier, TokenVerificationError } from "./auth.types";

function unauthorized(code: string, message: string): UnauthorizedException {
  return new UnauthorizedException({ code, message });
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(@Inject(TOKEN_VERIFIER) private readonly verifier: TokenVerifier) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.header("authorization");
    if (!authorization) throw unauthorized("auth/missing-token", "يلزم تسجيل الدخول.");
    const match = /^Bearer ([^\s]+)$/.exec(authorization);
    if (!match) throw unauthorized("auth/invalid-token", "رمز الدخول غير صالح.");
    try {
      request.auth = await this.verifier.verifyIdToken(match[1]!);
      return true;
    } catch (error) {
      if (error instanceof TokenVerificationError && error.code === "expired") {
        throw unauthorized("auth/expired-token", "انتهت جلسة الدخول. سجّل الدخول مجددًا.");
      }
      if (error instanceof TokenVerificationError && error.code === "revoked") {
        throw unauthorized("auth/revoked-token", "أُلغيت جلسة الدخول. سجّل الدخول مجددًا.");
      }
      if (error instanceof TokenVerificationError && error.code === "unavailable") {
        throw unauthorized("auth/unavailable", "تعذر التحقق من جلسة الدخول الآن.");
      }
      throw unauthorized("auth/invalid-token", "رمز الدخول غير صالح.");
    }
  }
}
