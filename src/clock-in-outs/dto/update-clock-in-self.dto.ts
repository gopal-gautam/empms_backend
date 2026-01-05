import { IsString, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateClockInSelfDto {
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/)
  clockOutTime?: string; // HH:mm

  @IsString()
  @IsOptional()
  notes?: string;
}
