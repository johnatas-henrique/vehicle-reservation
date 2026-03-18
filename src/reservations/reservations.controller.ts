import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Put,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async reserve(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.reserve(createReservationDto);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string, @Request() req) {
    if (req.user.sub !== userId && req.user.role !== 'admin') {
      return [];
    }
    return this.reservationsService.findByUser(userId);
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string, @Request() req) {
    return this.reservationsService.cancel(id, req.user);
  }

  @Put(':id/finish')
  async finish(@Param('id') id: string, @Request() req) {
    return this.reservationsService.finish(id, req.user);
  }
}
