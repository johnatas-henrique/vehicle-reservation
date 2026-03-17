import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../../src/app.module';
import { UsersRepository } from '../../src/users/users.repository';
import { Role } from '../../src/common/enums/role.enum';

describe('Auth + Users Integration (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let userToken: string;
  let createdUserId: string;
  const adminEmail = `admin_${Date.now()}@localhost.com`;
  const userEmail = `user_${Date.now()}@localhost.com`;
  const anotherEmail = `another_${Date.now()}@localhost.com`;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    const usersRepo = app.get<UsersRepository>(UsersRepository);
    try {
      await usersRepo.create({ name: 'Admin Seed', email: adminEmail, password: 'admin123', role: Role.Admin });
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

  it('admin creates a user', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Regular User', email: userEmail, password: 'user1234', role: Role.User });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe(userEmail);
    expect(res.body.role).toBe(Role.User);
    createdUserId = res.body._id;
  });

  it('user cannot create another user', async () => {
    const loginUser = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password: 'user1234' });

    expect([200, 201]).toContain(loginUser.status);
    expect(loginUser.body).toHaveProperty('accessToken');
    userToken = loginUser.body.accessToken;

    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Another', email: 'newuser@localhost', password: 'new1234', role: Role.User });

    expect(res.status).toBe(403);
  });

  it('user updates own profile', async () => {
    const res = await request(app.getHttpServer())
      .put(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'User Updated' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('User Updated');
  });

  it('user cannot delete another user', async () => {
    const another = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Another User', email: anotherEmail, password: 'another1234', role: Role.User });

    expect(another.status).toBe(201);

    const res = await request(app.getHttpServer())
      .delete(`/users/${another.body._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('admin can delete a user', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: true });
  });

  it('login with invalid email format should fail validation', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'invalid-email', password: 'admin123' });

    expect(res.status).toBe(400);
  });
});
