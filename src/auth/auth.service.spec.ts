import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersRepository } from 'src/users/users.repository';
import { UnauthorizedException } from '@nestjs/common';
import { SECRET_KEY } from 'src/common/const/env-keys.const';
import { LoginUserDto, SignUpUserDto } from 'src/users/dto/user.dto';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('string'),
            verify: jest.fn().mockImplementation(() => {
              return Promise.resolve({ email: 'string', id: 1 });
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('string'),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findOne: jest.fn().mockReturnValue({ email: 'string', id: 1 }),
            findUserByEmail: jest.fn(),
            signup: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  describe('getTokenFromHeader', () => {
    it('should be return token', async () => {
      const header = 'Bearer token';
      const result = service.getTokenFromHeader(header);
      expect(result).toBe('token');
    });

    it('should be throw UnauthorizedException_ type !== Bearer', async () => {
      const header = 'Bear string';
      await expect(async () =>
        service.getTokenFromHeader(header),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyToken', () => {
    it('should return Promise', async () => {
      const token = 'string';
      const result = await service.verifyToken(token);
      expect(result).toEqual({ email: 'string', id: 1 });
      expect(jwtService.verify).toHaveBeenCalledWith(token, {
        secret: configService.get<string>(SECRET_KEY),
      });
    });
  });

  describe('rotateToken', () => {
    it('should return access token', async () => {
      const token = 'string';
      const isRefreshToken = true;
      jwtService.verify = jest.fn().mockReturnValue({ type: 'refresh' });
      const result = service.rotateToken(token, isRefreshToken);
      expect(result).toBe('string');
      expect(jwtService.verify).toHaveBeenCalledWith(token, {
        secret: configService.get<string>(SECRET_KEY),
      });
    });
    it('should throw UnauthorizedException', async () => {
      const token = 'string';
      const isRefreshToken = false;
      jest.spyOn(jwtService, 'verify').mockReturnValue({ type: 'access' });
      await expect(async () =>
        service.rotateToken(token, isRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signToken', () => {
    it('should sign Token', async () => {
      const user = { email: 'string', id: 1 };
      const isRefreshToken = true;
      const result = service.signToken(user, isRefreshToken);
      expect(result).toBe('string');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'string', sub: 1, type: 'refresh' },
        {
          secret: configService.get<string>(SECRET_KEY),
          expiresIn: 3600,
        },
      );
    });
  });

  describe('getUserTokens', () => {
    it('should return access token and refresh token', async () => {
      const user = { email: 'string', id: 1 };
      const result = service.getUserTokens(user);
      expect(result).toEqual({ accessToken: 'string', refreshToken: 'string' });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'string', sub: 1, type: 'access' },
        {
          secret: configService.get<string>(SECRET_KEY),
          expiresIn: 600,
        },
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'string', sub: 1, type: 'refresh' },
        {
          secret: configService.get<string>(SECRET_KEY),
          expiresIn: 3600,
        },
      );
    });
  });

  describe('authenticateUser', () => {
    it('should return UnauthorizedException _ no user', async () => {
      const user = new LoginUserDto();
      user.email = 'test@test.com';
      jest.spyOn(repository, 'findUserByEmail').mockResolvedValue(null);
      await expect(async () => service.authenticateUser(user)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return UnauthorizedException _ pw not matched', async () => {
      const user = new LoginUserDto();
      user.email = 'test@test.com';
      user.password = '1234';
      const existingUser = new User();
      existingUser.email = user.email;
      existingUser.password = '123';
      jest.spyOn(repository, 'findUserByEmail').mockResolvedValue(existingUser);
      const bcryptCompare = jest.fn().mockResolvedValue(false);
      (bcrypt.compare as jest.Mock) = bcryptCompare;
      await expect(async () => service.authenticateUser(user)).rejects.toThrow(
        new UnauthorizedException('비밀번호가 일치하지 않습니다.'),
      );
    });
  });

  it('should return User', async () => {
    const user = new LoginUserDto();
    user.email = 'test@test.com';
    user.password = '1234';
    const existingUser = new User();
    existingUser.email = user.email;
    existingUser.password = '1234';
    const bcryptCompare = jest.fn().mockResolvedValue(true);
    (bcrypt.compare as jest.Mock) = bcryptCompare;
    jest.spyOn(repository, 'findUserByEmail').mockResolvedValue(existingUser);

    const result = await service.authenticateUser(user);
    expect(result).toEqual(existingUser);
  });

  describe('login', () => {
    it('should return User', async () => {
      const user = new LoginUserDto();
      const mockReturn = {
        accessToken: 'access',
        refreshToken: 'refresh',
      };
      service.authenticateUser = jest.fn().mockResolvedValue(user);
      service.getUserTokens = jest.fn().mockReturnValue(mockReturn);
      const result = await service.login(user);
      expect(result).toEqual(mockReturn);
      expect(service.authenticateUser).toHaveBeenCalledWith(user);
    });
  });

  describe('signUp', () => {
    it('should throw UnauthorizedExeption', async () => {
      const dto = new SignUpUserDto();
      dto.email = 'test@test.com';
      jest.spyOn(repository, 'findUserByEmail').mockResolvedValue(new User());
      await expect(async () => service.signup(dto)).rejects.toThrow(
        new UnauthorizedException('이미 존재하는 Email 입니다.'),
      );
      expect(repository.findUserByEmail).toHaveBeenCalledWith(dto.email);
    });

    it('should return user', async () => {
      const dto = new SignUpUserDto();
      dto.email = 'test@test.com';
      dto.password = '1234';
      jest.spyOn(repository, 'findUserByEmail').mockResolvedValue(null);
      const bcryptHash = jest.fn().mockResolvedValue('hash');
      (bcrypt.hash as jest.Mock) = bcryptHash;
      const expectedUser = new User();
      const expectedParam = {
        ...dto,
        password: 'hash',
      };
      jest.spyOn(repository, 'signup').mockResolvedValue(expectedUser);
      const result = await service.signup(dto);
      expect(result).toEqual(expectedUser);
      expect(repository.signup).toHaveBeenCalledWith(expectedParam);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        dto.password,
        parseInt(configService.get<string>('PASSWORD_HASH_ROUND')),
      );
    });
  });
});
