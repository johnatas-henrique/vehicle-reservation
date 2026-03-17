import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesRepository {
  constructor(
    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<VehicleDocument>,
  ) {}

  create(createVehicleDto: CreateVehicleDto): Promise<VehicleDocument> {
    const created = new this.vehicleModel(createVehicleDto);
    return created.save();
  }

  findAll(): Promise<VehicleDocument[]> {
    return this.vehicleModel.find().exec();
  }

  findById(id: string): Promise<VehicleDocument | null> {
    return this.vehicleModel.findById(id).exec();
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<VehicleDocument> {
    const updated = await this.vehicleModel
      .findByIdAndUpdate(id, { $set: updateVehicleDto }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Vehicle not found');
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.vehicleModel.findByIdAndDelete(id).exec();
  }
}
