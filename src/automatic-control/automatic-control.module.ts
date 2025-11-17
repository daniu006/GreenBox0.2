import { Module } from '@nestjs/common';
import { AutomaticControlService } from './automatic-control.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PrismaService],
  providers: [AutomaticControlService],
  exports: [AutomaticControlService],
})
export class AutomaticControlModule {}
