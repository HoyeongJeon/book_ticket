import { BaseModel } from 'src/common/entities/base.entity';
import { Concert } from 'src/concerts/entities/concert.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Book extends BaseModel {
  @ManyToOne(() => User, (user) => user.books)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Concert, (concert) => concert.book)
  concert: Concert;

  @Column()
  date: Date;
}
