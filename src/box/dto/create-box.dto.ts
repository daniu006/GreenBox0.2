import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBoxDto {
    
    @IsString()
    code: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsNumber()
    plantId?: number;

}
