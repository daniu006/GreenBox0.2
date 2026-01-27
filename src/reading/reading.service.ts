import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReadingDto } from './dto/create-reading.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatisticService } from 'src/statistic/statistic.service';
import { AutomaticControlService } from 'src/automatic-control/automatic-control.service';

@Injectable()
export class ReadingService {
  constructor(
    private prisma: PrismaService,
    private statisticService: StatisticService,
    private automaticControlService: AutomaticControlService,
  ) { }

  async create(createReadingDto: CreateReadingDto) {
    const boxId = await this.prisma.box.findUnique({
      where: { id: createReadingDto.boxId },
    });

    if (!boxId) {
      throw new NotFoundException('Box not found');
    }

    const reading = await this.prisma.reading.create({
      data: {
        boxId: createReadingDto.boxId,
        temperature: createReadingDto.temperature,
        humidity: createReadingDto.humidity,
        soilMoisture: createReadingDto.soilMoisture || 0,
        lightHours: createReadingDto.lightHours,
        waterLevel: createReadingDto.waterLevel,
      },
      include: {
        box: {
          select: {
            id: true,
            name: true
          }
        },
      }
    });

    // Evaluar lectura y obtener comandos para sensores
    const control = await this.automaticControlService.evaluarLectura(
      createReadingDto.boxId,
      {
        temperature: createReadingDto.temperature,
        humidity: createReadingDto.humidity,
        soilMoisture: createReadingDto.soilMoisture || 0,
        lightHours: createReadingDto.lightHours,
        waterLevel: createReadingDto.waterLevel,
      }
    );

    try {
      await this.statisticService.calculateStatics(createReadingDto.boxId);
    } catch (error) {
      console.error('Error calculating statistics:', error);
    }
    return {
      message: 'Reading processed successfully',
      data: reading,
      commands: control.commands  // Comandos para el ESP32
    };
  }

  async findAll(boxId: number, limit?: number) {
    const box = await this.prisma.box.findUnique({ where: { id: boxId } });

    if (!box) {
      throw new NotFoundException('Box not found');
    }

    const readings = await this.prisma.reading.findMany({
      where: { boxId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        box: {
          select: {
            id: true,
            name: true
          }
        },
      }
    });

    return {
      message: 'This action returns all reading',
      total: readings.length,
      data: readings
    }
  }

  async findOne(id: number) {
    const reading = await this.prisma.reading.findUnique({
      where: { id },
      include: {
        box: {
          select: { id: true, name: true }
        }
      }
    });

    if (!reading) {
      throw new NotFoundException('Reading not found');
    }

    return {
      message: 'Reading retrieved successfully',
      data: reading
    };
  }

  async remove(id: number) {

    const reading = await this.prisma.reading.findUnique({ where: { id } });

    if (!reading) {
      throw new NotFoundException('Reading not found');
    }

    await this.prisma.reading.delete({ where: { id } });

    return {
      message: `This action removes a #${id} reading`,
    };
  }
}
