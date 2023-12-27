import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/user.dto';
import { UsersReposiory } from 'src/users/users.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersReposiory,
    private readonly jwtService: JwtService,
  ) {}
  async jwtLogin(loginUserDto: LoginUserDto) {
    const user = await this.usersRepository.findUserByEmail(loginUserDto.email);
    if (!user) {
      throw new ConflictException('유저가 존재하지 않습니다.');
    }
    console.log(user);

    const isMatch = await bcrypt.compare(loginUserDto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }
    const payload = { email: loginUserDto.email, sub: user.id };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
