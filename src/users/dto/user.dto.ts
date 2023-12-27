import { OmitType, PickType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity';

export class SignUpUserDto extends OmitType(User, [
  'id',
  'createdAt',
  'updatedAt',
  'profile',
] as const) {}

export class LoginUserDto extends PickType(User, [
  'email',
  'password',
] as const) {}
