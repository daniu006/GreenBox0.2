import { IsString, IsNumber, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class CreatePlantDto {
    @IsString()
    @IsNotEmpty({ message: 'The plant name cannot be empty' })
    name: string;

    @IsNumber()
    minTemperature: number;

    @IsNumber()
    maxTemperature: number;

    @IsNumber()
    minHumidity: number;

    @IsNumber()
    maxHumidity: number;

    @IsNumber()
    lightHours: number;

    @IsNumber()
    minWaterLevel: number;

    @IsNumber()
    @IsOptional()
    minSoilMoisture?: number;

    @IsNumber()
    @IsOptional()
    maxSoilMoisture?: number;

    @IsNumber()
    wateringFrequency: number;
}
