import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateBoxCode(code: string) {
    const box = await this.prisma.box.findUnique({
      where: { code: code.toUpperCase()},
      include: {
        plant: true,
      },
    });

    if (!box) {
      throw new NotFoundException(`La caja con el código ${code} no existe.`);
    }

    return {
      valid: true,
      boxId: box.id,
      boxCode: box.code,
      boxName: box.name,
      plant: box.plant ? {
        id: box.plant.id,
        name: box.plant.name,
        minTemperature: box.plant.minTemperature,
        maxTemperature: box.plant.maxTemperature,
        minHumidity: box.plant.minHumidity,
        maxHumidity: box.plant.maxHumidity,
        lightHours: box.plant.lightHours,
        minWaterLevel: box.plant.minWaterLevel,
        wateringFrequency: box.plant.wateringFrequency,
      } : null,
    };
  }
}