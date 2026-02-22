import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }

  async validateBoxCode(code: string) {
    const box = await this.prisma.box.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        plant: true,
      },
    });

    if (!box) {
      throw new NotFoundException(`La caja con el código ${code} no existe.`);
    }

    // Resetear estado manual de actuadores al hacer login
    // Esto garantiza que LED y Bomba siempre arranquen apagados en cada sesión
    await this.prisma.box.update({
      where: { id: box.id },
      data: {
        manualLed: false,
        manualPump: false,
      },
    });

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