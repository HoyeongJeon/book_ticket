import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { Concert } from 'src/concerts/entities/concert.entity';
import { Dates } from 'src/concerts/entities/dates.entity';
import { Seat } from 'src/concerts/entities/seat.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity()
export class Book extends BaseModel {
  @ManyToOne(() => User, (user) => user.books)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Concert, (concert) => concert.book)
  concert: Concert;

  @IsDate()
  @IsNotEmpty()
  @Column()
  date: Date;

  @IsString()
  @IsNotEmpty()
  @Column()
  grade: string;

  @IsNumber()
  @IsNotEmpty()
  @Column()
  price: number;

  @OneToOne(() => Seat, (seat) => seat.Book)
  @JoinColumn()
  Seat: Seat;

  @ManyToOne(() => Dates, (dates) => dates.Book)
  Dates: Dates;
}
