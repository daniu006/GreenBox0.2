import { Module } from '@nestjs/common';
import { AutomaticControlService } from './automatic-control.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AlertModule } from 'src/alert/alert.module';

@Module({
  imports: [PrismaModule, AlertModule],
  providers: [AutomaticControlService],
  exports: [AutomaticControlService],
})
export class AutomaticControlModule {}
