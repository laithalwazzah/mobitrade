import { Type } from "class-transformer";
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min } from "class-validator";
import type { MerchantApplicationStatus } from "./merchant.types";

export class CreateMerchantApplicationDto {
  @IsString() @IsNotEmpty() @MaxLength(80)
  name!: string;

  @IsString() @IsNotEmpty() @MaxLength(80)
  area!: string;

  @IsString() @IsNotEmpty() @MaxLength(160)
  address!: string;

  @IsString() @IsNotEmpty() @MaxLength(32)
  whatsapp!: string;
}

export class ListMerchantApplicationsDto {
  @IsOptional() @IsIn(["pending", "approved", "rejected"])
  status?: MerchantApplicationStatus;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  limit = 20;

  @IsOptional() @IsString() @MaxLength(512) @Matches(/^[A-Za-z0-9_-]+$/)
  pageToken?: string;
}

export class MerchantDecisionDto {
  @IsIn(["approved", "rejected"])
  decision!: "approved" | "rejected";

  @Type(() => Number) @IsInt() @Min(1)
  expectedVersion!: number;

  @IsOptional() @IsString() @MaxLength(500)
  reason?: string;
}
