import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ReadingService } from '../reading/reading.service';
import { BoxService } from '../box/box.service';

@Controller('sensors')
export class SensorsController {
    constructor(
        private readonly readingService: ReadingService,
        private readonly boxService: BoxService,
    ) { }

    // 1. GET /sensors/latest/:boxId
    @Get('latest/:boxId')
    async getLatest(@Param('boxId') boxId: string) {
        const result = await this.readingService.findAll(+boxId, 1);
        if (!result.data || result.data.length === 0) {
            throw new NotFoundException('No hay lecturas para esta caja');
        }
        // Retorna la lectura más reciente
        return result.data[0];
    }

    // 2. GET /sensors/actuators/:boxId
    @Get('actuators/:boxId')
    async getActuators(@Param('boxId') boxId: string) {
        const response = await this.boxService.findOne(+boxId);
        return {
            ledStatus: response.box.ledStatus,
            pumpStatus: response.box.pumpStatus,
        };
    }

    // 3. POST /sensors/actuators/:boxId (Equivalente a tu ruta /box/:id/actuators)
    @Post('actuators/:boxId')
    async updateActuators(
        @Param('boxId') boxId: string,
        @Body() updateData: { ledStatus?: boolean; pumpStatus?: boolean },
    ) {
        return await this.boxService.update(+boxId, updateData);
    }
}