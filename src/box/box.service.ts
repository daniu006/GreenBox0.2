import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoxDto } from './dto/create-box.dto';
import { UpdateBoxDto } from './dto/update-box.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BoxService {
  constructor(private prisma: PrismaService) {}

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
          select: { name: true }
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
    const formatted = {
    id: box.id,
    code: box.code,
    name: box.name,
    plantName: box.plant?.name || null,
    _count: box._count,
  };
    
    return {
      message: `This action returns a #${id} box`,
      box: formatted,
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
      message:`This action removes a #${id} box`,
   };
  }
}
