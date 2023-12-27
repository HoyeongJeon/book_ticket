import { ConflictException, Injectable } from '@nestjs/common';
import { SignUpUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { PASSWORD_HASH_SALT } from './const/bcrypt.const';
import { UsersReposiory } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersReposiory) {}

  async signup(signUpUserDto: SignUpUserDto) {
    if (await this.findUserByEmail(signUpUserDto.email)) {
      throw new ConflictException(
        '이미 해당 이메일로 가입된 사용자가 있습니다.',
      );
    }

    const hashedPassword = await bcrypt.hash(
      signUpUserDto.password,
      PASSWORD_HASH_SALT,
    );
    const userObj = { ...signUpUserDto, password: hashedPassword };
    const user = await this.usersRepository.signup(userObj);

    return user;
  }

  async findUserByEmail(email: string) {
    return await this.usersRepository.findUserByEmail(email);
  }
}
