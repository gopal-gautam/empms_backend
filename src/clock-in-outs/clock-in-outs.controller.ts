import { Controller, Post, Body, Get, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { ClockInOutsService } from './clock-in-outs.service';
import { CreateClockInOutDto } from './dto/create-clock-in-out.dto';
import { UpdateClockInOutDto } from './dto/update-clock-in-out.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('clock-in-outs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ClockInOutsController {
  constructor(private readonly service: ClockInOutsService) {}

  @Post()
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

  @Get()
  async findAll() {
    return await this.service.getAllWithEmployee();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.service.getByIdWithEmployee(id);
    if (!item) {
      // keep consistent with existing conventions — return 404 when missing
      throw new (require('@nestjs/common').NotFoundException)('ClockInOut not found');
    }
    return item;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateClockInOutDto) {
    // if date supplied, convert
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    return await this.service.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.remove(id);
  }
}
