import { Controller, Get, Param } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('box/:boxId/evolution')
  getEvolution(@Param('boxId') boxId: string) {
    return this.historyService.getEvolution(+boxId);
  }

  @Get('box/:boxId/latest')
  findLatestByBoxId(@Param('boxId') boxId: string) {
    return this.historyService.findLatestByBoxId(+boxId);
  }

  @Get('box/:boxId/type/:type')
  findByBoxIdAndType(
    @Param('boxId') boxId: string,
    @Param('type') type: 'daily' | 'weekly'
  ) {
    return this.historyService.findByBoxIdAndType(+boxId, type);
  }

  @Get('box/:boxId')
  findByBoxId(@Param('boxId') boxId: string) {
    return this.historyService.findByBoxId(+boxId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historyService.findOne(+id);
  }
}

