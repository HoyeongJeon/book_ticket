import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Dates } from './dates.entity';
import { ApiOperation } from '@nestjs/swagger';
import { Book } from 'src/books/entities/book.entity';

@Entity()
export class Seat extends BaseModel {
  // 좌석 번호
  @Column()
  seatNumber: number;

  // 좌석 등급
  @Column()
  grade: string;

  // 예약 됐는지 여부
  @Column({
    default: false,
  })
  isBooked: boolean;

  // 날짜
  @ManyToOne(() => Dates, (dates) => dates.seats)
  @JoinColumn()
  dates: Dates;

  // 어떤 공연인지
  @Column()
  concertId: number;

  @OneToOne(() => Book, (book) => book.Seat)
  Book: Book;
}
