import { Controller, Get, Inject, ServiceUnavailableException } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from "@nestjs/swagger";
import type { BackendConfig } from "../config/backend-config";
import { BACKEND_CONFIG } from "../config/config.tokens";
import { TOKEN_VERIFIER, type TokenVerifier } from "../auth/auth.types";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    @Inject(BACKEND_CONFIG) private readonly config: BackendConfig,
    @Inject(TOKEN_VERIFIER) private readonly verifier: TokenVerifier,
  ) {}

  @Get("live")
  @ApiOperation({ summary: "Process liveness probe" })
  @ApiOkResponse({ description: "The API process is alive" })
  live() {
    return { status: "ok", service: "sa3erli-backend" };
  }

  @Get("ready")
  @ApiOperation({ summary: "Configuration and dependency readiness probe" })
  @ApiOkResponse({ description: "The API is ready to accept requests" })
  @ApiServiceUnavailableResponse({ description: "A required dependency is not ready" })
  ready() {
    const firebaseAuth = this.verifier.readiness();
    if (!firebaseAuth.ready) {
      throw new ServiceUnavailableException({ code: "health/not-ready", message: "الخدمة غير جاهزة." });
    }
    return {
      status: "ready",
      dependencies: { firebaseAuth: firebaseAuth.mode },
      environment: this.config.environment,
    };
  }
}
