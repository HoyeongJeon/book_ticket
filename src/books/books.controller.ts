import {
  Body,
  Controller,
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
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @ApiOperation({ summary: '공연을 예약합니다.' })
  @UseGuards(AccessTokenGuard)
  @Post(':concertId')
  book(
    @Param('concertId', ParseIntPipe) concertId: number,
    @Body('date', ParseDatePipe) date: Date,
    @LoggedInUser() user: User,
  ) {
    const { id: userId, wallet } = user;
    const userInfo = {
      userId,
      wallet,
    };
    return this.booksService.book(concertId, date, userInfo);
  }
}

/**
 * 예약을 할 때 필요한 정보
 * 1. 공연 id
 * 2. 공연 날짜와 시간
 * 3. 공연 id와 해당하는 날짜를 보내서 해당 공연에 자리가 남아있는지 확인.
 * 3. 가격
 * 4. 내 돈
 */
