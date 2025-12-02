import { IsNumber, IsString, IsOptional } from "class-validator";

export class CreateGuideDto {
    @IsNumber()
    plantId: number;

    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsNumber()
    step?: number;

    @IsOptional()
    @IsString()
    image?: string;
}
