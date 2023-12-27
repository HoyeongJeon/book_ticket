import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Profile } from './profile.entity';

@Entity()
export class User extends BaseModel {
  @ApiProperty({
    example: 'test@test.com',
    description: 'email',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty({
    message: '이메일을 입력해주세요',
  })
  @Column({
    type: 'varchar',
    unique: true,
    nullable: false,
  })
  email: string;

  @ApiProperty({
    example: 'test',
    description: 'name',
    required: true,
  })
  @IsString()
  @IsNotEmpty({
    message: '이름을 입력해주세요',
  })
  @Column({
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @ApiProperty({
    example: '12341234',
    description: 'password',
    required: true,
  })
  @IsString()
  @IsNotEmpty({
    message: '비밀번호를 입력해주세요',
  })
  @Column({ type: 'varchar', nullable: false })
  password: string;

  @OneToOne(() => Profile, (profile) => profile.user, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  profile: Profile;
}
