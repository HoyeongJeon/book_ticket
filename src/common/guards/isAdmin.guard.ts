import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class IsAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest(); // req
    const user = request.user; // user에 req.user

    console.log(user);
    if (user.isAdmin === false) {
      throw new UnauthorizedException('관리자만 접근할 수 있는 페이지입니다.');
    } else {
      return true;
    }
  }
}
