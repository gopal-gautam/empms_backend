import { Module } from '@nestjs/common';
import { ClockInOutsController } from './clock-in-outs.controller';
import { ClockInOutsService } from './clock-in-outs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ClockInOutsController],
  providers: [ClockInOutsService],
})
export class ClockInOutsModule {}
