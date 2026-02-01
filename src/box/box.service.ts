import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoxDto } from './dto/create-box.dto';
import { UpdateBoxDto } from './dto/update-box.dto';
import { RegisterTokenDto } from './dto/register-token.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BoxService {
  constructor(private prisma: PrismaService) { }

  async create(createBoxDto: CreateBoxDto) {
    // Verifica que la planta exista
    if (createBoxDto.plantId) {
      const plant = await this.prisma.plant.findUnique({
        where: { id: createBoxDto.plantId },
      });

      if (!plant) {
        throw new NotFoundException('Plant not found');
      }
    }

    // Verifica que el código de la caja sea único
    const existingBox = await this.prisma.box.findUnique({
      where: { code: createBoxDto.code },
    });

    if (existingBox) {
      throw new ConflictException('Box with this code already exists');
    }

    // Crea la caja
    const box = await this.prisma.box.create({
      data: {
        code: createBoxDto.code,
        name: createBoxDto.name,
        plantId: createBoxDto.plantId,
      },
    });

    return {
      message: 'Box created successfully',
      box
    };
  }

  async findAll() {
    const boxes = await this.prisma.box.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        plant: {
          select: { name: true },
        },
      },
    });

    const formattedBoxes = boxes.map(box => ({
      id: box.id,
      code: box.code,
      name: box.name,
      plantName: box.plant?.name ?? null,
    }));

    return {
      message: 'Boxes retrieved successfully',
      boxes: formattedBoxes,
    };
  }


  async findOne(id: number) {
    const box = await this.prisma.box.findUnique({
      where: { id },
      include: {
        plant: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            readings: true,
            statistics: true,
            alerts: true,
          },
        },
      },
    });

    if (!box) {
      throw new NotFoundException('Box not found');
    }

    // Retornar con TODOS los campos necesarios
    return {
      message: `Box with id ${id} retrieved successfully`,
      box: {
        id: box.id,
        code: box.code,
        name: box.name,
        plantId: box.plantId,
        plantName: box.plant?.name || null,
        ledStatus: box.ledStatus,
        pumpStatus: box.pumpStatus,
        manualLed: box.manualLed,
        manualPump: box.manualPump,
        wateringCount: box.wateringCount,
        lastWateringDate: box.lastWateringDate,
        createdAt: box.createdAt,
        fcmTokens: box.fcmTokens,
        _count: box._count,
      }
    };
  }
  async update(id: number, updateBoxDto: UpdateBoxDto) {
    const existingBox = await this.prisma.box.findUnique({ where: { id } });

    if (!existingBox) {
      throw new NotFoundException('Box not found');
    }

    // Validar que la planta exista si se proporciona plantId
    if (updateBoxDto.plantId !== undefined) {
      const plant = await this.prisma.plant.findUnique({
        where: { id: updateBoxDto.plantId },
      });

      if (!plant) {
        throw new NotFoundException('Plant not found');
      }
    }

    // Preparar datos para actualización
    let dataToUpdate = { ...updateBoxDto };

    // Si se asigna una planta diferente, resetear estados
    if (updateBoxDto.plantId !== undefined && updateBoxDto.plantId !== existingBox.plantId) {
      dataToUpdate = {
        ...updateBoxDto,
        wateringCount: 0,
        ledStatus: false,
        pumpStatus: false,
        lastWateringDate: null,
      };
    }

    // Actualizar caja
    const updated = await this.prisma.box.update({
      where: { id },
      data: dataToUpdate,
      include: {
        plant: { select: { name: true } },
      },
    });

    return {
      message: 'Box updated successfully',
      data: {
        id: updated.id,
        code: updated.code,
        name: updated.name,
        plantName: updated.plant?.name || null,
      },
    };
  }

  async remove(id: number) {
    const existingBox = await this.prisma.box.findUnique({
      where: { id },
    });

    if (!existingBox) {
      throw new NotFoundException('Box not found');
    }

    await this.prisma.box.delete({
      where: { id },
    });

    return {
      message: `This action removes a #${id} box`,
    };
  }
  async registerToken(id: number, registerTokenDto: RegisterTokenDto) {
    const box = await this.prisma.box.findUnique({ where: { id } });
    if (!box) {
      throw new NotFoundException('Box not found');
    }

    const currentTokens = box.fcmTokens || [];
    console.log(`[BoxServer] 🔎 Current tokens for box ${id}:`, currentTokens);
    console.log(`[BoxServer] 🆕 New token to register:`, registerTokenDto.token);

    if (!currentTokens.includes(registerTokenDto.token)) {
      console.log(`[BoxServer] ✅ Token is new, adding to database...`);
      const updatedBox = await this.prisma.box.update({
        where: { id },
        data: {
          fcmTokens: {
            push: registerTokenDto.token
          }
        },
        select: { fcmTokens: true }
      });
      console.log(`[BoxServer] ✨ Token added successfully.`);
      return { message: 'Token registered successfully', currentTokens: updatedBox.fcmTokens };
    } else {
      console.log(`[BoxServer] ⚠️ Token already exists. Skipping.`);
      return { message: 'Token already registered', currentTokens: box.fcmTokens };
    }
  }

  async removeToken(token: string) {
    // Buscar cajas que contengan este token
    const boxes = await this.prisma.box.findMany({
      where: {
        fcmTokens: {
          has: token
        }
      }
    });

    // Eliminar el token de cada caja encontrada
    for (const box of boxes) {
      const newTokens = box.fcmTokens.filter(t => t !== token);
      await this.prisma.box.update({
        where: { id: box.id },
        data: {
          fcmTokens: {
            set: newTokens
          }
        }
      });
    }

    return { message: 'Token removed successfully' };
  }

  // deleteToken se elimina o se hace alias de removeToken si era necesario, 
  // pero ya no existe la tabla DeviceToken para eliminar una fila.
  async deleteToken(token: string) {
    return this.removeToken(token);
  }
}
