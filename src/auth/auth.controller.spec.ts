import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenGuard } from './guard/LoggedIn.guard';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let jwtService: JwtService;
  let usersRepository: Repository<User>;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getTokenFromHeader: jest.fn().mockReturnValue('string'),
            rotateToken: jest.fn().mockReturnValue('string'),
          },
        },
        // {
        //   provide: JwtService,
        //   useValue: {
        //     sign: jest.fn().mockReturnValue('string'),
        //     verify: jest.fn().mockReturnValue({ email: 'string', id: 1 }),
        //   },
        // },
        // {
        //   provide: Repository,
        //   useValue: {
        //     findOne: jest.fn().mockReturnValue({ email: 'string', id: 1 }),
        //   },
        // },
        // {
        //   provide: ConfigService,
        //   useValue: {
        //     get: jest.fn().mockReturnValue('string'),
        //   },
        // },
      ],
    })
      .overrideGuard(RefreshTokenGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();
    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('postAccessToken', () => {
    it('should be pass', async () => {
      const rawToken = 'Bearer string';
      service.getTokenFromHeader = jest.fn().mockReturnValue('string');
      service.rotateToken = jest.fn().mockReturnValue('string');
      const result = await controller.postAccessToken(rawToken);
      expect(result).toEqual({ accessToken: 'string' });
      expect(service.getTokenFromHeader).toHaveBeenCalledWith(rawToken);
      expect(service.rotateToken).toHaveBeenCalledWith('string', false);
    });
  });

  describe('postRefreshToken', () => {
    it('should be pass', async () => {
      const rawToken = 'Bearer string';
      service.getTokenFromHeader = jest.fn().mockReturnValue('string');
      service.rotateToken = jest.fn().mockReturnValue('string');
      const result = await controller.postRefreshToken(rawToken);
      expect(result).toEqual({ refreshToken: 'string' });
      expect(service.getTokenFromHeader).toHaveBeenCalledWith(rawToken);
      expect(service.rotateToken).toHaveBeenCalledWith('string', true);
    });
  });
});
