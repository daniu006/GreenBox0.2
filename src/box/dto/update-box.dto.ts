import { PartialType } from '@nestjs/mapped-types';
import { CreateBoxDto } from './create-box.dto';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

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
  lastWateringDate?: Date | null;
}
