import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Dates } from './dates.entity';

@Entity()
export class Seat extends BaseModel {
  @Column()
  seatNumber: number;

  @Column()
  grade: string;

  @Column({
    default: false,
  })
  isBooked: boolean;

  @ManyToOne(() => Dates, (dates) => dates.seats)
  @JoinColumn()
  dates: Dates;

  @Column()
  concertId: number;
}
