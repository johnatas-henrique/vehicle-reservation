import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { UsersRepository } from './users/users.repository';
import { Role } from './common/enums/role.enum';

async function seedAdmin(app: INestApplication) {
  const configService = app.get<ConfigService>(ConfigService, {
    strict: false,
  });
  const getSafe =
    configService && typeof (configService as any).get === 'function'
      ? (configService as any).get.bind(configService)
      : () => undefined;

  const env = (key: string, fallback: string) =>
    getSafe(key) ?? process.env[key] ?? fallback;

  if (env('NODE_ENV', '') === 'test') {
    return;
  }

  const repo = app.get(UsersRepository);
  const email = env('ADMIN_EMAIL', 'admin@localhost.com');
  const password = env('ADMIN_PASSWORD', 'admin123');
  const existing = await repo.findByEmail(email);

  if (!existing) {
    await repo.create({ name: 'Admin', email, password, role: Role.Admin });
    console.log(`Admin seed created (${email})`);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.enableCors();
  await app.init();

  await seedAdmin(app);

  await app.listen(Number(process.env.PORT) || 3000);
}

void bootstrap();
