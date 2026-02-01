import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseNotificationService } from '../notifications/firebase-notification.service';

@Injectable()
export class AlertService {
  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseNotificationService
  ) { }

  async create(
    boxId: number,
    type: string,
    message: string,
    priority: 'high' | 'medium' | 'low'
  ) {

    const box = await this.prisma.box.findUnique({ where: { id: boxId } });
    if (!box) {
      throw new NotFoundException(`Box with id ${boxId} not found`);
    }

    // Buscar si ya existe una alerta NO RESUELTA con el mismo tipo y mensaje
    const existingAlert = await this.prisma.alert.findFirst({
      where: {
        boxId,
        type,
        message,
        resolved: false,
      },
    });

    if (existingAlert) {
      return {
        message: 'Existing unresolved alert found, creation skipped',
        data: existingAlert,
      };
    }

    // Crear nueva alerta
    const newAlert = await this.prisma.alert.create({
      data: {
        boxId,
        type,
        message,
        priority,
        resolved: false,
      },
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

    // Enviar notificación push si el box tiene un token registrado
    if (box.fcmToken) {
      await this.firebaseService.sendPushNotification(
        box.fcmToken,
        `Alerta: ${type}`,
        message,
        {
          boxId: boxId.toString(),
          priority: priority,
          alertId: newAlert.id.toString(),
        }
      );
    }

    return {
      message: 'Alert created successfully',
      data: newAlert,
    };
  }

  async activeAlerts(boxId: number) {
    // Verificar que la caja existe
    const box = await this.prisma.box.findUnique({ where: { id: boxId } });
    if (!box) {
      throw new NotFoundException(`Box with id ${boxId} not found`);
    }
    // Obtener alertas NO resueltas, ordenadas por prioridad y fecha
    const alerts = await this.prisma.alert.findMany({
      where: {
        boxId,
        resolved: false,
      },
      orderBy: [
        { priority: 'desc' }, // high, medium, low
        { createdAt: 'desc' },
      ],
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
      message: 'Active alerts retrieved successfully',
      data: alerts,
      total: alerts.length,
    };
  }

  async getAllAlerts(boxId: number) {
    // Verificar que la caja existe
    const box = await this.prisma.box.findUnique({ where: { id: boxId } });
    if (!box) {
      throw new NotFoundException(`Box with id ${boxId} not found`);
    }

    // Obtener todas las alertas (resueltas y no resueltas)
    const alerts = await this.prisma.alert.findMany({
      where: { boxId },
      orderBy: { createdAt: 'desc' },
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
      message: 'All alerts retrieved successfully',
      data: alerts,
      total: alerts.length,
    };
  }

  async resolveAlert(alertId: number) {
    // Verificar que la alerta existe
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new NotFoundException(`Alert with id ${alertId} not found`);
    }

    // Marcar como resuelta
    const updatedAlert = await this.prisma.alert.update({
      where: { id: alertId },
      data: { resolved: true },
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
      message: 'Alert resolved successfully',
      data: updatedAlert,
    };
  }

  async remove(id: number) {
    const alert = await this.prisma.alert.findUnique({ where: { id } });

    if (!alert) {
      throw new NotFoundException(`Alert with id ${id} not found`);
    }

    // Eliminar alerta
    await this.prisma.alert.delete({ where: { id } });

    return {
      message: 'Alert deleted successfully',
    };
  }


  async resolveAll(boxId: number) {
    return this.prisma.alert.updateMany({
      where: {
        boxId: boxId,
        resolved: false
      },
      data: {
        resolved: true
      },
    });
  }
}