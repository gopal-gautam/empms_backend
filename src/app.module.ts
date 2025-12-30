import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeesModule } from './employees/employee.module';
import { AuthModule } from './auth/auth.module';
import { ClockInOutsModule } from './clock-in-outs/clock-in-outs.module';

@Module({
  imports: [AuthModule, EmployeesModule, ClockInOutsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
