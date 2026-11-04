import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { FirebaseAuthGuard } from "./firebase-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  @Get("me")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Return the authenticated user's safe identity and authorization claims" })
  @ApiOkResponse({ description: "Safe authenticated identity" })
  me(@Req() request: Request) {
    const identity = request.auth!;
    return {
      user: {
        uid: identity.uid,
        email: identity.email,
        emailVerified: identity.emailVerified,
        providerIds: identity.providerIds,
      },
      claims: { admin: identity.admin },
    };
  }
}
