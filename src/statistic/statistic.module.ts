import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HistoryModule } from 'src/history/history.module';

@Module({
  imports: [PrismaModule,HistoryModule],
  controllers: [StatisticController],
  providers: [StatisticService],
  exports: [StatisticService],
})
export class StatisticModule {}
