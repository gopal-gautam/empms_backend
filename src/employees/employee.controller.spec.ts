import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Employee } from '../generated/prisma/client';

describe('EmployeeController', () => {
  let controller: EmployeeController;
  let service: EmployeeService;

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

  const mockEmployeeService = {
    createEmployee: jest.fn(),
    getAllEmployees: jest.fn(),
    getAllEmployeesColumns: jest.fn(),
    getEmployeeById: jest.fn(),
    deleteEmployee: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<EmployeeController>(EmployeeController);
    service = module.get<EmployeeService>(EmployeeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new employee', async () => {
      const createEmployeeDto: CreateEmployeeDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
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
        dateOfJoining: '2020-01-01',
        workLocation: 'Mumbai Office',
        bankName: 'HDFC Bank',
        accountNumber: '1234567890',
        ifscCode: 'HDFC0001234',
        emergencyContactName: 'Jane Doe',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '9876543210',
        emergencyContactAddress: '123 Main St',
      };

      mockEmployeeService.createEmployee.mockResolvedValue(mockEmployee);

      const result = await controller.create(createEmployeeDto);

      expect(result).toEqual(mockEmployee);
      expect(service.createEmployee).toHaveBeenCalledWith(createEmployeeDto);
    });

    it('should throw an error when employee creation fails', async () => {
      const createEmployeeDto: CreateEmployeeDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
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
        dateOfJoining: '2020-01-01',
        workLocation: 'Mumbai Office',
        bankName: 'HDFC Bank',
        accountNumber: '1234567890',
        ifscCode: 'HDFC0001234',
        emergencyContactName: 'Jane Doe',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '9876543210',
        emergencyContactAddress: '123 Main St',
      };

      const error = new Error('Creation failed');
      mockEmployeeService.createEmployee.mockRejectedValue(error);

      await expect(controller.create(createEmployeeDto)).rejects.toThrow(
        'Creation failed',
      );
      expect(service.createEmployee).toHaveBeenCalledWith(createEmployeeDto);
    });
  });

  describe('findAll', () => {
    it('should return all employees when no fields specified', async () => {
      const mockEmployees = [mockEmployee];
      mockEmployeeService.getAllEmployees.mockResolvedValue(mockEmployees);

      const result = await controller.findAll();

      expect(result).toEqual(mockEmployees);
      expect(service.getAllEmployees).toHaveBeenCalled();
      expect(service.getAllEmployeesColumns).not.toHaveBeenCalled();
    });

    it('should return employees with specific fields when fields parameter is provided', async () => {
      const fields = 'id,firstName,lastName,email';
      const mockResult = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      ];
      mockEmployeeService.getAllEmployeesColumns.mockResolvedValue(mockResult);

      const result = await controller.findAll(fields);

      expect(result).toEqual(mockResult);
      expect(service.getAllEmployeesColumns).toHaveBeenCalledWith([
        'id',
        'firstName',
        'lastName',
        'email',
      ]);
      expect(service.getAllEmployees).not.toHaveBeenCalled();
    });

    it('should filter out invalid fields from the fields parameter', async () => {
      const fields = 'id,firstName,invalidField,email';
      const mockResult = [
        { id: '1', firstName: 'John', email: 'john.doe@example.com' },
      ];
      mockEmployeeService.getAllEmployeesColumns.mockResolvedValue(mockResult);

      const result = await controller.findAll(fields);

      expect(result).toEqual(mockResult);
      expect(service.getAllEmployeesColumns).toHaveBeenCalledWith([
        'id',
        'firstName',
        'email',
      ]);
    });

    it('should handle fields with extra spaces', async () => {
      const fields = ' id , firstName , email ';
      const mockResult = [
        { id: '1', firstName: 'John', email: 'john.doe@example.com' },
      ];
      mockEmployeeService.getAllEmployeesColumns.mockResolvedValue(mockResult);

      const result = await controller.findAll(fields);

      expect(result).toEqual(mockResult);
      expect(service.getAllEmployeesColumns).toHaveBeenCalledWith([
        'id',
        'firstName',
        'email',
      ]);
    });

    it('should return all employees when fields parameter is empty string', async () => {
      const mockEmployees = [mockEmployee];
      mockEmployeeService.getAllEmployees.mockResolvedValue(mockEmployees);

      const result = await controller.findAll('');

      expect(result).toEqual(mockEmployees);
      expect(service.getAllEmployees).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single employee by id', async () => {
      mockEmployeeService.getEmployeeById.mockResolvedValue(mockEmployee);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockEmployee);
      expect(service.getEmployeeById).toHaveBeenCalledWith('1');
    });

    it('should return null when employee is not found', async () => {
      mockEmployeeService.getEmployeeById.mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(result).toBeNull();
      expect(service.getEmployeeById).toHaveBeenCalledWith('999');
    });
  });

  describe('remove', () => {
    it('should delete an employee by id', async () => {
      mockEmployeeService.deleteEmployee.mockResolvedValue(mockEmployee);

      const result = await controller.remove('1');

      expect(result).toEqual(mockEmployee);
      expect(service.deleteEmployee).toHaveBeenCalledWith('1');
    });
  });
});
