import { Controller, Post, Body, Get, Param, Delete, Patch, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ClockInOutsService } from './clock-in-outs.service';
import { CreateClockInOutDto } from './dto/create-clock-in-out.dto';
import { UpdateClockInOutDto } from './dto/update-clock-in-out.dto';
import { CreateClockInSelfDto } from './dto/create-clock-in-self.dto';
import { UpdateClockInSelfDto } from './dto/update-clock-in-self.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('clock-in-outs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClockInOutsController {
  constructor(private readonly service: ClockInOutsService) {}

  // Admin: create for arbitrary employee code
  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateClockInOutDto) {
    // Accept employeeId from frontend and map to internal employee id
    const employeeCode = (dto as any).employeeId;

    return await this.service.createForEmployeeCode({
      employeeCode,
      date: dto.date,
      clockInTime: dto.clockInTime,
      clockOutTime: dto.clockOutTime ?? null,
      notes: dto.notes ?? null,
    });
  }

  // Employee: clock-in for self (date default to today, cannot set employeeId)
  @Post('self')
  @Roles('employee')
  async clockInSelf(@Req() req: any, @Body() dto: CreateClockInSelfDto) {
    const email = req.user?.email;
    if (!email) throw new ForbiddenException('Missing user email');

    return await this.service.createForEmployeeEmail({
      email,
      clockInTime: dto.clockInTime,
      notes: dto.notes ?? null,
    });
  }

  @Get()
  @Roles('admin')
  async findAll() {
    return await this.service.getAllWithEmployee();
  }


  @Get('self')
  @Roles('employee')
  async findSelf(@Req() req: any) {
    // console.log(req.user);
    const email = req.user?.email;
    if (!email) throw new ForbiddenException('Missing user email');
    return await this.service.getForEmployeeEmail(email);
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const item = await this.service.getByIdWithEmployee(id);
    if (!item) {
      // keep consistent with existing conventions — return 404 when missing
      throw new (require('@nestjs/common').NotFoundException)('ClockInOut not found');
    }
    return item;
  }

  // Admin: free update
  @Patch(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() dto: UpdateClockInOutDto) {
    // if date supplied, convert
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    return await this.service.update(id, data);
  }

  // Employee: can add clockOutTime (only if not already set) and modify notes on own record
  @Patch('self/:id')
  @Roles('employee')
  async updateSelf(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateClockInSelfDto) {
    // console.log(req.user);
    const email = req.user?.email;
    if (!email) throw new ForbiddenException('Missing user email');
    return await this.service.updateByEmployee(id, email, {
      clockOutTime: (dto as any).clockOutTime ?? undefined,
      notes: (dto as any).notes ?? undefined,
    });
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return await this.service.remove(id);
  }
}
