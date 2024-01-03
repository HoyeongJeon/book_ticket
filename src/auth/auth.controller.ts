import { Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessTokenGuard, RefreshTokenGuard } from './guard/LoggedIn.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Access Token 재발급' })
  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  async postAccessToken(@Headers('Authorization') rawToken: string) {
    const token = this.authService.getTokenFromHeader(rawToken);
    const accessToken = this.authService.rotateToken(token, false);
    return {
      accessToken,
    };
  }

  @ApiOperation({ summary: 'Refresh Token 재발급' })
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
