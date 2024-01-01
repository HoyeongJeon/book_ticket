import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
  exports: [AuthService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    forwardRef(() => UsersModule),
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1y' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
