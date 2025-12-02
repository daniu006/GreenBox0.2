import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlertModule } from './alert/alert.module';
import { BoxModule } from './box/box.module';
import { GuideModule } from './guide/guide.module';
import { HistoryModule } from './history/history.module';
import { PlantModule } from './plant/plant.module';
import { ReadingModule } from './reading/reading.module';
import { StatisticModule } from './statistic/statistic.module';
import { AutomaticControlModule } from './automatic-control/automatic-control.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AlertModule,
    BoxModule,
    GuideModule,
    HistoryModule,
    PlantModule,
    ReadingModule,
    StatisticModule,
    AutomaticControlModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
