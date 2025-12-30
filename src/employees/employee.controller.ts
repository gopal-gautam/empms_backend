import { Controller, Post, Body, Get, Param, Delete, UseGuards, Query, Logger } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Employee } from 'src/generated/prisma/browser';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) { }

  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    try {
      return await this.employeeService.createEmployee(createEmployeeDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async findAll(@Query('fields') fields?: string) {
    // const logger = new Logger(EmployeeController.name);
    // logger.debug(`GET /employees fields: ${fields}`);
    const ALLOWED_FIELDS = [
      "id","firstName","middleName","lastName","dateOfBirth","gender","maritalStatus","nationality","email","phone","alternatePhone","address","city","state","zipCode","country","employeeId","department","position","jobTitle","employmentType","dateOfJoining","workLocation","reportingManager","bankName","accountNumber","ifscCode","emergencyContactName","emergencyContactRelation","emergencyContactPhone","emergencyContactAddress","citizenShipNumber","panNumber","passportNumber","drivingLicense","bloodGroup","allergies","notes","createdAt","updatedAt"
    ] as const;
    if (fields) {
      const fieldArray = fields.split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .filter(c => ALLOWED_FIELDS.includes(c as any));
      return await this.employeeService.getAllEmployeesColumns(fieldArray as (keyof Employee)[]);
    } 
    return await this.employeeService.getAllEmployees();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.employeeService.getEmployeeById(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.employeeService.deleteEmployee(id);
  }

}