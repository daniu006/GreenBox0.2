import { Module } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { ReadingController } from './reading.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StatisticService } from 'src/statistic/statistic.service';
import { AutomaticControlService } from 'src/automatic-control/automatic-control.service';

@Module({
  imports: [PrismaModule,StatisticService,AutomaticControlService],
  controllers: [ReadingController],
  providers: [ReadingService],
  exports: [ReadingService],
})
export class ReadingModule {}
