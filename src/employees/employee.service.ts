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

    async getAllEmployeesColumns(columns: (keyof Employee)[]): Promise<Record<string, any>[]> {
        // If no columns are provided, return all employees (safe fallback)
        if (!columns || columns.length === 0) {
            return this.prismaService.employee.findMany();
        }
      
        // Build select object dynamically
        const select = columns.reduce((acc, col) => ({ ...acc, [col]: true }), {}) as Prisma.EmployeeSelect;
        return this.prismaService.employee.findMany({ select }) as Promise<Record<string, any>[]>;
    }
}