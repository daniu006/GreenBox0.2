import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ValidateCodeDto } from './dto/validate-code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validate(@Body() validateCodeDto: ValidateCodeDto) {
    return await this.authService.validateBoxCode(validateCodeDto.code);
  }
}