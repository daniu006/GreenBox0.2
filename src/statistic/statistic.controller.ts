import { Controller, Get, Post, Param } from '@nestjs/common';
import { StatisticService } from './statistic.service';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get('box/:boxId')
  findByBoxId(@Param('boxId') boxId: string) {
    return this.statisticService.findByBoxId(+boxId);
  }

  @Get('box/:boxId/latest')
  findLatest(@Param('boxId') boxId: string) {
    return this.statisticService.findLatestByBoxId(+boxId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.statisticService.findOne(+id);
  }

  @Post('calculate/:boxId')
  calculate(@Param('boxId') boxId: string) {
    return this.statisticService.calculateStatics(+boxId);
  }
}
