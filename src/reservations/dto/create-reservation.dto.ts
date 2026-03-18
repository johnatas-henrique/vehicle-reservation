import {
  IsMongoId,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateReservationDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  vehicleId: string;

  @IsDateString()
  @IsNotEmpty()
  startedAt: string;

  @IsDateString()
  @IsOptional()
  endedAt?: string | null;
}
