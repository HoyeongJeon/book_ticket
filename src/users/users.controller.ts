import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LoginUserDto, SignUpUserDto } from './dto/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';
import { BooksService } from 'src/books/books.service';
import { AccessTokenGuard } from 'src/auth/guard/LoggedIn.guard';
import { LoggedInUser } from 'src/common/decorators/user.decorator';
import { User } from './entities/user.entity';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly bookService: BooksService,
  ) {}

  @ApiOperation({
    summary: '회원가입',
  })
  @Post('signup')
  async signup(@Body() signUpUserDto: SignUpUserDto) {
    return await this.authService.signup(signUpUserDto);
  }

  @ApiOperation({
    summary: '로그인',
  })
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.login(loginUserDto);
  }

  @ApiOperation({
    summary: '내 정보 보기',
  })
  @Get('my-profile')
  @UseGuards(AccessTokenGuard)
  async myProfile(@Req() req: Request, @LoggedInUser() loggedInUser: User) {
    const myBooks = await this.bookService.myBooks(loggedInUser.id);
    const user = {
      ...req.user,
      myBooks,
    };
    return user;
  }
}
