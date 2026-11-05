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
import { FirebaseAdminService } from "./firebase/firebase-admin.service";
import { HealthController } from "./health/health.controller";
import { AdminMerchantApplicationsController } from "./merchant/admin-merchant.controller";
import { FirestoreMerchantApplicationsRepository } from "./merchant/firestore-merchant.repository";
import { MerchantApplicationsController } from "./merchant/merchant.controller";
import { MERCHANT_REPOSITORY, type MerchantApplicationsRepository } from "./merchant/merchant.repository";
import { MerchantApplicationsService } from "./merchant/merchant.service";

@Module({})
export class AppModule {
  static register(
    config: BackendConfig,
    verifier?: TokenVerifier,
    merchantRepository?: MerchantApplicationsRepository,
  ): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ThrottlerModule.forRoot([{ ttl: config.rateLimitWindowMs, limit: config.rateLimitMax }]),
      ],
      controllers: [HealthController, AuthController, MerchantApplicationsController, AdminMerchantApplicationsController],
      providers: [
        { provide: BACKEND_CONFIG, useValue: config },
        {
          provide: FirebaseAdminService,
          inject: [BACKEND_CONFIG],
          useFactory: (backendConfig: BackendConfig) => new FirebaseAdminService(backendConfig),
        },
        verifier
          ? { provide: TOKEN_VERIFIER, useValue: verifier }
          : {
              provide: TOKEN_VERIFIER,
              inject: [FirebaseAdminService],
              useFactory: (firebase: FirebaseAdminService) => new FirebaseAdminTokenVerifier(firebase),
            },
        merchantRepository
          ? { provide: MERCHANT_REPOSITORY, useValue: merchantRepository }
          : {
              provide: MERCHANT_REPOSITORY,
              inject: [FirebaseAdminService],
              useFactory: (firebase: FirebaseAdminService) => new FirestoreMerchantApplicationsRepository(firebase),
            },
        MerchantApplicationsService,
        FirebaseAuthGuard,
        VerifiedEmailGuard,
        AdminGuard,
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
      exports: [BACKEND_CONFIG, TOKEN_VERIFIER, MERCHANT_REPOSITORY, FirebaseAuthGuard, VerifiedEmailGuard, AdminGuard],
    };
  }
}
