import { jest } from '@jest/globals';
import { UsersRepository } from '../../src/users/users.repository';
import { VehiclesRepository } from '../../src/vehicles/vehicles.repository';

describe('main bootstrap', () => {
  afterEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });

  it('calls NestFactory methods and seeds admin + vehicles', async () => {
    const usersRepo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(true),
    };
    const vehiclesRepo = {
      findAll: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue(true),
    };

    const mockApp = {
      useGlobalPipes: jest.fn(),
      enableCors: jest.fn(),
      init: jest.fn().mockResolvedValue(null),
      listen: jest.fn().mockResolvedValue(null),
      get: jest.fn((token: any) => {
        const tokenName = token?.name || token;

        if (tokenName === 'ConfigService') {
          return { get: () => undefined };
        }
        if (token === UsersRepository || tokenName === 'UsersRepository') {
          return usersRepo;
        }
        if (
          token === VehiclesRepository ||
          tokenName === 'VehiclesRepository'
        ) {
          return vehiclesRepo;
        }
        return undefined;
      }),
    };

    jest.doMock('@nestjs/core', () => ({
      NestFactory: {
        create: jest.fn().mockResolvedValue(mockApp),
      },
    }));

    await jest.isolateModulesAsync(async () => {
      process.env.NODE_ENV = 'development';
      process.env.ADMIN_EMAIL = 'admin@localhost.com';
      process.env.ADMIN_PASSWORD = 'admin123';
      process.env.PORT = '3000';
      // load module and execute bootstrap
      require('../../src/main');
      await new Promise((resolve) => setImmediate(resolve));
    });

    expect(mockApp.useGlobalPipes).toHaveBeenCalled();
    expect(mockApp.enableCors).toHaveBeenCalled();
    expect(mockApp.init).toHaveBeenCalled();
    expect(mockApp.listen).toHaveBeenCalled();
    expect(usersRepo.findByEmail).toHaveBeenCalledWith('admin@localhost.com');
    expect(vehiclesRepo.findAll).toHaveBeenCalled();
    expect(vehiclesRepo.create).toHaveBeenCalledTimes(13);
  });

  it('seedAdmin returns early in test environment', async () => {
    const app = { get: jest.fn().mockReturnValue(undefined) } as any;
    jest.resetModules();
    process.env.NODE_ENV = 'test';

    const { seedAdmin } = require('../../src/main');
    await expect(seedAdmin(app)).resolves.toBeUndefined();
    expect(app.get).toHaveBeenCalledWith(expect.anything(), { strict: false });
  });

  it('seedAdmin creates admin if not exists', async () => {
    const create = jest.fn().mockResolvedValue(true);
    const repo = { findByEmail: jest.fn().mockResolvedValue(null), create };
    const app = {
      get: jest.fn((token) =>
        token === 'ConfigService' ? { get: () => undefined } : repo,
      ),
    } as any;

    jest.resetModules();
    process.env.NODE_ENV = 'test';
    const { seedAdmin } = require('../../src/main');

    process.env.NODE_ENV = 'development';
    process.env.ADMIN_EMAIL = 'admin@localhost.com';
    process.env.ADMIN_PASSWORD = 'admin123';

    await seedAdmin(app);
    expect(repo.findByEmail).toHaveBeenCalledWith('admin@localhost.com');
    expect(create).toHaveBeenCalledWith({
      name: 'Admin',
      email: 'admin@localhost.com',
      password: 'admin123',
      role: 'admin',
    });
  });

  it('seedAdmin does not create admin if exists', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue({ _id: '1' }),
      create: jest.fn(),
    };
    const app = {
      get: jest.fn((token) =>
        token === 'ConfigService' ? { get: () => undefined } : repo,
      ),
    } as any;

    jest.resetModules();
    process.env.NODE_ENV = 'test';
    const { seedAdmin } = require('../../src/main');

    process.env.NODE_ENV = 'development';
    process.env.ADMIN_EMAIL = 'admin@localhost.com';
    process.env.ADMIN_PASSWORD = 'admin123';

    await seedAdmin(app);
    expect(repo.findByEmail).toHaveBeenCalledWith('admin@localhost.com');
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('seedVehicles skips already seeded vehicles and does not duplicate', async () => {
    const vehiclesRepo = {
      findAll: jest.fn().mockResolvedValue([{ name: 'Mini Cooper' }]),
      create: jest.fn().mockResolvedValue(true),
    };

    const app = {
      get: jest.fn((token) =>
        token === VehiclesRepository ||
        (token && (token as any).name === 'VehiclesRepository')
          ? vehiclesRepo
          : undefined,
      ),
    } as any;

    jest.resetModules();
    process.env.NODE_ENV = 'test';
    const { seedVehicles } = require('../../src/main');

    await seedVehicles(app);

    expect(vehiclesRepo.findAll).toHaveBeenCalled();
    expect(vehiclesRepo.create).toHaveBeenCalledTimes(12);
    expect(vehiclesRepo.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Mini Cooper' }),
    );
  });
});
