import { IsString, IsOptional, IsNotEmpty, Matches } from 'class-validator';

export class CreateClockInSelfDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/)
  clockInTime: string; // HH:mm

  @IsString()
  @IsOptional()
  notes?: string;
}
