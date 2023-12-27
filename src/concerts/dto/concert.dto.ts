import { OmitType } from '@nestjs/mapped-types';
import { Concert } from '../entities/concert.entity';

export class CreateConcertDto extends OmitType(Concert, [
  'id',
  'createdAt',
  'updatedAt',
] as const) {}
