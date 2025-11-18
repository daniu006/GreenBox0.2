import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertService } from '../alert/alert.service';

@Injectable()
export class AutomaticControlService {
  constructor(
    private prisma: PrismaService,
    private alertService: AlertService,
  ) {}

  async evaluarLectura(boxId: number, lecturaData: any) {
    const box = await this.prisma.box.findUnique({
      where: { id: boxId },
      include: { plant: true },
    });

    if (!box || !box.plant) {
      return { commands: { led: false, pump: false } };
    }

    await this.verificarParametros(lecturaData, box.plant, boxId);
    const commands = await this.controlarActuadores(lecturaData, box.plant, box);

    return { commands };
  }

  private async verificarParametros(lectura: any, planta: any, boxId: number) {
    if (lectura.temperature < planta.minTemperature || lectura.temperature > planta.maxTemperature) {
      await this.alertService.create(
        boxId,
        'temperature',
        `Temperature out of range: ${lectura.temperature}°C (Required: ${planta.minTemperature}-${planta.maxTemperature}°C)`,
        'high',
      );
    }

    if (lectura.humidity < planta.minHumidity || lectura.humidity > planta.maxHumidity) {
      await this.alertService.create(
        boxId,
        'humidity',
        `Humidity out of range: ${lectura.humidity}% (Required: ${planta.minHumidity}-${planta.maxHumidity}%)`,
        'medium',
      );
    }

    if (lectura.waterLevel < planta.minWaterLevel) {
      await this.alertService.create(
        boxId,
        'water',
        `Water level too low: ${lectura.waterLevel}% (Minimum: ${planta.minWaterLevel}%)`,
        'high',
      );
    }
  }

  private async controlarActuadores(lectura: any, planta: any, box: any) {
    await this.resetearContadores(box);

    const horasLuzHoy = await this.calcularHorasLuzDia(box.id);
    const ledCommand = horasLuzHoy < planta.lightHours;

    let pumpCommand = false;
    let nuevoContador = box.wateringCount;

    if (box.wateringCount < planta.wateringFrequency) {
      pumpCommand = true;
      nuevoContador = box.wateringCount + 1;
    }

    await this.prisma.box.update({
      where: { id: box.id },
      data: {
        ledStatus: ledCommand,
        pumpStatus: pumpCommand,
        wateringCount: nuevoContador,
        lastWateringDate: pumpCommand ? new Date() : box.lastWateringDate,
      },
    });

    return { led: ledCommand, pump: pumpCommand };
  }

  private async calcularHorasLuzDia(boxId: number): Promise<number> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const lecturas = await this.prisma.reading.findMany({
      where: {
        boxId,
        timestamp: { gte: hoy },
      },
    });

    if (lecturas.length === 0) return 0;

    const totalHoras = lecturas.reduce((sum, l) => sum + l.lightHours, 0);
    return totalHoras / lecturas.length;
  }

  private async resetearContadores(box: any) {
    if (!box.lastWateringDate) return;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const ultimoRiego = new Date(box.lastWateringDate);
    ultimoRiego.setHours(0, 0, 0, 0);

    if (hoy.getTime() > ultimoRiego.getTime()) {
      await this.prisma.box.update({
        where: { id: box.id },
        data: { wateringCount: 0 },
      });
    }
  }
}