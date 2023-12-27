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

  @IsNotEmpty()
  @IsNumber()
  @Column({
    default: 10000,
  })
  seats: number;

  @ManyToOne(() => Concert, (concert) => concert.dates)
  concert: Concert;
}
