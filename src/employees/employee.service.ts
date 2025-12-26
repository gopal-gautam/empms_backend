import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Employee, Prisma } from '../generated/prisma/client';

@Injectable()
export class EmployeeService {
    constructor(private prismaService: PrismaService) { }

    async createEmployee(data: Prisma.EmployeeCreateInput): Promise<Employee> {
        return this.prismaService.employee.create({ data });
    }

    //Get all employees
    async getAllEmployees(): Promise<Employee[]> {
        return this.prismaService.employee.findMany();
    }


    //Get employee by ID
    async getEmployeeById(id: string): Promise<Employee | null> {
        return this.prismaService.employee.findUnique({
            where: { id },
        });
    }

    //Delete employee by ID
    async deleteEmployee(id: string): Promise<Employee> {
        return this.prismaService.employee.delete({
            where: { id },
        });
    }
}