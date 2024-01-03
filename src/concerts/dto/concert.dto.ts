import { OmitType } from '@nestjs/mapped-types';
import { Concert } from '../entities/concert.entity';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Dates } from '../entities/dates.entity';

export class CreateConcertDto extends OmitType(Concert, [
  'id',
  'createdAt',
  'updatedAt',
  'is_booking_open',
  'img_url',
] as const) {
  @IsNotEmpty()
  S: number;

  @IsNotEmpty()
  priceS: number;

  @IsNotEmpty()
  B: number;

  @IsNotEmpty()
  priceB: number;

  @IsNotEmpty()
  A: number;

  @IsNotEmpty()
  priceA: number;
}
