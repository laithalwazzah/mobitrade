import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { Request } from "express";

@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const identity = context.switchToHttp().getRequest<Request>().auth;
    if (!identity?.emailVerified) {
      throw new ForbiddenException({
        code: "auth/email-not-verified",
        message: "يجب توثيق البريد الإلكتروني أولًا.",
      });
    }
    return true;
  }
}
