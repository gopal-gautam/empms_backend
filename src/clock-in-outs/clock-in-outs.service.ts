import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClockInOut, Prisma } from '../generated/prisma/client';

@Injectable()
export class ClockInOutsService {
  constructor(private prismaService: PrismaService) {}

  // Keep a low-level create helper if needed
  async createClockInOut(data: Prisma.ClockInOutCreateInput): Promise<ClockInOut> {
    return this.prismaService.clockInOut.create({ data });
  }

  // Create from frontend payload using employee code/employeeID (admin)
  async createForEmployeeCode(payload: {
    employeeCode: string;
    date: string | Date;
    clockInTime: string;
    clockOutTime?: string | null;
    notes?: string | null;
  }): Promise<ClockInOut> {
    const employee = await this.prismaService.employee.findUnique({ where: { employeeId: payload.employeeCode } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const data: Prisma.ClockInOutCreateInput = {
      employeeId: employee.id,
      date: typeof payload.date === 'string' ? new Date(payload.date) : payload.date,
      clockInTime: payload.clockInTime,
      clockOutTime: payload.clockOutTime ?? null,
      notes: payload.notes ?? null,
    } as any;

    return this.prismaService.clockInOut.create({ data });
  }

  // Create clock-in for the authenticated employee (date defaults to today)
  async createForEmployeeEmail(payload: {
    email: string;
    clockInTime: string;
    notes?: string | null;
    date?: Date;
  }): Promise<ClockInOut> {
    const employee = await this.prismaService.employee.findUnique({ where: { email: payload.email } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const data: Prisma.ClockInOutCreateInput = {
      employeeId: employee.id,
      date: payload.date ?? new Date(),
      clockInTime: payload.clockInTime,
      clockOutTime: null,
      notes: payload.notes ?? null,
    } as any;

    return this.prismaService.clockInOut.create({ data });
  }

  // Allow an employee to update only their own record: add clockOutTime (only if not already set) and notes
  async updateByEmployee(id: string, email: string, data: { clockOutTime?: string | undefined | null; notes?: string | undefined | null; }): Promise<ClockInOut> {
    const row = await this.prismaService.clockInOut.findUnique({ where: { id }, include: { employee: true } });
    if (!row) throw new NotFoundException('ClockInOut not found');

    if (row.employee?.email !== email) {
      throw new ForbiddenException('Not allowed to modify this record');
    }

    const updateData: Prisma.ClockInOutUpdateInput = {} as any;

    if (data.clockOutTime !== undefined) {
      // allow setting clockOutTime only if not already set
      if (row.clockOutTime) {
        throw new ForbiddenException('Clock-out time is already set and cannot be modified');
      }
      updateData.clockOutTime = data.clockOutTime ?? null;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes ?? null;
    }

    // If no allowed fields provided, just return the row
    const keys = Object.keys(updateData);
    if (keys.length === 0) return row;

    return this.prismaService.clockInOut.update({ where: { id }, data: updateData });
  }

  /**
   * Return enriched records for frontend consumption
   * Each item includes employee code and names from the Employee model
   */
  async getAllWithEmployee(): Promise<Array<{
    id: string;
    employeeId: string; // employee code
    firstName: string;
    lastName: string;
    date: string; // ISO
    clockInTime: string;
    clockOutTime?: string | null;
    notes?: string | null;
  }>> {
    const rows = await this.prismaService.clockInOut.findMany({ include: { employee: true } });
    return rows.map(r => ({
      id: r.id,
      employeeId: r.employee?.employeeId ?? '',
      firstName: r.employee?.firstName ?? '',
      lastName: r.employee?.lastName ?? '',
      date: r.date.toISOString(),
      clockInTime: r.clockInTime,
      clockOutTime: r.clockOutTime ?? null,
      notes: r.notes ?? null,
    }));
  }

  async getByIdWithEmployee(id: string): Promise<{
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    date: string;
    clockInTime: string;
    clockOutTime?: string | null;
    notes?: string | null;
  } | null> {
    const r = await this.prismaService.clockInOut.findUnique({ where: { id }, include: { employee: true } });
    if (!r) return null;
    return {
      id: r.id,
      employeeId: r.employee?.employeeId ?? '',
      firstName: r.employee?.firstName ?? '',
      lastName: r.employee?.lastName ?? '',
      date: r.date.toISOString(),
      clockInTime: r.clockInTime,
      clockOutTime: r.clockOutTime ?? null,
      notes: r.notes ?? null,
    };
  }


  async getForEmployeeEmail(email: string): Promise<Array<{
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    date: string;
    clockInTime: string;
    clockOutTime?: string | null;
    notes?: string | null;
  }>> {

    const rows = await this.prismaService.clockInOut.findMany({
      where: { employee: { email } },
      include: { employee: true }
    });

    return rows.map(r => ({
      id: r.id,
      employeeId: r.employee?.employeeId ?? '',
      firstName: r.employee?.firstName ?? '',
      lastName: r.employee?.lastName ?? '',
      date: r.date.toISOString(),
      clockInTime: r.clockInTime,
      clockOutTime: r.clockOutTime ?? null,
      notes: r.notes ?? null,
    }));
  }

  async update(id: string, data: Prisma.ClockInOutUpdateInput): Promise<ClockInOut> {
    return this.prismaService.clockInOut.update({ where: { id }, data });
  }

  async remove(id: string): Promise<ClockInOut> {
    return this.prismaService.clockInOut.delete({ where: { id } });
  }
}
