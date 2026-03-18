import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { seedAdmin, seedVehicles } from './seeds/init.seed';

export { seedAdmin, seedVehicles } from './seeds/init.seed';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.enableCors();
  await app.init();

  await seedAdmin(app);
  await seedVehicles(app);

  await app.listen(Number(process.env.PORT) || 3000);
}

if (process.env.NODE_ENV !== 'test') {
  void bootstrap();
}
