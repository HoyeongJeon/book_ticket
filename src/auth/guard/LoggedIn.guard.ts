import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { JsonWebTokenError } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest(); // express 에서 req
      const rawToken = request.headers['authorization']; // req.headers에 있는 'authorization'

      if (!rawToken) {
        throw new UnauthorizedException('로그인이 필요한 서비스입니다.');
      }
      //Bearer {token}
      const token = this.authService.getTokenFromHeader(rawToken); // 토큰 추출 {token}

      const userInfo = await this.authService.verifyToken(token); // 토큰 검증
      // email, id

      const user = await this.usersService.findUserByEmail(userInfo.email); // user 정보가져오기
      request.token = token;
      request.type = userInfo.type;
      request.user = user; // request = req => req.user
      return true;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('다시 로그인해주세요');
      } else {
        throw new UnauthorizedException(error.message);
      }
    }
  }
}

@Injectable()
export class AccessTokenGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    if (request.type !== 'access') {
      throw new UnauthorizedException('Access Token이 아닙니다.');
    }
    return true;
  }
}

@Injectable()
export class RefreshTokenGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    if (request.type !== 'refresh') {
      throw new UnauthorizedException('Refresh Token이 아닙니다.');
    }
    return true;
  }
}
