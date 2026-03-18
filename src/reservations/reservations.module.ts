import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';
import { ReservationsRepository } from './reservations.repository';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
    ]),
    VehiclesModule,
    UsersModule,
  ],
  providers: [ReservationsRepository, ReservationsService],
  controllers: [ReservationsController],
  exports: [ReservationsService, ReservationsRepository],
})
export class ReservationsModule {}
