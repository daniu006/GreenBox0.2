import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlantService {
  constructor(private prisma: PrismaService) {}

  async create(createPlantDto: CreatePlantDto) {
    
    try {
    const plant = await this.prisma.plant.create({
      data: {
        name: createPlantDto.name,
        minTemperature: createPlantDto.minTemperature,
        maxTemperature: createPlantDto.maxTemperature,
        minHumidity: createPlantDto.minHumidity,
        maxHumidity: createPlantDto.maxHumidity,
        lightHours: createPlantDto.lightHours,
        minWaterLevel: createPlantDto.minWaterLevel,  
        wateringFrequency: createPlantDto.wateringFrequency,
      }
    });
    console.log("Plant created:", plant);
    return plant;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('A plant with this name already exists.');  
      }
      throw error;
    }
  } 

  async findAll() { 
    const plants = await this.prisma.plant.findMany({
      orderBy: {createdAt: 'asc'},
    });
  
    return {
      message: 'Plants retrieved successfully',
      total: plants.length,
      plants,
    };
  }

  async findOne(id: number) {
    const plant = await this.prisma.plant.findUnique({
      where: { id },
    }); 

    if (!plant) {
      throw new NotFoundException('Plant not found');
    }
    
    return {
      message:`This action returns a #${id} plant`,
      plant,
    };  
  }

  async update(id: number, updatePlantDto: UpdatePlantDto) {
    const plantExists = await this.prisma.plant.findUnique({
      where: { id },
    });
    
    if (!plantExists) {
      throw new NotFoundException('Plant not found');
    }

    const updated = this.prisma.plant.update({
      where: { id },
      data: updatePlantDto,
    });

    return {
      message:`This action updates a #${id} plant`,
      plant: updated,
    };
  }

  async remove(id: number) {
    const plantExists = await this.prisma.plant.findUnique({
      where: { id },
    });

    if (!plantExists) {
      throw new NotFoundException('Plant not found');
    }

    await this.prisma.plant.delete({
      where: { id },
    });

    return {
      message:`This action removes a #${id} plant`,
    };  
  }
}
