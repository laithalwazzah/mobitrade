import { Module, type DynamicModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthController } from "./auth/auth.controller";
import { AdminGuard } from "./auth/admin.guard";
import { FirebaseAuthGuard } from "./auth/firebase-auth.guard";
import { TOKEN_VERIFIER, type TokenVerifier } from "./auth/auth.types";
import { VerifiedEmailGuard } from "./auth/verified-email.guard";
import type { BackendConfig } from "./config/backend-config";
import { BACKEND_CONFIG } from "./config/config.tokens";
import { FirebaseAdminTokenVerifier } from "./firebase/firebase-admin-token-verifier";
import { HealthController } from "./health/health.controller";

@Module({})
export class AppModule {
  static register(config: BackendConfig, verifier?: TokenVerifier): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ThrottlerModule.forRoot([{ ttl: config.rateLimitWindowMs, limit: config.rateLimitMax }]),
      ],
      controllers: [HealthController, AuthController],
      providers: [
        { provide: BACKEND_CONFIG, useValue: config },
        verifier
          ? { provide: TOKEN_VERIFIER, useValue: verifier }
          : {
              provide: TOKEN_VERIFIER,
              inject: [BACKEND_CONFIG],
              useFactory: (backendConfig: BackendConfig) => new FirebaseAdminTokenVerifier(backendConfig),
            },
        FirebaseAuthGuard,
        VerifiedEmailGuard,
        AdminGuard,
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
      exports: [BACKEND_CONFIG, TOKEN_VERIFIER, FirebaseAuthGuard, VerifiedEmailGuard, AdminGuard],
    };
  }
}
