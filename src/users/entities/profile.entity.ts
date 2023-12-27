import { Column, Entity, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { BaseModel } from 'src/common/entities/base.entity';

@Entity()
export class Profile extends BaseModel {
  @OneToOne(() => User, (user) => user.profile)
  user: User;

  @Column({
    default: 1000000,
  })
  wallet: number;
}
