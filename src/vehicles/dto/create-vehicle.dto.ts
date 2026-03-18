import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsIn,
  IsOptional,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { VEHICLE_BODYWORK, VEHICLE_ENGINE } from '../schemas/vehicle.schema';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1886)
  year: number;

  @IsString()
  @IsIn(VEHICLE_BODYWORK)
  bodywork: (typeof VEHICLE_BODYWORK)[number];

  @IsString()
  @IsIn(VEHICLE_ENGINE)
  engine: (typeof VEHICLE_ENGINE)[number];

  @IsInt()
  @Min(1)
  seats: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  inactiveReason?: string | null;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string | null;
}
