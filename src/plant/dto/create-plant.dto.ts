import { IsString, IsNumber, IsNotEmpty,Min } from 'class-validator';

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
    @Min(0, { message: 'Water level must be 0 or greater' })
    minWaterLevel: number;

    @IsNumber()
    wateringFrequency: number;
}
