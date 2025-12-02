import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlertService } from './alert.service';

@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

 
  @Get('box/:boxId/active')
  getActive(@Param('boxId') boxId: string) {
    return this.alertService.activeAlerts(+boxId);
  }

 
  @Get('box/:boxId')
  getAllByBox(@Param('boxId') boxId: string) {
    return this.alertService.getAllAlerts(+boxId);
  }

  @Patch(':id/resolve')
  resolve(@Param('id') id: string) {
    return this.alertService.resolveAlert(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alertService.remove(+id);
  }

}
