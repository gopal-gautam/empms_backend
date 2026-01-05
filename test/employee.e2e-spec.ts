import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Auth0Service } from '../src/auth/auth0.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/auth/roles.guard';

describe('Employee (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let auth0Service: Auth0Service;
  let authToken: string;

  const mockEmployee = {
    firstName: 'John',
    middleName: 'A',
    lastName: 'Doe',
    dateOfBirth: '1992-04-18T00:00:00.000Z',
    gender: 'Male',
    maritalStatus: 'Single',
    nationality: 'Indian',
    email: 'john.doe@example.com',
    phone: '1234567890',
    alternatePhone: '9876543210',
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
    dateOfJoining: '2020-07-01T00:00:00.000Z',
    workLocation: 'Mumbai Office',
    reportingManager: 'Jane Smith',
    bankName: 'HDFC Bank',
    accountNumber: '1234567890',
    ifscCode: 'HDFC0001234',
    emergencyContactName: 'Jane Doe',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '9876543210',
    emergencyContactAddress: '123 Main St',
    citizenShipNumber: 'CIT12345',
    panNumber: 'ABCDE1234F',
    passportNumber: 'P1234567',
    drivingLicense: 'DL1234567890',
    bloodGroup: 'O+',
    allergies: 'None',
    notes: 'Test employee',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(Auth0Service)
      .useValue({
        createUser: jest.fn().mockResolvedValue(undefined),
      })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const request = context.switchToHttp().getRequest();
          const authHeader = request.headers.authorization;
          if (!authHeader) {
            return false;
          }
          request.user = {
            sub: 'test-user-id',
            email: 'admin@example.com',
            roles: ['admin']
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    auth0Service = moduleFixture.get<Auth0Service>(Auth0Service);

    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prismaService.employee.deleteMany({});
  });

  describe('/employees (POST)', () => {
    it('should create a new employee with valid data', () => {
      return request(app.getHttpServer())
        .post('/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockEmployee)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.firstName).toBe(mockEmployee.firstName);
          expect(res.body.lastName).toBe(mockEmployee.lastName);
          expect(res.body.email).toBe(mockEmployee.email);
          expect(res.body.employeeId).toBe(mockEmployee.employeeId);
        });
    });

    it('should fail to create employee without required fields', () => {
      return request(app.getHttpServer())
        .post('/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
        })
        .expect(400);
    });

    it('should fail to create employee with invalid email', () => {
      return request(app.getHttpServer())
        .post('/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...mockEmployee,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should fail to create employee with invalid date format', () => {
      return request(app.getHttpServer())
        .post('/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...mockEmployee,
          dateOfBirth: 'not-a-date',
        })
        .expect(400);
    });

    it('should fail to create employee without authorization', () => {
      return request(app.getHttpServer())
        .post('/employees')
        .send(mockEmployee)
        .expect(401);
    });
  });

  describe('/employees (GET)', () => {
    beforeEach(async () => {
      await prismaService.employee.create({
        data: mockEmployee,
      });
    });

    it('should return all employees', () => {
      return request(app.getHttpServer())
        .get('/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('firstName');
          expect(res.body[0]).toHaveProperty('email');
        });
    });

    it('should return employees with specific fields when fields query parameter is provided', () => {
      return request(app.getHttpServer())
        .get('/employees?fields=id,firstName,lastName,email')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('firstName');
          expect(res.body[0]).toHaveProperty('lastName');
          expect(res.body[0]).toHaveProperty('email');
          expect(res.body[0]).not.toHaveProperty('phone');
          expect(res.body[0]).not.toHaveProperty('address');
        });
    });

    it('should filter out invalid fields from query parameter', () => {
      return request(app.getHttpServer())
        .get('/employees?fields=id,firstName,invalidField,email')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('firstName');
          expect(res.body[0]).toHaveProperty('email');
        });
    });

    it('should fail to get employees without authorization', () => {
      return request(app.getHttpServer()).get('/employees').expect(401);
    });
  });

  describe('/employees/:id (GET)', () => {
    let createdEmployeeId: string;

    beforeEach(async () => {
      const employee = await prismaService.employee.create({
        data: mockEmployee,
      });
      createdEmployeeId = employee.id;
    });

    it('should return a specific employee by id', () => {
      return request(app.getHttpServer())
        .get(`/employees/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdEmployeeId);
          expect(res.body.firstName).toBe(mockEmployee.firstName);
          expect(res.body.email).toBe(mockEmployee.email);
        });
    });

    it('should return null for non-existent employee', () => {
      return request(app.getHttpServer())
        .get('/employees/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeNull();
        });
    });

    it('should fail to get employee by id without authorization', () => {
      return request(app.getHttpServer())
        .get(`/employees/${createdEmployeeId}`)
        .expect(401);
    });
  });

  describe('/employees/:id (DELETE)', () => {
    let createdEmployeeId: string;

    beforeEach(async () => {
      const employee = await prismaService.employee.create({
        data: mockEmployee,
      });
      createdEmployeeId = employee.id;
    });

    it('should delete an employee by id', async () => {
      await request(app.getHttpServer())
        .delete(`/employees/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdEmployeeId);
        });

      const deletedEmployee = await prismaService.employee.findUnique({
        where: { id: createdEmployeeId },
      });
      expect(deletedEmployee).toBeNull();
    });

    it('should fail to delete non-existent employee', () => {
      return request(app.getHttpServer())
        .delete('/employees/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);
    });

    it('should fail to delete employee without authorization', () => {
      return request(app.getHttpServer())
        .delete(`/employees/${createdEmployeeId}`)
        .expect(401);
    });
  });

  describe('Employee workflow (e2e)', () => {
    it('should complete full CRUD workflow', async () => {
      let employeeId: string;

      await request(app.getHttpServer())
        .post('/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockEmployee)
        .expect(201)
        .expect((res) => {
          employeeId = res.body.id;
          expect(res.body.firstName).toBe(mockEmployee.firstName);
        });

      await request(app.getHttpServer())
        .get(`/employees/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(employeeId);
          expect(res.body.email).toBe(mockEmployee.email);
        });

      await request(app.getHttpServer())
        .get('/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBeGreaterThan(0);
          const foundEmployee = res.body.find((emp: any) => emp.id === employeeId);
          expect(foundEmployee).toBeDefined();
        });

      await request(app.getHttpServer())
        .delete(`/employees/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/employees/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeNull();
        });
    });
  });
});
