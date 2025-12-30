import { IsString, IsOptional, IsNotEmpty, IsDateString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClockInOutDto {
  @IsString()
  @IsNotEmpty()
  // Received from frontend — the employee code (e.g. "EMP-001")
  employeeId: string;

  @IsDateString()
  date: string; // ISO date

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  clockInTime: string; // HH:mm

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/)
  clockOutTime?: string; // HH:mm

  @IsString()
  @IsOptional()
  notes?: string;
}
