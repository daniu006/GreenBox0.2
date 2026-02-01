import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BoxService } from './box.service';
import { CreateBoxDto } from './dto/create-box.dto';
import { UpdateBoxDto } from './dto/update-box.dto';
import { RegisterTokenDto } from './dto/register-token.dto';

@Controller('box')
export class BoxController {
  constructor(private readonly boxService: BoxService) { }

  @Post()
  create(@Body() createBoxDto: CreateBoxDto) {
    return this.boxService.create(createBoxDto);
  }

  @Get()
  findAll() {
    return this.boxService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boxService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBoxDto: UpdateBoxDto) {
    return this.boxService.update(+id, updateBoxDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boxService.remove(+id);
  }
  @Post(':id/token')
  registerToken(@Param('id') id: string, @Body() registerTokenDto: RegisterTokenDto) {
    console.log(`[BoxServer] 📩 Received registerToken request for Box ID: ${id}`);
    console.log(`[BoxServer] 📦 Body data:`, JSON.stringify(registerTokenDto));
    return this.boxService.registerToken(+id, registerTokenDto);
  }

  @Post('token/logout')
  logoutToken(@Body('token') token: string) {
    return this.boxService.removeToken(token);
  }
}
