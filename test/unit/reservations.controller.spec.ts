import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from '../../src/reservations/reservations.controller';
import { ReservationsService } from '../../src/reservations/reservations.service';

const reservationMock = {
  _id: '1',
  userId: 'u1',
  vehicleId: 'v1',
  status: 'active',
};

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: Partial<ReservationsService>;

  beforeEach(async () => {
    service = {
      reserve: jest.fn().mockResolvedValue(reservationMock),
      findByUser: jest.fn().mockResolvedValue([reservationMock]),
      cancel: jest.fn().mockResolvedValue({ _id: '1', status: 'cancelled' }),
      finish: jest.fn().mockResolvedValue({ _id: '1', status: 'finished' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  it('reserve should create reservation', async () => {
    await expect(
      controller.reserve({
        userId: 'u1',
        vehicleId: 'v1',
        startedAt: '2025-01-01T00:00:00Z',
      } as any),
    ).resolves.toEqual(reservationMock);
  });

  it('findByUser should return user reservations for same user', async () => {
    const result = await controller.findByUser('u1', {
      user: { sub: 'u1', role: 'user' },
    } as any);
    expect(result).toEqual([reservationMock]);
  });

  it('findByUser should return empty for non-owner and non-admin', async () => {
    const result = await controller.findByUser('u1', {
      user: { sub: 'u2', role: 'user' },
    } as any);
    expect(result).toEqual([]);
  });

  it('cancel should call service', async () => {
    await expect(
      controller.cancel('1', { user: { sub: 'u1', role: 'user' } } as any),
    ).resolves.toEqual({ _id: '1', status: 'cancelled' });
  });

  it('finish should call service', async () => {
    await expect(
      controller.finish('1', { user: { sub: 'u1', role: 'user' } } as any),
    ).resolves.toEqual({ _id: '1', status: 'finished' });
  });
});
