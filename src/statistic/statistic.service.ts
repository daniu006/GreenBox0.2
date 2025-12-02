import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HistoryService } from 'src/history/history.service';
@Injectable()
export class StatisticService {
  constructor(
    private prisma: PrismaService,
    private historyService: HistoryService // Renombrado de historialService
  ) {}

  async calculateStatics(boxId: number) { 
    
    const box = await this.prisma.box.findUnique({ 
      where: { id: boxId },
      include: { plant: true } 
    });

    if (!box || !box.plant) {
      throw new NotFoundException(`Box with id ${boxId} not found or no plant assigned.`);
    }

    const plant = box.plant; 

    // Obtener lecturas de los últimos 7 días
    const dateEnd = new Date();  
    const dateStart = new Date();
    dateStart.setDate(dateEnd.getDate() - 7);

    const readings = await this.prisma.reading.findMany({ // Renombrado de lectura
      where: {
        boxId,
        timestamp: { gte: dateStart, lte: dateEnd } 
      },
      orderBy: { timestamp: 'asc' }
    });

    if (readings.length === 0) {
      return {
        message: 'No sufficient readings to calculate statistics',
        data: null
      };
    }

    // Calcular promedios
    const temperature = readings.reduce((acc, l) => acc + l.temperature, 0) / readings.length;
    const humidity = readings.reduce((acc, l) => acc + l.humidity, 0) / readings.length;
    const waterLevel = readings.reduce((acc, l) => acc + l.waterLevel, 0) / readings.length;

    // Calcular horas de luz por día
    const lightHours = this.calculateDailyLightHours(readings);

    // 2. Calcular salud estimada, PASANDO LOS PARÁMETROS DE LA PLANTA
    const estimatedHealth = this.calculatePlantHealth(readings, plant); 

    // Obtener número de semana actual
    const currentWeek = this.getWeekNumber(new Date()); 

    // Guardar o actualizar estadística semanal (modelo statistic)
    const statistic = await this.prisma.statistic.upsert({ 
      where: {
        boxId_week: { // Clave compuesta
          boxId: boxId,
          week: currentWeek
        }
      },
      update: {
        avgTemperature: parseFloat(temperature.toFixed(2)),
        avgHumidity: parseFloat(humidity.toFixed(2)),
        avgLightHours: parseFloat(lightHours.toFixed(2)),
        avgWaterLevel: parseFloat(waterLevel.toFixed(2)),
        estimatedHealth: parseFloat(estimatedHealth.toFixed(2)),
        generatedAt: new Date()
      },
      create: {
        boxId: boxId,
        week: currentWeek,
        avgTemperature: parseFloat(temperature.toFixed(2)),
        avgHumidity: parseFloat(humidity.toFixed(2)),
        avgLightHours: parseFloat(lightHours.toFixed(2)),
        avgWaterLevel: parseFloat(waterLevel.toFixed(2)),
        estimatedHealth: parseFloat(estimatedHealth.toFixed(2))
      }
    });

    // Guardar en historial semanal automáticamente
    try {
      await this.historyService.saveHistory(boxId, 'weekly', { // Renombrado de guardarHistorial y tipo
        temperature: temperature,
        humidity: humidity,
        lightHours: lightHours,
        waterLevel: waterLevel,
        estimatedHealth: estimatedHealth
      });
    } catch (error) {
      console.error('Error saving weekly history:', error);
    }

    return {
      message: 'Statistics calculated successfully',
      data: statistic
    };
  }

