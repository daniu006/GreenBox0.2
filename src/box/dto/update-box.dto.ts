import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNumber, IsOptional, IsDateString, IsString } from 'class-validator';
import { CreateBoxDto } from './create-box.dto';

export class UpdateBoxDto extends PartialType(CreateBoxDto) {
  @IsOptional()
  @IsNumber()
  wateringCount?: number;

  @IsOptional()
  @IsBoolean()
  ledStatus?: boolean;

  @IsOptional()
  @IsBoolean()
  pumpStatus?: boolean;

  @IsOptional()
  @IsBoolean()
  manualLed?: boolean;

  @IsOptional()
  @IsBoolean()
  manualPump?: boolean;

  @IsOptional()
  @IsDateString()
  lastWateringDate?: string | null;

  @IsOptional()
  @IsString({ each: true })
  fcmTokens?: string[];
}
