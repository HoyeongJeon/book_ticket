import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from 'src/users/users.repository';
// import { JWT_SECRET } from '../const/jwt.const';
import { Payload } from './jwt.payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersRepository: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_KEY,
    });
  }
  async validate(payload: Payload) {
    const user = this.usersRepository.findUserById(payload.sub);
    if (user) {
      return user;
    } else {
      throw new UnauthorizedException('로그인이 필요한 서비스입니다.');
    }
  }
}
