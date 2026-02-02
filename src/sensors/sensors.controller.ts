import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  NotFoundException
} from '@nestjs/common';
import { ReadingService } from '../reading/reading.service';
import { BoxService } from '../box/box.service';
import { AlertService } from '../alert/alert.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('sensors')
export class SensorsController {
  constructor(
    private readonly readingService: ReadingService,
    private readonly boxService: BoxService,
    private readonly alertService: AlertService,
    private readonly prisma: PrismaService,
  ) { }

  @Get('latest/:boxId')
  async getLatest(@Param('boxId') boxId: string) {
    const result = await this.readingService.findAll(+boxId, 1);

    if (!result.data || result.data.length === 0) {
      throw new NotFoundException('No readings found for this box');
    }

    const reading = result.data[0];

    // FIX: Agregar soilMoisture que faltaba
    return {
      temp: reading.temperature,
      hum: reading.humidity,
      light: reading.lightHours,
      water: reading.waterLevel,
      soilMoisture: reading.soilMoisture,  // <-- ESTO FALTABA
      timestamp: reading.timestamp
    };
  }

  @Get('actuators/:boxId')
  async getActuators(@Param('boxId') boxId: string) {
    const result = await this.boxService.findOne(+boxId);
    const box = result.box;

    return {
      boxId: box.id,
      boxName: box.name,
      led: box.ledStatus,
      pump: box.pumpStatus,
      manualLed: box.manualLed,
      manualPump: box.manualPump,
      wateringCount: box.wateringCount,
      lastWateringDate: box.lastWateringDate
    };
  }

  @Get('history/:boxId/:period')
  async getHistory(
    @Param('boxId') boxId: string,
    @Param('period') period: string
  ) {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        throw new NotFoundException('Invalid period. Use: 24h, 7d, or 30d');
    }

    const readings = await this.prisma.reading.findMany({
      where: {
        boxId: +boxId,
        timestamp: { gte: startDate, lte: endDate }
      },
      orderBy: { timestamp: 'asc' },
    });

    if (readings.length === 0) {
      throw new NotFoundException('No readings found for this period');
    }

    // FIX: Agregar soilMoisture al historial también
    return readings.map(r => ({
      timestamp: r.timestamp,
      temperature: r.temperature,
      humidity: r.humidity,
      light: r.lightHours,
      water: r.waterLevel,
      soilMoisture: r.soilMoisture  // <-- ESTO FALTABA
    }));
  }

  // --- NOTIFICACIONES ---

  @Get('notifications/:boxId')
  getNotifications(@Param('boxId') boxId: string) {
    return this.alertService.getAllAlerts(+boxId);
  }

  @Patch('notifications/:id/read')
  readNotification(@Param('id') id: string) {
    return this.alertService.resolveAlert(+id);
  }

  @Patch('notifications/mark-all-read/:boxId')
  markAllAsRead(@Param('boxId') boxId: string) {
    return this.alertService.resolveAll(+boxId);
  }

  @Delete('notifications/:id')
  deleteNotification(@Param('id') id: string) {
    return this.alertService.remove(+id);
  }
}