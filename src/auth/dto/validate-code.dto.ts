import { IsNotEmpty, IsString } from "class-validator";

export class ValidateCodeDto {
    @IsString()
    @IsNotEmpty()
    code: string;
}
