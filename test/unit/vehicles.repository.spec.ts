import { NotFoundException } from '@nestjs/common';
import { VehiclesRepository } from '../../src/vehicles/vehicles.repository';

class FakeVehicleModel {
  static dataStore = [
    {
      _id: '1',
      name: 'Car One',
      type: 'Sedan',
      status: 'available',
      bodywork: 'sedan',
      engine: 'combustion',
      active: true,
      inactiveReason: null,
    },
  ];

  constructor(public value) {}

  save = jest
    .fn()
    .mockImplementation(async () => ({ _id: 'newid', ...this.value }));

  static find() {
    return {
      exec: async () => FakeVehicleModel.dataStore,
    };
  }

  static findById(id) {
    const sample = FakeVehicleModel.dataStore.find((item) => item._id === id);
    return {
      exec: async () => (sample ? { ...sample } : null),
    };
  }

  static findByIdAndUpdate(id, update) {
    const sample = FakeVehicleModel.dataStore.find((item) => item._id === id);
    if (!sample) {
      return { exec: async () => null };
    }
    Object.assign(sample, update.$set);
    return {
      exec: async () => ({ ...sample }),
    };
  }

  static findByIdAndDelete(id) {
    const index = FakeVehicleModel.dataStore.findIndex(
      (item) => item._id === id,
    );
    if (index === -1) {
      return { exec: async () => null };
    }
    const [deleted] = FakeVehicleModel.dataStore.splice(index, 1);
    return { exec: async () => deleted };
  }
}

describe('VehiclesRepository', () => {
  let repository: VehiclesRepository;

  beforeEach(() => {
    FakeVehicleModel.dataStore = [
      {
        _id: '1',
        name: 'Car One',
        type: 'Sedan',
        status: 'available',
        bodywork: 'sedan',
        engine: 'combustion',
        active: true,
        inactiveReason: null,
      },
    ];
    repository = new VehiclesRepository(FakeVehicleModel as any);
  });

  it('create returns saved vehicle', async () => {
    const result = await repository.create({
      name: 'Car Two',
      type: 'SUV',
      status: 'available',
      bodywork: 'suv',
      engine: 'hybrid',
      active: true,
      inactiveReason: null,
    } as any);

    expect(result).toHaveProperty('_id', 'newid');
    expect(result).toHaveProperty('name', 'Car Two');
  });

  it('findAll returns vehicles', async () => {
    const result = await repository.findAll();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  it('findById returns null for missing id', async () => {
    const result = await repository.findById('missing');
    expect(result).toBeNull();
  });

  it('findById returns vehicle when found', async () => {
    const result = await repository.findById('1');
    expect(result).toBeDefined();
    expect(result).toHaveProperty('name', 'Car One');
  });

  it('update throws not found if id missing', async () => {
    await expect(
      repository.update('missing', { name: 'New' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('update returns updated vehicle', async () => {
    const result = await repository.update('1', { name: 'Updated' } as any);
    expect(result).toHaveProperty('name', 'Updated');
  });

  it('delete removes existing vehicle', async () => {
    await expect(repository.delete('1')).resolves.toBeUndefined();
    expect(FakeVehicleModel.dataStore).toHaveLength(0);
  });

  it('delete is idempotent for missing id', async () => {
    await expect(repository.delete('missing')).resolves.toBeUndefined();
  });
});
