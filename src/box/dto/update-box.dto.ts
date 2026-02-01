import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNumber, IsOptional, IsDateString } from 'class-validator';
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
  @IsDateString()
  lastWateringDate?: string | null;

  @IsOptional()
  fcmToken?: string;
}
