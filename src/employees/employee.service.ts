import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Employee, Prisma } from '../generated/prisma/client';
import { Auth0Service } from '../auth/auth0.service';

@Injectable()
export class EmployeeService {
    constructor(
        private prismaService: PrismaService,
        private auth0Service: Auth0Service,
    ) { }

    async createEmployee(data: Prisma.EmployeeCreateInput): Promise<Employee> {
        const employee = await this.prismaService.employee.create({ data });

        try {
            await this.auth0Service.createUser(
                employee.email,
                employee.firstName,
                employee.lastName,
            );
        } catch (error) {
            await this.prismaService.employee.delete({
                where: { id: employee.id },
            });
            throw error;
        }

        return employee;
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