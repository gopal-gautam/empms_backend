import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from './employee.service';
import { PrismaService } from '../prisma/prisma.service';
import { Auth0Service } from '../auth/auth0.service';
import { Employee, Prisma } from '../generated/prisma/client';
import { afterEach, beforeEach, describe, it } from 'node:test';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let prismaService: PrismaService;
  let auth0Service: Auth0Service;

  const mockEmployee: Employee = {
    id: '1',
    firstName: 'John',
    middleName: null,
    lastName: 'Doe',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'Male',
    maritalStatus: 'Single',
    nationality: 'Indian',
    email: 'john.doe@example.com',
    phone: '1234567890',
    alternatePhone: null,
    address: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    country: 'India',
    employeeId: 'EMP001',
    department: 'Engineering',
    position: 'Senior',
    jobTitle: 'Software Engineer',
    employmentType: 'Full-time',
    dateOfJoining: new Date('2020-01-01'),
    workLocation: 'Mumbai Office',
    reportingManager: null,
    bankName: 'HDFC Bank',
    accountNumber: '1234567890',
    ifscCode: 'HDFC0001234',
    emergencyContactName: 'Jane Doe',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '9876543210',
    emergencyContactAddress: '123 Main St',
    citizenShipNumber: null,
    panNumber: null,
    passportNumber: null,
    drivingLicense: null,
    bloodGroup: null,
    allergies: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    employee: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAuth0Service = {
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: Auth0Service,
          useValue: mockAuth0Service,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    prismaService = module.get<PrismaService>(PrismaService);
    auth0Service = module.get<Auth0Service>(Auth0Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEmployee', () => {
    const createEmployeeDto: Prisma.EmployeeCreateInput = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Male',
      maritalStatus: 'Single',
      nationality: 'Indian',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
      employeeId: 'EMP001',
      department: 'Engineering',
      position: 'Senior',
      jobTitle: 'Software Engineer',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2020-01-01'),
      workLocation: 'Mumbai Office',
      bankName: 'HDFC Bank',
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
      emergencyContactName: 'Jane Doe',
      emergencyContactRelation: 'Spouse',
      emergencyContactPhone: '9876543210',
      emergencyContactAddress: '123 Main St',
    };

    it('should create an employee and Auth0 user successfully', async () => {
      mockPrismaService.employee.create.mockResolvedValue(mockEmployee);
      mockAuth0Service.createUser.mockResolvedValue(undefined);

      const result = await service.createEmployee(createEmployeeDto);

      expect(result).toEqual(mockEmployee);
      expect(prismaService.employee.create).toHaveBeenCalledWith({
        data: createEmployeeDto,
      });
      expect(auth0Service.createUser).toHaveBeenCalledWith(
        mockEmployee.email,
        mockEmployee.firstName,
        mockEmployee.lastName,
      );
    });

    it('should rollback employee creation if Auth0 user creation fails', async () => {
      mockPrismaService.employee.create.mockResolvedValue(mockEmployee);
      mockAuth0Service.createUser.mockRejectedValue(
        new Error('Auth0 creation failed'),
      );
      mockPrismaService.employee.delete.mockResolvedValue(mockEmployee);

      await expect(service.createEmployee(createEmployeeDto)).rejects.toThrow(
        'Auth0 creation failed',
      );

      expect(prismaService.employee.create).toHaveBeenCalledWith({
        data: createEmployeeDto,
      });
      expect(auth0Service.createUser).toHaveBeenCalledWith(
        mockEmployee.email,
        mockEmployee.firstName,
        mockEmployee.lastName,
      );
      expect(prismaService.employee.delete).toHaveBeenCalledWith({
        where: { id: mockEmployee.id },
      });
    });
  });

  describe('getAllEmployees', () => {
    it('should return an array of employees', async () => {
      const mockEmployees = [mockEmployee];
      mockPrismaService.employee.findMany.mockResolvedValue(mockEmployees);

      const result = await service.getAllEmployees();

      expect(result).toEqual(mockEmployees);
      expect(prismaService.employee.findMany).toHaveBeenCalled();
    });

    it('should return an empty array when no employees exist', async () => {
      mockPrismaService.employee.findMany.mockResolvedValue([]);

      const result = await service.getAllEmployees();

      expect(result).toEqual([]);
      expect(prismaService.employee.findMany).toHaveBeenCalled();
    });
  });

  describe('getEmployeeById', () => {
    it('should return an employee by id', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);

      const result = await service.getEmployeeById('1');

      expect(result).toEqual(mockEmployee);
      expect(prismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null when employee is not found', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(null);

      const result = await service.getEmployeeById('999');

      expect(result).toBeNull();
      expect(prismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { id: '999' },
      });
    });
  });

  describe('deleteEmployee', () => {
    it('should delete an employee by id', async () => {
      mockPrismaService.employee.delete.mockResolvedValue(mockEmployee);

      const result = await service.deleteEmployee('1');

      expect(result).toEqual(mockEmployee);
      expect(prismaService.employee.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('getAllEmployeesColumns', () => {
    it('should return employees with specific columns', async () => {
      const columns: (keyof Employee)[] = ['id', 'firstName', 'lastName', 'email'];
      const mockResult = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      ];
      mockPrismaService.employee.findMany.mockResolvedValue(mockResult);

      const result = await service.getAllEmployeesColumns(columns);

      expect(result).toEqual(mockResult);
      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
    });

    it('should return employees with single column', async () => {
      const columns: (keyof Employee)[] = ['email'];
      const mockResult = [{ email: 'john.doe@example.com' }];
      mockPrismaService.employee.findMany.mockResolvedValue(mockResult);

      const result = await service.getAllEmployeesColumns(columns);

      expect(result).toEqual(mockResult);
      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        select: { email: true },
      });
    });
  });
});
