import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LoginUserDto, SignUpUserDto } from './dto/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Request } from 'express';
import { BooksService } from 'src/books/books.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly bookService: BooksService,
  ) {}

  @Post('signup')
  async signup(@Body() signUpUserDto: SignUpUserDto) {
    return await this.authService.signup(signUpUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.login(loginUserDto);
  }

  @Get('my-profile')
  @UseGuards(JwtAuthGuard)
  async myProfile(@Req() req: Request) {
    const myBooks = await this.bookService.myBooks(req.user['id']);
    const user = {
      ...req.user,
      myBooks,
    };
    return user;
  }
}
