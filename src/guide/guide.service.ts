import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuideService {
  constructor(private prisma: PrismaService) {}

  async create(createGuideDto: CreateGuideDto) {
    // Verificar que la planta existe
    const plant = await this.prisma.plant.findUnique({
      where: { id: createGuideDto.plantId },
    });

    if (!plant) {
      throw new NotFoundException(`Plant with id ${createGuideDto.plantId} not found`);
    }

    // Crear guía
    const guide = await this.prisma.guide.create({
      data: {
        plantId: createGuideDto.plantId,
        title: createGuideDto.title,
        description: createGuideDto.description,
        step: createGuideDto.step,
        image: createGuideDto.image,
      },
      include: {
        plant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Guide created successfully',
      data: guide,
    };
  }

  async findAll() {
    const guides = await this.prisma.guide.findMany({
      orderBy: [
        { plantId: 'asc' },
        { step: 'asc' },
      ],
      include: {
        plant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Guides retrieved successfully',
      data: guides,
      total: guides.length,
    };
  }

  async findByPlantId(plantId: number) {
    // Verificar que la planta existe
    const plant = await this.prisma.plant.findUnique({
      where: { id: plantId },
    });

    if (!plant) {
      throw new NotFoundException(`Plant with id ${plantId} not found`);
    }

    // Obtener guías de la planta ordenadas por paso
    const guides = await this.prisma.guide.findMany({
      where: { plantId },
      orderBy: { step: 'asc' },
      include: {
        plant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Guides retrieved successfully',
      data: guides,
      total: guides.length,
    };
  }

  async findOne(id: number) {
    const guide = await this.prisma.guide.findUnique({
      where: { id },
      include: {
        plant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!guide) {
      throw new NotFoundException(`Guide with id ${id} not found`);
    }

    return {
      message: 'Guide retrieved successfully',
      data: guide,
    };
  }

  async update(id: number, updateGuideDto: UpdateGuideDto) {
    // Verificar que la guía existe
    const guide = await this.prisma.guide.findUnique({
      where: { id },
    });

    if (!guide) {
      throw new NotFoundException(`Guide with id ${id} not found`);
    }

    // Si se actualiza la planta, verificar que existe
    if (updateGuideDto.plantId) {
      const plant = await this.prisma.plant.findUnique({
        where: { id: updateGuideDto.plantId },
      });

      if (!plant) {
        throw new NotFoundException(`Plant with id ${updateGuideDto.plantId} not found`);
      }
    }

    // Actualizar guía
    const updatedGuide = await this.prisma.guide.update({
      where: { id },
      data: updateGuideDto,
      include: {
        plant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Guide updated successfully',
      data: updatedGuide,
    };
  }

  async remove(id: number) {
    // Verificar que la guía existe
    const guide = await this.prisma.guide.findUnique({
      where: { id },
    });

    if (!guide) {
      throw new NotFoundException(`Guide with id ${id} not found`);
    }

    // Eliminar guía
    await this.prisma.guide.delete({
      where: { id },
    });

    return {
      message: 'Guide deleted successfully',
    };
  }
}