import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from '../../src/reservations/reservations.service';
import { ReservationsRepository } from '../../src/reservations/reservations.repository';
import { VehiclesRepository } from '../../src/vehicles/vehicles.repository';
import { UsersRepository } from '../../src/users/users.repository';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let repository: Partial<ReservationsRepository>;

  beforeEach(async () => {
    repository = {
      findActiveByUser: jest.fn(),
      findActiveByVehicle: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      findAllByUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: ReservationsRepository,
          useValue: repository,
        },
        {
          provide: VehiclesRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('reserve works when no conflicts', async () => {
    const usersRepo = (service as any).usersRepository as Partial<UsersRepository>;
    const vehiclesRepo = (service as any).vehiclesRepository as Partial<VehiclesRepository>;

    usersRepo.findById = jest.fn().mockResolvedValue({ _id: 'u1' });
    vehiclesRepo.findById = jest.fn().mockResolvedValue({ _id: 'v1', active: true });

    (repository.findActiveByUser as jest.Mock).mockResolvedValue(null);
    (repository.findActiveByVehicle as jest.Mock).mockResolvedValue(null);
    (repository.create as jest.Mock).mockResolvedValue({ _id: '1' });

    const result = await service.reserve({
      userId: 'u1',
      vehicleId: 'v1',
      startedAt: '2025-01-01T00:00:00Z',
    } as any);
    expect(result).toEqual({ _id: '1' });
  });

  it('reserve fails when user does not exist', async () => {
    const usersRepo = (service as any).usersRepository as Partial<UsersRepository>;
    const vehiclesRepo = (service as any).vehiclesRepository as Partial<VehiclesRepository>;

    usersRepo.findById = jest.fn().mockResolvedValue(null);
    vehiclesRepo.findById = jest.fn().mockResolvedValue({ _id: 'v1', active: true });

    await expect(
      service.reserve({ userId: 'u-not-exists', vehicleId: 'v1', startedAt: '2025-01-01T00:00:00Z' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('reserve fails when vehicle does not exist', async () => {
    const usersRepo = (service as any).usersRepository as Partial<UsersRepository>;
    const vehiclesRepo = (service as any).vehiclesRepository as Partial<VehiclesRepository>;

    usersRepo.findById = jest.fn().mockResolvedValue({ _id: 'u1' });
    vehiclesRepo.findById = jest.fn().mockResolvedValue(null);

    await expect(
      service.reserve({ userId: 'u1', vehicleId: 'v-not-exists', startedAt: '2025-01-01T00:00:00Z' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('reserve fails when vehicle is inactive', async () => {
    const usersRepo = (service as any).usersRepository as Partial<UsersRepository>;
    const vehiclesRepo = (service as any).vehiclesRepository as Partial<VehiclesRepository>;

    usersRepo.findById = jest.fn().mockResolvedValue({ _id: 'u1' });
    vehiclesRepo.findById = jest.fn().mockResolvedValue({ _id: 'v1', active: false });

    await expect(
      service.reserve({ userId: 'u1', vehicleId: 'v1', startedAt: '2025-01-01T00:00:00Z' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('reserve fails when user has active', async () => {
    const usersRepo = (service as any).usersRepository as Partial<UsersRepository>;
    const vehiclesRepo = (service as any).vehiclesRepository as Partial<VehiclesRepository>;

    usersRepo.findById = jest.fn().mockResolvedValue({ _id: 'u1' });
    vehiclesRepo.findById = jest.fn().mockResolvedValue({ _id: 'v1', active: true });

    (repository.findActiveByUser as jest.Mock).mockResolvedValue({});

    await expect(
      service.reserve({
        userId: 'u1',
        vehicleId: 'v1',
        startedAt: '2025-01-01T00:00:00Z',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('reserve fails when vehicle is already reserved', async () => {
    const usersRepo = (service as any).usersRepository as Partial<UsersRepository>;
    const vehiclesRepo = (service as any).vehiclesRepository as Partial<VehiclesRepository>;

    usersRepo.findById = jest.fn().mockResolvedValue({ _id: 'u1' });
    vehiclesRepo.findById = jest.fn().mockResolvedValue({ _id: 'v1', active: true });

    (repository.findActiveByUser as jest.Mock).mockResolvedValue(null);
    (repository.findActiveByVehicle as jest.Mock).mockResolvedValue({});

    await expect(
      service.reserve({
        userId: 'u1',
        vehicleId: 'v1',
        startedAt: '2025-01-01T00:00:00Z',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('cancel work for owner', async () => {
    (repository.findById as jest.Mock).mockResolvedValue({
      _id: 'res1',
      userId: 'u1',
      status: 'active',
    });
    (repository.updateStatus as jest.Mock).mockResolvedValue({
      _id: 'res1',
      status: 'cancelled',
    });

    const result = await service.cancel('res1', {
      sub: 'u1',
      role: 'user',
    } as any);
    expect(result).toHaveProperty('status', 'cancelled');
  });

  it('cancel fails for wrong user', async () => {
    (repository.findById as jest.Mock).mockResolvedValue({
      _id: 'res1',
      userId: 'u1',
      status: 'active',
    });

    await expect(
      service.cancel('res1', { sub: 'u2', role: 'user' } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('finish work for owner', async () => {
    (repository.findById as jest.Mock).mockResolvedValue({
      _id: 'res1',
      userId: 'u1',
      status: 'active',
    });
    (repository.updateStatus as jest.Mock).mockResolvedValue({
      _id: 'res1',
      status: 'finished',
    });

    const result = await service.finish('res1', {
      sub: 'u1',
      role: 'user',
    } as any);
    expect(result).toHaveProperty('status', 'finished');
  });

  it('cancel fails when reservation not found', async () => {
    (repository.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.cancel('resMissing', { sub: 'u1', role: 'user' } as any)).rejects.toThrow(NotFoundException);
  });

  it('cancel fails when reservation inactive', async () => {
    (repository.findById as jest.Mock).mockResolvedValue({
      _id: 'res1',
      userId: 'u1',
      status: 'finished',
    });

    await expect(service.cancel('res1', { sub: 'u1', role: 'user' } as any)).rejects.toThrow(BadRequestException);
  });

  it('finish fails when reservation not found', async () => {
    (repository.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.finish('resMissing', { sub: 'u1', role: 'user' } as any)).rejects.toThrow(NotFoundException);
  });

  it('finish fails when reservation inactive', async () => {
    (repository.findById as jest.Mock).mockResolvedValue({
      _id: 'res1',
      userId: 'u1',
      status: 'cancelled',
    });

    await expect(service.finish('res1', { sub: 'u1', role: 'user' } as any)).rejects.toThrow(BadRequestException);
  });

  it('get by user returns all', async () => {
    (repository.findAllByUser as jest.Mock).mockResolvedValue([
      { _id: 'res1' },
    ]);
    const result = await service.findByUser('u1');
    expect(result).toEqual([{ _id: 'res1' }]);
  });
});
