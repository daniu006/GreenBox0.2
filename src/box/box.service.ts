import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoxDto } from './dto/create-box.dto';
import { UpdateBoxDto } from './dto/update-box.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BoxService {
  constructor(private prisma: PrismaService) {}

  async create(createBoxDto: CreateBoxDto) {
      //Verfica que la planta exista
    if (createBoxDto.plantId) {
      const plant = await this.prisma.plant.findUnique({
        where: { id: createBoxDto.plantId },
      });

      if (!plant) {
        throw new NotFoundException('Plant not found');
      }
    }
     //Verifica que el código de la caja sea único
    const existingBox = await this.prisma.box.findUnique({
      where: { code: createBoxDto.code },
    });

    if (existingBox) {
      throw new NotFoundException('Box with this code already exists');
    }

    //Crea la caja
    const box = await this.prisma.box.create({
      data: {
        code: createBoxDto.code,
        name: createBoxDto.name,
        plantId: createBoxDto.plantId,
        wateringCount: createBoxDto.wateringCount,
        lastWateringDate: createBoxDto.lastWateringDate,
        ledStatus: createBoxDto.ledStatus,
        pumpStatus: createBoxDto.pumpStatus,
      },
    });
    return {
      message:'This action adds a new box',
      box,
    };
   }

  async findAll() {
    const boxes = await this.prisma.box.findMany({
      orderBy: {createdAt: 'asc'},
      include: {
        plant:{
          select: {name:true}
        },
        _count: {
          select: {
            readings: true,
            statistics: true,
          },
        },
      },
    });
    return {
      message:`This action returns all box`,
      data: boxes,
      total: boxes.length, 
    };
  }

  async findOne(id: number) {
    const box = await this.prisma.box.findUnique({
      where: { id },
      include: {
        plant:{
          select: {name:true}
        },
        _count: {
          select: {
            readings: true,
            statistics: true,
          },
        },
      },
    });
    if (!box) {
      throw new NotFoundException('Box not found');
    }
    return {
      message:`This action returns a #${id} box`,
      data: box,
    };
  }

  async update(id: number, updateBoxDto: UpdateBoxDto) {
    const existingBox = await this.prisma.box.findUnique({
      where: { id },
    });

    if (!existingBox) {
      throw new NotFoundException('Box not found');
    }

    if (updateBoxDto.plantId) {
      const plant = await this.prisma.plant.findUnique({
        where: { id: updateBoxDto.plantId },
      });
      if (!plant) {
        throw new NotFoundException('Plant not found');
      }

      const updated = await this.prisma.box.update({
        where: { id },
        data: updateBoxDto,
        include: {
          plant:{
            select: {name:true},
          },
        },
      });

    return {
      message:`This action updates a #${id} box`,
      data: updated,
    };
  }
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
