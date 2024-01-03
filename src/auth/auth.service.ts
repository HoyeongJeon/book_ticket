import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto, SignUpUserDto } from 'src/users/dto/user.dto';
import { UsersRepository } from 'src/users/users.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import {
  SECRET_KEY,
  PASSWORD_HASH_ROUND,
} from 'src/common/const/env-keys.const';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  // header에서 토큰 받기
  // Bearer {token}
  getTokenFromHeader(header: string) {
    const [type, token] = header.split(' ');
    // 토큰 길이가 2를 넘으면, 잘못 들어온것, 토큰 타입 체크
    if (header.split(' ').length !== 2 || type !== 'Bearer') {
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }
    return token;
  }

  // 토큰 검증
  async verifyToken(token: string) {
    return await this.jwtService.verify(token, {
      secret: this.configService.get<string>(SECRET_KEY),
    });
  }

  // 토큰 재발급
  rotateToken(token: string, isRefreshToken: boolean) {
    const payload = this.jwtService.verify(token, {
      secret: this.configService.get<string>(SECRET_KEY),
    });

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException(
        '토큰 재발급은 refresh token으로만 가능합니다.',
      );
    }
    return this.signToken(
      {
        ...payload,
      },
      isRefreshToken,
    );
  }

  // payload = email, sub(id), type('access' | 'refresh')
  signToken(user: Pick<User, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(SECRET_KEY),
      expiresIn: isRefreshToken ? 3600 : 600,
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
      parseInt(this.configService.get<string>(PASSWORD_HASH_ROUND)),
    );
    const userObj = { ...signUpUserDto, password: hashedPassword };
    const user = await this.usersRepository.signup(userObj);

    return user;
  }
}
