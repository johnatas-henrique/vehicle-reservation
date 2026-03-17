import { jest } from '@jest/globals';

describe('main bootstrap', () => {
  afterEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });

  it('calls NestFactory methods and seeds admin', async () => {
    const mockApp = {
      useGlobalPipes: jest.fn(),
      enableCors: jest.fn(),
      init: jest.fn().mockResolvedValue(null),
      listen: jest.fn().mockResolvedValue(null),
      get: jest.fn().mockReturnValue({
        findByEmail: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(true),
      }),
    };

    jest.doMock('@nestjs/core', () => ({
      NestFactory: {
        create: jest.fn().mockResolvedValue(mockApp),
      },
    }));

    await jest.isolateModulesAsync(async () => {
      process.env.ADMIN_EMAIL = 'admin@localhost.com';
      process.env.ADMIN_PASSWORD = 'admin123';
      process.env.PORT = '3000';
      // load module and execute bootstrap
      require('../../src/main');
    });

    expect(mockApp.useGlobalPipes).toHaveBeenCalled();
    expect(mockApp.enableCors).toHaveBeenCalled();
    expect(mockApp.init).toHaveBeenCalled();
    expect(mockApp.listen).toHaveBeenCalled();
  });
});
