import { Module } from '@nestjs/common';
import { SensorsController } from './sensors.controller';
import { ReadingModule } from '../reading/reading.module';
import { BoxModule } from '../box/box.module';

@Module({
  imports: [ReadingModule, BoxModule],
  controllers: [SensorsController],
})
export class SensorsModule {}