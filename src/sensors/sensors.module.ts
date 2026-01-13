import { Module } from '@nestjs/common';
import { SensorsController } from './sensors.controller';
import { ReadingModule } from '../reading/reading.module';
import { BoxModule } from '../box/box.module';
import { AlertModule } from '../alert/alert.module';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  imports: [ReadingModule, BoxModule, AlertModule, PrismaModule],
  controllers: [SensorsController],
})
export class SensorsModule {}