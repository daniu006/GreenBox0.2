import { IsNumber, IsOptional } from "class-validator";

export class CreateReadingDto {

    @IsNumber()
    boxId: number;

    @IsNumber()
    temperature: number;

    @IsNumber()
    humidity: number; 
    
    @IsNumber()
    lightHours: number;

    @IsNumber()
    waterLevel: number; 

}
