import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VehiclesService } from '../../src/vehicles/vehicles.service';
import { VehiclesRepository } from '../../src/vehicles/vehicles.repository';

const vehicleMock = {
  _id: '1',
  name: 'Gol',
  year: 2020,
  bodywork: 'Hatch compacto',
  engine: 'Motor 1.0',
  seats: 5,
  active: true,
  inactiveReason: null,
};

describe('VehiclesService', () => {
  let service: VehiclesService;
  let repository: Partial<VehiclesRepository>;

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockResolvedValue(vehicleMock),
      findAll: jest.fn().mockResolvedValue([vehicleMock]),
      findById: jest.fn().mockResolvedValue(vehicleMock),
      update: jest.fn().mockResolvedValue(vehicleMock),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: VehiclesRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
  });

  it('should create vehicle', async () => {
    const result = await service.create({
      name: 'Gol',
      year: 2020,
      bodywork: 'Hatch compacto',
      engine: 'Motor 1.0',
      seats: 5,
      active: true,
      inactiveReason: null,
    } as any);
    expect(result).toEqual(vehicleMock);
  });

  it('should find all vehicles', async () => {
    const result = await service.findAll();
    expect(result).toEqual([vehicleMock]);
  });

  it('should find by id', async () => {
    const result = await service.findById('1');
    expect(result).toEqual(vehicleMock);
  });

  it('should throw not found if vehicle does not exist', async () => {
    (repository.findById as jest.Mock).mockResolvedValue(null);
    await expect(service.findById('999')).rejects.toThrow(NotFoundException);
  });

  it('should update vehicle', async () => {
    const result = await service.update('1', { name: 'Gol 2' } as any);
    expect(result).toEqual(vehicleMock);
    expect(repository.update).toHaveBeenCalledWith('1', { name: 'Gol 2' });
  });

  it('should remove vehicle', async () => {
    await expect(service.remove('1')).resolves.toEqual({ deleted: true });
    expect(repository.delete).toHaveBeenCalledWith('1');
  });
});
