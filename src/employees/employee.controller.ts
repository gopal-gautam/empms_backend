import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) { }

  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    // You may want to define a CreateEmployeeDto for better typing
    return await this.employeeService.createEmployee(createEmployeeDto);
  }

  @Get()
  async findAll() {
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