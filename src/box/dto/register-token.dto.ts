import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class RegisterTokenDto {
    @IsString()
    token: string;

    @IsOptional()
    @IsBoolean()
    isLoggedIn?: boolean;
}
