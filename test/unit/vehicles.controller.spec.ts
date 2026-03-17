import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesController } from '../../src/vehicles/vehicles.controller';
import { VehiclesService } from '../../src/vehicles/vehicles.service';

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

describe('VehiclesController', () => {
  let controller: VehiclesController;
  let service: Partial<VehiclesService>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue(vehicleMock),
      findAll: jest.fn().mockResolvedValue([vehicleMock]),
      findById: jest.fn().mockResolvedValue(vehicleMock),
      update: jest.fn().mockResolvedValue(vehicleMock),
      remove: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [
        {
          provide: VehiclesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<VehiclesController>(VehiclesController);
  });

  it('should create vehicle', async () => {
    await expect(
      controller.create({
        name: 'Gol',
        year: 2020,
        bodywork: 'Hatch compacto',
        engine: 'Motor 1.0',
        seats: 5,
        active: true,
        inactiveReason: null,
      } as any),
    ).resolves.toEqual(vehicleMock);
  });

  it('should return all vehicles', async () => {
    await expect(controller.findAll()).resolves.toEqual([vehicleMock]);
  });

  it('should return one vehicle', async () => {
    await expect(controller.findOne('1')).resolves.toEqual(vehicleMock);
  });

  it('should update vehicle', async () => {
    await expect(
      controller.update('1', { name: 'Gol Doppler' } as any),
    ).resolves.toEqual(vehicleMock);
  });

  it('should remove vehicle', async () => {
    await expect(controller.remove('1')).resolves.toEqual({ deleted: true });
  });
});
