import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { ApiOperation } from '@nestjs/swagger';
import { LoggedInUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ParseDatePipe } from './pipes/date.pipe';
import { AccessTokenGuard } from 'src/auth/guard/LoggedIn.guard';

@Controller('books')
@UseGuards(AccessTokenGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @ApiOperation({ summary: '공연을 예약합니다.' })
  @Post(':concertId')
  book(
    @Param('concertId', ParseIntPipe) concertId: number,
    @Body('date', ParseDatePipe) date: Date,
    @Body('grade') grade: string,
    @Body('seatNumber') seatNumber: number,
    @LoggedInUser() user: User,
  ) {
    const { id: userId, wallet } = user;
    const userInfo = {
      userId,
      wallet,
    };
    return this.booksService.book(concertId, date, userInfo, grade, seatNumber);
  }

  @ApiOperation({ summary: '예약을 취소합니다.' })
  @Delete(':bookingId')
  delete(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @LoggedInUser() user: User,
  ) {
    return this.booksService.delete(bookingId, user.id);
  }
}
