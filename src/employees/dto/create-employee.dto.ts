import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsOptional() middleName?: string;
  @IsString() @IsNotEmpty() lastName: string;

  @IsDateString() @Type(() => Date) dateOfBirth: string;
  @IsString() @IsNotEmpty() gender: string;
  @IsString() @IsNotEmpty() maritalStatus: string;
  @IsString() @IsNotEmpty() nationality: string;

  @IsEmail() email: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsOptional() alternatePhone?: string;
  @IsString() @IsNotEmpty() address: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() state: string;
  @IsString() @IsNotEmpty() zipCode: string;
  @IsString() @IsNotEmpty() country: string;

  @IsString() @IsNotEmpty() employeeId: string;
  @IsString() @IsNotEmpty() department: string;
  @IsString() @IsNotEmpty() position: string;
  @IsString() @IsNotEmpty() jobTitle: string;
  @IsString() @IsNotEmpty() employmentType: string;

  @IsDateString() @Type(() => Date) dateOfJoining: string;
  @IsString() @IsNotEmpty() workLocation: string;
  @IsString() @IsOptional() reportingManager?: string;

  @IsString() @IsNotEmpty() bankName: string;
  @IsString() @IsNotEmpty() accountNumber: string;
  @IsString() @IsNotEmpty() ifscCode: string;

  @IsString() @IsNotEmpty() emergencyContactName: string;
  @IsString() @IsNotEmpty() emergencyContactRelation: string;
  @IsString() @IsNotEmpty() emergencyContactPhone: string;
  @IsString() @IsNotEmpty() emergencyContactAddress: string;

  @IsString() @IsOptional() citizenShipNumber?: string;
  @IsString() @IsOptional() panNumber?: string;
  @IsString() @IsOptional() passportNumber?: string;
  @IsString() @IsOptional() drivingLicense?: string;

  @IsString() @IsOptional() bloodGroup?: string;
  @IsString() @IsOptional() allergies?: string;
  @IsString() @IsOptional() notes?: string;
}