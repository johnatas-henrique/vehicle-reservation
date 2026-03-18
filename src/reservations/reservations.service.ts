import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ReservationsRepository } from './reservations.repository';
import { VehiclesRepository } from '../vehicles/vehicles.repository';
import { UsersRepository } from '../users/users.repository';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    private readonly vehiclesRepository: VehiclesRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async reserve(createReservationDto: CreateReservationDto) {
    const { userId, vehicleId } = createReservationDto;

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const vehicle = await this.vehiclesRepository.findById(vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (!vehicle.active) {
      throw new BadRequestException('Vehicle is inactive and cannot be reserved');
    }

    const userHasActive =
      await this.reservationsRepository.findActiveByUser(userId);
    if (userHasActive) {
      throw new BadRequestException('User already has an active reservation');
    }

    const vehicleHasActive =
      await this.reservationsRepository.findActiveByVehicle(vehicleId);
    if (vehicleHasActive) {
      throw new BadRequestException('Vehicle is already reserved');
    }

    return this.reservationsRepository.create(createReservationDto);
  }

  async cancel(reservationId: string, requester) {
    const reservation =
      await this.reservationsRepository.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (
      requester.role !== Role.Admin &&
      reservation.userId.toString() !== requester.sub
    ) {
      throw new ForbiddenException('Cannot cancel reservation of another user');
    }

    if (reservation.status !== 'active') {
      throw new BadRequestException(
        'Only active reservations can be cancelled',
      );
    }

    return this.reservationsRepository.updateStatus(reservationId, 'cancelled');
  }

  async finish(reservationId: string, requester) {
    const reservation =
      await this.reservationsRepository.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (
      requester.role !== Role.Admin &&
      reservation.userId.toString() !== requester.sub
    ) {
      throw new ForbiddenException('Cannot finish reservation of another user');
    }

    if (reservation.status !== 'active') {
      throw new BadRequestException('Only active reservations can be finished');
    }

    return this.reservationsRepository.updateStatus(reservationId, 'finished');
  }

  findByUser(userId: string) {
    return this.reservationsRepository.findAllByUser(userId);
  }
}
