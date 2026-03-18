import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsRepository {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  create(
    createReservationDto: CreateReservationDto,
  ): Promise<ReservationDocument> {
    const created = new this.reservationModel({
      ...createReservationDto,
      userId: new Types.ObjectId(createReservationDto.userId),
      vehicleId: new Types.ObjectId(createReservationDto.vehicleId),
      status: 'active',
      endedAt: createReservationDto.endedAt || null,
      startedAt: new Date(createReservationDto.startedAt),
    });
    return created.save();
  }

  findActiveByVehicle(vehicleId: string): Promise<ReservationDocument | null> {
    const vehicleObjectId = Types.ObjectId.isValid(vehicleId)
      ? new Types.ObjectId(vehicleId)
      : vehicleId;
    return this.reservationModel
      .findOne({ vehicleId: vehicleObjectId, status: 'active' })
      .exec();
  }

  findActiveByUser(userId: string): Promise<ReservationDocument | null> {
    const userObjectId = Types.ObjectId.isValid(userId)
      ? new Types.ObjectId(userId)
      : userId;
    return this.reservationModel
      .findOne({ userId: userObjectId, status: 'active' })
      .exec();
  }

  findAllByUser(userId: string): Promise<ReservationDocument[]> {
    const userObjectId = Types.ObjectId.isValid(userId)
      ? new Types.ObjectId(userId)
      : userId;
    return this.reservationModel.find({ userId: userObjectId }).exec();
  }

  findById(id: string): Promise<ReservationDocument | null> {
    return this.reservationModel.findById(id).exec();
  }

  async updateStatus(
    id: string,
    status: 'cancelled' | 'finished',
  ): Promise<ReservationDocument> {
    const updated = await this.reservationModel
      .findByIdAndUpdate(id, { status, endedAt: new Date() }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Reservation not found');
    }

    return updated;
  }
}
