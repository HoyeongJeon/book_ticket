import { OmitType } from '@nestjs/mapped-types';
import { Concert } from '../entities/concert.entity';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateConcertDto extends OmitType(Concert, [
  'id',
  'createdAt',
  'updatedAt',
] as const) {
  @IsNumber()
  @IsNotEmpty()
  seats: number;
}
