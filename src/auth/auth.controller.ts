import { Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessTokenGuard, RefreshTokenGuard } from './guard/LoggedIn.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  @UseGuards(AccessTokenGuard)
  async postAccessToken(@Headers('Authorization') rawToken: string) {
    const token = this.authService.getTokenFromHeader(rawToken);
    const accessToken = this.authService.rotateToken(token, false);
    return {
      accessToken,
    };
  }

  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  async postRefreshToken(@Headers('Authorization') rawToken: string) {
    const token = this.authService.getTokenFromHeader(rawToken);
    const refreshToken = this.authService.rotateToken(token, true);
    return {
      refreshToken,
    };
  }
}
