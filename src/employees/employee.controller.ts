import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EmployeeService } from './employee.service';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) { }

  @Post()
  async create(@Body() createEmployeeDto: any) {
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

}