  async findByBoxId(boxId: number) {
    const box = await this.prisma.box.findUnique({ where: { id: boxId } });
    
    if (!box) {
      throw new NotFoundException(`Box with id ${boxId} not found`);
    }

    const statistics = await this.prisma.statistic.findMany({
      where: { boxId },
      orderBy: { generatedAt: 'desc' },
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

    return {
      message: 'Statistics retrieved successfully',
      data: statistics,
      total: statistics.length,
    };
  }

  async findLatestByBoxId(boxId: number) {
    const box = await this.prisma.box.findUnique({ where: { id: boxId } });
    
    if (!box) {
      throw new NotFoundException(`Box with id ${boxId} not found`);
    }

    const statistic = await this.prisma.statistic.findFirst({
      where: { boxId },
      orderBy: { generatedAt: 'desc' },
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

    if (!statistic) {
      return {
        message: 'No statistics available for this box',
        data: null,
      };
    }

    return {
      message: 'Latest statistic retrieved successfully',
      data: statistic,
    };
  }

  async findOne(id: number) {
    const statistic = await this.prisma.statistic.findUnique({
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

    if (!statistic) {
      throw new NotFoundException(`Statistic with id ${id} not found`);
    }

    return {
      message: 'Statistic retrieved successfully',
      data: statistic,
    };
  }

  async remove(id: number) {
    const statistic = await this.prisma.statistic.findUnique({ where: { id } });

    if (!statistic) {
      throw new NotFoundException(`Statistic with id ${id} not found`);
    }

    await this.prisma.statistic.delete({ where: { id } });

    return {
      message: 'Statistic deleted successfully',
    };
  }

  
  
  private calculatePlantHealth(readings: any[], plant: any): number {
    const avgTemperature = readings.reduce((acc, l) => acc + l.temperature, 0) / readings.length;
    const avgHumidity = readings.reduce((acc, l) => acc + l.humidity, 0) / readings.length;
    const avgWater = readings.reduce((acc, l) => acc + l.waterLevel, 0) / readings.length;
    
    const dailyLightHours = this.calculateDailyLightHours(readings);

    // --- 1. Temperatura (Ponderación 0.25) ---
    let tempNorm;
    if (avgTemperature >= plant.minTemperature && avgTemperature <= plant.maxTemperature) {
        tempNorm = 100; // 100% de salud en este parámetro si está en rango
    } else {
        // Penalización: Asumimos una penalización de 10 puntos por cada unidad de desviación fuera del rango
        const deviation = avgTemperature < plant.minTemperature 
            ? plant.minTemperature - avgTemperature 
            : avgTemperature - plant.maxTemperature;
        tempNorm = 100 - (deviation * 10);
    }
    tempNorm = Math.max(0, Math.min(tempNorm, 100)); // Limitar entre 0 y 100

    // --- 2. Humedad (Ponderación 0.3) ---
    let humidityNorm;
    if (avgHumidity >= plant.minHumidity && avgHumidity <= plant.maxHumidity) {
        humidityNorm = 100;
    } else {
        const deviation = avgHumidity < plant.minHumidity
            ? plant.minHumidity - avgHumidity
            : avgHumidity - plant.maxHumidity;
        humidityNorm = 100 - (deviation * 10); // Misma penalización
    }
    humidityNorm = Math.max(0, Math.min(humidityNorm, 100));

    // --- 3. Nivel de Agua (Ponderación 0.25) ---
    // El puntaje se basa en qué tan cerca está el promedio del mínimo requerido (asumiendo que 100% es el máximo del sensor).
    let waterNorm;
    if (avgWater >= plant.minWaterLevel) {
        waterNorm = 100;
    } else {
        
        waterNorm = (avgWater / plant.minWaterLevel) * 100;
    }
    waterNorm = Math.max(0, Math.min(waterNorm, 100));

    // --- 4. Horas de Luz (Ponderación 0.2) ---
    const lightNorm = Math.min((dailyLightHours / plant.lightHours) * 100, 100);

    // Cálculo final de salud estimada 
    let estimatedHealth = 
        (humidityNorm * 0.3) + 
        (tempNorm * 0.25) + 
        (waterNorm * 0.25) + 
        (lightNorm * 0.2);
    
    return Math.max(0, Math.min(estimatedHealth, 100));
  }
  private calculateDailyLightHours(readings: any[]): number {
  
    const totalLightHoursValue = readings.reduce((sum, l) => sum + l.lightHours, 0);


    return totalLightHoursValue / readings.length; 
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}