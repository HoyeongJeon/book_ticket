import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { Concert } from 'src/concerts/entities/concert.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Dates extends BaseModel {
  @IsDate()
  @IsNotEmpty()
  @Column()
  date: Date;

  @ManyToOne(() => Concert, (concert) => concert.dates)
  concert: Concert;

  @IsNumber()
  @IsNotEmpty()
  @Column()
  S: number;

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
}
