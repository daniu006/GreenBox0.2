import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { CreateReadingDto } from './dto/create-reading.dto';

@Controller('reading')
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Post()
  create(@Body() createReadingDto: CreateReadingDto) {
    return this.readingService.create(createReadingDto);
  }

  @Post('esp32')
async createFromESP32(@Body() createReadingDto: CreateReadingDto) {
  return this.readingService.create(createReadingDto);
}

  @Get('box/:boxId')
findAll(@Param('boxId') boxId: string, @Query('limit') limit?: string) {
  return this.readingService.findAll(+boxId, limit ? +limit : undefined);
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.readingService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.readingService.remove(+id);
  }
}
