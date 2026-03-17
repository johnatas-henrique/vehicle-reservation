import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../../src/app.module';
import { UsersRepository } from '../../src/users/users.repository';
import { Role } from '../../src/common/enums/role.enum';

describe('Vehicles Integration (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let vehicleId: string;
  const adminEmail = `admin_${Date.now()}@localhost.com`;

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
    try {
      await usersRepo.create({
        name: 'Admin Seed',
        email: adminEmail,
        password: 'admin123',
        role: Role.Admin,
      });
    } catch (err) {
      if (!err?.code || err.code !== 11000) {
        throw err;
      }
    }

    const loginAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: 'admin123' });

    expect([200, 201]).toContain(loginAdmin.status);
    expect(loginAdmin.body).toHaveProperty('accessToken');
    adminToken = loginAdmin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.env.NODE_ENV = undefined;
    process.env.MONGO_URI = undefined;
  });

  it('admin creates a vehicle', async () => {
    const res = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Fiesta',
        year: 2018,
        bodywork: 'Hatch compacto',
        engine: 'Motor 1.0',
        seats: 5,
        active: true,
        inactiveReason: null,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    vehicleId = res.body._id;
  });

  it('returns all vehicles', async () => {
    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('returns a vehicle by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Fiesta');
  });

  it('updates a vehicle', async () => {
    const res = await request(app.getHttpServer())
      .put(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Fiesta Updated' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Fiesta Updated');
  });

  it('rejects invalid bodywork value', async () => {
    const res = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Invalid',
        year: 2022,
        bodywork: 'SpaceShip',
        engine: 'Motor 1.0',
        seats: 4,
      });

    expect(res.status).toBe(400);
  });

  it('rejects invalid engine value', async () => {
    const res = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Invalid',
        year: 2022,
        bodywork: 'Hatch médio',
        engine: 'Motor 10.0',
        seats: 4,
      });

    expect(res.status).toBe(400);
  });

  it('deletes a vehicle', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: true });
  });
});
