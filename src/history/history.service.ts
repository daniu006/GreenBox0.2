import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async saveHistory(
    boxId: number,
    type: 'daily' | 'weekly',
    data: {
      temperature: number;
      humidity: number;
      waterLevel: number;
      lightHours: number;
      estimatedHealth: number;
    }
  ) {
    const box = await this.prisma.box.findUnique({ where: { id: boxId } });
    if (!box) {
      throw new NotFoundException(`Box with id ${boxId} not found`);
    }

    const history = await this.prisma.history.create({
      data: {
        boxId: boxId,
        Type: type, // Usa 'Type' del modelo History
        week: this.getWeekNumber(new Date()), // ESENCIAL: Usa el helper para asignar la semana
        temperature: parseFloat(data.temperature.toFixed(2)),
        humidity: parseFloat(data.humidity.toFixed(2)),
        waterLevel: parseFloat(data.waterLevel.toFixed(2)),
        lightHours: parseFloat(data.lightHours.toFixed(2)),
        estimatedHealth: parseFloat(data.estimatedHealth.toFixed(2)),
      },
      include: {
        box: {
          select: { id: true, code: true, name: true }
        }
      }
    });

    return {
      message: `History ${type} saved successfully`,
      data: history
    };
  }

  async findByBoxId(boxId: number) {
    const box = await this.prisma.box.findUnique({ where: { id: boxId } });
    if (!box) {
      throw new NotFoundException(`Box with id ${boxId} not found`);
    }

    const history = await this.prisma.history.findMany({
      where: { boxId },
      orderBy: { date: 'desc' }, 
      include: { box: { select: { id: true, code: true, name: true } } }
    });

    return {
      message: 'History retrieved successfully',
      data: history,
      total: history.length
    };
  }

  async findByBoxIdAndType(boxId: number, type: 'daily' | 'weekly') {
    const box = await this.prisma.box.findUnique({ where: { id: boxId } });
    if (!box) {
      throw new NotFoundException(`Box with id ${boxId} not found`);
    }

    const history = await this.prisma.history.findMany({
      where: { boxId, Type: type },
      orderBy: { date: 'desc' },
      include: { box: { select: { id: true, code: true, name: true } } }
    });

    return {
      message: `${type} history retrieved successfully`,
      data: history,
      total: history.length
    };
  }

  async findLatestByBoxId(boxId: number) {
    const box = await this.prisma.box.findUnique({ where: { id: boxId } });
    if (!box) {
      throw new NotFoundException(`Box with id ${boxId} not found`);
    }

    const history = await this.prisma.history.findFirst({
      where: { boxId },
      orderBy: { date: 'desc' },
      include: { box: { select: { id: true, code: true, name: true } } }
    });

    if (!history) {
      return { message: 'No history available for this box', data: null };
    }

    return {
      message: 'Latest history record obtained successfully',
      data: history
    };
  }

  async getEvolution(boxId: number) {
    const box = await this.prisma.box.findUnique({ where: { id: boxId } });
    if (!box) {
      throw new NotFoundException(`Box with id ${boxId} not found`);
    }

    // Obtener el primer y último registro (asumiendo que 'date' es el campo de ordenamiento)
    const firstRecord = await this.prisma.history.findFirst({
      where: { boxId },
      orderBy: { date: 'asc' }
    });

    const lastRecord = await this.prisma.history.findFirst({
      where: { boxId },
      orderBy: { date: 'desc' }
    });

    if (!firstRecord || !lastRecord) {
      return { message: 'Not enough data to calculate evolution', data: null };
    }

    // Calcular diferencias
    const diffHealth = lastRecord.estimatedHealth - firstRecord.estimatedHealth;
    const diffTemp = lastRecord.temperature - firstRecord.temperature;
    const diffHumidity = lastRecord.humidity - firstRecord.humidity;
    const diffLightHours = lastRecord.lightHours - firstRecord.lightHours;
    const diffWaterLevel = lastRecord.waterLevel - firstRecord.waterLevel;

    return {
      message: 'Plant evolution calculated successfully',
      data: {
        boxId,
        box: { id: box.id, code: box.code, name: box.name },
        firstRecord: {
          date: firstRecord.date, estimatedHealth: firstRecord.estimatedHealth,
          temperature: firstRecord.temperature, humidity: firstRecord.humidity,
          lightHours: firstRecord.lightHours, waterLevel: firstRecord.waterLevel
        },
        lastRecord: {
          date: lastRecord.date, estimatedHealth: lastRecord.estimatedHealth,
          temperature: lastRecord.temperature, humidity: lastRecord.humidity,
          lightHours: lastRecord.lightHours, waterLevel: lastRecord.waterLevel
        },
        evolution: {
          estimatedHealth: parseFloat(diffHealth.toFixed(2)),
          temperature: parseFloat(diffTemp.toFixed(2)),
          humidity: parseFloat(diffHumidity.toFixed(2)),
          lightHours: parseFloat(diffLightHours.toFixed(2)),
          waterLevel: parseFloat(diffWaterLevel.toFixed(2)),
          trend: diffHealth >= 0 ? 'improving' : 'deteriorating'
        }
      }
    };
  }

  async findOne(id: number) {
    const history = await this.prisma.history.findUnique({
      where: { id },
      include: {
        box: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (!history) {
      throw new NotFoundException(`History record with id ${id} not found`);
    }

    return {
      message: 'History record retrieved successfully',
      data: history,
    };
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}