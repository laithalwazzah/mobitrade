import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { Request } from "express";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const identity = context.switchToHttp().getRequest<Request>().auth;
    if (identity?.admin !== true) {
      throw new ForbiddenException({ code: "auth/admin-required", message: "هذه العملية مخصصة للإدارة." });
    }
    return true;
  }
}
