import { Injectable, NotFoundException } from '@nestjs/common';
import { VehiclesRepository } from './vehicles.repository';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly vehiclesRepository: VehiclesRepository) {}

  async create(createVehicleDto: CreateVehicleDto) {
    return this.vehiclesRepository.create(createVehicleDto);
  }

  async findAll() {
    return this.vehiclesRepository.findAll();
  }

  async findById(id: string) {
    const vehicle = await this.vehiclesRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesRepository.update(id, updateVehicleDto);
  }

  async remove(id: string) {
    await this.vehiclesRepository.delete(id);
    return { deleted: true };
  }
}
