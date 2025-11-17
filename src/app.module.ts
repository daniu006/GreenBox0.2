import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlantModule } from './plant/plant.module';
import { BoxModule } from './box/box.module';
import { StatisticModule } from './statistic/statistic.module';
import { AutomaticControlModule } from './automatic-control/automatic-control.module';
import { ReadingModule } from './reading/reading.module';

@Module({
  imports: [PlantModule, BoxModule, StatisticModule, AutomaticControlModule, ReadingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
