import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto, SignUpUserDto } from 'src/users/dto/user.dto';
import { UsersRepository } from 'src/users/users.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { JWT_SECRET } from './const/jwt.const';
import { PASSWORD_HASH_ROUND } from 'src/users/const/bcrypt.const';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
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

  // payload = email, sub(id), type('access' | 'refresh')
  signToken(user: Pick<User, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? '3600' : '600',
    });
  }

  // 인자로 User 정보를 받고, 정보를 signToken으로 넘겨 refresh token과 access token 반환!
  getUserTokens(user: Pick<User, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  // email, pw 받아서 유저가 존재하는지 확인하고, 존재하면 pw 일치여부 확인해서 유저 정보 반환
  async authenticateUser(user: LoginUserDto) {
    const existingUser = await this.usersRepository.findUserByEmail(user.email);
    if (!existingUser) {
      throw new UnauthorizedException('Email이 존재하지 않습니다.');
    }

    const isMatch = await bcrypt.compare(user.password, existingUser.password);
    if (!isMatch) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }
    return existingUser;
  }

  async login(user: LoginUserDto) {
    const existingUser = await this.authenticateUser(user);
    return this.getUserTokens(existingUser);
  }

  async signup(signUpUserDto: SignUpUserDto) {
    const existingUser = await this.usersRepository.findUserByEmail(
      signUpUserDto.email,
    );
    if (existingUser) {
      throw new UnauthorizedException('이미 존재하는 Email 입니다.');
    }
    const hashedPassword = await bcrypt.hash(
      signUpUserDto.password,
      PASSWORD_HASH_ROUND,
    );
    const userObj = { ...signUpUserDto, password: hashedPassword };
    const user = await this.usersRepository.signup(userObj);

    return user;
  }
}
