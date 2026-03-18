import { NotFoundException } from '@nestjs/common';
import { ReservationsRepository } from '../../src/reservations/reservations.repository';

class FakeReservationModel {
  static dataStore = [
    {
      _id: '1',
      userId: 'user1',
      vehicleId: 'vehicle1',
      status: 'active',
      startedAt: new Date('2025-01-01T00:00:00Z'),
      endedAt: null,
    },
  ];

  constructor(public value) {}

  save = jest
    .fn()
    .mockImplementation(async () => ({ _id: 'newid', ...this.value }));

  static findOne(query) {
    const item = FakeReservationModel.dataStore.find((row) => {
      const matches = Object.keys(query).every((k) => row[k] === query[k]);
      return matches;
    });
    return {
      exec: async () => (item ? { ...item } : null),
    };
  }

  static find(query) {
    const items = FakeReservationModel.dataStore.filter((row) => {
      return Object.keys(query).every((k) => row[k] === query[k]);
    });
    return {
      exec: async () => items.map((x) => ({ ...x })),
    };
  }

  static findById(id) {
    const item = FakeReservationModel.dataStore.find((row) => row._id === id);
    return {
      exec: async () => (item ? { ...item } : null),
    };
  }

  static findByIdAndUpdate(id, update) {
    const item = FakeReservationModel.dataStore.find((row) => row._id === id);
    if (!item) {
      return { exec: async () => null };
    }
    Object.assign(item, update);
    return {
      exec: async () => ({ ...item }),
    };
  }
}

describe('ReservationsRepository', () => {
  let repository: ReservationsRepository;

  beforeEach(() => {
    FakeReservationModel.dataStore = [
      {
        _id: '1',
        userId: 'user1',
        vehicleId: 'vehicle1',
        status: 'active',
        startedAt: new Date('2025-01-01T00:00:00Z'),
        endedAt: null,
      },
    ];
    repository = new ReservationsRepository(FakeReservationModel as any);
  });

  it('create returns saved reservation', async () => {
    const result = await repository.create({
      userId: '000000000000000000000002',
      vehicleId: '000000000000000000000002',
      startedAt: '2025-01-02T00:00:00Z',
    } as any);

    expect(result).toHaveProperty('_id', 'newid');
    expect(result).toHaveProperty('userId');
  });

  it('findActiveByVehicle returns active reservation', async () => {
    const result = await repository.findActiveByVehicle('vehicle1');
    expect(result).toHaveProperty('userId', 'user1');
  });

  it('findActiveByUser returns active reservation', async () => {
    const result = await repository.findActiveByUser('user1');
    expect(result).toHaveProperty('vehicleId', 'vehicle1');
  });

  it('findAllByUser returns array', async () => {
    const result = await repository.findAllByUser('user1');
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('status', 'active');
  });

  it('findById returns reservation or null', async () => {
    await expect(repository.findById('1')).resolves.toBeDefined();
    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('updateStatus updates status', async () => {
    const result = await repository.updateStatus('1', 'cancelled');
    expect(result).toHaveProperty('status', 'cancelled');
  });

  it('updateStatus throws if not found', async () => {
    await expect(
      repository.updateStatus('missing', 'finished'),
    ).rejects.toThrow(NotFoundException);
  });
});
