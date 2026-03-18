import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../users/users.repository';
import { VehiclesRepository } from '../vehicles/vehicles.repository';
import { Role } from '../common/enums/role.enum';
import { vehiclesSeed } from './vehicles.seed';

export async function seedAdmin(app: INestApplication) {
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

export async function seedVehicles(app: INestApplication) {
  const repo = app.get(VehiclesRepository);
  const existing = await repo.findAll();

  const existingNames = new Set(existing.map((item: any) => item.name));
  const vehiclesToInsert = vehiclesSeed.filter(
    (vehicle) => !existingNames.has(vehicle.name),
  );

  if (vehiclesToInsert.length === 0) {
    return;
  }

  for (const vehicle of vehiclesToInsert) {
    await repo.create(vehicle as any);
  }

  console.log(`Vehicles seed inserted (${vehiclesToInsert.length} vehicles)`);
}
