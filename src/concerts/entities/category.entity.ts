import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToMany } from 'typeorm';
import { Concert } from './concert.entity';

@Entity()
export class Category extends BaseModel {
  @ManyToMany(() => Concert, (concert) => concert.category, {
    onDelete: 'CASCADE',
  })
  concerts: Concert[];

  @Column()
  tags: string;
}
