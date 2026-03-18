import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ReservationDocument = HydratedDocument<Reservation>;

export type ReservationStatus = 'active' | 'cancelled' | 'finished';

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicleId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['active', 'cancelled', 'finished'],
    default: 'active',
    type: String,
  })
  status: ReservationStatus;

  @Prop({ required: true, type: Date })
  startedAt: Date;

  @Prop({ type: Date, default: null })
  endedAt: Date | null;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
