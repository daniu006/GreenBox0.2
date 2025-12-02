import { Module } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { ReadingController } from './reading.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StatisticModule } from 'src/statistic/statistic.module';
import { AutomaticControlModule } from 'src/automatic-control/automatic-control.module';

@Module({
  imports: [PrismaModule,StatisticModule,AutomaticControlModule],
  controllers: [ReadingController],
  providers: [ReadingService],
  exports: [ReadingService],
})
export class ReadingModule {}
