import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseModel {
  @ApiProperty({
    example: 1,
    description: 'db에 있는 column id',
    required: true,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '2023-12-25T23:17:14.877Z',
    description: 'created date',
    required: true,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-12-25T23:17:14.877Z',
    description: 'updated date',
    required: true,
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
