import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type VehicleDocument = HydratedDocument<Vehicle>;

export const VEHICLE_BODYWORK = [
  'Hatch compacto',
  'Hatch médio',
  'SUV compacto',
  'SUV médio',
  'Coupé',
] as const;

export const VEHICLE_ENGINE = [
  'Motor 1.0',
  'Motor 1.4',
  'Motor 1.6',
  'Motor 1.8',
  'Motor 2.0',
] as const;

@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, type: Number })
  year: number;

  @Prop({ required: true, enum: VEHICLE_BODYWORK, type: String, trim: true })
  bodywork: string;

  @Prop({ required: true, enum: VEHICLE_ENGINE, type: String, trim: true })
  engine: string;

  @Prop({ required: true, type: Number })
  seats: number;

  @Prop({ required: true, type: Boolean, default: true })
  active: boolean;

  @Prop({ type: String, default: null, nullable: true })
  inactiveReason: string | null;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
