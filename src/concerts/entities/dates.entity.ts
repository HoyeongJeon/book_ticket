import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { Concert } from 'src/concerts/entities/concert.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Seat } from './seat.entity';

@Entity()
export class Dates extends BaseModel {
  // 공연 날짜 및 시간
  @IsDate()
  @IsNotEmpty()
  @Column()
  date: Date;

  // 공연
  @ManyToOne(() => Concert, (concert) => concert.dates)
  concert: Concert;

  // S좌석 몇개인지
  @IsNumber()
  @IsNotEmpty()
  @Column()
  S: number;

  // S좌석 가격
  @IsNumber()
  @IsNotEmpty()
  @Column()
  priceS: number;

  @IsNumber()
  @IsNotEmpty()
  @Column()
  B: number;

  @IsNumber()
  @IsNotEmpty()
  @Column()
  priceB: number;

  @IsNumber()
  @IsNotEmpty()
  @Column()
  A: number;

  @IsNumber()
  @IsNotEmpty()
  @Column()
  priceA: number;

  // 좌석
  @OneToMany(() => Seat, (seat) => seat.dates)
  seats: Seat[];
}
