import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { Dates } from './dates.entity';

@Entity()
export class Concert extends BaseModel {
  @IsNotEmpty()
  @IsString()
  @Column()
  title: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Column()
  price: number;

  @IsNotEmpty()
  @IsString()
  @Column()
  location: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  img_url: string;

  @IsNotEmpty()
  @IsBoolean()
  @Column()
  is_booking_open: boolean;

  @IsNotEmpty()
  @IsNumber()
  @Column()
  seats: number;

  @OneToMany(() => Dates, (date) => date.concert, {
    // eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  dates: Dates[];

  @IsString()
  @IsNotEmpty()
  @Column()
  category: string;
}
