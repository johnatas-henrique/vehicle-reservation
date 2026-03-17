import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { UsersRepository } from './users/users.repository';
import { Role } from './common/enums/role.enum';

async function seedAdmin(app) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const repo = app.get(UsersRepository);
  const email = process.env.ADMIN_EMAIL || 'admin@localhost.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const existing = await repo.findByEmail(email);
  if (!existing) {
    await repo.create({ name: 'Admin', email, password, role: Role.Admin });
    console.log(`Admin seed created (${email})`);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableCors();
  await app.init();

  await seedAdmin(app);

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

bootstrap();
