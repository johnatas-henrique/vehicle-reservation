import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../../src/app.module';
import { UsersRepository } from '../../src/users/users.repository';
import { VehiclesRepository } from '../../src/vehicles/vehicles.repository';
import { Role } from '../../src/common/enums/role.enum';

describe('Reservations Integration (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let adminUserId: string;
  let vehicleId: string;
  let reservationId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    const usersRepo = app.get<UsersRepository>(UsersRepository);
    const existing = await usersRepo.findByEmail('admin@localhost.com');
    if (!existing) {
      const admin = await usersRepo.create({
        name: 'Admin Seed',
        email: 'admin@localhost.com',
        password: 'admin123',
        role: Role.Admin,
      });
      adminUserId = admin._id.toString();
    } else {
      adminUserId = existing._id.toString();
    }

    const loginAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@localhost.com', password: 'admin123' });

    expect([200, 201]).toContain(loginAdmin.status);
    adminToken = loginAdmin.body.accessToken;

    const vehiclesRepo = app.get<VehiclesRepository>(VehiclesRepository);
    const vehicle = await vehiclesRepo.create({
      name: 'Uno',
      year: 2020,
      bodywork: 'Hatch compacto',
      engine: 'Motor 1.0',
      seats: 5,
      active: true,
      inactiveReason: null,
    } as any);
    vehicleId = vehicle._id.toString();
  });

  afterAll(async () => {
    await app.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.env.NODE_ENV = undefined;
    process.env.MONGO_URI = undefined;
  });

  it('reserves a vehicle', async () => {
    const res = await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: adminUserId,
        vehicleId,
        startedAt: new Date().toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('status', 'active');
    reservationId = res.body._id;
  });

  it('does not allow second reservation for same user', async () => {
    const res = await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: adminUserId,
        vehicleId,
        startedAt: new Date().toISOString(),
      });

    expect(res.status).toBe(400);
  });

  it('fails to reserve non-existent user', async () => {
    const res = await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: '000000000000000000000000',
        vehicleId,
        startedAt: new Date().toISOString(),
      });

    expect(res.status).toBe(404);
  });

  it('fails to reserve non-existent vehicle', async () => {
    const res = await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: adminUserId,
        vehicleId: '000000000000000000000000',
        startedAt: new Date().toISOString(),
      });

    expect(res.status).toBe(404);
  });

  it('fails to reserve inactive vehicle', async () => {
    // create inactive vehicle
    const inactive = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Fiat City',
        year: 2022,
        bodywork: 'Hatch compacto',
        engine: 'Motor 1.0',
        seats: 5,
        active: false,
        inactiveReason: 'manutenção',
      });

    expect(inactive.status).toBe(201);

    const res = await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: adminUserId,
        vehicleId: inactive.body._id,
        startedAt: new Date().toISOString(),
      });

    expect(res.status).toBe(400);
  });

  it('lists reservations for user', async () => {
    const res = await request(app.getHttpServer())
      .get(`/reservations/user/${adminUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('finishes reservation', async () => {
    const res = await request(app.getHttpServer())
      .put(`/reservations/${reservationId}/finish`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'finished');
  });

  it('allows new reservation after finish', async () => {
    const res = await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: adminUserId,
        vehicleId,
        startedAt: new Date().toISOString(),
      });

    expect(res.status).toBe(201);
  });
});
